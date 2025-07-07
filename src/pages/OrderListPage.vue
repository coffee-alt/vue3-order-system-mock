<template>
  <div class="order-list-page">
    <div class="page-header">
      <h2>订单列表</h2>
      <router-link to="/" class="menu-btn">
        去点餐
      </router-link>
    </div>
    
    <!-- 订单类型筛选 -->
    <div class="filter-bar">
      <div 
        v-for="type in orderTypes" 
        :key="type.value"
        :class="['filter-btn', { active: selectedType === type.value }]"
        @click="selectedType = type.value"
      >
        {{ type.label }}
      </div>
    </div>
    
    <div class="order-list">
      <div v-for="order in filteredOrders" :key="order.orderNumber" class="order-card">
        <div class="order-header">
          <div class="order-info">
            <span class="order-number">订单号：{{ order.orderNumber }}</span>
            <span class="order-type">
              {{ order.type === 'dine_in' ? '堂食' : '外带' }}
              {{ order.type === 'dine_in' ? `(${order.tableNumber}号桌)` : '' }}
            </span>
          </div>
          <div class="order-status" :class="order.status">
            {{ getStatusText(order.status) }}
          </div>
        </div>
        
        <div class="order-items">
          <div v-for="item in order.items" :key="item.id" class="order-item">
            <img :src="item.image" :alt="item.name" class="item-image">
            <div class="item-info">
              <h4>{{ item.name }}</h4>
              <p class="item-price">¥{{ item.price }} × {{ item.quantity }}</p>
            </div>
            <div class="item-total">¥{{ item.price * item.quantity }}</div>
          </div>
        </div>
        
        <div class="order-footer">
          <div class="order-info">
            <p>下单时间：{{ formatDate(order.createTime) }}</p>
            <p v-if="order.note">备注：{{ order.note }}</p>
          </div>
          <div class="order-actions">
            <div class="order-total">
              <span>总计：</span>
              <span class="total-amount">¥{{ order.totalAmount }}</span>
            </div>
            <div class="action-buttons" v-if="order.status === 'pending'">
              <button 
                @click="updateStatus(order.orderNumber, 'preparing')"
                class="primary-btn"
              >
                开始准备
              </button>
              <button 
                @click="updateStatus(order.orderNumber, 'cancelled')"
                class="danger-btn"
              >
                取消订单
              </button>
            </div>
            <div class="action-buttons" v-if="order.status === 'preparing'">
              <button 
                @click="updateStatus(order.orderNumber, 'completed')"
                class="success-btn"
              >
                完成订单
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredOrders.length === 0" class="empty-state">
      <p>暂无订单</p>
      <router-link to="/" class="primary-btn">去点餐</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useOrderStore } from '../stores/order'

const orderStore = useOrderStore()

// 订单类型选项
const orderTypes = [
  { label: '全部订单', value: 'all' },
  { label: '堂食', value: 'dine_in' },
  { label: '外带', value: 'takeout' }
]

const selectedType = ref('all')

// 根据类型筛选订单
const filteredOrders = computed(() => {
  const orders = [...orderStore.orders].sort((a, b) => 
    new Date(b.createTime) - new Date(a.createTime)
  )
  
  if (selectedType.value === 'all') {
    return orders
  }
  
  return orders.filter(order => order.type === selectedType.value)
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const getStatusText = (status) => {
  const statusMap = {
    'pending': '待处理',
    'preparing': '准备中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return statusMap[status] || status
}

const updateStatus = (orderNumber, status) => {
  if (confirm(`确定要${getStatusText(status)}吗？`)) {
    orderStore.updateOrderStatus(orderNumber, status)
  }
}
</script>

<style scoped>
.order-list-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.menu-btn {
  background: #1890ff;
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  text-decoration: none;
  font-size: 14px;
  transition: background-color 0.3s;
}

.menu-btn:hover {
  background: #40a9ff;
}

.filter-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-btn.active {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.order-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.order-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.order-header {
  padding: 15px;
  background: #f8f8f8;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.order-number {
  color: #666;
  font-size: 14px;
}

.order-type {
  font-size: 14px;
  color: #1890ff;
}

.order-status {
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
}

.order-status.pending {
  background: #e6f7ff;
  color: #1890ff;
}

.order-status.preparing {
  background: #fff7e6;
  color: #fa8c16;
}

.order-status.completed {
  background: #f6ffed;
  color: #52c41a;
}

.order-status.cancelled {
  background: #fff1f0;
  color: #ff4d4f;
}

.order-items {
  padding: 15px;
  max-height: 300px;
  overflow-y: auto;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 15px;
}

.item-info {
  flex: 1;
}

.item-info h4 {
  margin: 0;
  font-size: 14px;
  color: #333;
}

.item-price {
  margin: 5px 0 0;
  color: #666;
  font-size: 12px;
}

.item-total {
  color: #ff4d4f;
  font-weight: bold;
}

.order-footer {
  padding: 15px;
  background: #f8f8f8;
  border-top: 1px solid #f0f0f0;
}

.order-info p {
  margin: 5px 0;
  color: #666;
  font-size: 14px;
}

.order-actions {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-total {
  font-size: 16px;
}

.total-amount {
  color: #ff4d4f;
  font-weight: bold;
  margin-left: 5px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.primary-btn, .danger-btn, .success-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.primary-btn {
  background: #1890ff;
  color: white;
}

.primary-btn:hover {
  background: #40a9ff;
}

.danger-btn {
  background: #ff4d4f;
  color: white;
}

.danger-btn:hover {
  background: #ff7875;
}

.success-btn {
  background: #52c41a;
  color: white;
}

.success-btn:hover {
  background: #73d13d;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.empty-state p {
  color: #666;
  margin-bottom: 20px;
}
</style> 