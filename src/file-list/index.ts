import stripIndent from 'licia/stripIndent'
import Component, { IComponentOptions } from '../share/Component'
import LunaDataGrid from 'luna-data-grid'
import LunaIconList from 'luna-icon-list'
import { exportCjs } from '../share/util'
import map from 'licia/map'
import fileSize from 'licia/fileSize'
import folderIcon from './folder.svg'
import fileIcon from './file.svg'

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** File list. */
  files?: IFile[]
  /** Show files in list view. */
  listView?: boolean
  /** Current directory. */
  directory?: string
}

/** IFile */
export interface IFile {
  /** File name. */
  name: string
  /** Modified timestamp. */
  mtime: number
  /** File size. */
  size?: number
  /** Whether file is a directory. */
  directory: boolean
}

/**
 * List files in the directory.
 */
export default class FileList extends Component<IOptions> {
  private dataGrid: LunaDataGrid
  private iconList: LunaIconList
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'file-list' }, options)

    this.initOptions(options, {
      files: [],
      listView: false,
      directory: '',
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

    const iconListContainer = this.find('.icon-view').get(0) as HTMLElement
    this.iconList = new LunaIconList(iconListContainer, {
      size: 48,
    })

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
      return {
        src: file.directory ? folderIcon : fileIcon,
        name: file.name,
      }
    })
    this.iconList.setIcons(icons)
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
