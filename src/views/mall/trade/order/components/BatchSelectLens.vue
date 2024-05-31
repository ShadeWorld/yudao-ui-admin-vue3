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
  price: number | undefined
  skuId: number | undefined
  count: number
  selected: boolean
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
const props = defineProps<{
  skuList?: Sku[]
  spuId?: number
  degreeRange?: DegreeRange
}>()

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
const isNormal = computed(() => {
  localDegreeRange.value.minAdd === 0 && localDegreeRange.value.maxAdd === 0
})

const cylList = ref<number[]>([])

const renderGrid = () => {
  if (isNormal) {
    cylList.value.splice(0, cylList.value.length)
    for (
      let sph = localDegreeRange.value.maxSph;
      sph >= localDegreeRange.value.minSph;
      sph -= 0.25
    ) {
      // 先找rows里面有没有这一行
      let row: Row = rows.value?.find((i) => i.sph === sph)
      // 没有就new一行
      row = row ? row : { sph: sph, cols: [] }
      for (
        let cyl = localDegreeRange.value.maxCyl;
        cyl >= localDegreeRange.value.minCyl;
        cyl -= 0.25
      ) {
        if (sph === localDegreeRange.value.minSph) {
          // 保存所有柱镜（只用保存一次，用于展示横向表头）
          cylList.value.push(cyl)
        }
        // 如果该行已经有这一列，就不用重新生成了
        if (row.cols.findIndex((i) => i.cyl === cyl) > 0) continue
        let col: Col = { row: row, cyl: cyl, add: 0, ...getLensInfo(sph, cyl) }
        row.cols.push(col)
      }
      rows.value.push(row)
    }
  }
}

if (rows.value.length > 0) {
  localDegreeRange.value = {
    minSph: rows.value[0].sph,
    maxSph: rows.value[rows.value?.length - 1].sph,
    minCyl: rows.value[0].cols[0].cyl,
    maxCyl: rows.value[0].cols[0].cyl,
    minAdd: rows.value[0].cols[0].add,
    maxAdd: rows.value[0].cols[0].add
  }
  rows.value?.forEach((row) => {
    row.cols.forEach((col) => {
      localDegreeRange.value.minCyl = Math.min(localDegreeRange.value.minCyl, col.cyl)
      localDegreeRange.value.maxCyl = Math.max(localDegreeRange.value.maxCyl, col.cyl)
      localDegreeRange.value.minAdd = Math.min(localDegreeRange.value.minCyl, col.add)
      localDegreeRange.value.maxAdd = Math.max(localDegreeRange.value.maxCyl, col.add)
    })
  })
  renderGrid()
}

// 监听skuList，及时变更价格规则
watch(
  () => props.skuList,
  async (skuList) => {
    console.log('skuList变了')
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
      console.log('degreeRange变了')
      copyValueToTarget(localDegreeRange.value, degreeRange)
      // 光度范围发生变化，需要清空rows
      rows.value.splice(0, rows.value.length)
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
  console.log(firstPosition)
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
          if (between(i.cyl, [firstPosition.col, col.cyl])) {
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
  [48, 57],
  [96, 105]
]
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
}
</script>

<template>
  <table border="0" cellpadding="0" cellspacing="0">
    <tr>
      <td><!--(1, 1) 用于展示纵横（交叉）表头--></td>
      <td v-for="cyl in cylList" :key="cyl" class="tab-head">
        {{ cyl.toFixed(2) }}
      </td>
    </tr>
    <tr v-for="row in rows" :key="row.sph">
      <td class="tab-head">{{ row.sph.toFixed(2) }}</td>
      <td
        v-for="col in row.cols"
        :key="`${row.sph}, ${col.cyl}`"
        @mousedown="onMouseDown(col)"
        @mouseenter="onMouseEnter(col)"
        :class="{ 'td-selected': col.selected && col.skuId, 'td-disabled': !col.skuId }"
      >
        <div>
          <input
            v-model="col.count"
            min="0"
            type="number"
            class="count-input w-45"
            :disabled="!col.skuId"
          />
        </div>
      </td>
    </tr>
  </table>
</template>

<style scoped lang="scss">
table {
  table-layout: fixed;
  border-left: 1px #ebeef5 solid;
  border-top: 1px #ebeef5 solid;

  tr {
    td {
      border-bottom: 1px #ebeef5 solid;
      border-right: 1px #ebeef5 solid;
    }
  }
}

.tab-head {
  text-align: right;
  cursor: pointer;
  padding: 4px 8px;
}

.w-45 {
  width: 45px;
}

.count-input {
  appearance: none;
  -webkit-appearance: none !important;
  -moz-appearance: textfield !important;
  line-height: 1;
  margin: 0;
  border: none;
  outline: none;
  background: none;
  box-sizing: border-box;
}

.td-selected {
  background: #29b6f6;
  capacity: 0.6;
}

.td-disabled {
  background: #e6e8eb;
}
</style>
