<!-- 商品发布 - 基础设置 -->
<template>
  <el-form ref="formRef" :disabled="isDetail" :model="formData" :rules="rules" label-width="120px">
    <el-row>
      <el-col :span="12">
        <el-form-item label="商品分类" prop="categoryId">
          <el-cascader
            v-model="formData.categoryId"
            :options="categoryList"
            :props="defaultProps"
            @change="changeCategory"
            :disabled="propFormData.id !== undefined"
            class="w-100%!"
            clearable
            filterable
            placeholder="请选择商品分类"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="商品品牌" prop="brandId">
          <el-select
            v-model="formData.brandId"
            class="w-100%!"
            placeholder="请选择商品品牌"
            :disabled="propFormData.id !== undefined"
          >
            <el-option
              v-for="item in brandList"
              :key="item.id"
              :label="item.name"
              :value="item.id as number"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="商品名称" prop="name">
          <el-input
            v-model="formData.name"
            :clearable="true"
            :show-word-limit="true"
            class="w-100%!"
            maxlength="64"
            placeholder="请输入商品名称"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="商品关键字" prop="keyword">
          <el-input v-model="formData.keyword" class="w-100%!" placeholder="请输入商品关键字" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="商品简介" prop="introduction">
          <el-input
            v-model="formData.introduction"
            :autosize="{ minRows: 2, maxRows: 2 }"
            :clearable="true"
            :show-word-limit="true"
            class="w-100%!"
            maxlength="128"
            placeholder="请输入商品名称"
            type="textarea"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="商品封面图" prop="picUrl">
          <UploadImg v-model="formData.picUrl" :disabled="isDetail" height="80px" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="商品轮播图" prop="sliderPicUrls">
          <UploadImgs v-model="formData.sliderPicUrls" :disabled="isDetail" />
        </el-form-item>
        <el-form-item
          label="属性"
          v-if="formData.categoryId && (formData.categoryId === 1 || formData.categoryId === 2)"
        >
          <ProductPropertyForm :is-detail="isDetail" v-model="formData" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item
          label="动态属性"
          v-if="formData.categoryId && (formData.categoryId === 1 || formData.categoryId === 2)"
        >
          <ProductLensTagForm :is-detail="isDetail" v-model="formData" />
        </el-form-item>
      </el-col>
      <el-col :span="24" v-if="formData.categoryId">
        <el-form-item label="商品规格" props="specType">
          <el-radio-group v-model="formData.specType" @change="onChangeSpec" class="w-80">
            <el-radio
              :label="false"
              :disabled="lensCategory.includes(formData.categoryId)"
              class="radio"
            >
              单规格
            </el-radio>
            <el-radio :label="true">多规格</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>
      <el-col :span="24" v-if="formData.categoryId">
        <!-- 单规格添加-->
        <el-form-item v-if="!formData.specType">
          <SkuList
            ref="skuListRef"
            :prop-form-data="formData"
            :property-list="specList"
            :rule-config="ruleConfig"
          />
        </el-form-item>
        <!-- 多规格添加-->
        <el-form-item
          v-if="!isDetail && formData.specType && !lensCategory.includes(formData.categoryId)"
          label="规格"
        >
          <el-button class="mb-10px mr-15px" @click="attributesAddFormRef.open">添加规格</el-button>
          <ProductSpec :property-list="specList" @success="generateSkus" :is-detail="isDetail" />
        </el-form-item>
        <!--        <template v-if="formData.specType && specList.length > 0">-->
        <!--        <el-form-item label="批量设置" v-if="!isDetail">-->
        <!--          <SkuList :is-batch="true" :prop-form-data="formData" :property-list="specList" />-->
        <!--        </el-form-item>-->
        <el-form-item label="规格列表" v-if="formData.specType">
          <el-button
            class="mb-10px mr-15px"
            @click="addLensRow"
            v-if="!isDetail && (formData.categoryId === 1 || formData.categoryId === 2)"
          >
            添加
          </el-button>
          <SkuList
            ref="skuListRef"
            :prop-form-data="formData"
            :property-list="specList"
            :rule-config="ruleConfig"
            :is-detail="isDetail"
          />
        </el-form-item>
        <!--        </template>-->
      </el-col>
    </el-row>
  </el-form>

  <!-- 商品规格添加 Form 表单 -->
  <ProductSpecAddForm
    ref="attributesAddFormRef"
    :propertyList="specList"
    :categoryId="formData.categoryId"
    :is-attr="false"
  />
</template>
<script lang="ts" setup>
import { PropType } from 'vue'
import { copyValueToTarget } from '@/utils'
import { defaultProps, handleTree } from '@/utils/tree'
import { Spu } from '@/api/mall/product/spu'
import * as ProductCategoryApi from '@/api/mall/product/category'
import { CategoryVO } from '@/api/mall/product/category'
import * as ProductBrandApi from '@/api/mall/product/brand'
import { BrandVO } from '@/api/mall/product/brand'
import { CascaderValue } from 'element-plus'
import ProductSpecAddForm from './ProductSpecAddForm.vue'
import ProductSpec from './ProductSpec.vue'
import ProductPropertyForm from './ProductPropertyForm.vue'
import ProductLensTagForm from './ProductLensTagForm.vue'
import {
  getSpecList,
  PropertyAndValues,
  RuleConfig,
  SkuList
} from '@/views/mall/product/spu/components/index'

defineOptions({ name: 'ProductSpuInfoForm' })
const props = defineProps({
  propFormData: {
    type: Object as PropType<Spu>,
    default: () => {}
  },
  isDetail: Boolean // 是否作为详情组件
})

const lensCategory: number[] = [1, 2]

const message = useMessage() // 消息弹窗

// 规格数组
const specList = ref<PropertyAndValues[]>([])

const attributesAddFormRef = ref() // 添加商品属性表单
const skuListRef = ref() // 商品属性列表 Ref
const formRef = ref() // 表单 Ref
const formData = reactive<Spu>({
  name: '', // 商品名称
  lensTags: [],
  lensProperty: {
    series: '', // 系列
    kind: '', // 品种
    refractive: '', // 折射率
    filmLayer: '', // 膜层
    standard: '', // 执行标准
    abbe: '', // 阿贝系数
    color: '', // 颜色
    transmittance: '' // 透射比
  },
  categoryId: undefined, // 商品分类
  keyword: '', // 关键字
  picUrl: '', // 商品封面图
  sliderPicUrls: [], // 商品轮播图
  introduction: '', // 商品简介
  brandId: undefined, // 商品品牌
  specType: false, // 商品规格
  skus: []
})
const rules = reactive({
  name: [required],
  categoryId: [required],
  keyword: [required],
  introduction: [required],
  picUrl: [required],
  sliderPicUrls: [required],
  brandId: [required]
})
// sku 相关属性校验规则
const ruleConfig: RuleConfig[] = [
  {
    name: 'price',
    rule: (arg) => arg >= 0.01,
    message: '商品销售价格必须大于等于 0.01 元！！！'
  },
  {
    name: 'costPrice',
    rule: (arg) => arg >= 0.01,
    message: '商品成本价格必须大于等于 0.00 元！！！'
  }
]

/** 修改商品分类 */
const changeCategory = async (value: CascaderValue) => {
  brandList.value = await ProductBrandApi.getSimpleBrandList(value as number)
  if (value) {
    // 镜片、车房默认多规格
    formData.specType = lensCategory.includes(value as number)
    // getPropertiesByCategory(value as number)
  }
}

/** 选择规格 */
const onChangeSpec = () => {
  // 重置sku列表
  formData.skus = [
    {
      price: 0,
      marketPrice: 0,
      costPrice: 0,
      barCode: '',
      picUrl: '',
      weight: 0,
      volume: 0,
      firstBrokeragePrice: 0,
      secondBrokeragePrice: 0
    }
  ]
}

/** 将传进来的值赋值给 formData */
watch(
  () => props.propFormData,
  (data) => {
    if (!data) {
      return
    }
    copyValueToTarget(formData, data)
    if (data.id) {
      // 回显规格
      specList.value = getSpecList(data)
    }
  },
  {
    immediate: true
  }
)

/** 表单校验 */
const emit = defineEmits(['update:activeName'])
const validate = async () => {
  if (!formRef) return
  try {
    // 校验 sku
    skuListRef.value.validateSku()
    await unref(formRef)?.validate()
    // 校验通过更新数据
    Object.assign(props.propFormData, formData)
  } catch (e) {
    message.error('【基础设置】不完善，请填写相关信息')
    emit('update:activeName', 'info')
    throw e // 目的截断之后的校验
  }
}
defineExpose({ validate })

/** 初始化 */
const brandList = ref<BrandVO[]>([]) // 商品品牌列表
const categoryList = ref<CategoryVO[]>([]) // 商品分类树
onMounted(async () => {
  // 获得分类树
  const data = await ProductCategoryApi.getCategoryList({})
  categoryList.value = handleTree(data, 'id')
  // 获取商品品牌列表
  brandList.value = await ProductBrandApi.getSimpleBrandList()
})

/** 调用 SkuList generateTableData 方法*/
const generateSkus = (specList) => {
  skuListRef.value.generateTableData(specList)
}

const addLensRow = () => {
  skuListRef.value.addLensRow()
}
</script>
