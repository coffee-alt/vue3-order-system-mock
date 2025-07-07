<template>
  <div class="orders-page">
    <!-- 导航栏 -->
    <TheNavbar 
      title="我的订单" 
      :show-back="true"
      :show-orders="false"
    />

    <!-- 订单列表 -->
    <div class="orders-content">
      <div v-if="orders.length" class="orders-list">
        <div 
          v-for="order in orders" 
          :key="order.id" 
          class="order-card"
        >
          <!-- 订单头部 -->
          <div class="order-header">
            <div class="order-status" :class="order.status">
              {{ getStatusText(order.status) }}
            </div>
            <div class="order-time">
              {{ formatTime(order.createTime) }}
            </div>
          </div>

          <!-- 订单商品列表 -->
          <div class="order-items">
            <div 
              v-for="item in order.items" 
              :key="item.id" 
              class="order-item"
            >
              <div class="item-image">
                <img :src="item.image" :alt="item.name">
              </div>
              <div class="item-info">
                <h3 class="item-name">{{ item.name }}</h3>
                <div class="item-quantity">x{{ item.quantity }}</div>
              </div>
              <div class="item-price">
                <span class="price-symbol">¥</span>
                <span class="price-value">{{ item.price * item.quantity }}</span>
              </div>
            </div>
          </div>

          <!-- 订单底部 -->
          <div class="order-footer">
            <div class="order-total">
              <span>共{{ getTotalQuantity(order) }}件商品，实付</span>
              <div class="total-price">
                <span class="price-symbol">¥</span>
                <span class="price-value">{{ getTotalPrice(order) }}</span>
              </div>
            </div>
            <div class="order-actions">
              <button 
                v-if="order.status === 'pending'" 
                class="cancel-button"
                @click="cancelOrder(order)"
              >
                取消订单
              </button>
              <button 
                v-if="order.status === 'completed'" 
                class="review-button"
                @click="reviewOrder(order)"
              >
                评价订单
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空订单提示 -->
      <div v-else class="empty-orders">
        <i class="fas fa-receipt"></i>
        <p>暂无订单</p>
        <button class="primary-button" @click="router.push('/')">
          去点餐
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '../stores/order'
import { useUserStore } from '../stores/user'
import TheNavbar from '../components/TheNavbar.vue'

const router = useRouter()
const orderStore = useOrderStore()
const userStore = useUserStore()

// 获取当前用户的订单
const orders = computed(() => {
  return orderStore.userOrders(userStore.currentUser?.id)
})

// 初始化
onMounted(() => {
  // 从本地存储加载订单
  orderStore.loadFromLocalStorage()
  // 初始化WebSocket连接
  orderStore.initWebSocket()
})

// 组件卸载时断开WebSocket连接
onUnmounted(() => {
  wsService.disconnect()
})

// 获取订单状态文本
const getStatusText = (status) => {
  const statusMap = {
    pending: '待完成',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  if (diff < 60 * 1000) { // 1分钟内
    return '刚刚'
  } else if (diff < 60 * 60 * 1000) { // 1小时内
    return `${Math.floor(diff / (60 * 1000))}分钟前`
  } else if (diff < 24 * 60 * 60 * 1000) { // 24小时内
    return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
  }
}

// 获取订单总数量
const getTotalQuantity = (order) => {
  return order.items.reduce((sum, item) => sum + item.quantity, 0)
}

// 获取订单总价
const getTotalPrice = (order) => {
  return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

// 取消订单
const cancelOrder = (order) => {
  order.status = 'cancelled'
}

// 评价订单
const reviewOrder = (order) => {
  router.push(`/review/${order.id}`)
}
</script>

<style scoped>
@import '../styles/variables.css';

.orders-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-secondary);
}

.orders-content {
  flex: 1;
  margin-top: 56px;
  padding: var(--spacing-md);
  max-width: 800px;
  margin: 56px auto 0;
  width: 100%;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.order-card {
  background-color: var(--bg-primary);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--card-shadow);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.order-status {
  font-weight: 500;
  font-size: var(--font-size-sm);
}

.order-status.completed {
  color: var(--success-color);
}

.order-status.pending {
  color: var(--warning-color);
}

.order-status.cancelled {
  color: var(--text-light);
}

.order-time {
  color: var(--text-light);
  font-size: var(--font-size-sm);
}

.order-items {
  padding: var(--spacing-md);
}

.order-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) 0;
}

.item-image {
  width: 60px;
  height: 60px;
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

.item-quantity {
  color: var(--text-light);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
}

.item-price {
  color: var(--price-color);
  font-weight: bold;
}

.price-symbol {
  font-size: var(--font-size-sm);
}

.price-value {
  font-size: var(--font-size-md);
}

.order-footer {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-total {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.total-price {
  color: var(--price-color);
  font-weight: bold;
}

.order-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.cancel-button,
.review-button {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.cancel-button {
  border: 1px solid var(--border-color);
  background: none;
  color: var(--text-secondary);
}

.cancel-button:hover {
  border-color: var(--danger-color);
  color: var(--danger-color);
}

.review-button {
  border: none;
  background-color: var(--primary-color);
  color: var(--text-primary);
}

.review-button:hover {
  background-color: var(--primary-color-dark);
}

/* 空订单样式 */
.empty-orders {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl) var(--spacing-md);
  color: var(--text-light);
}

.empty-orders i {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
}

.empty-orders p {
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

/* 响应式布局 */
@media (max-width: 768px) {
  .orders-content {
    padding: var(--spacing-sm);
  }

  .item-image {
    width: 50px;
    height: 50px;
  }

  .item-name {
    font-size: var(--font-size-sm);
  }
}</style> 