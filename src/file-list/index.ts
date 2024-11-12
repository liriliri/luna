import Component, { IComponentOptions } from '../share/Component'
import { exportCjs } from '../share/util'

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** File list. */
  files?: IFile[]
  /** Current directory. */
  directory?: string
}

export interface IFile {
  name: string
  size: number
  directory: boolean
}

/**
 * List files in the directory.
 */
export default class FileList extends Component<IOptions> {
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'file-list' }, options)

    this.initOptions(options, {
      files: [],
      directory: '',
    })
  }
}

if (typeof module !== 'undefined') {
  exportCjs(module, FileList)
}
