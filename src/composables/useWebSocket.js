import { ref } from 'vue'

export function useWebSocket() {
  const socket = ref(null)
  const isConnected = ref(false)
  const error = ref(null)

  // 连接WebSocket
  const connect = () => {
    try {
      // 使用安全的WebSocket连接
      socket.value = new WebSocket('wss://your-api-domain/ws')

      socket.value.onopen = () => {
        console.log('WebSocket连接已建立')
        isConnected.value = true
        error.value = null
      }

      socket.value.onclose = () => {
        console.log('WebSocket连接已关闭')
        isConnected.value = false
        // 尝试重新连接
        setTimeout(connect, 5000)
      }

      socket.value.onerror = (err) => {
        console.error('WebSocket错误:', err)
        error.value = '连接发生错误'
        isConnected.value = false
      }

      socket.value.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleMessage(data)
        } catch (err) {
          console.error('处理WebSocket消息失败:', err)
        }
      }
    } catch (err) {
      console.error('建立WebSocket连接失败:', err)
      error.value = '连接失败'
    }
  }

  // 断开连接
  const disconnect = () => {
    if (socket.value && isConnected.value) {
      socket.value.close()
      socket.value = null
      isConnected.value = false
    }
  }

  // 发送消息
  const send = (message) => {
    if (socket.value && isConnected.value) {
      try {
        socket.value.send(JSON.stringify(message))
      } catch (err) {
        console.error('发送WebSocket消息失败:', err)
        error.value = '发送消息失败'
      }
    } else {
      console.warn('WebSocket未连接，无法发送消息')
    }
  }

  // 处理接收到的消息
  const handleMessage = (data) => {
    switch (data.type) {
      case 'order_update':
        // 处理订单更新
        console.log('收到订单更新:', data.order)
        break
      case 'notification':
        // 处理通知
        console.log('收到通知:', data.message)
        break
      default:
        console.log('收到未知类型的消息:', data)
    }
  }

  return {
    isConnected,
    error,
    connect,
    disconnect,
    send
  }
} 