import { defineStore } from 'pinia'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { ref, computed } from 'vue'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 默认占位图片
const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGMEYwRjAiLz48cGF0aCBkPSJNODAgNjBIMTIwVjE0MEg4MFY2MFoiIGZpbGw9IiNEOEQ4RDgiLz48cGF0aCBkPSJNMTAwIDkwQzEwNS41MjMgOTAgMTEwIDg1LjUyMjggMTEwIDgwQzExMCA3NC40NzcyIDEwNS41MjMgNzAgMTAwIDcwQzk0LjQ3NzIgNzAgOTAgNzQuNDc3MiA5MCA4MEM5MCA4NS41MjI4IDk0LjQ3NzIgOTAgMTAwIDkwWiIgZmlsbD0iI0Q4RDhEOCIvPjwvc3ZnPg=='

// 生成随机价格
const generateRandomPrice = () => {
  return Math.floor(Math.random() * (100 - 10) + 10)
}

// 生成随机图片URL
const generateRandomImage = () => {
  const width = 400
  const height = 300
  const randomId = Math.floor(Math.random() * 1000)
  return `https://picsum.photos/seed/${randomId}/${width}/${height}`
}

// 生成测试数据
const generateTestData = () => {
  return [
    {
      id: 1,
      name: '热销套餐',
      items: [
        { id: 101, name: '商务午餐A', description: '主菜+小菜+饮品', price: generateRandomPrice(), image: generateRandomImage(), sales: Math.floor(Math.random() * 100), rating: (Math.random() * 2 + 3).toFixed(1) },
        { id: 102, name: '情侣套餐', description: '双人主菜+小食+饮品', price: generateRandomPrice(), image: generateRandomImage(), sales: Math.floor(Math.random() * 100), rating: (Math.random() * 2 + 3).toFixed(1) },
        { id: 103, name: '家庭欢乐套餐', description: '四人主菜+小食+饮品', price: generateRandomPrice(), image: generateRandomImage(), sales: Math.floor(Math.random() * 100), rating: (Math.random() * 2 + 3).toFixed(1) },
        { id: 104, name: '单人特惠套餐', description: '主菜+小食+饮品', price: generateRandomPrice(), image: generateRandomImage(), sales: Math.floor(Math.random() * 100), rating: (Math.random() * 2 + 3).toFixed(1) }
      ]
    },
    {
      id: 2,
      name: '主食',
      items: [
        { id: 201, name: '黄金炒饭', description: '精选大米，黄金蛋花', price: generateRandomPrice(), image: generateRandomImage(), sales: Math.floor(Math.random() * 100), rating: (Math.random() * 2 + 3).toFixed(1) },
        { id: 202, name: '阳春面', description: '手工面条，清淡可口', price: generateRandomPrice(), image: generateRandomImage(), sales: Math.floor(Math.random() * 100), rating: (Math.random() * 2 + 3).toFixed(1) },
        { id: 203, name: '扬州炒饭', description: '什锦配料，色香味俱全', price: generateRandomPrice(), image: generateRandomImage(), sales: Math.floor(Math.random() * 100), rating: (Math.random() * 2 + 3).toFixed(1) },
        { id: 204, name: '牛肉面', description: '优质牛肉，筋道面条', price: generateRandomPrice(), image: generateRandomImage(), sales: Math.floor(Math.random() * 100), rating: (Math.random() * 2 + 3).toFixed(1) }
      ]
    },
    {
      id: 3,
      name: '小吃',
      items: [
        { id: 301, name: '春卷', description: '酥脆可口，配料丰富', price: generateRandomPrice(), image: generateRandomImage(), sales: Math.floor(Math.random() * 100), rating: (Math.random() * 2 + 3).toFixed(1) },
        { id: 302, name: '锅贴', description: '外酥里嫩，美味可口', price: generateRandomPrice(), image: generateRandomImage(), sales: Math.floor(Math.random() * 100), rating: (Math.random() * 2 + 3).toFixed(1) },
        { id: 303, name: '炸鸡翅', description: '外酥内嫩，香辣可选', price: generateRandomPrice(), image: generateRandomImage(), sales: Math.floor(Math.random() * 100), rating: (Math.random() * 2 + 3).toFixed(1) },
        { id: 304, name: '薯条', description: '黄金脆薯，外酥内软', price: generateRandomPrice(), image: generateRandomImage(), sales: Math.floor(Math.random() * 100), rating: (Math.random() * 2 + 3).toFixed(1) }
      ]
    },
    {
      id: 4,
      name: '饮品',
      items: [
        { id: 401, name: '柠檬茶', description: '清爽解腻，回味甘甜', price: generateRandomPrice(), image: generateRandomImage(), sales: Math.floor(Math.random() * 100), rating: (Math.random() * 2 + 3).toFixed(1) },
        { id: 402, name: '奶茶', description: '浓郁香滑，暖心美味', price: generateRandomPrice(), image: generateRandomImage(), sales: Math.floor(Math.random() * 100), rating: (Math.random() * 2 + 3).toFixed(1) },
        { id: 403, name: '果汁', description: '鲜榨水果，营养美味', price: generateRandomPrice(), image: generateRandomImage(), sales: Math.floor(Math.random() * 100), rating: (Math.random() * 2 + 3).toFixed(1) },
        { id: 404, name: '咖啡', description: '醇香浓郁，提神醒脑', price: generateRandomPrice(), image: generateRandomImage(), sales: Math.floor(Math.random() * 100), rating: (Math.random() * 2 + 3).toFixed(1) }
      ]
    },
    {
      id: 5,
      name: '甜点',
      items: [
        { id: 501, name: '提拉米苏', description: '层次丰富，口感细腻', price: generateRandomPrice(), image: generateRandomImage(), sales: Math.floor(Math.random() * 100), rating: (Math.random() * 2 + 3).toFixed(1) },
        { id: 502, name: '芝士蛋糕', description: '浓郁芝士，绵密可口', price: generateRandomPrice(), image: generateRandomImage(), sales: Math.floor(Math.random() * 100), rating: (Math.random() * 2 + 3).toFixed(1) },
        { id: 503, name: '巧克力蛋糕', description: '浓情巧克力，甜蜜享受', price: generateRandomPrice(), image: generateRandomImage(), sales: Math.floor(Math.random() * 100), rating: (Math.random() * 2 + 3).toFixed(1) },
        { id: 504, name: '水果拼盘', description: '新鲜水果，营养美味', price: generateRandomPrice(), image: generateRandomImage(), sales: Math.floor(Math.random() * 100), rating: (Math.random() * 2 + 3).toFixed(1) }
      ]
    }
  ]
}

export const useMenuStore = defineStore('menu', () => {
  // 状态
  const categories = ref([])
  const products = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // 模拟数据
  const mockCategories = [
    { id: 1, name: '热门推荐', icon: 'fire' },
    { id: 2, name: '主食', icon: 'rice' },
    { id: 3, name: '小吃', icon: 'cookie' },
    { id: 4, name: '饮品', icon: 'coffee' },
    { id: 5, name: '甜点', icon: 'cake' }
  ]

  const mockProducts = [
    {
      id: 1,
      categoryId: 1,
      name: '黄金炸鸡',
      description: '外酥里嫩，香辣可口',
      price: 28.00,
      image: '/images/fried-chicken.jpg',
      rating: 4.8,
      sales: 1200,
      isSpicy: true,
      isNew: true
    },
    {
      id: 2,
      categoryId: 1,
      name: '招牌牛肉面',
      description: '汤浓肉香，面条劲道',
      price: 32.00,
      image: '/images/beef-noodles.jpg',
      rating: 4.9,
      sales: 1500,
      isSpicy: false,
      isNew: false
    },
    {
      id: 3,
      categoryId: 2,
      name: '扬州炒饭',
      description: '色香味俱全，经典美味',
      price: 26.00,
      image: '/images/fried-rice.jpg',
      rating: 4.7,
      sales: 1000,
      isSpicy: false,
      isNew: false
    },
    {
      id: 4,
      categoryId: 3,
      name: '香辣鸭翅',
      description: '香辣入味，回味无穷',
      price: 18.00,
      image: '/images/duck-wings.jpg',
      rating: 4.6,
      sales: 800,
      isSpicy: true,
      isNew: false
    },
    {
      id: 5,
      categoryId: 4,
      name: '珍珠奶茶',
      description: '香浓丝滑，珍珠Q弹',
      price: 15.00,
      image: '/images/bubble-tea.jpg',
      rating: 4.5,
      sales: 2000,
      isSpicy: false,
      isNew: false
    }
  ]

  // 计算属性
  const categorizedProducts = computed(() => {
    const result = {}
    categories.value.forEach(category => {
      result[category.id] = products.value.filter(
        product => product.categoryId === category.id
      )
    })
    return result
  })

  const featuredProducts = computed(() => {
    return products.value.filter(product => product.isNew || product.sales > 1000)
  })

  const getProductById = computed(() => {
    return (productId) => products.value.find(p => p.id === productId)
  })

  // 方法
  const loadFromLocalStorage = () => {
    try {
      const savedCategories = localStorage.getItem('menu_categories')
      const savedProducts = localStorage.getItem('menu_products')
      
      if (savedCategories && savedProducts) {
        categories.value = JSON.parse(savedCategories)
        products.value = JSON.parse(savedProducts)
        return true
      }
      return false
    } catch (err) {
      console.error('从本地存储加载菜单数据失败:', err)
      return false
    }
  }

  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('menu_categories', JSON.stringify(categories.value))
      localStorage.setItem('menu_products', JSON.stringify(products.value))
      return true
    } catch (err) {
      console.error('保存菜单数据到本地存储失败:', err)
      return false
    }
  }

  const fetchMenuData = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 如果本地存储中有数据，则使用本地数据
      if (loadFromLocalStorage()) {
        return
      }
      
      // 否则使用模拟数据
      categories.value = mockCategories
      products.value = mockProducts
      
      // 保存到本地存储
      saveToLocalStorage()
    } catch (err) {
      error.value = '加载菜单数据失败'
      console.error(error.value, err)
    } finally {
      isLoading.value = false
    }
  }

  const updateProduct = async (productId, updates) => {
    try {
      const index = products.value.findIndex(p => p.id === productId)
      if (index === -1) {
        throw new Error('商品不存在')
      }
      
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 更新商品
      products.value[index] = {
        ...products.value[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      // 保存到本地存储
      saveToLocalStorage()
      
      return products.value[index]
    } catch (err) {
      console.error('更新商品失败:', err)
      throw err
    }
  }

  const addProduct = async (productData) => {
    try {
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 生成新ID
      const newId = Math.max(...products.value.map(p => p.id)) + 1
      
      // 创建新商品
      const newProduct = {
        id: newId,
        ...productData,
        rating: 5.0,
        sales: 0,
        isNew: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // 添加到列表
      products.value.push(newProduct)
      
      // 保存到本地存储
      saveToLocalStorage()
      
      return newProduct
    } catch (err) {
      console.error('添加商品失败:', err)
      throw err
    }
  }

  const deleteProduct = async (productId) => {
    try {
      const index = products.value.findIndex(p => p.id === productId)
      if (index === -1) {
        throw new Error('商品不存在')
      }
      
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 删除商品
      products.value.splice(index, 1)
      
      // 保存到本地存储
      saveToLocalStorage()
      
      return true
    } catch (err) {
      console.error('删除商品失败:', err)
      throw err
    }
  }

  const updateCategory = async (categoryId, updates) => {
    try {
      const index = categories.value.findIndex(c => c.id === categoryId)
      if (index === -1) {
        throw new Error('分类不存在')
      }
      
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 更新分类
      categories.value[index] = {
        ...categories.value[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      // 保存到本地存储
      saveToLocalStorage()
      
      return categories.value[index]
    } catch (err) {
      console.error('更新分类失败:', err)
      throw err
    }
  }

  return {
    // 状态
    categories,
    products,
    isLoading,
    error,
    
    // 计算属性
    categorizedProducts,
    featuredProducts,
    getProductById,
    
    // 方法
    fetchMenuData,
    loadFromLocalStorage,
    saveToLocalStorage,
    updateProduct,
    addProduct,
    deleteProduct,
    updateCategory
  }
}) 