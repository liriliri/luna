import Component from '../share/Component'

/**
 * Music visualization.
 */
export default class MusicVisualizer extends Component {
  constructor(container: HTMLElement) {
    super(container, { compName: 'music-visualizer' })
  }
}

module.exports = MusicVisualizer
module.exports.default = MusicVisualizer
