<template>
  <div class="welcome-page">
    <div class="welcome-content">
      <h1 class="welcome-title">
        <i class="fas fa-utensils"></i>
        欢迎来到点餐系统
      </h1>
      <p class="welcome-description">
        <i class="fas fa-star"></i>
        探索美味，享受便捷的点餐体验
      </p>
      <div class="feature-list">
        <div class="feature-item">
          <i class="fas fa-mobile-alt"></i>
          <span>移动端友好</span>
        </div>
        <div class="feature-item">
          <i class="fas fa-clock"></i>
          <span>实时订单追踪</span>
        </div>
        <div class="feature-item">
          <i class="fas fa-shield-alt"></i>
          <span>安全支付</span>
        </div>
      </div>
      <router-link to="/menu" class="start-btn">
        <i class="fas fa-arrow-right"></i>
        开始点餐
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMenuStore } from '../stores/menu'

const router = useRouter()
const menuStore = useMenuStore()

onMounted(() => {
  // 确保菜单数据已加载
  if (menuStore.categories.length === 0) {
    menuStore.loadFromLocalStorage()
  }
})
</script>

<style scoped>
.welcome-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-primary);
  padding: var(--spacing-xl);
}

.welcome-content {
  text-align: center;
  max-width: 600px;
}

.welcome-title {
  font-size: var(--font-size-xxl);
  color: var(--primary-color);
  margin-bottom: var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
}

.welcome-title i {
  font-size: 1.2em;
}

.welcome-description {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.welcome-description i {
  color: var(--warning-color);
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius);
  transition: transform var(--transition-fast);
}

.feature-item:hover {
  transform: translateY(-4px);
}

.feature-item i {
  font-size: var(--font-size-xl);
  color: var(--primary-color);
}

.feature-item span {
  font-size: var(--font-size-md);
  color: var(--text-primary);
}

.start-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  background-color: var(--primary-color);
  color: var(--text-white);
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--border-radius);
  font-size: var(--font-size-lg);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.start-btn:hover {
  background-color: var(--primary-color-dark);
  transform: scale(1.05);
}

.start-btn i {
  transition: transform var(--transition-fast);
}

.start-btn:hover i {
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .welcome-title {
    font-size: var(--font-size-xl);
  }

  .welcome-description {
    font-size: var(--font-size-md);
  }

  .feature-list {
    grid-template-columns: 1fr;
  }
}
</style> 