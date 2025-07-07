<template>
  <div class="menu-page">
    <!-- 导航栏 -->
    <TheNavbar title="点餐" />

    <!-- 主要内容区域 -->
    <div class="menu-content">
      <!-- 左侧分类列表 -->
      <div class="category-list">
        <div 
          v-for="category in menuStore.allCategories" 
          :key="category.id"
          :class="['category-item', { active: selectedCategory === category.id }]"
          @click="selectedCategory = category.id"
        >
          {{ category.name }}
        </div>
      </div>

      <!-- 右侧商品列表 -->
      <div class="product-list">
        <!-- 分类标题 -->
        <div v-if="currentCategory" class="category-title">
          {{ currentCategory.name }}
        </div>

        <!-- 商品网格 -->
        <div class="product-grid">
          <div 
            v-for="item in currentItems" 
            :key="item.id" 
            class="product-card"
          >
            <!-- 商品图片 -->
            <div class="product-image">
              <img :src="item.image" :alt="item.name">
            </div>

            <!-- 商品信息 -->
            <div class="product-info">
              <h3 class="product-name">{{ item.name }}</h3>
              <p class="product-description">{{ item.description }}</p>
              <div class="product-meta">
                <div class="product-rating">
                  <i class="fas fa-star"></i>
                  <span>{{ item.rating }}</span>
                </div>
                <div class="product-sales">
                  月售 {{ item.sales }}
                </div>
              </div>
              <div class="product-footer">
                <div class="product-price">
                  <span class="price-symbol">¥</span>
                  <span class="price-value">{{ item.price }}</span>
                </div>
                <div class="quantity-control">
                  <button 
                    v-if="getItemQuantity(item.id) > 0"
                    class="quantity-btn minus"
                    @click="decrementQuantity(item)"
                  >
                    <i class="fas fa-minus"></i>
                  </button>
                  <span v-if="getItemQuantity(item.id) > 0" class="quantity">
                    {{ getItemQuantity(item.id) }}
                  </span>
                  <button 
                    class="quantity-btn plus"
                    @click="incrementQuantity(item)"
                  >
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 购物车悬浮按钮 -->
    <div 
      v-if="cartStore.count > 0"
      class="cart-fab"
      @click="router.push('/cart')"
    >
      <div class="cart-icon">
        <i class="fas fa-shopping-cart"></i>
        <span class="cart-count">{{ cartStore.count }}</span>
      </div>
      <div class="cart-total">
        <span class="total-label">总计</span>
        <span class="total-price">¥{{ cartStore.total }}</span>
      </div>
      <div class="checkout-btn">
        去结算
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMenuStore } from '../stores/menu'
import { useCartStore } from '../stores/cart'
import TheNavbar from '../components/TheNavbar.vue'

const router = useRouter()
const menuStore = useMenuStore()
const cartStore = useCartStore()

// 选中的分类ID
const selectedCategory = ref(null)

// 当前分类
const currentCategory = computed(() => {
  return selectedCategory.value
    ? menuStore.getCategory(selectedCategory.value)
    : menuStore.allCategories[0]
})

// 当前分类的商品
const currentItems = computed(() => {
  return currentCategory.value?.items || []
})

// 获取商品数量
const getItemQuantity = (itemId) => {
  return cartStore.getItemQuantity(itemId)
}

// 增加商品数量
const incrementQuantity = (item) => {
  cartStore.addItem(item)
}

// 减少商品数量
const decrementQuantity = (item) => {
  cartStore.decrementItemQuantity(item.id)
}

// 初始化
onMounted(() => {
  menuStore.loadFromLocalStorage()
  cartStore.loadFromLocalStorage()
  // 默认选中第一个分类
  if (menuStore.allCategories.length > 0) {
    selectedCategory.value = menuStore.allCategories[0].id
  }
})
</script>

<style scoped>
@import '../styles/variables.css';

.menu-page {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.menu-content {
  display: flex;
  margin-top: var(--header-height);
  height: calc(100vh - var(--header-height));
}

/* 左侧分类列表 */
.category-list {
  width: var(--sidebar-width);
  background-color: var(--bg-primary);
  overflow-y: auto;
  flex-shrink: 0;
}

.category-item {
  padding: var(--spacing-md);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  border-left: 3px solid transparent;
}

.category-item.active {
  background-color: var(--bg-secondary);
  border-left-color: var(--primary-color);
  color: var(--primary-color);
}

/* 右侧商品列表 */
.product-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
}

.category-title {
  font-size: var(--font-size-lg);
  font-weight: bold;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-md);
}

/* 商品卡片 */
.product-card {
  background-color: var(--bg-primary);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--card-shadow);
  transition: transform var(--transition-fast);
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.product-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-fast);
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-info {
  padding: var(--spacing-md);
}

.product-name {
  margin: 0;
  font-size: var(--font-size-md);
  color: var(--text-primary);
}

.product-description {
  margin: var(--spacing-xs) 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.product-meta {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--text-light);
}

.product-rating {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.product-rating i {
  color: var(--warning-color);
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  color: var(--price-color);
  font-weight: bold;
}

.price-symbol {
  font-size: var(--font-size-sm);
}

.price-value {
  font-size: var(--font-size-lg);
}

/* 数量控制 */
.quantity-control {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.quantity-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: var(--border-radius-circle);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.quantity-btn.minus {
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
}

.quantity-btn.plus {
  background-color: var(--primary-color);
  color: var(--text-white);
}

.quantity-btn:hover {
  transform: scale(1.1);
}

.quantity {
  font-size: var(--font-size-md);
  color: var(--text-primary);
  min-width: 20px;
  text-align: center;
}

/* 购物车悬浮按钮 */
.cart-fab {
  position: fixed;
  bottom: var(--spacing-xl);
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--primary-color);
  border-radius: 50px;
  padding: var(--spacing-sm) var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  box-shadow: var(--fab-shadow);
  cursor: pointer;
  transition: transform var(--transition-fast);
  z-index: var(--z-index-fixed);
}

.cart-fab:hover {
  transform: translateX(-50%) scale(1.02);
  background-color: var(--primary-color-dark);
}

.cart-icon {
  position: relative;
  color: var(--text-white);
  font-size: var(--font-size-lg);
}

.cart-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: var(--danger-color);
  color: var(--text-white);
  font-size: var(--font-size-xs);
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.cart-total {
  color: var(--text-white);
  display: flex;
  flex-direction: column;
}

.total-label {
  font-size: var(--font-size-xs);
  opacity: 0.8;
}

.total-price {
  font-size: var(--font-size-md);
  font-weight: bold;
}

.checkout-btn {
  background-color: var(--primary-color-dark);
  color: var(--text-white);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: 20px;
  font-size: var(--font-size-sm);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .menu-content {
    flex-direction: column;
  }

  .category-list {
    width: 100%;
    height: auto;
    display: flex;
    overflow-x: auto;
    white-space: nowrap;
  }

  .category-item {
    padding: var(--spacing-sm) var(--spacing-md);
    border-left: none;
    border-bottom: 3px solid transparent;
  }

  .category-item.active {
    border-bottom-color: var(--primary-color);
  }

  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }

  .product-image {
    height: 160px;
  }
}
</style> 