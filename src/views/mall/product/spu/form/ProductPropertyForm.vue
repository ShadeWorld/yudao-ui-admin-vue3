<script setup lang="ts">
import type { Spu } from '@/api/mall/product/spu'

const props = defineProps({
  isDetail: Boolean
})

const model = defineModel<Spu>()

console.log(model)
</script>

<template>
  <table border="0" cellpadding="0" cellspacing="0">
    <tr class="my-tr">
      <td class="my-td" colspan="2">系列</td>
      <td class="my-td" colspan="2">
        <el-input v-model="model.lensProperty.series" v-if="!isDetail" />
        <span v-else>{{ model.lensProperty.series }}</span>
      </td>
    </tr>
    <tr class="my-tr">
      <td class="my-td" colspan="2">品种</td>
      <td class="my-td" colspan="2">
        <el-input v-model="model.lensProperty.kind" v-if="!isDetail" />
        <span v-else>{{ model.lensProperty.kind }}</span>
      </td>
    </tr>
    <tr class="my-tr">
      <td class="my-td">折射率（标签打印）</td>
      <td class="my-td">
        <el-input v-model="model.lensProperty.refractive" v-if="!isDetail" />
        <span v-else>{{ model.lensProperty.refractive }}</span>
      </td>
      <td class="my-td">折射率（小程序展示）</td>
      <td class="my-td">
        <el-input v-model="model.lensProperty.refractiveShow" v-if="!isDetail" />
        <span v-else>{{ model.lensProperty.refractiveShow }}</span>
      </td>
    </tr>
    <tr class="my-tr">
      <td class="my-td" colspan="2">膜层</td>
      <td class="my-td" colspan="2">
        <el-input v-model="model.lensProperty.filmLayer" v-if="!isDetail" />
        <span v-else>{{ model.lensProperty.filmLayer }}</span>
      </td>
    </tr>
    <tr class="my-tr">
      <td class="my-td" colspan="2">执行标准</td>
      <td class="my-td" colspan="2">
        <el-input v-model="model.lensProperty.standard" v-if="!isDetail" />
        <span v-else>{{ model.lensProperty.standard }}</span>
      </td>
    </tr>
    <tr class="my-tr">
      <td class="my-td" colspan="2">色散系数</td>
      <td class="my-td" colspan="2">
        <el-input v-model="model.lensProperty.abbe" v-if="!isDetail" />
        <span v-else>{{ model.lensProperty.abbe }}</span>
      </td>
    </tr>
    <tr class="my-tr">
      <td class="my-td" colspan="2">颜色</td>
      <td class="my-td" colspan="2">
        <el-input v-model="model.lensProperty.color" v-if="!isDetail" />
        <span v-else>{{ model.lensProperty.color }}</span>
      </td>
    </tr>
    <tr class="my-tr">
      <td class="my-td" colspan="2">透射比</td>
      <td class="my-td" colspan="2">
        <el-input v-model="model.lensProperty.transmittance" v-if="!isDetail" />
        <span v-else>{{ model.lensProperty.transmittance }}</span>
      </td>
    </tr>
    <tr class="my-tr">
      <td class="my-td" colspan="2">是否区分左右眼</td>
      <td class="my-td" colspan="2">
        <el-radio-group v-model="model.lensProperty.distinguishEye">
          <el-radio :label="true" class="radio"> 是 </el-radio>
          <el-radio :label="false">否</el-radio>
        </el-radio-group>
      </td>
    </tr>
  </table>
</template>
<style scoped lang="scss">
table {
  width: 100%;
  table-layout: fixed;
  border-left: 1px #ebeef5 solid;
  border-top: 1px #ebeef5 solid;
}
.my-td {
  padding: 4px 8px;
  border-bottom: 1px #ebeef5 solid;
  border-right: 1px #ebeef5 solid;
}
.my-tr:hover {
  background: #f5f7fa;
}
</style>
