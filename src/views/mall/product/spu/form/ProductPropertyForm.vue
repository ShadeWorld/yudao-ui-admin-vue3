<script setup lang="ts">
import { ElTable } from 'element-plus'
import { PropertyAndValues } from '@/views/mall/product/spu/components'
import { PropType } from 'vue'
import type { Spu } from '@/api/mall/product/spu'
import * as PropertyApi from '@/api/mall/product/property'

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

const handleInputConfirm = async (value, propertyId: number) => {
  if (value) {
    // 保存属性值
    try {
      await PropertyApi.createPropertyValue({ propertyId, name: value })
    } catch {
      console.log('添加失败，请重试')
    }
  }
}
</script>

<template>
  <el-table
    v-if="!isDetail"
    border
    class="tabNumWidth"
    max-height="500"
    size="small"
    :show-header="false"
    :data="model?.properties"
    :fit="true"
  >
    <!--    <el-table-column-->
    <!--      v-for="(item, index) in tableHeaders"-->
    <!--      :key="index"-->
    <!--      :label="item.label"-->
    <!--      align="center"-->
    <!--      min-width="120"-->
    <!--    >-->
    <!--      <template #default="{ row }">-->
    <!--        <span style="font-weight: bold; color: #40aaff">-->
    <!--          {{ row.properties[index]?.valueName }}-->
    <!--        </span>-->
    <!--      </template>-->
    <!--    </el-table-column>-->
    <el-table-column label="属性名">
      <template #default="{ row }">
        {{ row.propertyName }}
      </template>
    </el-table-column>
    <el-table-column label="属性值">
      <template #default="{ row }">
        <el-input
          v-model="row.valueName"
          @blur="handleInputConfirm(row.valueName, row.propertyId)"
        />
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped lang="scss"></style>
