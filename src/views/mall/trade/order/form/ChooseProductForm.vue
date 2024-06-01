<script setup lang="ts">
import * as ProductSpuApi from '@/api/mall/product/spu'
import { Spu } from '@/api/mall/product/spu'
import { CascaderProps } from 'element-plus'
import { BatchSelectLens } from '@/views/mall/trade/order/components'
import { DegreeRange, Row } from '@/views/mall/trade/order/components/BatchSelectLens.vue'

defineOptions({ name: 'ChooseProductForm' })
const emit = defineEmits(['confirm'])

const dialogVisible = ref(false) // 弹窗的是否展示

// 所有行
const rows = ref<Row[]>([])

/** 打开弹窗 */
const open = async () => {
  dialogVisible.value = true
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const cascadeProps: CascaderProps = {
  lazy: true,
  async lazyLoad(node, resolve) {
    const { level } = node
    switch (level) {
      case 0:
        resolve(await ProductSpuApi.getCategoryList())
        break
      case 1:
        resolve(await ProductSpuApi.getBrandList({ categoryId: node.value }))
        break
      case 2:
        resolve(
          await ProductSpuApi.getLenSeriesList({
            categoryId: node.pathValues[0],
            brandId: node.pathValues[1]
          })
        )
        break
      case 3:
        resolve(
          await ProductSpuApi.getLenKindList({
            categoryId: node.pathValues[0],
            brandId: node.pathValues[1],
            series: node.pathValues[2]
          })
        )
        break
      case 4:
        resolve(
          await ProductSpuApi.getLenRefractiveList({
            categoryId: node.pathValues[0],
            brandId: node.pathValues[1],
            series: node.pathValues[2],
            kind: node.pathValues[3]
          })
        )
        break
      case 5:
        resolve(
          await ProductSpuApi.getLenFilmLayerList({
            categoryId: node.pathValues[0],
            brandId: node.pathValues[1],
            series: node.pathValues[2],
            kind: node.pathValues[3],
            refractive: node.pathValues[4]
          })
        )
        break
    }
  }
}

const spu = ref<Spu>()

const degreeRange = ref<DegreeRange>()
const cascadeChange = async (node) => {
  spu.value = await ProductSpuApi.getLensSpu({
    categoryId: node[0],
    brandId: node[1],
    series: node[2],
    kind: node[3],
    refractive: node[4],
    filmLayer: node[5]
  })

  // 生成光度范围
  const sphRangeList: number[] = []
  const cylRangeList: number[] = []
  const addRangeList: number[] = []
  spu.value?.skus?.map((sku) => {
    sphRangeList.push(sku.skuLens?.minSph, sku.skuLens?.maxSph)
    cylRangeList.push(sku.skuLens?.minCyl, sku.skuLens?.maxCyl)
    addRangeList.push(sku.skuLens?.minAdd, sku.skuLens?.maxAdd)
  })
  sphRangeList.sort((a, b) => a - b)
  cylRangeList.sort((a, b) => a - b)
  addRangeList.sort((a, b) => a - b)
  degreeRange.value = {
    minSph: sphRangeList[0],
    maxSph: sphRangeList[sphRangeList.length - 1],
    minCyl: cylRangeList[0],
    maxCyl: cylRangeList[cylRangeList.length - 1],
    minAdd: addRangeList[0],
    maxAdd: addRangeList[addRangeList.length - 1]
  }
}

const onClose = () => {
  spu.value = undefined
  rows.value = []
}

const confirm = () => {
  let lensList = []
  rows.value.forEach((row) => {
    row.cols.forEach((col) => {
      // 找出每一行有数量的col，转换格式
      if (col.count > 0) {
        lensList.push({
          sph: row.sph,
          cyl: col.cyl,
          add: col.add,
          count: col.count,
          price: col.price,
          skuId: col.skuId
        })
      }
    })
  })
  emit('confirm', {
    id: spu.value?.id,
    name: spu.value?.name,
    lensList: lensList
  })
  dialogVisible.value = false
}
</script>

<template>
  <Dialog
    v-model="dialogVisible"
    :fullscreen="true"
    title="选择商品"
    width="1500px"
    @close="onClose"
  >
    <el-row>
      <el-col :span="18">
        <el-cascader-panel
          style="width: fit-content"
          :props="cascadeProps"
          @change="cascadeChange"
        />
        <div class="content" v-if="spu">
          <div class="header">
            {{ spu.name }}
          </div>
          <BatchSelectLens v-model="rows" :sku-list="spu.skus" :degree-range="degreeRange" />
        </div>
      </el-col>
      <el-col :span="6">
        <el-row justify="end">
          <el-button type="primary" @click="confirm">保存</el-button>
        </el-row>
      </el-col>
    </el-row>
  </Dialog>
</template>

<style scoped lang="scss">
.content {
  color: #000;
  margin-top: 20px;
}
.header {
  color: #000;
  margin-bottom: 10px;
}
</style>
