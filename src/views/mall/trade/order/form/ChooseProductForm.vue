<script setup lang="ts">
import { OrderItem } from '@/api/mall/trade/order'
import * as ProductSpuApi from '@/api/mall/product/spu'
import { CascaderProps } from 'element-plus'

defineOptions({ name: 'ChooseProductForm' })

const dialogVisible = ref(false) // 弹窗的是否展示

// 商品项
const items = ref<OrderItem>()
// 商品检索条件
const search = ref<any>()

/** 打开弹窗 */
const open = async () => {
  dialogVisible.value = true
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const cascadeProps: CascaderProps = {
  lazy: true,
  async lazyLoad(node, resolve) {
    console.log('lazyLoad', node)
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

const spu = ref()
const cascadeChange = async (node) => {
  console.log('cascadeChange', node)
  spu.value = await ProductSpuApi.getLensSpu({
    categoryId: node[0],
    brandId: node[1],
    series: node[2],
    kind: node[3],
    refractive: node[4],
    filmLayer: node[5]
  })
  console.log(spu)
}
</script>

<template>
  <Dialog v-model="dialogVisible" title="选择商品" width="1500px">
    <el-row>
      <el-col :span="24">
        <el-cascader-panel
          style="width: fit-content"
          :props="cascadeProps"
          @change="cascadeChange"
        />
      </el-col>
    </el-row>
  </Dialog>
</template>

<style scoped lang="scss"></style>
