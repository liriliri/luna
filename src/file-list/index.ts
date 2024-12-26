import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'
import Component, { IComponentOptions } from '../share/Component'
import LunaDataGrid from 'luna-data-grid'
import { exportCjs } from '../share/util'

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
  /** Create time. */
  ctime: number
  /** File size. */
  size?: number
  /** Whether file is a directory. */
  directory: boolean
}

/**
 * List files in the directory.
 */
export default class FileList extends Component<IOptions> {
  private $iconView: $.$
  private listView: LunaDataGrid
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'file-list' }, options)

    this.initOptions(options, {
      files: [],
      listView: false,
      directory: '',
    })

    this.initTpl()
    this.$iconView = this.find('.icon-view')

    const listViewContainer = this.find('.list-view').get(0) as HTMLElement
    this.listView = new LunaDataGrid(listViewContainer, {
      columns: [
        {
          id: 'name',
          title: 'Name',
          weight: 20,
        },
      ],
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
    this.$iconView.html(JSON.stringify(files))
  }
  private renderListView(files: IFile[]) {
    this.listView.setData([])
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, FileList)
}
