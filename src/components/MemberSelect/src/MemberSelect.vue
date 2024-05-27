<script setup lang="ts">
import { getSimpleMemberList } from '@/api/member/user'

const emit = defineEmits(['select'])

const modelValue = ref()

const model = defineModel<number>()

const props = defineProps<{
  modelKey?: string
}>()

const querySearch = (query: string, cb: any) => {
  getSimpleMemberList(query).then((res) => {
    cb(res)
  })
}

const handleSelect = (item: any) => {
  console.log(item)
  if (props.modelKey) {
    model.value = item[props.modelKey]
  } else {
    model.value = item.id
  }
  emit('select', item)
}
</script>

<template>
  <el-autocomplete
    v-model="modelValue"
    :fetch-suggestions="querySearch"
    :trigger-on-focus="false"
    clearable
    class="inline-input w-50"
    placeholder="请输入客户姓名"
    @select="handleSelect"
    value-key="name"
  />
</template>

<style scoped lang="scss"></style>
