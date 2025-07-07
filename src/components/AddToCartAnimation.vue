<template>
  <Transition name="fade">
    <div v-if="show" class="add-to-cart-animation">
      <div class="animation-content">
        <i class="fas fa-check"></i>
        <span>已添加到购物车</span>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useCartStore } from '../stores/cart'

const cartStore = useCartStore()
const show = ref(false)
let timer = null

// 监听最近添加的商品
watch(() => cartStore.recentlyAdded, (newValue) => {
  if (newValue) {
    show.value = true
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      show.value = false
    }, 2000)
  }
})
</script>

<style scoped>
.add-to-cart-animation {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.7);
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--border-radius);
  color: white;
}

.animation-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.animation-content i {
  color: var(--success-color);
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 