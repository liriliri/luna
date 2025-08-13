import {
  defineComponent,
  shallowRef,
  h,
  onMounted,
  onBeforeUnmount,
  watch,
  ref,
  provide,
  inject,
  ShallowRef,
} from 'vue'
import { IElOptions } from './index'
import type SplitPane from './index'
import each from 'licia/each'
import isNum from 'licia/isNum'
import isBool from 'licia/isBool'
import isBrowser from 'licia/isBrowser'

const LunaSplitPane = defineComponent({
  name: 'LunaSplitPane',
  props: {
    theme: {
      type: String,
      default: 'light',
    },
    direction: {
      type: String as () => 'horizontal' | 'vertical',
      default: 'horizontal',
    },
  },
  setup(props, context) {
    const container = shallowRef<HTMLDivElement>()
    const splitPane = shallowRef<SplitPane>()

    provide('splitPane', splitPane)

    onMounted(async () => {
      if (!isBrowser) {
        return
      }

      const { default: SplitPane } = await import('./index')

      splitPane.value = new SplitPane(container.value!, {
        theme: props.theme,
        direction: props.direction,
      })

      each(['theme'], (key: keyof typeof props) => {
        watch(
          () => props[key],
          (val) => {
            splitPane.value?.setOption(key, val)
          }
        )
      })
    })

    onBeforeUnmount(() => {
      splitPane.value?.destroy()
    })

    return () => {
      return h(
        'div',
        {
          ref: container,
        },
        context.slots.default ? context.slots.default() : []
      )
    }
  },
})

export const LunaSplitPaneItem = defineComponent({
  name: 'LunaSplitPaneItem',
  props: {
    minSize: { type: Number, default: 24 },
    weight: { type: Number, default: undefined },
    visible: { type: Boolean, default: true },
  },
  setup(props, context) {
    const el = ref<HTMLElement | null>(null)
    const splitPane = inject<ShallowRef<SplitPane>>('splitPane')!

    watch(
      () => splitPane.value,
      (splitPane) => {
        if (splitPane && el.value) {
          splitPane.append(el.value, {
            minSize: props.minSize,
            weight: props.weight,
            visible: props.visible,
          })
        }
      },
      { immediate: true }
    )

    watch(
      () => [props.minSize, props.weight, props.visible],
      ([minSize, weight, visible]) => {
        if (splitPane.value && el.value) {
          const options: IElOptions = {}
          if (isNum(minSize)) {
            options.minSize = minSize
          }
          if (isNum(weight)) {
            options.weight = weight
          }
          if (isBool(visible)) {
            options.visible = visible
          }
          splitPane.value.update(el.value, options)
        }
      }
    )

    return () =>
      h(
        'div',
        { ref: el },
        context.slots.default ? context.slots.default() : []
      )
  },
})

export default LunaSplitPane
