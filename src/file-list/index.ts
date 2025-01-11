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
  mtime: number
  /** File size. */
  size?: number
  /** Thumbnail. */
  thumbnail?: string
  /** Whether file is a directory. */
  directory?: boolean
}

/**
 * List files in the directory.
 */
export default class FileList extends Component<IOptions> {
  private dataGrid: LunaDataGrid
  private iconList: LunaIconList
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
          weight: 20,
          sortable: true,
        },
        {
          id: 'size',
          title: 'Size',
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

    this.render()
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
    this.dataGrid.$container.hide()
    this.iconList.$container.show()

    const icons = map(files, (file) => {
      let src = folderIcon
      if (!file.directory) {
        src = file.thumbnail || this.getIcon(file.name)
      }

      return {
        src,
        name: file.name,
      }
    })
    this.iconList.setIcons(icons)
  }
  private getIcon(name: string) {
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
    this.iconList.$container.hide()
    this.dataGrid.$container.show()

    const data = map(files, (file) => {
      return {
        name: file.name,
        size: file.size ? fileSize(file.size) : '--',
      }
    })
    this.dataGrid.setData(data)
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, FileList)
}
