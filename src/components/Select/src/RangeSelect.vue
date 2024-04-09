<template>
  <el-select v-model="selected" multiple collapse-tags collapse-tags-tooltip>
    <el-option v-for="item in range" :key="item.value" :label="item.name" :value="item.value" />
  </el-select>
</template>

<script setup lang="ts">
const props = defineProps({
  maxValue: Number,
  minValue: Number
})
// eslint-disable-next-line vue/require-prop-types
const selected = defineModel()
const range = ref([])

watch(
  () => props,
  (data) => {
    range.value = []
    const minValue = Math.min(data.maxValue, data.minValue)
    const maxValue = Math.max(data.maxValue, data.minValue)
    for (let i = minValue; i < maxValue; i += 0.25) {
      range.value.push({ name: i.toFixed(2), value: i })
    }
  },
  {
    deep: true,
    immediate: true
  }
)
</script>
