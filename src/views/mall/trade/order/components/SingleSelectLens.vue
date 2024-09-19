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

const nearZero = (val1, val2) => {
  return Math.min(val1 - 0, val2 - 0)
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
      let defaultSku: any
      const sphFilter = value.filter(({ skuLens }) => between(0, [skuLens?.minSph, skuLens?.maxSph]))
      if (sphFilter.length > 0) {
        // 有sph包含0度的
        const cylFilter = sphFilter.filter(({ skuLens }) => between(0, [skuLens?.minCyl, skuLens?.maxCyl]))
        if (cylFilter.length > 0) {
          // 有sph和cyl都包含0度的
          const addFilter = cylFilter.filter(({ skuLens }) => between(0, [skuLens?.minAdd, skuLens?.maxAdd]))
          if (addFilter.length > 0) {
            // 有sph、cyl和add都包含0度的
            defaultSku = addFilter[0].skuLens
          } else {
            // 只有sph和cyl包含0度的
            defaultSku = cylFilter[0].skuLens
          }
        } else {
          // 只有sph包含0度的
          defaultSku = sphFilter[0].skuLens
        }
      } else {
        // sph都没有包含0度的
        defaultSku = value[0].skuLens
      }

      defaultRow = {
        sph: between(0, [defaultSku.minSph, defaultSku.maxSph]) ? 0 : nearZero(defaultSku.minSph, defaultSku.maxSph),
        cyl: between(0, [defaultSku.minCyl, defaultSku.maxCyl]) ? 0 : nearZero(defaultSku.minCyl, defaultSku.maxCyl),
        add: between(0, [defaultSku.minAdd, defaultSku.maxAdd]) ? 0 : nearZero(defaultSku.minAdd, defaultSku.maxAdd),
        count: 1,
        price: defaultSku?.price,
        skuId: defaultSku?.id
      }
      if (props.leftOrRight) {
        defaultRow.leftOrRight = props.leftOrRight
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
        <el-table-column label="操作" width="60px" align="center" v-if="!isDetail && !processChoose">
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
