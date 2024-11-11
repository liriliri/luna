import { defineComponent, h, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import ShaderToyPlayer from './index'

const LunaShaderToyPlayer = defineComponent({
  name: 'LunaShaderToyPlayer',
  props: {
    style: {
      type: Object,
      default: () => ({}),
    },
    controls: {
      type: Boolean,
      default: true,
    },
    renderPass: {
      type: Array,
    },
  },
  emits: ['create'],
  setup(props, context) {
    const container = shallowRef<HTMLDivElement>()
    const shaderToyPlayer = shallowRef<ShaderToyPlayer>()

    onMounted(() => {
      shaderToyPlayer.value = new ShaderToyPlayer(container.value!, {
        renderPass: props.renderPass,
        controls: props.controls,
      })

      context.emit('create', shaderToyPlayer.value)
    })

    onBeforeUnmount(() => {
      shaderToyPlayer.value?.destroy()
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
