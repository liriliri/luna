import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  watch,
} from 'vue'
import each from 'licia/each'
import ImageList from './index'

const LunaImageList = defineComponent({
  name: 'LunaImageList',
  props: {
    images: {
      type: Array<{
        src: string
        title?: string
      }>,
      required: true,
    },
    rowHeight: {
      type: Number,
    },
    verticalMargin: {
      type: Number,
    },
    horizontalMargin: {
      type: Number,
    },
    showTitle: {
      type: Boolean,
    },
  },
  emits: ['create'],
  setup(props, context) {
    const container = shallowRef<HTMLDivElement>()
    const imageList = shallowRef<ImageList>()

    onMounted(() => {
      imageList.value = new ImageList(container.value!, {
        rowHeight: props.rowHeight,
        verticalMargin: props.verticalMargin,
        horizontalMargin: props.horizontalMargin,
        showTitle: props.showTitle,
      })
      imageList.value.setImages(props.images)

      context.emit('create', imageList.value)

      watch(
        () => props.images,
        (images) => {
          imageList.value?.setImages(images)
        }
      )

      each(
        ['rowHeight', 'verticalMargin', 'horizontalMargin', 'showTitle'],
        (key: keyof typeof props) => {
          watch(
            () => props[key],
            (val) => {
              imageList.value?.setOption(key, val)
            }
          )
        }
      )
    })

    onBeforeUnmount(() => {
      imageList.value?.destroy()
    })

    return () => {
      return h('div', {
        ref: container,
      })
    }
  },
})

export default LunaImageList
