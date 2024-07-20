<script setup lang="ts">
import { Sku } from '@/api/mall/product/spu'
import { copyValueToTarget } from '@/utils'

export interface Row {
  sph: number
  cols: Col[]
}

export interface Col {
  row: Row
  cyl: number
  add: number
  price?: number
  skuId?: number
  count?: number
  selected?: boolean
}

export interface DegreeRange {
  minSph: number
  maxSph: number
  minCyl: number
  maxCyl: number
  minAdd: number
  maxAdd: number
}

const rows = defineModel<Row[]>()
const props = withDefaults(
  defineProps<{
    skuList?: Sku[]
    spuId?: number
    degreeRange?: DegreeRange
    isDetail?: boolean
  }>(),
  {
    isDetail: false
  }
)

const localSkuList: Sku[] = []

/**
 * 判断target是否再interval之间
 * @param target
 * @param interval
 */
const between = (target: number, interval: number[]): boolean => {
  interval.sort((a, b) => a - b)
  return target >= interval[0] && target <= interval[1]
}

/**
 * 获取光度价格信息
 * @param sph 球镜
 * @param cyl 柱镜
 * @param add 加光
 */
const getLensInfo = (sph: number, cyl: number = 0, add: number = 0) => {
  let lensInfo = {}
  localSkuList.forEach((sku) => {
    if (
      between(sph, [sku.skuLens?.minSph, sku.skuLens?.maxSph]) &&
      between(cyl, [sku.skuLens?.minCyl, sku.skuLens?.maxCyl]) &&
      between(add, [sku.skuLens?.minAdd, sku.skuLens?.maxAdd])
    ) {
      // 柱镜、球镜、加光分别都符合
      if (sku.skuLens?.minUnion !== 0 || sku.skuLens?.maxUnion !== 0) {
        // 设置了联合光度
        if (between(sph + cyl + add, [sku.skuLens?.minUnion, sku.skuLens?.maxUnion])) {
          // 联合光度也符合
          lensInfo = {
            skuId: sku.id,
            price: sku.price
          }
        }
      } else {
        // 未设置联合光度
        lensInfo = {
          skuId: sku.id,
          price: sku.price
        }
      }
    }
  })
  return lensInfo
}

const localDegreeRange = ref<DegreeRange>({
  minSph: undefined,
  maxSph: undefined,
  minCyl: undefined,
  maxCyl: undefined,
  minAdd: undefined,
  maxAdd: undefined
})

// 普通镜片，只有球柱镜
const isNormal = computed(() => localDegreeRange.value.minAdd === 0 && localDegreeRange.value.maxAdd === 0)

const colList = ref<number[]>([])

const renderGrid = () => {
  // 清空横轴度数
  colList.value.splice(0, colList.value.length)
  for (let sph = localDegreeRange.value.maxSph; sph >= localDegreeRange.value.minSph; sph -= 0.25) {
    // 先找rows里面有没有这一行
    let row: Row | undefined = rows.value?.find((i) => i.sph === sph)
    if (!row) {
      // 没有就new一个，然后push到rows里面
      row = row ? row : { sph: sph, cols: [] }
      rows.value?.push(row)
    }
    if (isNormal.value) {
      // 球镜和柱镜的情况
      for (let cyl = localDegreeRange.value.maxCyl; cyl >= localDegreeRange.value.minCyl; cyl -= 0.25) {
        if (sph === localDegreeRange.value.maxSph) {
          // 保存所有柱镜（只用保存一次，用于展示横向表头）
          colList.value.push(cyl)
        }
        // 如果该行已经有这一列，就不用重新生成了
        if (row.cols.findIndex((i) => i.cyl === cyl) > -1) continue
        let col: Col = { row: row, cyl: cyl, add: 0, ...getLensInfo(sph, cyl) }
        row.cols.push(col)
      }
      row.cols.sort((a, b) => b.cyl - a.cyl)
    } else {
      // 球镜和ADD的情况
      for (let add = localDegreeRange.value.maxAdd; add >= localDegreeRange.value.minAdd; add -= 0.25) {
        if (sph === localDegreeRange.value.maxSph) {
          // 保存所有柱镜（只用保存一次，用于展示横向表头）
          colList.value.push(add)
        }
        // 如果该行已经有这一列，就不用重新生成了
        if (row.cols.findIndex((i) => i.add === add) > -1) continue
        let col: Col = { row: row, cyl: 0, add: add, ...getLensInfo(sph, 0, add) }
        row.cols.push(col)
      }
      row.cols.sort((a, b) => b.add - a.add)
    }
  }
  // 把行按度数从低到高排序
  rows.value?.sort((a, b) => b.sph - a.sph)
}

if (rows.value?.length) {
  // 添加订单或订单详情的商品列表详情按钮会进这里
  localDegreeRange.value = {
    minSph: rows.value[rows.value?.length - 1].sph,
    maxSph: rows.value[0].sph,
    minCyl: rows.value[0].cols[0].cyl,
    maxCyl: rows.value[0].cols[0].cyl,
    minAdd: rows.value[0].cols[0].add,
    maxAdd: rows.value[0].cols[0].add
  }
  rows.value?.forEach((row) => {
    localDegreeRange.value.minSph = Math.min(localDegreeRange.value.minSph, row.sph)
    localDegreeRange.value.maxSph = Math.max(localDegreeRange.value.maxSph, row.sph)
    row.cols.forEach((col) => {
      localDegreeRange.value.minCyl = Math.min(localDegreeRange.value.minCyl, col.cyl)
      localDegreeRange.value.maxCyl = Math.max(localDegreeRange.value.maxCyl, col.cyl)
      localDegreeRange.value.minAdd = Math.min(localDegreeRange.value.minAdd, col.add)
      localDegreeRange.value.maxAdd = Math.max(localDegreeRange.value.maxAdd, col.add)
    })
  })
  renderGrid()
}

// 监听skuList，及时变更价格规则
watch(
  () => props.skuList,
  async (skuList) => {
    if (skuList) {
      localSkuList.splice(0, localSkuList.length)
      localSkuList.push(...skuList)
    }
  },
  {
    immediate: true
  }
)

// 监听光度范围变化，及时刷新表格
watch(
  () => props.degreeRange,
  async (degreeRange) => {
    if (degreeRange) {
      copyValueToTarget(localDegreeRange.value, degreeRange)
      // 光度范围发生变化，需要清空rows
      rows.value?.splice(0, rows.value?.length)
      renderGrid()
    }
  },
  {
    immediate: true
  }
)

let mouseDown = false
let firstPosition: any
const onMouseDown = (col: Col) => {
  if (!col.skuId) return
  mouseDown = true
  firstPosition = { col: col.cyl, row: col.row.sph }
}

const onMouseEnter = (col: Col) => {
  if (!col.skuId) return
  if (mouseDown) {
    rows.value?.forEach((row) => {
      row.cols.forEach((col) => {
        col.selected = false
      })
    })
    // 遍历所有列，将选中的col.selected设为true
    rows.value?.forEach((row) => {
      if (between(row.sph, [firstPosition.row, col.row.sph])) {
        row.cols.forEach((i) => {
          if (between(i.cyl, [firstPosition.col, col.cyl]) && i.skuId) {
            i.selected = true
          }
        })
      }
    })
  }
}
window.onmousedown = () => {
  rows.value?.forEach((row) => {
    row.cols.forEach((col) => {
      col.selected = false
    })
  })
}
window.onmouseup = () => {
  mouseDown = false
}

const numberKeyCodeRange = [
  // 数字1-9
  [48, 57],
  // 小键盘1-9
  [96, 105]
]
const backspaceCode = 8
window.onkeyup = (e) => {
  if (between(e.keyCode, numberKeyCodeRange[0])) {
    rows.value?.forEach((row) => {
      row.cols.forEach((col) => {
        if (col.selected) {
          col.count = e.keyCode - 48
        }
      })
    })
  }
  if (between(e.keyCode, numberKeyCodeRange[1])) {
    rows.value?.forEach((row) => {
      row.cols.forEach((col) => {
        if (col.selected) {
          col.count = e.keyCode - 96
        }
      })
    })
  }
  if (e.keyCode === backspaceCode) {
    rows.value?.forEach((row) => {
      row.cols.forEach((col) => {
        if (col.selected) {
          col.count = undefined
        }
      })
    })
  }
}
</script>

<template>
  <table border="0" cellpadding="0" cellspacing="0">
    <thead>
      <tr>
        <td>
          <!--(1, 1) 用于展示纵横（交叉）表头-->
          {{ isNormal ? 'SPH/CYL' : 'SPH/ADD' }}
        </td>
        <td v-for="col in colList" :key="col" class="tab-head">
          {{ col.toFixed(2) }}
        </td>
      </tr>
    </thead>
    <tr v-for="row in rows" :key="row.sph">
      <td class="tab-head">{{ row.sph.toFixed(2) }}</td>
      <td
        v-for="col in row.cols"
        :key="isNormal ? `${row.sph}, ${col.cyl}` : `${row.sph}, ${col.add}`"
        @mousedown="onMouseDown(col)"
        @mouseenter="onMouseEnter(col)"
        :class="{ 'td-selected': col.selected && col.skuId, 'td-disabled': !col.skuId }"
      >
        <div>
          <input
            v-model="col.count"
            min="0"
            step="1"
            type="number"
            class="count-input w-45"
            :disabled="!col.skuId || isDetail"
          />
        </div>
      </td>
    </tr>
  </table>
</template>

<style scoped lang="scss">
table {
  user-select: none;
  font-size: 12px;
  line-height: 18px;
  table-layout: fixed;
  border-left: 1px #ebeef5 solid;
  border-top: 1px #ebeef5 solid;

  thead tr td {
    position: sticky;
    top: 0;
    background: #f4f4f5;
    height: 30px;
  }

  tr {
    td:first-child {
      height: 30px;
      position: sticky;
      left: 0;
      background: #f4f4f5;
      right: 0;
      text-align: center;
    }

    td {
      width: 60px;
      height: 25px;
      border-bottom: 1px #ebeef5 solid;
      border-right: 1px #ebeef5 solid;
    }
  }
}

.tab-head {
  text-align: center;
  cursor: pointer;
}

.w-45 {
  width: 45px;
}

.count-input {
  -webkit-appearance: none !important;
  line-height: 1;
  margin: 0;
  border: none;
  outline: none;
  background: none;
  box-sizing: border-box;
}

.td-selected {
  background: #29b6f6;
}

.td-disabled {
  background: #e6e8eb;
}

input {
  -webkit-appearance: none !important;
}
</style>
