<template>
  <div class="success-page">
    <div class="success-icon">
      <svg viewBox="64 64 896 896" data-icon="check-circle" width="48" height="48" fill="currentColor" aria-hidden="true">
        <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-210.6 292a31.8 31.8 0 01-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z"></path>
      </svg>
    </div>
    
    <h2>订单提交成功！</h2>
    
    <div class="order-info">
      <div class="info-item">
        <span class="label">订单号：</span>
        <span class="value">{{ orderNumber }}</span>
      </div>
      <div class="info-item">
        <span class="label">下单时间：</span>
        <span class="value">{{ formatDate(createTime) }}</span>
      </div>
      <div class="info-item">
        <span class="label">订单金额：</span>
        <span class="value amount">¥{{ totalAmount }}</span>
      </div>
    </div>

    <div class="actions">
      <router-link to="/orders" class="primary-btn">查看订单</router-link>
      <router-link to="/" class="secondary-btn">继续点餐</router-link>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const orderNumber = route.query.orderNumber
const createTime = route.query.createTime
const totalAmount = route.query.totalAmount

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
</script>

<style scoped>
.success-page {
  max-width: 600px;
  margin: 40px auto;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
}

.success-icon {
  color: #52c41a;
  font-size: 72px;
  margin-bottom: 24px;
}

h2 {
  color: #52c41a;
  margin-bottom: 32px;
}

.order-info {
  text-align: left;
  margin: 32px 0;
  padding: 20px;
  background: #f8f8f8;
  border-radius: 4px;
}

.info-item {
  margin: 12px 0;
  display: flex;
  align-items: center;
}

.label {
  color: #666;
  width: 100px;
}

.value {
  flex: 1;
  color: #333;
}

.value.amount {
  color: #ff4d4f;
  font-weight: bold;
}

.actions {
  margin-top: 32px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.primary-btn, .secondary-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
}

.primary-btn {
  background: #1890ff;
  color: white;
}

.primary-btn:hover {
  background: #40a9ff;
}

.secondary-btn {
  background: white;
  border: 1px solid #d9d9d9;
  color: #666;
}

.secondary-btn:hover {
  color: #40a9ff;
  border-color: #40a9ff;
}
</style> 