import { defineStore } from 'pinia'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    isLoggedIn: false,
    user: null,
    // 模拟管理员账号
    adminAccount: {
      username: 'admin',
      password: '123456'
    }
  }),
  
  actions: {
    async login(username, password) {
      try {
        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        if (username === this.adminAccount.username && 
            password === this.adminAccount.password) {
          this.isLoggedIn = true
          this.user = { 
            username,
            avatar: null // 可以在这里设置默认头像
          }
          this.saveToLocalStorage()
          return true
        }
        return false
      } catch (error) {
        console.error('登录失败:', error)
        return false
      }
    },
    
    logout() {
      this.isLoggedIn = false
      this.user = null
      localStorage.removeItem('admin-store')
    },

    // 从本地存储加载状态
    loadFromLocalStorage() {
      try {
        const savedState = localStorage.getItem('admin-store')
        if (savedState) {
          const { isLoggedIn, user } = JSON.parse(savedState)
          this.isLoggedIn = isLoggedIn
          this.user = user
        }
      } catch (error) {
        console.error('加载登录状态失败:', error)
        this.logout() // 发生错误时清除状态
      }
    },

    // 保存状态到本地存储
    saveToLocalStorage() {
      try {
        localStorage.setItem('admin-store', JSON.stringify({
          isLoggedIn: this.isLoggedIn,
          user: this.user
        }))
      } catch (error) {
        console.error('保存登录状态失败:', error)
      }
    }
  }
}) 