<template>
  <div style="min-height: 100vh; background-color: #f9fafb; font-family: Arial, sans-serif;">
    <!-- 调试信息 -->
    <div v-if="debugMode" style="position: fixed; top: 0; left: 0; background: red; color: white; padding: 8px; z-index: 50; font-size: 12px;">
      DEBUG: 组件已挂载 | 商品数: {{ products.length }} | 分类数: {{ categories.length }} | 加载中: {{ loading }} | 错误: {{ error }}
    </div>

    <!-- 错误提示 -->
    <div v-if="error" style="min-height: 100vh; display: flex; align-items: center; justify-content: center;">
      <div style="text-align: center; padding: 32px;">
        <div style="font-size: 4rem; margin-bottom: 16px;">😵</div>
        <h2 style="font-size: 1.5rem; font-weight: bold; color: #374151; margin-bottom: 8px;">数据加载失败</h2>
        <p style="color: #6b7280; margin-bottom: 16px;">{{ error }}</p>
        <button 
          @click="reloadData"
          style="background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; border: none; cursor: pointer; font-size: 16px;"
        >
          重新加载
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-else-if="loading" style="min-height: 100vh; display: flex; align-items: center; justify-content: center;">
      <div style="text-align: center;">
        <div style="width: 48px; height: 48px; border: 3px solid #f59e0b; border-top: 3px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
        <p style="color: #6b7280; font-size: 16px;">正在加载数据...</p>
      </div>
    </div>

    <!-- 主要内容 -->
    <div v-else>
      <!-- 顶部 Logo -->
      <div style="padding: 16px 0; border-bottom: 1px solid #e5e7eb; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
          <div style="width: 32px; height: 32px; background: #f59e0b; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">
            🍜
          </div>
          <h1 style="font-size: 1.5rem; font-weight: bold; color: #374151; margin: 0;">美食订餐系统</h1>
        </div>
      </div>

      <!-- Toast 提示 -->
      <div 
        v-if="toast.show" 
        style="position: fixed; top: 16px; right: 16px; background: white; color: #111827; padding: 12px 24px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 12px; z-index: 50; border: 1px solid #e5e7eb;"
      >
        <span style="color: #10b981; font-size: 1.25rem;">✓</span>
        <span style="color: #374151;">{{ toast.message }}</span>
      </div>

      <!-- 主要内容区 -->
      <div style="max-width: 1200px; margin: 0 auto; padding: 24px 16px;">
        <!-- 数据检查 -->
        <div v-if="!categories.length || !products.length" style="text-align: center; padding: 64px 0;">
          <div style="font-size: 4rem; margin-bottom: 16px;">📦</div>
          <h2 style="font-size: 1.5rem; font-weight: bold; color: #374151; margin-bottom: 8px;">暂无数据</h2>
          <p style="color: #6b7280; font-size: 16px;">分类: {{ categories.length }} | 商品: {{ products.length }}</p>
          <button 
            @click="reloadData"
            style="margin-top: 16px; background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; border: none; cursor: pointer; font-size: 16px;"
          >
            重新加载数据
          </button>
        </div>

        <div v-else style="display: flex; gap: 24px; align-items: flex-start;">
          <!-- 左侧分类列表 -->
          <div style="width: 200px; flex-shrink: 0;">
            <div style="background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 20px;">
              <h2 style="font-size: 1.25rem; font-weight: bold; margin: 0 0 20px 0; color: #374151;">商品分类</h2>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li 
                  v-for="category in categories" 
                  :key="category.id"
                  :style="{
                    padding: '12px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginBottom: '8px',
                    transition: 'all 0.2s',
                    backgroundColor: selectedCategory === category.id ? '#f59e0b' : 'transparent',
                    color: selectedCategory === category.id ? 'white' : '#374151',
                    fontWeight: selectedCategory === category.id ? 'bold' : 'normal'
                  }"
                  @click="selectedCategory = category.id"
                >
                  {{ category.name }}
                </li>
              </ul>
            </div>
          </div>

          <!-- 右侧商品列表 -->
          <div style="flex: 1;">
            <!-- 商品数量提示 -->
            <div v-if="filteredProducts.length === 0" style="text-align: center; padding: 64px 0;">
              <div style="font-size: 4rem; margin-bottom: 16px;">🍽️</div>
              <h3 style="font-size: 1.25rem; font-weight: bold; color: #374151; margin-bottom: 8px;">该分类暂无商品</h3>
              <p style="color: #6b7280; font-size: 16px;">请选择其他分类查看商品</p>
            </div>

            <div v-else style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
              <div 
                v-for="product in filteredProducts" 
                :key="product.id"
                :data-product-id="product.id"
                style="background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; transition: all 0.3s; border: 1px solid #e5e7eb;"
              >
                <div style="position: relative; width: 100%; height: 200px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                  <img 
                    :src="product.image" 
                    :alt="product.name"
                    style="width: 100%; height: 100%; object-fit: cover;"
                    @error="handleImageError"
                    @load="handleImageLoad"
                    loading="lazy"
                  >
                  <div 
                    v-if="imageErrors[product.id]"
                    style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: #e5e7eb; display: flex; align-items: center; justify-content: center; color: #6b7280;"
                  >
                    <div style="text-align: center;">
                      <div style="font-size: 3rem; margin-bottom: 8px;">🍽️</div>
                      <div style="font-size: 14px;">{{ product.name }}</div>
                    </div>
                  </div>
                </div>
                <div style="padding: 20px;">
                  <h3 style="font-size: 1.125rem; font-weight: 600; color: #374151; margin: 0 0 12px 0; line-height: 1.4;">{{ product.name }}</h3>
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span style="color: #f59e0b; font-weight: bold; font-size: 1.125rem;">¥{{ product.price.toFixed(2) }}</span>
                    <button 
                      @click="addToCart(product)"
                      style="background: #f59e0b; color: white; padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; font-weight: 500; transition: all 0.2s; font-size: 14px;"
                    >
                      加入购物车
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 购物车浮动按钮 -->
      <div 
        style="position: fixed; right: 32px; bottom: 32px; cursor: pointer; z-index: 40;"
        @click="showCart = true"
      >
        <div style="background: #f59e0b; color: white; padding: 16px; border-radius: 50%; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4); transition: all 0.3s; position: relative;">
          <svg xmlns="http://www.w3.org/2000/svg" style="height: 28px; width: 28px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <div 
            v-if="cartTotalCount" 
            style="position: absolute; top: -8px; right: -8px; background: #dc2626; color: white; font-size: 12px; font-weight: bold; border-radius: 50%; min-width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border: 2px solid white;"
          >
            {{ cartTotalCount }}
          </div>
        </div>
      </div>

      <!-- 购物车侧边栏 -->
      <Transition name="drawer">
        <div 
          v-if="showCart" 
          class="fixed inset-0 bg-black bg-opacity-50 z-50 backdrop-blur-sm"
          @click="showCart = false"
        >
          <div 
            class="absolute right-0 top-0 bottom-0 w-96 bg-white shadow-xl transform transition-transform duration-300"
            :class="showCart ? 'translate-x-0' : 'translate-x-full'"
            @click.stop
          >
            <div class="h-full flex flex-col">
              <!-- 头部 -->
              <div class="p-4 border-b flex justify-between items-center bg-gray-50">
                <h2 class="text-xl font-bold flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  购物车
                </h2>
                <button 
                  @click="showCart = false"
                  class="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- 空购物车状态 -->
              <div v-if="cartItems.length === 0" class="flex-1 flex items-center justify-center p-8">
                <div class="text-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p class="text-lg mb-2">购物车是空的</p>
                  <p class="text-sm text-gray-400">快去选购喜欢的商品吧</p>
                </div>
              </div>

              <!-- 购物车商品列表 -->
              <div v-else class="flex-1 overflow-y-auto p-4">
                <TransitionGroup name="list" tag="div" class="space-y-4">
                  <div 
                    v-for="item in cartItems" 
                    :key="item.id"
                    class="bg-gray-50 rounded-lg p-4 flex gap-4 group relative"
                  >
                    <div class="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                      <img 
                        :src="item.image" 
                        :alt="item.name"
                        class="w-full h-full object-cover"
                        @error="(e) => e.target.style.display = 'none'"
                        loading="lazy"
                      >
                      <div class="absolute inset-0 flex items-center justify-center text-gray-400 text-2xl">
                        🍽️
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3 class="font-semibold truncate mb-1">{{ item.name }}</h3>
                      <div class="text-yellow-500 font-bold mb-2">¥{{ item.price.toFixed(2) }}</div>
                      <div class="flex items-center gap-2">
                        <button 
                          @click="updateCartItemQuantity(item.id, item.quantity - 1)"
                          class="w-8 h-8 flex items-center justify-center border rounded-full hover:bg-white transition-colors"
                        >-</button>
                        <span class="w-8 text-center">{{ item.quantity }}</span>
                        <button 
                          @click="updateCartItemQuantity(item.id, item.quantity + 1)"
                          class="w-8 h-8 flex items-center justify-center border rounded-full hover:bg-white transition-colors"
                        >+</button>
                      </div>
                    </div>
                    <button 
                      @click="removeFromCart(item.id)"
                      class="text-gray-400 hover:text-red-500 transition-colors absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </TransitionGroup>
              </div>

              <!-- 底部结算区 -->
              <div v-if="cartItems.length > 0" class="border-t p-4 bg-white">
                <div class="flex justify-between items-center mb-4">
                  <div class="text-gray-500">
                    <span class="mr-2">共 {{ cartTotalCount }} 件商品</span>
                    <span>合计：</span>
                  </div>
                  <span class="text-xl font-bold text-yellow-500">¥{{ cartTotal.toFixed(2) }}</span>
                </div>
                <button 
                  class="w-full bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 transition-colors text-lg font-medium"
                >
                  去结算
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onErrorCaptured } from 'vue'

// 调试模式
const debugMode = ref(false) // 设为 true 开启调试

// 加载和错误状态
const loading = ref(true)
const error = ref('')

// Toast 状态
const toast = ref({
  show: false,
  message: ''
})

// 显示 Toast
const showToast = (product) => {
  try {
    toast.value.message = `已加入购物车：${product.name}`
    toast.value.show = true
    setTimeout(() => {
      toast.value.show = false
    }, 2000)
  } catch (err) {
    console.error('Toast 显示错误:', err)
    error.value = `Toast 显示错误: ${err.message}`
  }
}

// Logo 错误状态
const logoError = ref(false)

// 处理 logo 加载错误
const handleLogoError = () => {
  logoError.value = true
  console.warn('Logo 加载失败，使用备用图标')
}

// 图片加载错误状态
const imageErrors = ref({})

// 处理商品图片加载错误
const handleImageError = (event) => {
  try {
    const img = event.target
    const productId = img.closest('[data-product-id]')?.dataset.productId
    if (productId) {
      imageErrors.value[productId] = true
      console.warn(`商品图片加载失败: ID ${productId}`)
    }
  } catch (err) {
    console.error('图片错误处理失败:', err)
  }
}

// 处理商品图片加载成功
const handleImageLoad = (event) => {
  try {
    const img = event.target
    const productId = img.closest('[data-product-id]')?.dataset.productId
    if (productId) {
      imageErrors.value[productId] = false
    }
  } catch (err) {
    console.error('图片加载处理失败:', err)
  }
}

// 购物车状态
const cartItems = ref([])
const showCart = ref(false)

// 购物车计算属性
const cartTotalCount = computed(() => {
  try {
    return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
  } catch (err) {
    console.error('计算购物车总数失败:', err)
    return 0
  }
})

const cartTotal = computed(() => {
  try {
    return cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  } catch (err) {
    console.error('计算购物车总价失败:', err)
    return 0
  }
})

// 购物车方法
const addToCart = (product) => {
  try {
    const existingItem = cartItems.value.find(item => item.id === product.id)
    if (existingItem) {
      existingItem.quantity++
    } else {
      cartItems.value.push({
        ...product,
        quantity: 1
      })
    }
    showToast(product)
    console.log('商品已添加到购物车:', product.name)
  } catch (err) {
    console.error('添加到购物车失败:', err)
    error.value = `添加商品失败: ${err.message}`
  }
}

const updateCartItemQuantity = (productId, quantity) => {
  try {
    const item = cartItems.value.find(item => item.id === productId)
    if (item) {
      if (quantity <= 0) {
        removeFromCart(productId)
      } else {
        item.quantity = quantity
      }
    }
  } catch (err) {
    console.error('更新商品数量失败:', err)
    error.value = `更新数量失败: ${err.message}`
  }
}

const removeFromCart = (productId) => {
  try {
    const index = cartItems.value.findIndex(item => item.id === productId)
    if (index > -1) {
      cartItems.value.splice(index, 1)
      console.log('商品已从购物车移除:', productId)
    }
  } catch (err) {
    console.error('移除商品失败:', err)
    error.value = `移除商品失败: ${err.message}`
  }
}

// Mock 数据 - 分类
const categories = ref([])

// Mock 数据 - 商品  
const products = ref([])

// 当前选中的分类
const selectedCategory = ref(1)

// 根据分类筛选商品
const filteredProducts = computed(() => {
  try {
    if (!products.value || !Array.isArray(products.value)) {
      console.warn('商品数据无效')
      return []
    }
    return products.value.filter(product => product.categoryId === selectedCategory.value)
  } catch (err) {
    console.error('筛选商品失败:', err)
    error.value = `筛选商品失败: ${err.message}`
    return []
  }
})

// 初始化数据
const initData = () => {
  try {
    console.log('开始初始化数据...')
    
    // 初始化分类数据
    categories.value = [
      { id: 1, name: '热门推荐' },
      { id: 2, name: '小吃点心' },
      { id: 3, name: '饮品果汁' },
      { id: 4, name: '主食面点' },
      { id: 5, name: '特色菜品' }
    ]

    // 初始化商品数据
    products.value = [
      // 热门推荐
      {
        id: 1,
        categoryId: 1,
        name: '香辣小龙虾',
        price: 78.00,
        image: 'https://images.unsplash.com/photo-1559847844-d721426d6edc?w=300&h=200&fit=crop&crop=center'
      },
      {
        id: 2,
        categoryId: 1,
        name: '烤鸭卷饼',
        price: 68.00,
        image: 'https://images.unsplash.com/photo-1563379091339-03246963d29a?w=300&h=200&fit=crop&crop=center'
      },
      {
        id: 7,
        categoryId: 1,
        name: '蒜蓉扇贝',
        price: 58.00,
        image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=300&h=200&fit=crop&crop=center'
      },
      // 小吃点心
      {
        id: 3,
        categoryId: 2,
        name: '蒜蓉小龙虾',
        price: 88.00,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop&crop=center'
      },
      {
        id: 4,
        categoryId: 2,
        name: '酱香排骨',
        price: 58.00,
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=200&fit=crop&crop=center'
      },
      {
        id: 8,
        categoryId: 2,
        name: '小笼包',
        price: 28.00,
        image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=300&h=200&fit=crop&crop=center'
      },
      {
        id: 9,
        categoryId: 2,
        name: '煎饺',
        price: 25.00,
        image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=300&h=200&fit=crop&crop=center'
      },
      // 饮品果汁
      {
        id: 5,
        categoryId: 3,
        name: '鲜榨橙汁',
        price: 18.00,
        image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=300&h=200&fit=crop&crop=center'
      },
      {
        id: 6,
        categoryId: 3,
        name: '芒果冰沙',
        price: 22.00,
        image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=300&h=200&fit=crop&crop=center'
      },
      {
        id: 10,
        categoryId: 3,
        name: '柠檬蜂蜜茶',
        price: 16.00,
        image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&h=200&fit=crop&crop=center'
      },
      {
        id: 11,
        categoryId: 3,
        name: '草莓奶昔',
        price: 24.00,
        image: 'https://images.unsplash.com/photo-1553787499-6d8c5b0f1b5b?w=300&h=200&fit=crop&crop=center'
      },
      // 主食面点
      {
        id: 12,
        categoryId: 4,
        name: '牛肉面',
        price: 32.00,
        image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=200&fit=crop&crop=center'
      },
      {
        id: 13,
        categoryId: 4,
        name: '炒河粉',
        price: 28.00,
        image: 'https://images.unsplash.com/photo-1563379091339-03246963d29a?w=300&h=200&fit=crop&crop=center'
      },
      {
        id: 14,
        categoryId: 4,
        name: '蛋炒饭',
        price: 22.00,
        image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop&crop=center'
      },
      // 特色菜品
      {
        id: 15,
        categoryId: 5,
        name: '麻婆豆腐',
        price: 35.00,
        image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=300&h=200&fit=crop&crop=center'
      },
      {
        id: 16,
        categoryId: 5,
        name: '宫保鸡丁',
        price: 42.00,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop&crop=center'
      },
      {
        id: 17,
        categoryId: 5,
        name: '红烧肉',
        price: 48.00,
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=200&fit=crop&crop=center'
      }
    ]

    console.log('数据初始化完成:', {
      categories: categories.value.length,
      products: products.value.length
    })

    loading.value = false
  } catch (err) {
    console.error('数据初始化失败:', err)
    error.value = `数据初始化失败: ${err.message}`
    loading.value = false
  }
}

// 重新加载数据
const reloadData = () => {
  error.value = ''
  loading.value = true
  setTimeout(() => {
    initData()
  }, 1000) // 模拟加载时间
}

// 错误捕获
onErrorCaptured((err, instance, info) => {
  console.error('Vue 错误捕获:', err, info)
  error.value = `组件错误: ${err.message}`
  return false
})

// 组件挂载
onMounted(() => {
  console.log('Home 组件已挂载')
  // 模拟加载时间
  setTimeout(() => {
    initData()
  }, 500)
})
</script>

<style scoped>
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
/* Toast 动画 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 购物车图标弹跳动画 */
.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* 数量角标动画 */
.badge-enter-active,
.badge-leave-active {
  transition: all 0.3s ease;
}
.badge-enter-from,
.badge-leave-to {
  opacity: 0;
  transform: scale(0);
}

/* 侧边栏动画 */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

/* 购物车列表项动画 */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 图片容器样式 */
.aspect-w-16 {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
}

.aspect-h-9 {
  position: absolute;
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
}

/* 添加新的悬浮效果 */
.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}

/* 添加删除按钮渐变效果 */
.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}
</style>
