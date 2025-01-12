import stripIndent from 'licia/stripIndent'
import Component, { IComponentOptions } from '../share/Component'
import LunaDataGrid from 'luna-data-grid'
import LunaIconList from 'luna-icon-list'
import { exportCjs } from '../share/util'
import map from 'licia/map'
import splitPath from 'licia/splitPath'
import fileSize from 'licia/fileSize'
import asset from './asset'
import mime from 'licia/mime'
import startWith from 'licia/startWith'
import throttle from 'licia/throttle'
import ResizeSensor from 'licia/ResizeSensor'
import dateFormat from 'licia/dateFormat'
import toEl from 'licia/toEl'
import each from 'licia/each'

const folderIcon = asset['folder.svg']
const fileIcon = asset['file.svg']

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** File list. */
  files: IFile[]
  /** Show files in list view. */
  listView?: boolean
}

/** IFile */
export interface IFile {
  /** File name. */
  name: string
  /** Modified timestamp. */
  mtime: Date
  /** File size. */
  size?: number
  /** Thumbnail. */
  thumbnail?: string
  /** Whether file is a directory. */
  directory?: boolean
}

/**
 * List files in the directory.
 *
 * @example
 * const fileList = new LunaFileList(container, {
 *  listView: true,
 *  files: [
 *   { name: 'file1.txt', mtime: new Date(), size: 1024 },
 *  ],
 * })
 */
export default class FileList extends Component<IOptions> {
  private dataGrid: LunaDataGrid
  private iconList: LunaIconList
  private onResize: () => void
  private resizeSensor: ResizeSensor
  constructor(container: HTMLElement, options: IOptions) {
    super(container, { compName: 'file-list' }, options)

    this.initOptions(options, {
      files: [],
      listView: false,
    })

    this.initTpl()

    const dataGridContainer = this.find('.list-view').get(0) as HTMLElement
    this.dataGrid = new LunaDataGrid(dataGridContainer, {
      columns: [
        {
          id: 'name',
          title: 'Name',
          weight: 60,
          sortable: true,
        },
        {
          id: 'size',
          title: 'Size',
          weight: 20,
        },
        {
          id: 'mtime',
          title: 'Date Modified',
          weight: 20,
        },
      ],
      selectable: true,
    })
    this.addSubComponent(this.dataGrid)

    const iconListContainer = this.find('.icon-view').get(0) as HTMLElement
    this.iconList = new LunaIconList(iconListContainer, {
      size: 48,
    })
    this.addSubComponent(this.iconList)

    this.resizeSensor = new ResizeSensor(container)
    this.onResize = throttle(() => {
      this.updateListHeight()
    }, 100)

    this.bindEvent()
    this.render()
    this.updateListHeight()
  }
  destroy() {
    super.destroy()
    this.resizeSensor.destroy()
  }
  private updateListHeight() {
    const height = this.$container.offset().height
    this.dataGrid.setOption({
      maxHeight: height,
      minHeight: height,
    })
  }
  private initTpl() {
    this.$container.html(
      this.c(stripIndent`
        <div class="icon-view"></div>
        <div class="list-view"></div>
      `)
    )
  }
  private render() {
    const { files, listView } = this.options

    if (listView) {
      this.renderListView(files)
    } else {
      this.renderIconView(files)
    }
  }
  private renderIconView(files: IFile[]) {
    const hidden = this.c('hidden')
    this.dataGrid.$container.addClass(hidden)
    this.iconList.$container.rmClass(hidden)

    const icons = map(files, (file) => {
      return {
        src: this.getIcon(file),
        name: file.name,
        file,
      }
    })
    this.iconList.setIcons(icons)
  }
  private getIcon(file: IFile) {
    const { name } = file

    if (file.directory) {
      return folderIcon
    }

    if (file.thumbnail) {
      return file.thumbnail
    }

    const ext = splitPath(name).ext
    const type = mime(ext.slice(1))

    if (type) {
      if (startWith(type, 'image')) {
        return asset['image.svg']
      } else if (startWith(type, 'text')) {
        return asset['text.svg']
      } else if (startWith(type, 'video')) {
        return asset['video.svg']
      } else if (startWith(type, 'audio')) {
        return asset['audio.svg']
      }
    }

    return fileIcon
  }
  private renderListView(files: IFile[]) {
    const hidden = this.c('hidden')
    this.iconList.$container.addClass(hidden)
    this.dataGrid.$container.rmClass(hidden)

    const data = map(files, (file) => {
      return {
        name: toEl(
          `<span><img src="${this.getIcon(file)}" />${file.name}</span>`
        ) as HTMLElement,
        size: file.size ? fileSize(file.size) : '--',
        mtime: dateFormat(file.mtime, 'yyyy-mm-dd HH:MM:ss'),
        file,
      }
    })
    this.dataGrid.setData(data as any)
  }
  private bindEvent() {
    this.resizeSensor.addListener(this.onResize)

    each(['select', 'deselect'], (event) => {
      this.iconList.on(event, (icon) => {
        if (event === 'select') {
          this.emit(event, icon.data.file)
        } else {
          this.emit(event)
        }
      })
      this.dataGrid.on(event, (node) => {
        if (event === 'select') {
          this.emit(event, node.data.file)
        } else {
          this.emit(event)
        }
      })
    })
    each(['click', 'dblclick', 'contextmenu'], (event) => {
      this.iconList.on(event, (e, icon) => {
        this.emit(event, e, icon.data.file)
      })
      this.dataGrid.on(event, (e, node) => {
        this.emit(event, e, node.data.file)
      })
    })

    this.$container.on('contextmenu', (e) => {
      e.preventDefault()
      this.emit('contextmenu', e)
    })

    this.on('changeOption', (name) => {
      switch (name) {
        case 'files':
        case 'listView':
          this.render()
          break
      }
    })
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, FileList)
}
