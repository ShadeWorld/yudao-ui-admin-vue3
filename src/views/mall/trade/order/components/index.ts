import OrderTableColumn from './OrderTableColumn.vue'
import OrderItemList from './OrderItemList.vue'
import BatchSelectLens from './BatchSelectLens.vue'
import PrintShipList from './PrintShipList.vue'
import PrintTagList from './PrintTagList.vue'
import SingleSelectLens from './SingleSelectLens.vue'
import ProcessOrderItem from './ProcessOrderItem.vue'
import { Sku } from '@/api/mall/product/spu'
import { OrderLens } from '@/views/mall/trade/order/components/SingleSelectLens.vue'

export {
  OrderTableColumn,
  OrderItemList,
  BatchSelectLens,
  PrintShipList,
  PrintTagList,
  SingleSelectLens,
  ProcessOrderItem
}

/**
 * 判断target是否再interval之间
 * @param target
 * @param interval
 */
const between = (target: number, interval: number[]): boolean => {
  interval.sort((a, b) => a - b)
  return target >= interval[0] && target <= interval[1]
}

export const calcDegreeRange = (currentValue: number, row: OrderLens, type: string, skuList: Sku[]) => {
  const cylRangeList: number[] = []
  const addRangeList: number[] = []
  switch (type) {
    case 'sph':
      skuList.forEach(({ skuLens }) => {
        if (between(currentValue, [skuLens?.minSph, skuLens?.maxSph])) {
          cylRangeList.push(skuLens?.minCyl, skuLens?.maxCyl)
          addRangeList.push(skuLens?.minAdd, skuLens?.maxAdd)
        }
      })
      cylRangeList.sort((a, b) => a - b)
      addRangeList.sort((a, b) => a - b)
      row.cylRange = [cylRangeList[0], cylRangeList[cylRangeList.length - 1]]
      row.addRange = [addRangeList[0], addRangeList[addRangeList.length - 1]]

      if (!between(row.cyl, row.cylRange)) {
        row.cyl = row.cylRange[0]
      }
      if (!between(row.add, row.addRange)) {
        row.add = row.addRange[0]
      }
      break
    case 'cyl':
      skuList.forEach(({ skuLens }) => {
        if (
          between(row.sph, [skuLens?.minSph, skuLens?.maxSph]) &&
          between(currentValue, [skuLens?.minCyl, skuLens?.maxCyl])
        ) {
          addRangeList.push(skuLens?.minAdd, skuLens?.maxAdd)
        }
      })
      addRangeList.sort((a, b) => a - b)
      row.addRange = [addRangeList[0], addRangeList[addRangeList.length - 1]]

      if (!between(row.add, row.addRange)) {
        row.add = row.addRange[0]
      }
      break
    case 'add':
      skuList.forEach(({ skuLens }) => {
        if (
          between(row.sph, [skuLens?.minSph, skuLens?.maxSph]) &&
          between(currentValue, [skuLens?.minAdd, skuLens?.maxAdd])
        ) {
          cylRangeList.push(skuLens?.minCyl, skuLens?.maxCyl)
        }
      })
      cylRangeList.sort((a, b) => a - b)
      row.cylRange = [cylRangeList[0], cylRangeList[cylRangeList.length - 1]]

      if (!between(row.cyl, row.cylRange)) {
        row.cyl = row.cylRange[0]
      }
      break
  }

  const skuLensPrice = skuList.find(
    ({ skuLens }) =>
      between(row.sph, [skuLens?.minSph, skuLens?.maxSph]) &&
      between(row.cyl, [skuLens?.minCyl, skuLens?.maxCyl]) &&
      between(row.add, [skuLens?.minAdd, skuLens?.maxAdd])
  )
  row.price = skuLensPrice?.price
  row.skuId = skuLensPrice?.id
}
