<template>
  <nav class="navbar">
    <div class="navbar-content">
      <!-- 左侧按钮 -->
      <button v-if="showBack" class="nav-button" @click="handleBack">
        <i class="fas fa-arrow-left"></i>
      </button>
      <div v-else class="nav-spacer"></div>

      <!-- 中间标题 -->
      <h1 class="nav-title">{{ title }}</h1>

      <!-- 右侧按钮 -->
      <div class="nav-actions">
        <slot name="actions">
          <button v-if="showOrders" class="nav-button" @click="goToOrders">
            <i class="fas fa-receipt"></i>
            <span class="button-text">订单</span>
          </button>
        </slot>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  title: {
    type: String,
    default: '美味餐厅'
  },
  showBack: {
    type: Boolean,
    default: false
  },
  showOrders: {
    type: Boolean,
    default: true
  }
})

const router = useRouter()

const handleBack = () => {
  router.back()
}

const goToOrders = () => {
  router.push('/orders')
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background-color: var(--bg-primary);
  box-shadow: var(--card-shadow);
  z-index: 100;
}

.navbar-content {
  max-width: 1200px;
  height: 100%;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  border: none;
  background: none;
  color: var(--text-secondary);
  font-size: var(--font-size-md);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.nav-button:hover {
  color: var(--primary-color);
}

.nav-spacer {
  width: 40px;
}

.nav-title {
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--text-primary);
  font-weight: 600;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.button-text {
  font-size: var(--font-size-sm);
}

@media (max-width: 768px) {
  .button-text {
    display: none;
  }
  
  .nav-button {
    padding: var(--spacing-xs);
  }
}
</style> 