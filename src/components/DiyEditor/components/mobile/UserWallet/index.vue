<template>
  <el-image
    src="https://zhaomingyanjing.store/glass-manage/c1a300164fe33db8fcfe43b7b1b33ab56981e8094f593259c4c004d6f50fc6ff.png"
  />
</template>
<script setup lang="ts">
import { UserWalletProperty } from './config'

/** 用户资产 */
defineOptions({ name: 'UserWallet' })
// 定义属性
defineProps<{ property: UserWalletProperty }>()
</script>

<style scoped lang="scss"></style>
