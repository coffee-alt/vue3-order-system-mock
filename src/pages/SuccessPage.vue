<template>
  <div class="success-page">
    <div class="success-content">
      <div class="success-icon">✓</div>
      <h1>订单提交成功</h1>
      <div class="order-info">
        <p class="order-number">订单号：{{ orderStore.currentOrder?.id }}</p>
        <p class="order-time">下单时间：{{ formatTime(orderStore.currentOrder?.createTime) }}</p>
      </div>
      <router-link to="/" class="back-home">
        返回首页
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { useOrderStore } from '../stores/order'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const orderStore = useOrderStore()
const router = useRouter()

onMounted(() => {
  if (!orderStore.currentOrder) {
    router.replace('/')
  }
})

const formatTime = (timeString) => {
  if (!timeString) return ''
  const date = new Date(timeString)
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
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.success-content {
  background: white;
  padding: 32px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  max-width: 400px;
  width: 100%;
}

.success-icon {
  width: 60px;
  height: 60px;
  line-height: 60px;
  background: #52c41a;
  color: white;
  border-radius: 30px;
  font-size: 32px;
  margin: 0 auto 20px;
}

h1 {
  margin: 0 0 20px;
  color: #52c41a;
  font-size: 24px;
}

.order-info {
  margin: 20px 0;
  padding: 20px;
  background: #f8f8f8;
  border-radius: 4px;
}

.order-info p {
  margin: 8px 0;
  color: #666;
}

.back-home {
  display: inline-block;
  padding: 8px 24px;
  background: #1890ff;
  color: white;
  text-decoration: none;
  border-radius: 20px;
  margin-top: 20px;
}
</style> 