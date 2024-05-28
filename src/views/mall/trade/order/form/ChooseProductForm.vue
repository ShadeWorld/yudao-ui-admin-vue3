<script setup lang="ts">
defineOptions({ name: 'ChooseProductForm' })

const dialogVisible = ref(false) // 弹窗的是否展示

/** 打开弹窗 */
const open = async () => {
  dialogVisible.value = true
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗
</script>

<template>
  <Dialog v-model="dialogVisible" title="选择商品"> 123</Dialog>
</template>

<style scoped lang="scss"></style>
