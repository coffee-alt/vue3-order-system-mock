import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useCartStore } from './cart'
import { wsService } from '../services/WebSocketService'

export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: [],
    lastOrderId: 0,
    wsConnected: false
  }),

  getters: {
    // 获取所有订单
    allOrders: (state) => state.orders,

    // 获取待处理订单
    pendingOrders: (state) => state.orders.filter(order => order.status === 'pending'),

    // 获取已完成订单
    completedOrders: (state) => state.orders.filter(order => order.status === 'completed'),

    // 获取已取消订单
    cancelledOrders: (state) => state.orders.filter(order => order.status === 'cancelled'),

    // 获取用户的订单
    userOrders: (state) => (userId) => {
      return state.orders.filter(order => order.userId === userId)
    },

    // 获取指定状态的订单
    ordersByStatus: (state) => (status) => {
      if (status === 'all') return state.orders
      return state.orders.filter(order => order.status === status)
    },

    // 获取各状态订单数量
    orderStats: (state) => ({
      total: state.orders.length,
      pending: state.orders.filter(order => order.status === 'pending').length,
      completed: state.orders.filter(order => order.status === 'completed').length,
      cancelled: state.orders.filter(order => order.status === 'cancelled').length
    }),

    // WebSocket连接状态
    isConnected: (state) => state.wsConnected
  },

  actions: {
    // 提交订单
    async submitOrder(orderData) {
      try {
        const newOrder = {
          id: ++this.lastOrderId,
          orderNumber: this.generateOrderNumber(),
          ...orderData,
          status: 'pending',
          createTime: new Date().toISOString(),
          isChecked: false,
          isNew: true
        }

        this.orders.unshift(newOrder)
        this.saveToLocalStorage()

        // 通过WebSocket广播新订单
        this.broadcastNewOrder(newOrder)

        return {
          success: true,
          data: newOrder
        }
      } catch (error) {
        console.error('提交订单失败:', error)
        return {
          success: false,
          error: error.message
        }
      }
    },

    // 更新订单状态
    updateOrderStatus(orderNumber, newStatus) {
      const order = this.orders.find(o => o.orderNumber === orderNumber)
      if (order) {
        order.status = newStatus
        if (newStatus === 'completed') {
          order.completedTime = new Date().toISOString()
        }
        this.saveToLocalStorage()
        return true
      }
      return false
    },

    // 取消订单
    cancelOrder(orderId) {
      const order = this.orders.find(o => o.id === orderId)
      if (order && order.status === 'pending') {
        order.status = 'cancelled'
        this.saveToLocalStorage()
        return true
      }
      return false
    },

    // 完成订单
    completeOrder(orderId) {
      const order = this.orders.find(o => o.id === orderId)
      if (order && order.status === 'pending') {
        order.status = 'completed'
        order.completedTime = new Date().toISOString()
        this.saveToLocalStorage()
        return true
      }
      return false
    },

    // 删除订单
    deleteOrder(orderId) {
      const index = this.orders.findIndex(o => o.id === orderId)
      if (index !== -1) {
        this.orders.splice(index, 1)
        this.saveToLocalStorage()
        return true
      }
      return false
    },

    // 从本地存储加载订单
    loadFromLocalStorage() {
      const savedOrders = localStorage.getItem('orders')
      if (savedOrders) {
        this.orders = JSON.parse(savedOrders)
        // 更新最后订单ID
        const maxId = Math.max(...this.orders.map(o => o.id), 0)
        this.lastOrderId = maxId
      }
    },

    // 保存订单到本地存储
    saveToLocalStorage() {
      localStorage.setItem('orders', JSON.stringify(this.orders))
    },

    // 生成订单号
    generateOrderNumber() {
      const date = new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
      return `${year}${month}${day}${random}`
    },

    // 获取指定状态的订单数量
    getOrderCountByStatus(status) {
      if (status === 'all') return this.orders.length
      return this.orders.filter(order => order.status === status).length
    },

    // 初始化WebSocket连接
    initWebSocket() {
      try {
        const ws = new WebSocket('ws://localhost:3000')

        ws.onopen = () => {
          console.log('WebSocket连接成功')
          this.wsConnected = true
        }

        ws.onclose = () => {
          console.log('WebSocket连接关闭')
          this.wsConnected = false
          // 尝试重新连接
          setTimeout(() => this.initWebSocket(), 3000)
        }

        ws.onerror = (error) => {
          console.error('WebSocket错误:', error)
          this.wsConnected = false
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.type === 'NEW_ORDER') {
              // 处理新订单
              this.handleNewOrder(data.order)
            } else if (data.type === 'ORDER_STATUS_UPDATED') {
              // 处理订单状态更新
              this.handleOrderStatusUpdate(data.orderNumber, data.status)
            }
          } catch (error) {
            console.error('处理WebSocket消息失败:', error)
          }
        }

        return ws
      } catch (error) {
        console.error('初始化WebSocket失败:', error)
        this.wsConnected = false
        return null
      }
    },

    // 广播新订单
    broadcastNewOrder(order) {
      if (this.wsConnected) {
        this.ws.send(JSON.stringify({
          type: 'NEW_ORDER',
          order
        }))
      }
    },

    // 处理新订单
    handleNewOrder(order) {
      if (!this.orders.some(o => o.id === order.id)) {
        this.orders.unshift(order)
        this.saveToLocalStorage()
      }
    },

    // 处理订单状态更新
    handleOrderStatusUpdate(orderNumber, status) {
      const order = this.orders.find(o => o.orderNumber === orderNumber)
      if (order) {
        order.status = status
        if (status === 'completed') {
          order.completedTime = new Date().toISOString()
        }
        this.saveToLocalStorage()
      }
    }
  }
})