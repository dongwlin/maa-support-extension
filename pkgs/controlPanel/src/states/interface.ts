import { computed } from 'vue'

import type { Interface, InterfaceConfig } from '@mse/types'

import { ipc } from '@/main'

export function refresh() {
  ipc.postMessage({
    cmd: 'refreshInterface'
  })
}

export function launch() {
  ipc.postMessage({
    cmd: 'launchInterface'
  })
}

export const refreshing = computed(() => {
  return ipc.context.value.interfaceRefreshing ?? false
})

export const launching = computed(() => {
  return ipc.context.value.interfaceLaunching ?? false
})

export const freezed = computed(() => {
  return refreshing.value || launching.value
})

export const list = computed(() => {
  return ipc.context.value.interfaceList ?? []
})

export const currentName = computed<string | undefined>({
  set(v?: string) {
    if (v) {
      ipc.postMessage({
        cmd: 'selectInterface',
        interface: v
      })
    }
  },
  get() {
    return ipc.context.value.interfaceCurrent
  }
})

export const currentObj = computed<Partial<Interface>>(() => {
  if (!ipc.context.value.interfaceObj) {
    ipc.context.value.interfaceObj = {}
  }
  return ipc.context.value.interfaceObj
})

export const currentConfigObj = computed<Partial<InterfaceConfig>>(() => {
  if (!ipc.context.value.interfaceConfigObj) {
    ipc.context.value.interfaceConfigObj = {}
  }
  return ipc.context.value.interfaceConfigObj
})
