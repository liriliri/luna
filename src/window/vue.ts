import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  PropType,
  shallowRef,
  watch,
} from 'vue'
import each from 'licia/each'
import Window, { IOptions } from './index'

const LunaWindow = defineComponent({
  name: 'LunaWindow',
  props: {
    theme: {
      type: String,
      default: 'light',
    },
    width: {
      type: Number,
      default: 800,
    },
    height: {
      type: Number,
      default: 600,
    },
    x: {
      type: Number,
      default: 0,
    },
    y: {
      type: Number,
      default: 0,
    },
    title: {
      type: String,
      default: '',
    },
    content: {
      type: [String, Object] as PropType<IOptions['content']>,
      default: '',
    },
    minWidth: {
      type: Number,
      default: 200,
    },
    minHeight: {
      type: Number,
      default: 150,
    },
  },
  emits: ['create'],
  setup(props, context) {
    const win = shallowRef<Window>()

    onMounted(() => {
      win.value = new Window({
        theme: props.theme,
        width: props.width,
        height: props.height,
        x: props.x,
        y: props.y,
        title: props.title,
        content: props.content,
        minWidth: props.minWidth,
        minHeight: props.minHeight,
      })
      win.value.show()
      context.emit('create', win.value)

      each(
        [
          'theme',
          'width',
          'height',
          'x',
          'y',
          'title',
          'content',
          'minWidth',
          'minHeight',
        ],
        (key: keyof typeof props) => {
          watch(
            () => props[key],
            (val) => {
              win.value?.setOption(key, val)
            }
          )
        }
      )
    })

    onBeforeUnmount(() => {
      win.value?.destroy()
    })

    return () => h('div')
  },
})

export default LunaWindow
