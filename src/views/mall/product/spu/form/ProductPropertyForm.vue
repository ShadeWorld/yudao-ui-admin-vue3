<script setup lang="ts">
import { ElTable } from 'element-plus'
import { PropertyAndValues } from '@/views/mall/product/spu/components'
import { PropType } from 'vue'
import type { Spu } from '@/api/mall/product/spu'

const model = defineModel<Spu>()
const props = defineProps({
  isDetail: Boolean,
  properties: {
    type: Array as PropType<PropertyAndValues[]>,
    default: () => []
  }
})

watch(
  () => props.properties,
  (properties: PropertyAndValues[]) => {
    // 判断代理对象是否为空
    if (JSON.stringify(properties) === '[]') {
      return
    }
    generateTableData(properties)
  },
  {
    deep: true,
    immediate: true
  }
)

const generateTableData = (properties: PropertyAndValues[]) => {
  // 生成属性结构
  model.value?.properties?.push(
    ...properties.map((i) => ({
      propertyId: i.id,
      propertyName: i.name,
      valueId: undefined,
      valueName: undefined
    }))
  )
}
</script>

<template>
  <el-table
    border
    class="tabNumWidth"
    max-height="500"
    size="small"
    :show-header="false"
    :data="model?.properties"
    :fit="true"
  >
    <el-table-column label="属性名">
      <template #default="{ row }">
        {{ row.propertyName }}
      </template>
    </el-table-column>
    <el-table-column label="属性值">
      <template #default="{ row }">
        <el-input v-model="row.valueName" v-if="!isDetail" />
        <span v-else>{{ row.valueName }}</span>
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped lang="scss"></style>
