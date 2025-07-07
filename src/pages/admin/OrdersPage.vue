<template>
  <div class="orders-page">
    <div class="page-header">
      <h2>订单管理</h2>
      <div class="filter-bar">
        <div 
          v-for="status in orderStatuses" 
          :key="status.value"
          :class="['filter-btn', { active: selectedStatus === status.value }]"
          @click="selectedStatus = status.value"
        >
          {{ status.label }}
          <span class="count" v-if="getStatusCount(status.value)">
            {{ getStatusCount(status.value) }}
          </span>
        </div>
      </div>
    </div>

    <div class="orders-grid">
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
            <div class="action-buttons">
              <template v-if="order.status === 'pending'">
                <button 
                  @click="updateOrderStatus(order.orderNumber, 'preparing')"
                  class="primary-btn"
                >
                  开始准备
                </button>
                <button 
                  @click="updateOrderStatus(order.orderNumber, 'cancelled')"
                  class="danger-btn"
                >
                  取消订单
                </button>
              </template>
              <template v-if="order.status === 'preparing'">
                <button 
                  @click="updateOrderStatus(order.orderNumber, 'completed')"
                  class="success-btn"
                >
                  完成订单
                </button>
              </template>
              <button 
                v-if="order.status === 'completed'"
                @click="printOrder(order)"
                class="print-btn"
              >
                打印小票
              </button>
            </div>
          </div>
        </div>

        <!-- 新订单提醒标记 -->
        <div v-if="order.isNew" class="new-order-badge">新订单</div>
        
        <!-- 完成订单角标 -->
        <div v-if="order.isCompleted" class="completed-badge">
          已完成
          <span class="completed-time" v-if="order.completedTime">
            {{ formatCompletedTime(order.completedTime) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredOrders.length === 0" class="empty-state">
      <p>暂无{{ getStatusText(selectedStatus) }}订单</p>
    </div>

    <!-- 新订单提示音 -->
    <audio ref="newOrderSound" src="/sounds/new-order.mp3"></audio>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watchEffect } from 'vue'
import { useOrderStore } from '../../stores/order'

const orderStore = useOrderStore()
const newOrderSound = ref(null)

// 添加 watchEffect 来监听订单变化
watchEffect(() => {
  console.log('订单列表发生变化:', orderStore.orders)
})

// 订单状态选项
const orderStatuses = [
  { label: '全部订单', value: 'all' },
  { label: '待处理', value: 'pending' },
  { label: '准备中', value: 'preparing' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
]

const selectedStatus = ref('pending')

// 根据状态筛选订单
const filteredOrders = computed(() => {
  console.log('filteredOrders 计算开始')
  console.log('当前选中状态:', selectedStatus.value)
  
  const orders = orderStore.ordersByStatus(selectedStatus.value)
  const sortedOrders = [...orders].sort((a, b) => 
    new Date(b.createTime) - new Date(a.createTime)
  )
  
  console.log('过滤后的订单列表:', sortedOrders)
  return sortedOrders
})

// 获取各状态订单数量
const getStatusCount = (status) => {
  return orderStore.getOrderCountByStatus(status)
}

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
    'all': '全部',
    'pending': '待处理',
    'preparing': '准备中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return statusMap[status] || status
}

// 格式化完成时间
const formatCompletedTime = (completedTime) => {
  const now = new Date()
  const completed = new Date(completedTime)
  const diffMinutes = Math.floor((now - completed) / (1000 * 60))
  const remainingMinutes = 5 - diffMinutes
  
  if (remainingMinutes <= 0) return ''
  return `${remainingMinutes}分钟`
}

// 更新订单状态
const updateOrderStatus = async (orderNumber, status) => {
  if (confirm(`确定要${getStatusText(status)}该订单吗？`)) {
    await orderStore.updateOrderStatus(orderNumber, status)
    
    // 如果是完成订单，添加完成时间
    if (status === 'completed') {
      const order = orderStore.getOrderByNumber(orderNumber)
      if (order) {
        order.isCompleted = true
        order.completedTime = new Date().toISOString()
        
        // 5分钟后移除完成标记
        setTimeout(() => {
          order.isCompleted = false
          order.completedTime = null
        }, 5 * 60 * 1000)
      }
    }
  }
}

// 打印订单小票
const printOrder = (order) => {
  const printContent = `
    订单号：${order.orderNumber}
    类型：${order.type === 'dine_in' ? `堂食 (${order.tableNumber}号桌)` : '外带'}
    下单时间：${formatDate(order.createTime)}
    
    商品列表：
    ${order.items.map(item => 
      `${item.name} × ${item.quantity}  ¥${item.price * item.quantity}`
    ).join('\n')}
    
    总计：¥${order.totalAmount}
    
    ${order.note ? `备注：${order.note}` : ''}
  `
  
  const printWindow = window.open('', '_blank')
  printWindow.document.write(`
    <pre style="font-family: monospace; font-size: 14px; padding: 20px;">
      ${printContent}
    </pre>
  `)
  printWindow.document.close()
  printWindow.print()
  printWindow.close()
}

// 监听新订单
let checkInterval
onMounted(() => {
  console.log('后台订单页面已加载')
  console.log('初始订单列表:', orderStore.allOrders)
  // 每3秒检查一次新订单
  checkInterval = setInterval(() => {
    console.log('检查新订单...')
    const newOrders = orderStore.pendingOrders.filter(order => !order.isChecked)
    
    if (newOrders.length > 0) {
      console.log('发现新订单:', newOrders)
      // 标记订单为已查看
      newOrders.forEach(order => {
        order.isChecked = true
        order.isNew = true
        // 5秒后移除新订单标记
        setTimeout(() => {
          order.isNew = false
        }, 5000)
      })
    }
  }, 3000)
})

onUnmounted(() => {
  if (checkInterval) {
    clearInterval(checkInterval)
  }
})
</script>

<style scoped>
.orders-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.filter-bar {
  display: flex;
  gap: 15px;
  margin-top: 15px;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.filter-btn.active {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.count {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff4d4f;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 12px;
  min-width: 16px;
  text-align: center;
}

.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.order-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
  position: relative;
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

.primary-btn, .danger-btn, .success-btn, .print-btn {
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

.print-btn {
  background: #722ed1;
  color: white;
}

.print-btn:hover {
  background: #9254de;
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
}

.new-order-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #ff4d4f;
  color: white;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 0 8px 0 8px;
  animation: flash 1s infinite;
}

@keyframes flash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.completed-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #4CAF50;
  color: white;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.completed-time {
  font-size: 12px;
  margin-top: 2px;
  opacity: 0.8;
}
</style> 