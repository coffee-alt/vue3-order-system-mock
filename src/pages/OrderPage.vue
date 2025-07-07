<template>
  <div class="order-page">
    <!-- 添加返回按钮 -->
    <div class="header">
      <button class="back-btn" @click="goBack">
        <span class="back-icon">←</span> 返回
      </button>
      <h2>确认订单</h2>
    </div>
    
    <!-- 订单类型选择 -->
    <div class="order-type">
      <div 
        :class="['type-btn', { active: orderForm.type === 'dine_in' }]"
        @click="orderForm.type = 'dine_in'"
      >
        堂食
      </div>
      <div 
        :class="['type-btn', { active: orderForm.type === 'takeout' }]"
        @click="orderForm.type = 'takeout'"
      >
        外带
      </div>
    </div>

    <!-- 堂食选择桌号 -->
    <div v-if="orderForm.type === 'dine_in'" class="table-select">
      <label>桌号</label>
      <select v-model="orderForm.tableNumber">
        <option value="">请选择桌号</option>
        <option v-for="n in 20" :key="n" :value="n">{{ n }}号桌</option>
      </select>
    </div>
    
    <!-- 购物车商品列表 -->
    <div class="order-items">
      <div v-for="item in cartStore.items" :key="item.id" class="order-item">
        <img :src="item.image" :alt="item.name" class="item-image">
        <div class="item-info">
          <h3>{{ item.name }}</h3>
          <p class="item-price">¥{{ item.price }} × {{ item.quantity }}</p>
        </div>
        <div class="item-total">
          ¥{{ item.price * item.quantity }}
        </div>
      </div>
    </div>

    <!-- 订单总计 -->
    <div class="order-total">
      <span>总计：</span>
      <span class="total-amount">¥{{ cartStore.total }}</span>
    </div>

    <!-- 备注 -->
    <div class="order-form">
      <div class="form-group">
        <label>备注</label>
        <textarea 
          v-model="orderForm.note"
          placeholder="请输入备注信息（选填）"
          rows="2"
        ></textarea>
      </div>

      <button 
        @click="handleSubmit" 
        class="submit-btn"
        :disabled="isSubmitting || !isValid"
      >
        {{ isSubmitting ? '提交中...' : '确认下单' }}
      </button>
    </div>

    <div v-if="currentOrder" class="order-status">
      <h3>订单状态</h3>
      <div class="status-card">
        <div class="status-header">
          <span class="order-number">订单号：{{ currentOrder.orderNumber }}</span>
          <span :class="['status-badge', currentOrder.status]">
            {{ getStatusText(currentOrder.status) }}
          </span>
        </div>
        
        <div class="order-details">
          <p>订单类型：{{ currentOrder.type === 'dine_in' ? '堂食' : '外带' }}</p>
          <p v-if="currentOrder.type === 'dine_in'">桌号：{{ currentOrder.tableNumber }}号桌</p>
          <p>下单时间：{{ formatDate(currentOrder.createTime) }}</p>
          <p>总金额：¥{{ currentOrder.totalAmount }}</p>
        </div>

        <!-- 评价按钮 -->
        <div v-if="currentOrder.status === 'completed' && !currentOrder.isRated" class="rating-section">
          <button class="rating-btn" @click="showRatingDialog = true">
            评价订单
          </button>
        </div>
      </div>
    </div>

    <!-- 评价对话框 -->
    <div v-if="showRatingDialog" class="rating-dialog">
      <div class="rating-content">
        <h3>订单评价</h3>
        <div class="rating-stars">
          <span
            v-for="star in 5"
            :key="star"
            :class="['star', { active: star <= rating }]"
            @click="rating = star"
          >
            ★
          </span>
        </div>
        <textarea
          v-model="ratingComment"
          placeholder="请输入您的评价（选填）"
          rows="3"
        ></textarea>
        <div class="rating-actions">
          <button class="cancel-btn" @click="cancelRating">取消</button>
          <button class="submit-btn" @click="submitRating">提交评价</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useOrderStore } from '../stores/order'

const router = useRouter()
const cartStore = useCartStore()
const orderStore = useOrderStore()

const isSubmitting = ref(false)
const showRatingDialog = ref(false)
const rating = ref(5)
const ratingComment = ref('')

const orderForm = ref({
  type: 'dine_in', // dine_in 或 takeout
  tableNumber: '',
  note: ''
})

// 表单验证
const isValid = computed(() => {
  if (orderForm.value.type === 'dine_in' && !orderForm.value.tableNumber) {
    return false
  }
  return true
})

// 获取当前订单
const currentOrder = computed(() => {
  const orderNumber = localStorage.getItem('currentOrderNumber')
  return orderNumber ? orderStore.getOrderByNumber(orderNumber) : null
})

const handleSubmit = async () => {
  if (!isValid.value) {
    alert(orderForm.value.type === 'dine_in' ? '请选择桌号' : '请选择订单类型')
    return
  }

  if (cartStore.items.length === 0) {
    alert('购物车为空，请先添加商品')
    return
  }

  try {
    isSubmitting.value = true
    
    // 创建订单对象
    const orderData = {
      type: orderForm.value.type,
      tableNumber: orderForm.value.type === 'dine_in' ? orderForm.value.tableNumber : null,
      note: orderForm.value.note,
      items: cartStore.items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      totalAmount: cartStore.total
    }

    // 提交订单
    const result = await orderStore.submitOrder(orderData)
    
    // 跳转到订单成功页面
    router.push({
      name: 'orderSuccess',
      query: {
        orderNumber: result.data.orderNumber,
        createTime: result.data.createTime,
        totalAmount: result.data.totalAmount,
        type: result.data.type,
        tableNumber: result.data.tableNumber
      }
    })
  } catch (error) {
    console.error('提交订单失败:', error)
    alert('订单提交失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

// 状态文本映射
const getStatusText = (status) => {
  const statusMap = {
    'pending': '待处理',
    'preparing': '准备中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return statusMap[status] || status
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 取消评价
const cancelRating = () => {
  showRatingDialog.value = false
  rating.value = 5
  ratingComment.value = ''
}

// 提交评价
const submitRating = async () => {
  if (currentOrder.value) {
    await orderStore.submitRating(currentOrder.value.orderNumber, {
      rating: rating.value,
      comment: ratingComment.value
    })
    showRatingDialog.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.order-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px 0;
}

.back-btn {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: #333;
  font-size: 16px;
  cursor: pointer;
  padding: 8px 12px;
  margin-right: 15px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.back-btn:hover {
  background-color: #f5f5f5;
}

.back-icon {
  font-size: 20px;
  margin-right: 5px;
}

h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.order-type {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.type-btn {
  flex: 1;
  padding: 12px;
  text-align: center;
  border: 2px solid #e8e8e8;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.type-btn.active {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.table-select {
  margin-bottom: 20px;
}

select {
  width: 100%;
  padding: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 16px;
}

.order-items {
  margin: 20px 0;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 15px;
}

.item-info {
  flex: 1;
}

.item-info h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.item-price {
  margin: 5px 0 0;
  color: #666;
}

.item-total {
  font-weight: bold;
  color: #ff4d4f;
}

.order-total {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 20px 0;
  font-size: 18px;
}

.total-amount {
  color: #ff4d4f;
  font-weight: bold;
  margin-left: 10px;
}

.order-form {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #666;
}

textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  box-sizing: border-box;
  resize: vertical;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.submit-btn:hover {
  background: #40a9ff;
}

.submit-btn:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}

.order-status {
  margin-top: 20px;
}

.status-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.order-number {
  font-size: 16px;
  font-weight: bold;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  color: white;
}

.status-badge.pending {
  background-color: #ff9800;
}

.status-badge.preparing {
  background-color: #2196F3;
}

.status-badge.completed {
  background-color: #4CAF50;
}

.status-badge.cancelled {
  background-color: #f44336;
}

.order-details {
  margin-bottom: 20px;
}

.rating-section {
  margin-top: 20px;
  text-align: center;
}

.rating-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.rating-btn:hover {
  background-color: #45a049;
}

.rating-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.rating-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
}

.rating-stars {
  display: flex;
  justify-content: center;
  margin: 20px 0;
  font-size: 24px;
}

.star {
  color: #ddd;
  cursor: pointer;
  margin: 0 5px;
  transition: color 0.3s;
}

.star.active {
  color: #ffd700;
}

textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
}

.rating-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn,
.submit-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}

.submit-btn {
  background-color: #4CAF50;
  color: white;
}
</style> 