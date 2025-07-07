import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 状态
  const preferences = ref({
    darkMode: false,
    language: 'zh-CN',
    notifications: true
  })
  
  const pageVisits = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // 初始化
  const initialize = async () => {
    try {
      // 加载用户偏好设置
      const savedPreferences = localStorage.getItem('user_preferences')
      if (savedPreferences) {
        preferences.value = JSON.parse(savedPreferences)
      }

      // 加载页面访问记录
      const savedVisits = localStorage.getItem('page_visits')
      if (savedVisits) {
        pageVisits.value = JSON.parse(savedVisits)
      }
    } catch (err) {
      console.error('初始化用户数据失败:', err)
      error.value = '加载用户数据失败'
    }
  }

  // 保存偏好设置
  const savePreferences = () => {
    try {
      localStorage.setItem('user_preferences', JSON.stringify(preferences.value))
    } catch (err) {
      console.error('保存用户偏好设置失败:', err)
    }
  }

  // 保存页面访问记录
  const savePageVisits = () => {
    try {
      localStorage.setItem('page_visits', JSON.stringify(pageVisits.value))
    } catch (err) {
      console.error('保存页面访问记录失败:', err)
    }
  }

  // 切换深色模式
  const toggleDarkMode = () => {
    preferences.value.darkMode = !preferences.value.darkMode
    savePreferences()
  }

  // 设置语言
  const setLanguage = (lang) => {
    preferences.value.language = lang
    savePreferences()
  }

  // 切换通知设置
  const toggleNotifications = () => {
    preferences.value.notifications = !preferences.value.notifications
    savePreferences()
  }

  // 记录页面访问
  const logPageVisit = (path) => {
    try {
      pageVisits.value.push({
        path,
        timestamp: new Date().toISOString()
      })
      
      // 只保留最近的50条记录
      if (pageVisits.value.length > 50) {
        pageVisits.value = pageVisits.value.slice(-50)
      }
      
      savePageVisits()
    } catch (err) {
      console.error('记录页面访问失败:', err)
    }
  }

  // 清除所有数据
  const clearUserData = () => {
    try {
      preferences.value = {
        darkMode: false,
        language: 'zh-CN',
        notifications: true
      }
      pageVisits.value = []
      
      localStorage.removeItem('user_preferences')
      localStorage.removeItem('page_visits')
    } catch (err) {
      console.error('清除用户数据失败:', err)
      error.value = '清除数据失败'
    }
  }

  return {
    // 状态
    preferences,
    pageVisits,
    isLoading,
    error,
    
    // 方法
    initialize,
    toggleDarkMode,
    setLanguage,
    toggleNotifications,
    logPageVisit,
    clearUserData
  }
}) 