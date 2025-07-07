<template>
  <div class="cart-page">
    <!-- 导航栏 -->
    <TheNavbar 
      title="购物车" 
      :show-back="true"
      :show-cart="false"
    />

    <!-- 购物车内容 -->
    <div class="cart-content">
      <div v-if="!cartStore.isEmpty" class="cart-items">
        <TransitionGroup name="list" tag="div" class="items-list">
          <div 
            v-for="item in cartStore.items" 
            :key="item.id"
            class="cart-item"
          >
            <div class="item-image">
              <img :src="item.image" :alt="item.name">
            </div>
            <div class="item-info">
              <h3 class="item-name">{{ item.name }}</h3>
              <div class="item-price">
                <span class="price-symbol">¥</span>
                <span class="price-value">{{ item.price }}</span>
              </div>
            </div>
            <div class="item-quantity">
              <button 
                class="quantity-btn minus"
                @click="cartStore.removeItem(item)"
              >
                <i class="fas fa-minus"></i>
              </button>
              <span class="quantity-value">{{ item.quantity }}</span>
              <button 
                class="quantity-btn plus"
                @click="cartStore.addItem(item)"
              >
                <i class="fas fa-plus"></i>
              </button>
            </div>
          </div>
        </TransitionGroup>

        <!-- 购物车底部 -->
        <div class="cart-footer">
          <div class="cart-total">
            <span>总计</span>
            <div class="total-price">
              <span class="price-symbol">¥</span>
              <span class="price-value">{{ cartStore.total }}</span>
            </div>
          </div>
          <button 
            class="submit-button"
            @click="submitOrder"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? '提交中...' : '提交订单' }}
          </button>
        </div>
      </div>

      <!-- 空购物车提示 -->
      <div v-else class="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <p>购物车是空的</p>
        <button class="primary-button" @click="router.push('/')">
          去点餐
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useOrderStore } from '../stores/order'
import TheNavbar from '../components/TheNavbar.vue'

const router = useRouter()
const cartStore = useCartStore()
const orderStore = useOrderStore()
const isSubmitting = ref(false)

const submitOrder = async () => {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  try {
    const order = orderStore.createOrder()
    if (order) {
      router.push('/orders')
    }
  } catch (error) {
    console.error('提交订单失败:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
@import '../styles/variables.css';

.cart-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-secondary);
}

.cart-content {
  flex: 1;
  margin-top: 56px;
  padding: var(--spacing-md);
  max-width: 800px;
  margin: 56px auto 0;
  width: 100%;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.cart-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--bg-primary);
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: var(--border-radius);
  overflow: hidden;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
  margin: 0 var(--spacing-md);
  min-width: 0;
}

.item-name {
  margin: 0;
  font-size: var(--font-size-md);
  color: var(--text-primary);
}

.item-price {
  margin-top: var(--spacing-xs);
  color: var(--price-color);
  font-weight: bold;
}

.price-symbol {
  font-size: var(--font-size-sm);
}

.price-value {
  font-size: var(--font-size-md);
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.quantity-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
}

.quantity-btn.minus {
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
}

.quantity-btn.plus {
  background-color: var(--primary-color);
  color: var(--text-primary);
}

.quantity-btn:hover {
  transform: scale(1.1);
}

.quantity-btn.minus:hover {
  background-color: var(--danger-color);
  color: white;
}

.quantity-btn.plus:hover {
  background-color: var(--primary-color-dark);
}

.quantity-value {
  min-width: 24px;
  text-align: center;
  font-size: var(--font-size-md);
  color: var(--text-primary);
}

.cart-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--spacing-md);
  background-color: var(--bg-primary);
  box-shadow: var(--shadow-up);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
}

.cart-total {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: var(--font-size-md);
}

.total-price {
  color: var(--price-color);
  font-weight: bold;
}

.submit-button {
  padding: var(--spacing-sm) var(--spacing-xl);
  border: none;
  border-radius: var(--border-radius);
  background-color: var(--primary-color);
  color: var(--text-primary);
  font-size: var(--font-size-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.submit-button:hover:not(:disabled) {
  background-color: var(--primary-color-dark);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 空购物车样式 */
.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl) var(--spacing-md);
  color: var(--text-light);
}

.empty-cart i {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
}

.empty-cart p {
  margin: var(--spacing-md) 0;
  font-size: var(--font-size-md);
}

.primary-button {
  padding: var(--spacing-sm) var(--spacing-xl);
  border: none;
  border-radius: var(--border-radius);
  background-color: var(--primary-color);
  color: var(--text-primary);
  font-size: var(--font-size-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.primary-button:hover {
  background-color: var(--primary-color-dark);
}

/* 列表动画 */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-active {
  position: absolute;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .cart-content {
    padding: var(--spacing-sm);
  }

  .item-image {
    width: 60px;
    height: 60px;
  }

  .item-name {
    font-size: var(--font-size-sm);
  }
}
</style> 