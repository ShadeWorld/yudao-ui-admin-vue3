<script setup lang="ts">
import * as ProductSpuApi from '@/api/mall/product/spu'
import { Spu } from '@/api/mall/product/spu'
import { BatchSelectLens, SingleSelectLens } from '@/views/mall/trade/order/components'
import { DegreeRange, Row } from '@/views/mall/trade/order/components/BatchSelectLens.vue'
import { OrderLens } from '@/views/mall/trade/order/components/SingleSelectLens.vue'
import { ProcessItem } from '@/views/mall/trade/order/components/ProcessOrderItem.vue'

defineOptions({ name: 'ChooseProductForm' })
const emit = defineEmits(['confirm'])

const props = withDefaults(
  defineProps<{
    processChoose?: boolean
    leftOrRight?: number
  }>(),
  {
    processChoose: false
  }
)

const model = defineModel<ProcessItem>() // 目前是只有加工订单会用到，直接把类型写死

const dialogVisible = ref(false) // 弹窗的是否展示

// 多选时所有行，传给父组件时，会把rows转为lensList
const rows = ref<Row[]>([])
// 单选时所有的行，也是传给父组件时用的结构
const lensList = ref<OrderLens[]>([])

/** 打开弹窗 */
const open = async () => {
  dialogVisible.value = true
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const lazyLoad = async (node, resolve) => {
  const { level } = node
  switch (level) {
    case 0:
      if (props.processChoose) {
        resolve(await ProductSpuApi.getCategoryList([1, 2]))
      } else {
        resolve(await ProductSpuApi.getCategoryList())
      }
      break
    case 1:
      resolve(await ProductSpuApi.getBrandList({ categoryId: node.data.value }))
      break
    case 2:
      resolve(
        await ProductSpuApi.getLenSeriesList({
          categoryId: node.parent.data.value,
          brandId: node.data.value
        })
      )
      break
    case 3:
      resolve(
        await ProductSpuApi.getLenKindList({
          categoryId: node.parent.parent.data.value,
          brandId: node.parent.data.value,
          series: node.data.value
        })
      )
      break
    case 4:
      resolve(
        await ProductSpuApi.getLenRefractiveList({
          categoryId: node.parent.parent.parent.data.value,
          brandId: node.parent.parent.data.value,
          series: node.parent.data.value,
          kind: node.data.value
        })
      )
      break
    case 5:
      resolve(
        await ProductSpuApi.getLenFilmLayerList({
          categoryId: node.parent.parent.parent.parent.data.value,
          brandId: node.parent.parent.parent.data.value,
          series: node.parent.parent.data.value,
          kind: node.parent.data.value,
          refractive: node.data.value
        })
      )
      break
  }
}

const treeProps = {
  label: 'label',
  isLeaf: 'leaf'
}

const spu = ref<Spu>()

/**
 * 镜片是否支持多选，如果是加工订单不支持多选
 * 现片如果区分左右眼，则不能多选
 * 车房统一使用单选模板
 */
const isBatchLens = computed(
  () => !props.processChoose && spu.value?.categoryId === 1 && !spu.value?.lensProperty?.distinguishEye
)

// 分类变动的回调
const nodeClick = async (data, node) => {
  if (!data.leaf) return
  spu.value = await ProductSpuApi.getLensSpu({
    categoryId: node.parent.parent.parent.parent.parent.data.value,
    brandId: node.parent.parent.parent.parent.data.value,
    series: node.parent.parent.parent.data.value,
    kind: node.parent.parent.data.value,
    refractive: node.parent.data.value,
    filmLayer: node.data.value
  })
  resetLensSelect()
}

const resetLensSelect = () => {
  if (isBatchLens.value) {
    showBatchSelectLens(spu.value!)
  } else {
    showSingleSelectLens(spu.value!)
  }
}

// 当前光度范围
const degreeRange = ref<DegreeRange>()
/**
 * 批量选择镜片
 * @param spu
 */
const showBatchSelectLens = (spu: Spu) => {
  // 生成光度范围
  const sphRangeList: number[] = []
  const cylRangeList: number[] = []
  const addRangeList: number[] = []
  spu?.skus?.map((sku) => {
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
  // 清除上一个spu的数据
  rows.value.splice(0, rows.value.length)
  lensList.value.splice(0, lensList.value.length)
}

// 单个镜片选择时球镜范围
const sphRange = ref<number[]>([])
const showSingleSelectLens = (spu: Spu) => {
  // 生成光度范围
  const sphRangeList: number[] = []
  spu?.skus?.map((sku) => {
    sphRangeList.push(sku.skuLens?.minSph, sku.skuLens?.maxSph)
  })
  sphRangeList.sort((a, b) => a - b)
  sphRange.value[0] = sphRangeList[0]
  sphRange.value[1] = sphRangeList[sphRangeList.length - 1]
  // 清除上一个spu的数据
  lensList.value.splice(0, lensList.value.length)
}

const maxHeight = () => window.innerHeight * 0.78

/**
 *
 */
const transformRows = () => {
  rows.value.forEach((row) => {
    row.cols.forEach((col) => {
      // 找出每一行有数量的col，转换格式
      if (col.count) {
        lensList.value?.push({
          sph: row.sph,
          cyl: col.cyl,
          add: col.add,
          count: col.count,
          price: col.price!,
          skuId: col.skuId!
        })
      }
    })
  })
}

/**
 * 确认按钮事件，重组rows，返回给父级
 */
const confirm = (doubleEye: boolean = false) => {
  if (isBatchLens.value) {
    // 如果是多选，需要把rows转成lensList
    transformRows()
  }
  emit('confirm', {
    doubleEye: doubleEye,
    id: spu.value?.id,
    distinguishEye: spu.value?.lensProperty?.distinguishEye,
    categoryId: spu.value?.categoryId,
    skus: spu.value?.skus,
    name: spu.value?.name,
    lensList: lensList.value
  })

  // 保存之后要重置，选择镜片的组件
  resetLensSelect()
}

/**
 * 关闭窗口
 */
const onClose = () => {
  spu.value = undefined
  rows.value.splice(0, rows.value.length)
  lensList.value.splice(0, lensList.value.length)
}
</script>

<template>
  <Dialog
    v-model="dialogVisible"
    :fullscreen="true"
    title="选择商品"
    width="1500px"
    @close="onClose"
    class="lens-dialog"
  >
    <el-row>
      <el-col :span="4">
        <el-tree
          class="choose-header"
          highlight-current
          style="max-width: 200px"
          lazy
          :load="lazyLoad"
          :props="treeProps"
          @node-click="nodeClick"
        />
      </el-col>
      <el-col :span="20">
        <el-scrollbar :height="maxHeight()" v-if="spu">
          <div class="choose-content">
            <div class="product-name">
              <el-tag> {{ spu.name }}</el-tag>
            </div>
            <template v-if="spu.categoryId === 1 || spu.categoryId === 2">
              <!-- 镜片批量选择 -->
              <BatchSelectLens v-if="isBatchLens" v-model="rows" :sku-list="spu.skus" :degree-range="degreeRange" />
              <!-- 镜片普通选择 -->
              <SingleSelectLens
                v-else
                v-model="lensList"
                :sku-list="spu.skus!"
                :sph-range="sphRange"
                :process-choose="processChoose"
                :left-or-right="leftOrRight"
              />
            </template>
            <template v-else> 其他商品</template>
          </div>
        </el-scrollbar>
      </el-col>
    </el-row>
    <template #footer>
      <div class="dialog-footer">
        <!-- 加工单 -->
        <template v-if="processChoose">
          <el-button
            type="primary"
            @click="
              () => {
                confirm()
                dialogVisible = false
              }
            "
            >确定
          </el-button>
          <el-button
            type="primary"
            @click="
              () => {
                confirm(true)
                dialogVisible = false
              }
            "
            >应用到双眼
          </el-button>
        </template>
        <!-- 普通单 -->
        <template v-else>
          <el-button
            type="primary"
            @click="
              () => {
                dialogVisible = false
              }
            "
            >完成
          </el-button>
          <el-button type="primary" @click="confirm">添加</el-button>
        </template>
      </div>
    </template>
  </Dialog>
</template>

<style lang="scss">
.choose-header {
  padding: 1px;
  height: 100%;
  border: 1px solid var(--el-border-color-light);
  border-radius: var(--el-border-radius-base);
}

.choose-content {
  color: #000;
}

.product-name {
  position: sticky;
  top: 0;
  color: #000;
  margin-bottom: 10px;
}

.lens-dialog {
  --el-dialog-margin-top: 20px;
  margin-bottom: 10px !important;
}

.is-fullscreen.lens-dialog {
  margin-bottom: 0 !important;
}
</style>
