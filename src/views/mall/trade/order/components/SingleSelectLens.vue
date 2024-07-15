<script setup lang="ts">
import { Sku } from '@/api/mall/product/spu'
import { Plus } from '@element-plus/icons-vue'
import { calcDegreeRange } from '@/views/mall/trade/order/components/index'

/**
 * 判断target是否再interval之间
 * @param target
 * @param interval
 */
const between = (target: number, interval: number[]): boolean => {
  interval.sort((a, b) => a - b)
  return target >= interval[0] && target <= interval[1]
}

export interface OrderLens {
  sph: number
  cyl: number
  add: number
  leftOrRight?: number
  axis?: number
  pd?: number
  ph?: number
  count?: number
  price?: number
  skuId?: number
  cylRange?: number[]
  addRange?: number[]
}

const model = defineModel<OrderLens[]>()
let defaultRow: OrderLens

const props = withDefaults(
  defineProps<{
    skuList?: Sku[]
    spuId?: number
    sphRange?: number[]
    isDetail?: boolean
    processChoose?: boolean
    leftOrRight?: number
  }>(),
  {
    isDetail: false,
    processChoose: false
  }
)

const addLensRow = () => {
  model.value?.push(JSON.parse(JSON.stringify(defaultRow)))
}

const delLensRow = (row: OrderLens) => {
  model.value?.splice(
    model.value?.findIndex((i) => i === row),
    1
  )
}

watch(
  () => props.skuList,
  (value) => {
    if (value) {
      const skuLensPrice = value.find(
        ({ skuLens }) =>
          between(0, [skuLens?.minSph, skuLens?.maxSph]) &&
          between(0, [skuLens?.minCyl, skuLens?.maxCyl]) &&
          between(0, [skuLens?.minAdd, skuLens?.maxAdd])
      )
      defaultRow = {
        sph: 0,
        cyl: 0,
        add: 0,
        count: 1,
        price: skuLensPrice?.price,
        skuId: skuLensPrice?.id
      }
      if (props.leftOrRight) {
        defaultRow.leftOrRight = props.leftOrRight.toString()
      }
      calcDegreeRange(defaultRow.sph, defaultRow, 'sph', props.skuList)
      if (!model.value?.length) {
        model.value?.push(JSON.parse(JSON.stringify(defaultRow)))
      }
    }
  },
  {
    immediate: true
  }
)
</script>

<template>
  <div style="width: 100%">
    <el-row justify="end" style="margin-bottom: 10px" v-if="!isDetail && !processChoose">
      <el-button size="small" type="primary" :icon="Plus" plain @click="addLensRow" />
    </el-row>
    <el-form :disabled="isDetail">
      <el-table :data="model!" size="small" border>
        <el-table-column label="球镜" align="center" min-width="15">
          <template #default="{ row }">
            <el-tooltip
              class="box-item"
              effect="dark"
              placement="top"
              v-if="!isDetail"
              :content="`${sphRange[0].toFixed(2)}到${sphRange[1].toFixed(2)}`"
            >
              <el-input-number
                v-model="row.sph"
                :precision="2"
                :step="0.25"
                size="small"
                step-strictly
                :min="sphRange?.[0]"
                :max="sphRange?.[1]"
                @change="
                  (currentValue) => {
                    calcDegreeRange(currentValue, row, 'sph', skuList)
                  }
                "
              />
            </el-tooltip>
            <el-text v-else>
              {{ row.sph.toFixed(2) }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column label="柱镜" align="center" min-width="15">
          <template #default="{ row }">
            <el-tooltip
              class="box-item"
              effect="dark"
              placement="top"
              v-if="!isDetail"
              :content="`${row.cylRange[0].toFixed(2)}到${row.cylRange[1].toFixed(2)}`"
            >
              <el-input-number
                v-model="row.cyl"
                :precision="2"
                :step="0.25"
                size="small"
                step-strictly
                :min="row.cylRange[0]"
                :max="row.cylRange[1]"
                @change="
                  (currentValue) => {
                    calcDegreeRange(currentValue, row, 'cyl', skuList)
                  }
                "
              />
            </el-tooltip>
            <el-text v-else>
              {{ row.cyl.toFixed(2) }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column label="加光" align="center" min-width="15">
          <template #default="{ row }">
            <el-tooltip
              class="box-item"
              effect="dark"
              placement="top"
              v-if="!isDetail"
              :content="`${row.addRange[0].toFixed(2)}到${row.addRange[1].toFixed(2)}`"
            >
              <el-input-number
                v-model="row.add"
                :precision="2"
                :step="0.25"
                size="small"
                step-strictly
                :min="row.addRange[0]"
                :max="row.addRange[1]"
                @change="
                  (currentValue) => {
                    calcDegreeRange(currentValue, row, 'add', skuList)
                  }
                "
              />
            </el-tooltip>
            <el-text v-else>
              {{ row.add.toFixed(2) }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column label="左右" align="center" min-width="15" v-if="!processChoose">
          <template #default="{ row }">
            <el-select v-model="row.leftOrRight" clearable placeholder="请选择" v-if="!isDetail">
              <el-option value="1" label="左" />
              <el-option value="2" label="右" />
            </el-select>
            <el-text v-else>
              {{ row.leftOrRight === undefined ? '' : row.leftOrRight === 1 ? '左' : '右' }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column label="轴位" align="center" min-width="15">
          <template #default="{ row }">
            <el-input-number
              v-model="row.axis"
              :precision="0"
              :step="1"
              size="small"
              :min="0"
              :max="180"
              :controls="false"
              v-if="!isDetail"
            />
            <el-text v-else>
              {{ row.axis }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column label="瞳距" align="center" min-width="15" v-if="processChoose">
          <template #default="{ row }">
            <el-input-number
              v-model="row.pd"
              :precision="2"
              :step="0.01"
              size="small"
              :min="0"
              :controls="false"
              v-if="!isDetail"
            />
            <el-text v-else>
              {{ row.pd }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column label="瞳高" align="center" min-width="15" v-if="processChoose">
          <template #default="{ row }">
            <el-input-number
              v-model="row.ph"
              :precision="2"
              :step="0.01"
              size="small"
              :min="0"
              :controls="false"
              v-if="!isDetail"
            />
            <el-text v-else>
              {{ row.ph }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column label="数量" align="center" min-width="15">
          <template #default="{ row }">
            <el-input-number v-model="row.count" :precision="0" :step="1" size="small" :min="1" v-if="!isDetail" />
            <el-text v-else>
              {{ row.count }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="30px" align="center" v-if="!isDetail && !processChoose">
          <template #default="{ row }">
            <el-button link type="primary" @click="delLensRow(row)" :disabled="model?.length <= 1">
              <Icon icon="ep:delete" />
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
  </div>
</template>

<style scoped lang="scss"></style>
