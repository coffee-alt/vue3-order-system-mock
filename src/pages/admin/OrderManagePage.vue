<template>
  <div class="order-manage-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>订单管理</h1>
      <div class="header-actions">
        <div class="connection-status" :class="connectionStatus">
          <i class="fas fa-circle"></i>
          <span>{{ connectionStatusText }}</span>
        </div>
        <div class="filter-group">
          <select v-model="statusFilter" class="filter-select">
            <option value="all">全部订单</option>
            <option value="pending">待处理</option>
            <option value="completed">已完成</option>
            <option value="cancelled">已取消</option>
          </select>
          <input 
            type="date" 
            v-model="dateFilter"
            class="filter-date"
          >
        </div>
        <button class="refresh-btn" @click="refreshOrders">
          <i class="fas fa-sync-alt"></i>
          刷新
        </button>
      </div>
    </div>

    <!-- 订单统计 -->
    <div class="order-stats">
      <div class="stat-card">
        <div class="stat-value">{{ orderStats.total }}</div>
        <div class="stat-label">总订单</div>
      </div>
      <div class="stat-card pending">
        <div class="stat-value">{{ orderStats.pending }}</div>
        <div class="stat-label">待处理</div>
      </div>
      <div class="stat-card completed">
        <div class="stat-value">{{ orderStats.completed }}</div>
        <div class="stat-label">已完成</div>
      </div>
      <div class="stat-card cancelled">
        <div class="stat-value">{{ orderStats.cancelled }}</div>
        <div class="stat-label">已取消</div>
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="order-list">
      <div class="list-header">
        <div class="header-cell order-id">订单号</div>
        <div class="header-cell order-time">下单时间</div>
        <div class="header-cell order-items">商品信息</div>
        <div class="header-cell order-amount">金额</div>
        <div class="header-cell order-status">状态</div>
        <div class="header-cell order-actions">操作</div>
      </div>

      <TransitionGroup name="list">
        <div 
          v-for="order in filteredOrders" 
          :key="order.id"
          class="order-row"
        >
          <div class="cell order-id">#{{ order.id }}</div>
          <div class="cell order-time">
            <div class="time">{{ formatDate(order.createTime) }}</div>
            <div class="time-ago">{{ formatTimeAgo(order.createTime) }}</div>
          </div>
          <div class="cell order-items">
            <div class="items-summary">
              {{ getItemsSummary(order.items) }}
            </div>
            <button class="view-details-btn" @click="showOrderDetails(order)">
              查看详情
            </button>
          </div>
          <div class="cell order-amount">
            <span class="amount">¥{{ order.total }}</span>
            <span class="quantity">共{{ getTotalQuantity(order) }}件</span>
          </div>
          <div class="cell order-status">
            <span :class="['status-badge', order.status]">
              {{ getStatusText(order.status) }}
            </span>
          </div>
          <div class="cell order-actions">
            <template v-if="order.status === 'pending'">
              <button 
                class="action-btn complete"
                @click="completeOrder(order)"
              >
                完成订单
              </button>
              <button 
                class="action-btn cancel"
                @click="cancelOrder(order)"
              >
                取消订单
              </button>
            </template>
            <button 
              v-else
              class="action-btn delete"
              @click="deleteOrder(order)"
            >
              删除订单
            </button>
          </div>
        </div>
      </TransitionGroup>

      <!-- 空状态 -->
      <div v-if="filteredOrders.length === 0" class="empty-state">
        <i class="fas fa-receipt"></i>
        <p>暂无订单</p>
      </div>
    </div>

    <!-- 订单详情弹窗 -->
    <div 
      v-if="selectedOrder"
      class="order-details-modal"
      @click.self="closeOrderDetails"
    >
      <div class="modal-content">
        <div class="modal-header">
          <h2>订单详情</h2>
          <button class="close-btn" @click="closeOrderDetails">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="detail-row">
            <span class="label">订单号：</span>
            <span class="value">#{{ selectedOrder.id }}</span>
          </div>
          <div class="detail-row">
            <span class="label">下单时间：</span>
            <span class="value">{{ formatDate(selectedOrder.createTime) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">订单状态：</span>
            <span :class="['status-badge', selectedOrder.status]">
              {{ getStatusText(selectedOrder.status) }}
            </span>
          </div>
          <div class="items-list">
            <h3>商品清单</h3>
            <div 
              v-for="item in selectedOrder.items" 
              :key="item.id"
              class="item-row"
            >
              <div class="item-image">
                <img :src="item.image" :alt="item.name">
              </div>
              <div class="item-info">
                <div class="item-name">{{ item.name }}</div>
                <div class="item-price">¥{{ item.price }} × {{ item.quantity }}</div>
              </div>
              <div class="item-total">¥{{ item.price * item.quantity }}</div>
            </div>
          </div>
          <div class="order-summary">
            <div class="summary-row">
              <span>商品总数：</span>
              <span>{{ getTotalQuantity(selectedOrder) }}件</span>
            </div>
            <div class="summary-row total">
              <span>订单总额：</span>
              <span>¥{{ selectedOrder.total }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <template v-if="selectedOrder.status === 'pending'">
            <button 
              class="action-btn complete"
              @click="completeOrder(selectedOrder)"
            >
              完成订单
            </button>
            <button 
              class="action-btn cancel"
              @click="cancelOrder(selectedOrder)"
            >
              取消订单
            </button>
          </template>
          <button 
            v-else
            class="action-btn delete"
            @click="deleteOrder(selectedOrder)"
          >
            删除订单
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useOrderStore } from '../../stores/order'
import { wsService } from '../../services/WebSocketService'

const orderStore = useOrderStore()
const statusFilter = ref('all')
const dateFilter = ref('')
const selectedOrder = ref(null)
const connectionStatus = ref('disconnected')

// 连接状态提示
const connectionStatusText = computed(() => {
  return {
    connected: '已连接',
    disconnected: '未连接',
    connecting: '连接中...'
  }[connectionStatus.value]
})

// 初始化
onMounted(() => {
  // 从本地存储加载订单
  orderStore.loadFromLocalStorage()
  
  // 初始化WebSocket连接
  orderStore.initWebSocket()
  
  // 监听连接状态
  wsService.on('connection', ({ status }) => {
    connectionStatus.value = status
  })
})

// 组件卸载时断开WebSocket连接
onUnmounted(() => {
  wsService.disconnect()
})

// 订单统计
const orderStats = computed(() => {
  const orders = orderStore.allOrders
  return {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  }
})

// 过滤订单
const filteredOrders = computed(() => {
  let orders = orderStore.allOrders

  // 状态过滤
  if (statusFilter.value !== 'all') {
    orders = orders.filter(order => order.status === statusFilter.value)
  }

  // 日期过滤
  if (dateFilter.value) {
    const filterDate = new Date(dateFilter.value)
    orders = orders.filter(order => {
      const orderDate = new Date(order.createTime)
      return orderDate.toDateString() === filterDate.toDateString()
    })
  }

  return orders
})

// 格式化日期
const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 格式化相对时间
const formatTimeAgo = (timestamp) => {
  const now = Date.now()
  const diff = now - timestamp

  if (diff < 60 * 1000) return '刚刚'
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}分钟前`
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
  return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`
}

// 获取商品摘要
const getItemsSummary = (items) => {
  if (!items.length) return '无商品'
  const firstItem = items[0]
  return items.length > 1 
    ? `${firstItem.name} 等${items.length}件商品`
    : firstItem.name
}

// 获取订单总数量
const getTotalQuantity = (order) => {
  return order.items.reduce((sum, item) => sum + item.quantity, 0)
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    pending: '待处理',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

// 显示订单详情
const showOrderDetails = (order) => {
  selectedOrder.value = order
}

// 关闭订单详情
const closeOrderDetails = () => {
  selectedOrder.value = null
}

// 刷新订单列表
const refreshOrders = () => {
  orderStore.loadFromLocalStorage()
}

// 完成订单
const completeOrder = (order) => {
  orderStore.completeOrder(order.id)
  if (selectedOrder.value?.id === order.id) {
    selectedOrder.value = { ...order, status: 'completed' }
  }
}

// 取消订单
const cancelOrder = (order) => {
  orderStore.cancelOrder(order.id)
  if (selectedOrder.value?.id === order.id) {
    selectedOrder.value = { ...order, status: 'cancelled' }
  }
}

// 删除订单
const deleteOrder = (order) => {
  if (confirm('确定要删除该订单吗？')) {
    orderStore.deleteOrder(order.id)
    if (selectedOrder.value?.id === order.id) {
      closeOrderDetails()
    }
  }
}
</script>

<style scoped>
@import '../../styles/variables.css';

.order-manage-page {
  padding: var(--spacing-lg);
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

/* 页面标题样式 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.page-header h1 {
  margin: 0;
  font-size: var(--font-size-xl);
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  gap: var(--spacing-md);
}

.filter-group {
  display: flex;
  gap: var(--spacing-sm);
}

.filter-select,
.filter-date {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.refresh-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius);
  background-color: var(--primary-color);
  color: var(--text-primary);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.refresh-btn:hover {
  background-color: var(--primary-color-dark);
}

/* 订单统计样式 */
.order-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.stat-card {
  background-color: var(--bg-primary);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: bold;
  color: var(--text-primary);
}

.stat-label {
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.stat-card.pending .stat-value {
  color: var(--warning-color);
}

.stat-card.completed .stat-value {
  color: var(--success-color);
}

.stat-card.cancelled .stat-value {
  color: var(--danger-color);
}

/* 订单列表样式 */
.order-list {
  background-color: var(--bg-primary);
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  overflow: hidden;
}

.list-header {
  display: grid;
  grid-template-columns: 100px 180px 1fr 120px 100px 160px;
  padding: var(--spacing-md);
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  font-weight: 500;
  color: var(--text-secondary);
}

.order-row {
  display: grid;
  grid-template-columns: 100px 180px 1fr 120px 100px 160px;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  align-items: center;
}

.order-row:last-child {
  border-bottom: none;
}

.cell {
  padding: 0 var(--spacing-sm);
}

.order-id {
  color: var(--text-secondary);
  font-family: monospace;
}

.time {
  color: var(--text-primary);
}

.time-ago {
  color: var(--text-light);
  font-size: var(--font-size-xs);
  margin-top: var(--spacing-xs);
}

.items-summary {
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.view-details-btn {
  border: none;
  background: none;
  color: var(--primary-color);
  cursor: pointer;
  padding: 0;
  font-size: var(--font-size-sm);
}

.view-details-btn:hover {
  text-decoration: underline;
}

.amount {
  color: var(--price-color);
  font-weight: bold;
  display: block;
}

.quantity {
  color: var(--text-light);
  font-size: var(--font-size-xs);
}

.status-badge {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
}

.status-badge.pending {
  background-color: var(--warning-color-light);
  color: var(--warning-color);
}

.status-badge.completed {
  background-color: var(--success-color-light);
  color: var(--success-color);
}

.status-badge.cancelled {
  background-color: var(--danger-color-light);
  color: var(--danger-color);
}

.action-btn {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: none;
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn.complete {
  background-color: var(--success-color);
  color: white;
}

.action-btn.cancel {
  background-color: var(--warning-color);
  color: white;
  margin-left: var(--spacing-sm);
}

.action-btn.delete {
  background-color: var(--danger-color);
  color: white;
}

.action-btn:hover {
  filter: brightness(1.1);
}

/* 空状态样式 */
.empty-state {
  padding: var(--spacing-xl);
  text-align: center;
  color: var(--text-light);
}

.empty-state i {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
}

/* 订单详情弹窗样式 */
.order-details-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--bg-primary);
  border-radius: var(--border-radius);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: var(--font-size-lg);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  font-size: var(--font-size-lg);
  padding: var(--spacing-xs);
}

.close-btn:hover {
  color: var(--text-primary);
}

.modal-body {
  padding: var(--spacing-md);
}

.detail-row {
  margin-bottom: var(--spacing-md);
  display: flex;
  align-items: center;
}

.detail-row .label {
  color: var(--text-secondary);
  width: 100px;
}

.items-list {
  margin-top: var(--spacing-lg);
}

.items-list h3 {
  margin: 0 0 var(--spacing-md);
  color: var(--text-primary);
}

.item-row {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-color);
}

.item-row:last-child {
  border-bottom: none;
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
}

.item-name {
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.item-price {
  color: var(--text-light);
  font-size: var(--font-size-sm);
}

.item-total {
  color: var(--price-color);
  font-weight: bold;
}

.order-summary {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
}

.summary-row.total {
  color: var(--text-primary);
  font-weight: bold;
  font-size: var(--font-size-md);
}

.modal-footer {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
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
@media (max-width: 1024px) {
  .order-manage-page {
    padding: var(--spacing-md);
  }

  .list-header,
  .order-row {
    grid-template-columns: 80px 150px 1fr 100px 90px 140px;
  }
}

@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .list-header {
    display: none;
  }

  .order-row {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }

  .cell {
    padding: var(--spacing-xs) 0;
  }

  .order-id {
    font-size: var(--font-size-lg);
    margin-bottom: var(--spacing-sm);
  }

  .order-time,
  .order-items,
  .order-amount {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .order-status {
    display: flex;
    justify-content: flex-start;
  }

  .order-actions {
    display: flex;
    justify-content: flex-end;
    padding-top: var(--spacing-sm);
    border-top: 1px solid var(--border-color);
  }
}

.connection-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
}

.connection-status i {
  font-size: 8px;
}

.connection-status.connected {
  background-color: var(--success-color-light);
  color: var(--success-color);
}

.connection-status.disconnected {
  background-color: var(--danger-color-light);
  color: var(--danger-color);
}

.connection-status.connecting {
  background-color: var(--warning-color-light);
  color: var(--warning-color);
}
</style> 