<script setup lang="ts">
import { computed } from 'vue'

import { VscSingleSelect, type VscSingleSelectOption } from '@/components/VscEl'
import * as interfaceSt from '@/states/interface'

const props = defineProps<{
  taskIndex: number
  option: string
}>()

const task = computed(() => {
  return interfaceSt.currentConfigObj.value.task?.[props.taskIndex]!
})

const optionProto = interfaceSt.currentObj.value.option?.[props.option]!

const optionOptions = computed<VscSingleSelectOption[]>(() => {
  return optionProto.cases.map(i => {
    return {
      value: i.name
    } satisfies VscSingleSelectOption
  })
})

const value = computed<string | undefined>({
  set(v?: string) {
    if (v) {
      if (!task.value.option) {
        task.value.option = [
          {
            name: props.option,
            value: v
          }
        ]
      } else {
        const entry = task.value.option.find(x => x.name === props.option)
        if (entry) {
          entry.value = v
        } else {
          task.value.option.push({
            name: props.option,
            value: v
          })
        }
      }
    }
  },
  get() {
    const choice = task.value.option?.find(x => x.name === props.option)
    return choice?.value ?? optionProto.default_case ?? optionProto.cases[0].name
  }
})
</script>

<template>
  <template v-if="task && optionProto">
    <div class="col-flex">
      <span>{{ option }}</span>
      <vsc-single-select
        v-model="value"
        :options="optionOptions"
        :disabled="interfaceSt.freezed.value"
      ></vsc-single-select>
    </div>
  </template>
</template>
