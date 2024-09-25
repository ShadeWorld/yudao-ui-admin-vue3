<template>
  <el-image
    src="https://zhaomingyanjing.store/glass-manage/0f1973b11d873a30a3c88fe6f9ae53d7615287290e3be638170ef024f81375cb.png"
  />
</template>
<script setup lang="ts">
import { UserOrderProperty } from './config'

/** 用户订单 */
defineOptions({ name: 'UserOrder' })
// 定义属性
defineProps<{ property: UserOrderProperty }>()
</script>

<style scoped lang="scss"></style>
