<template>
  <div class="login-page">
    <div class="login-box">
      <h1>后台管理系统</h1>
      <div class="form-group">
        <label>用户名</label>
        <input 
          v-model="username" 
          type="text" 
          placeholder="请输入用户名"
          @keyup.enter="handleLogin"
          :disabled="isLoading"
        >
      </div>
      <div class="form-group">
        <label>密码</label>
        <input 
          v-model="password" 
          type="password" 
          placeholder="请输入密码"
          @keyup.enter="handleLogin"
          :disabled="isLoading"
        >
      </div>
      <button 
        @click="handleLogin" 
        class="login-btn"
        :disabled="isLoading"
      >
        <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
        {{ isLoading ? '登录中...' : '登录' }}
      </button>
      <p v-if="error" class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        {{ error }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAdminStore } from '../../stores/admin'

const router = useRouter()
const route = useRoute()
const adminStore = useAdminStore()

const username = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

onMounted(() => {
  // 如果已经登录，直接跳转
  if (adminStore.isLoggedIn) {
    const redirectPath = route.query.redirect || '/admin/products'
    router.replace(redirectPath)
  }
})

const handleLogin = async () => {
  try {
    if (isLoading.value) return
    
    if (!username.value || !password.value) {
      error.value = '请输入用户名和密码'
      return
    }

    isLoading.value = true
    error.value = ''

    const success = await adminStore.login(username.value, password.value)
    
    if (success) {
      const redirectPath = route.query.redirect || '/admin/products'
      router.replace(redirectPath)
    } else {
      error.value = '用户名或密码错误'
    }
  } catch (e) {
    console.error('登录失败:', e)
    error.value = '登录失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
}

.login-box {
  background: var(--bg-primary);
  padding: 40px;
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  margin: 0 0 30px;
  color: var(--primary-color);
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-secondary);
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  box-sizing: border-box;
  transition: all var(--transition-fast);
}

input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

input:disabled {
  background-color: var(--bg-secondary);
  cursor: not-allowed;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: var(--font-size-md);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-btn:hover:not(:disabled) {
  background: var(--primary-color-dark);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  color: var(--danger-color);
  text-align: center;
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fa-spin {
  animation: spin 1s linear infinite;
}
</style> 