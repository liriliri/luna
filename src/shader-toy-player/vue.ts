import { defineComponent, h, onMounted, shallowRef } from 'vue'
import ShaderToyPlayer from './index'

const LunaShaderToyPlayer = defineComponent({
  name: 'LunaShaderToyPlayer',
  props: {
    style: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const container = shallowRef<HTMLDivElement>()
    const shaderToyPlayer = shallowRef<ShaderToyPlayer>()

    onMounted(() => {
      shaderToyPlayer.value = new ShaderToyPlayer(container.value!)
    })

    return () => {
      return h('div', {
        ref: container,
        style: props.style,
      })
    }
  },
})

export default LunaShaderToyPlayer
