import * as colorPicker from '@zag-js/color-picker'
import { type PropTypes, normalizeProps, useMachine } from '@zag-js/vue'
import { type ComputedRef, computed } from 'vue'
import { useEnvironmentContext } from '../../providers'
import type { EmitFn, Optional } from '../../types'
import { useId } from '../../utils'
import type { RootEmits } from './color-picker.types'

export interface UseColorPickerProps
  extends Optional<
    Omit<colorPicker.Context, 'dir' | 'getRootNode' | 'open.controlled' | 'value'>,
    'id'
  > {
  modelValue?: string
}
export interface UseColorPickerReturn extends ComputedRef<colorPicker.Api<PropTypes>> {}

export const useColorPicker = (
  props: UseColorPickerProps,
  emit: EmitFn<RootEmits>,
): UseColorPickerReturn => {
  const env = useEnvironmentContext()

  const context = computed(() => {
    const { modelValue, ...rest } = props
    return {
      ...rest,
      value: modelValue ? colorPicker.parse(modelValue) : undefined,
      'open.controlled': props.open !== undefined,
    }
  })

  const [state, send] = useMachine(
    colorPicker.machine({
      ...context.value,
      id: context.value.id ?? useId().value,
      getRootNode: env?.value.getRootNode,
      onOpenChange(details) {
        emit('openChange', details)
        emit('update:open', details.open)
      },
      onValueChange(details) {
        emit('valueChange', details)
        emit('update:modelValue', details.valueAsString)
      },
      onFocusOutside: (details) => emit('focusOutside', details),
      onFormatChange: (details) => emit('formatChange', details),
      onInteractOutside: (details) => emit('interactOutside', details),
      onPointerDownOutside: (details) => emit('pointerDownOutside', details),
      onValueChangeEnd: (details) => emit('valueChangeEnd', details),
    }),
    { context },
  )

  return computed(() => colorPicker.connect(state.value, send, normalizeProps))
}
