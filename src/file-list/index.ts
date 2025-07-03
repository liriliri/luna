import stripIndent from 'licia/stripIndent'
import Component, { IComponentOptions } from '../share/Component'
import LunaDataGrid from 'luna-data-grid'
import LunaIconList from 'luna-icon-list'
import { exportCjs } from '../share/util'
import map from 'licia/map'
import I18n from 'licia/I18n'
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
import types from 'licia/types'
import wrap from 'licia/wrap'
import upperCase from 'licia/upperCase'
import isFn from 'licia/isFn'
import isEmpty from 'licia/isEmpty'
import statMode from 'stat-mode'
import isStr from 'licia/isStr'
import isUndef from 'licia/isUndef'

const folderIcon = asset['folder.svg']
const fileIcon = asset['file.svg']

type Column = 'name' | 'mtime' | 'type' | 'size' | 'mode'

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** File list. */
  files: IFile[]
  /** Show files in list view. */
  listView?: boolean
  /** List view columns. */
  columns?: Column[]
  /** File filter. */
  filter?: string | RegExp | types.AnyFn
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
  /** File mode. */
  mode?: number | string
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
  static i18n = new I18n(navigator.language !== 'zh-CN' ? 'en-US' : 'zh-CN', {
    'en-US': {
      name: 'Name',
      size: 'Size',
      type: 'Type',
      directory: 'Directory',
      file: 'File',
      dateModified: 'Date Modified',
      permissions: 'Permissions',
    },
    'zh-CN': {
      name: '名称',
      size: '大小',
      type: '类型',
      directory: '文件夹',
      file: '文件',
      dateModified: '修改日期',
      permissions: '权限',
    },
  })
  private dataGrid: LunaDataGrid
  private iconList: LunaIconList
  private onResize: () => void
  private resizeSensor: ResizeSensor
  constructor(container: HTMLElement, options: IOptions) {
    super(container, { compName: 'file-list' }, options)

    const defaultColumns: Column[] = ['name', 'mtime', 'type', 'size']
    this.initOptions(options, {
      files: [],
      columns: defaultColumns,
      listView: false,
    })
    if (isEmpty(this.options.columns)) {
      this.options.columns = defaultColumns
    }

    this.initTpl()

    const COLUMNS = {
      name: {
        id: 'name',
        title: FileList.i18n.t('name'),
        weight: 40,
        sortable: true,
      },
      mtime: {
        id: 'mtime',
        title: FileList.i18n.t('dateModified'),
        weight: 20,
        sortable: true,
      },
      type: {
        id: 'type',
        title: FileList.i18n.t('type'),
        weight: 20,
        sortable: true,
      },
      size: {
        id: 'size',
        title: FileList.i18n.t('size'),
        weight: 20,
        comparator: (a: string, b: string) => fileSize(a) - fileSize(b),
        sortable: true,
      },
      mode: {
        id: 'mode',
        title: FileList.i18n.t('permissions'),
        weight: 20,
        sortable: true,
      },
    }

    const dataGridContainer = this.find('.list-view').get(0) as HTMLElement
    this.dataGrid = new LunaDataGrid(dataGridContainer, {
      columns: map(
        this.options.columns,
        (column: keyof typeof COLUMNS) => COLUMNS[column]
      ),
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
      this.dataGrid.fit()
    }, 100)

    this.bindEvent()
    this.render()
    this.dataGrid.fit()

    if (this.options.filter) {
      this.setFilter(this.options.filter)
    }
  }
  destroy() {
    super.destroy()
    this.resizeSensor.destroy()
  }
  private setFilter(filter: string | RegExp | types.AnyFn) {
    if (isFn(filter)) {
      filter = wrap(filter, function (fn, data: any) {
        return fn(data.data.file)
      })
    }
    this.iconList.setOption('filter', filter)
    this.dataGrid.setOption('filter', filter)
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
      let mode = '--'
      if (file.mode) {
        if (isStr(file.mode)) {
          mode = file.mode
        } else {
          mode = statMode(file.mode).toString()
        }
      }

      return {
        name: toEl(
          `<span><img src="${this.getIcon(file)}" />${file.name}</span>`
        ) as HTMLElement,
        type: this.getType(file),
        size: !isUndef(file.size) ? fileSize(file.size) : '--',
        mtime: dateFormat(file.mtime, 'yyyy-mm-dd HH:MM:ss'),
        mode,
        file,
      }
    })
    this.dataGrid.setData(data as any)
  }
  private getType(file: IFile) {
    if (file.directory) {
      return FileList.i18n.t('directory')
    }

    const ext = splitPath(file.name).ext
    if (ext) {
      return upperCase(ext.slice(1))
    }

    return FileList.i18n.t('file')
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
      this.emit('contextmenu', e.origEvent)
    })

    this.on('changeOption', (name, val) => {
      switch (name) {
        case 'files':
        case 'listView':
          this.render()
          if (val) {
            this.dataGrid.fit()
          }
          break
        case 'filter':
          this.setFilter(val)
          break
      }
    })
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, FileList)
}
