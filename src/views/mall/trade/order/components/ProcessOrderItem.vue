<script setup lang="ts">
import { OrderItem } from '@/api/mall/trade/order'
import { ElTable } from 'element-plus'
import ChooseProductForm from '@/views/mall/trade/order/form/ChooseProductForm.vue'
import { formatLensDegree } from '@/utils'

export interface ProcessItem {
  isSelf: boolean
  spuId?: number
  categoryId?: number
  spuName?: string
  skuId?: number
  price?: number
  sph?: number // 球镜
  cyl?: number // 柱镜
  add?: number // 加光
  leftOrRight?: number // 左右眼
  axis?: number // 轴位
  prism?: number // 棱镜
  pd?: number // 瞳距
  ph?: number // 瞳高
  count?: number // 数量
}

const chooseProductFormRef = ref() // 选择镜片弹窗

const currentType = ref(0)

const model = defineModel<OrderItem[]>()

const rightLens = ref<ProcessItem>({
  isSelf: false,
  spuId: undefined,
  categoryId: undefined,
  spuName: undefined,
  skuId: undefined,
  price: undefined,
  sph: undefined, // 球镜
  cyl: undefined, // 柱镜
  add: undefined, // 加光
  leftOrRight: undefined, // 左右眼
  axis: undefined, // 轴位
  prism: undefined, // 棱镜
  pd: undefined, // 瞳距
  ph: undefined, // 瞳高
  count: undefined
})
const leftLens = ref<ProcessItem>({
  isSelf: false,
  spuId: undefined,
  categoryId: undefined,
  spuName: undefined,
  skuId: undefined,
  price: undefined,
  sph: undefined, // 球镜
  cyl: undefined, // 柱镜
  add: undefined, // 加光
  leftOrRight: undefined, // 左右眼
  axis: undefined, // 轴位
  prism: undefined, // 棱镜
  pd: undefined, // 瞳距
  ph: undefined, // 瞳高
  count: undefined
})

/**
 * 修改镜片来源
 * @param value true-自备 false-选择
 * @param type 1-左 2-右
 */
const onChangeLensSource = (value: boolean, type: number) => {
  if (type === 1) {
    leftLens.value.isSelf = value
  } else {
    rightLens.value.isSelf = value
  }
}

const onConfirm = (checkedSpu: any) => {
  let lens = {
    isSelf: leftLens.value.isSelf,
    spuId: checkedSpu.id,
    categoryId: checkedSpu.categoryId,
    spuName: checkedSpu.name,
    skuId: checkedSpu.lensList[0].skuId,
    price: checkedSpu.lensList[0].price,
    sph: checkedSpu.lensList[0].sph,
    cyl: checkedSpu.lensList[0].cyl,
    add: checkedSpu.lensList[0].add,
    leftOrRight: checkedSpu.lensList[0].leftOrRight,
    axis: checkedSpu.lensList[0].axis,
    prism: checkedSpu.lensList[0].prism,
    pd: checkedSpu.lensList[0].pd,
    ph: checkedSpu.lensList[0].ph,
    count: checkedSpu.lensList[0].count
  }
  if (checkedSpu.doubleEye) {
    leftLens.value = JSON.parse(JSON.stringify(lens))
    rightLens.value = JSON.parse(JSON.stringify(lens))
  } else {
    if (currentType.value === 1) {
      leftLens.value = JSON.parse(JSON.stringify(lens))
    } else {
      rightLens.value = JSON.parse(JSON.stringify(lens))
    }
  }
}

const validate = () => {
  if (!leftLens.value.isSelf) {
    model.value?.push({
      spuId: leftLens.value.spuId,
      categoryId: leftLens.value.categoryId,
      spuName: leftLens.value.spuName,
      skuId: leftLens.value.skuId,
      price: leftLens.value.price,
      count: leftLens.value.count,
      orderLensList: [
        {
          sph: leftLens.value.sph,
          cyl: leftLens.value.cyl,
          add: leftLens.value.add,
          leftOrRight: leftLens.value.leftOrRight,
          axis: leftLens.value.axis,
          prism: leftLens.value.prism,
          pd: leftLens.value.pd,
          ph: leftLens.value.ph,
          count: leftLens.value.count
        }
      ]
    })
  }
  if (!rightLens.value.isSelf) {
    model.value?.push({
      spuId: rightLens.value.spuId,
      categoryId: rightLens.value.categoryId,
      spuName: rightLens.value.spuName,
      skuId: rightLens.value.skuId,
      price: rightLens.value.price,
      count: rightLens.value.count,
      orderLensList: [
        {
          sph: rightLens.value.sph,
          cyl: rightLens.value.cyl,
          add: rightLens.value.add,
          leftOrRight: rightLens.value.leftOrRight,
          axis: rightLens.value.axis,
          prism: rightLens.value.prism,
          pd: rightLens.value.pd,
          ph: rightLens.value.ph,
          count: rightLens.value.count
        }
      ]
    })
  }
}

const productPrice = () => {
  let price = 0
  if (!leftLens.value.isSelf && leftLens.value.skuId) {
    price += leftLens.value.price! * leftLens.value.count!
  }
  if (!rightLens.value.isSelf && rightLens.value.skuId) {
    price += rightLens.value.price! * rightLens.value.count!
  }
  return price
}
defineExpose({ validate, productPrice })
</script>

<template>
  <el-row>
    <el-form-item label="左眼">
      <el-radio-group v-model="leftLens.isSelf" @change="onChangeLensSource($event, 1)" class="w-80">
        <el-radio :label="false" class="radio">选择镜片</el-radio>
        <el-radio :label="true">自备镜片</el-radio>
      </el-radio-group>
    </el-form-item>
  </el-row>
  <el-row>
    <el-form-item v-if="!leftLens.isSelf">
      <el-tag class="mb-10px mr-15px" v-if="leftLens.spuName">
        {{ leftLens.spuName }}
      </el-tag>
      <el-button
        class="mb-10px mr-15px"
        @click="
          () => {
            currentType = 1
            chooseProductFormRef.open()
          }
        "
        type="primary"
        size="small"
      >
        选择镜片
      </el-button>
      <el-table :data="[leftLens]" border class="tabNumWidth" size="small">
        <el-table-column align="center" label="球镜" min-width="20">
          <template #default="{ row }">
            {{ formatLensDegree(row.sph) }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="柱镜" min-width="20">
          <template #default="{ row }">
            {{ formatLensDegree(row.cyl) }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="加光" min-width="20">
          <template #default="{ row }">
            {{ formatLensDegree(row.add) }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="轴位" min-width="20">
          <template #default="{ row }">
            <el-input-number
              v-model="row.axis"
              :precision="0"
              :step="1"
              size="small"
              :min="0"
              :max="180"
              :controls="false"
            />
          </template>
        </el-table-column>
        <!--        <el-table-column align="center" label="棱镜" min-width="150">-->
        <!--          <template #default="{ row }">-->
        <!--            {{ row.sph }}-->
        <!--          </template>-->
        <!--        </el-table-column>-->
        <el-table-column align="center" label="瞳距" min-width="20">
          <template #default="{ row }">
            <el-input-number v-model="row.pd" :precision="2" :step="0.01" size="small" :min="0" :controls="false" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="瞳高" min-width="20">
          <template #default="{ row }">
            <el-input-number v-model="row.ph" :precision="2" :step="0.01" size="small" :min="0" :controls="false" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="数量" min-width="20">
          <template #default="{ row }">
            <el-input-number v-model="row.count" :precision="0" :step="1" size="small" :min="1" />
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>
  </el-row>
  <el-row>
    <el-form-item label="右眼">
      <el-radio-group v-model="rightLens.isSelf" @change="onChangeLensSource($event, 2)" class="w-80">
        <el-radio :label="false" class="radio">选择镜片</el-radio>
        <el-radio :label="true">自备镜片</el-radio>
      </el-radio-group>
    </el-form-item>
  </el-row>
  <el-row>
    <el-form-item v-if="!rightLens.isSelf">
      <el-tag class="mb-10px mr-15px" v-if="rightLens.spuName">
        {{ rightLens.spuName }}
      </el-tag>
      <el-button
        class="mb-10px mr-15px"
        @click="
          () => {
            currentType = 2
            chooseProductFormRef.open()
          }
        "
        type="primary"
        size="small"
      >
        选择镜片
      </el-button>
      <el-table :data="[rightLens]" border class="tabNumWidth" size="small">
        <el-table-column align="center" label="球镜" min-width="20">
          <template #default="{ row }">
            {{ formatLensDegree(row.sph) }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="柱镜" min-width="20">
          <template #default="{ row }">
            {{ formatLensDegree(row.cyl) }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="加光" min-width="20">
          <template #default="{ row }">
            {{ formatLensDegree(row.add) }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="轴位" min-width="20">
          <template #default="{ row }">
            <el-input-number
              v-model="row.axis"
              :precision="0"
              :step="1"
              size="small"
              :min="0"
              :max="180"
              :controls="false"
            />
          </template>
        </el-table-column>
        <!--        <el-table-column align="center" label="棱镜" min-width="150">-->
        <!--          <template #default="{ row }">-->
        <!--            {{ row.sph }}-->
        <!--          </template>-->
        <!--        </el-table-column>-->
        <el-table-column align="center" label="瞳距" min-width="20">
          <template #default="{ row }">
            <el-input-number v-model="row.pd" :precision="2" :step="0.01" size="small" :min="0" :controls="false" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="瞳高" min-width="20">
          <template #default="{ row }">
            <el-input-number v-model="row.ph" :precision="2" :step="0.01" size="small" :min="0" :controls="false" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="数量" min-width="20">
          <template #default="{ row }">
            <el-input-number v-model="row.count" :precision="0" :step="1" size="small" :min="1" />
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>
  </el-row>

  <ChooseProductForm
    ref="chooseProductFormRef"
    @confirm="onConfirm"
    :process-choose="true"
    :left-or-right="currentType"
  />
</template>

<style scoped lang="scss"></style>
