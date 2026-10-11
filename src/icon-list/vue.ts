import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  watch,
  PropType,
} from 'vue'
import each from 'licia/each'
import IconList, { IIcon, IOptions } from './index'

const LunaIconList = defineComponent({
  name: 'LunaIconList',
  props: {
    theme: {
      type: String,
      default: 'light',
    },
    icons: {
      type: Array as PropType<IIcon[]>,
      required: true,
    },
    size: {
      type: Number,
      default: 48,
    },
    filter: {
      type: [String, RegExp, Function] as PropType<IOptions['filter']>,
    },
    selectable: {
      type: Boolean,
      default: true,
    },
    multiSelections: {
      type: Boolean,
      default: false,
    },
    hotkey: {
      type: [Boolean, Object] as PropType<IOptions['hotkey']>,
      default: true,
    },
    style: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['create'],
  setup(props, context) {
    const container = shallowRef<HTMLDivElement>()
    const iconList = shallowRef<IconList>()

    onMounted(() => {
      iconList.value = new IconList(container.value!, {
        theme: props.theme,
        size: props.size,
        filter: props.filter,
        selectable: props.selectable,
        multiSelections: props.multiSelections,
        hotkey: props.hotkey,
      })
      iconList.value.setIcons(props.icons)

      context.emit('create', iconList.value)

      watch(
        () => props.icons,
        (icons) => {
          iconList.value?.setIcons(icons)
        }
      )

      each(
        ['theme', 'size', 'filter', 'selectable', 'multiSelections', 'hotkey'],
        (key: keyof typeof props) => {
          watch(
            () => props[key],
            (val) => {
              iconList.value?.setOption(key, val)
            }
          )
        }
      )
    })

    onBeforeUnmount(() => {
      iconList.value?.destroy()
    })

    return () => {
      return h('div', {
        ref: container,
        style: props.style,
      })
    }
  },
})

export default LunaIconList
