class WebSocketService {
  constructor() {
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.listeners = new Map()
  }

  connect() {
    // 在实际项目中替换为真实的WebSocket服务器地址
    this.ws = new WebSocket('ws://localhost:8080')

    this.ws.onopen = () => {
      console.log('WebSocket连接已建立')
      this.reconnectAttempts = 0
      this.emit('connection', { status: 'connected' })
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.emit(data.type, data.payload)
      } catch (error) {
        console.error('解析WebSocket消息失败:', error)
      }
    }

    this.ws.onclose = () => {
      console.log('WebSocket连接已关闭')
      this.emit('connection', { status: 'disconnected' })
      this.attemptReconnect()
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket错误:', error)
      this.emit('error', error)
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`尝试重新连接... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      setTimeout(() => this.connect(), 3000)
    }
  }

  send(type, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }))
    } else {
      console.warn('WebSocket未连接，无法发送消息')
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event).add(callback)
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback)
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data))
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

export const wsService = new WebSocketService() 