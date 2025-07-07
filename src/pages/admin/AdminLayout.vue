<template>
  <div class="admin-layout">
    <div class="sidebar">
      <div class="logo">订餐系统后台</div>
      <nav class="nav-menu">
        <router-link 
          to="/admin/products" 
          class="nav-item"
          active-class="active"
        >
          商品管理
        </router-link>
        <router-link 
          to="/admin/orders" 
          class="nav-item"
          active-class="active"
        >
          订单管理
        </router-link>
      </nav>
      <div class="user-info">
        <span>{{ adminStore.user?.username }}</span>
        <button @click="handleLogout" class="logout-btn">退出</button>
      </div>
    </div>
    
    <div class="main-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAdminStore } from '../../stores/admin'

const router = useRouter()
const adminStore = useAdminStore()

const handleLogout = () => {
  adminStore.logout()
  router.push('/admin/login')
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 200px;
  background: #001529;
  color: white;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
}

.logo {
  padding: 0 20px;
  font-size: 18px;
  height: 60px;
  line-height: 60px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.nav-menu {
  flex: 1;
  padding: 20px 0;
}

.nav-item {
  display: block;
  padding: 12px 20px;
  color: rgba(255,255,255,0.65);
  text-decoration: none;
  transition: all 0.3s;
}

.nav-item:hover,
.nav-item.active {
  color: white;
  background: #1890ff;
}

.user-info {
  padding: 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logout-btn {
  padding: 4px 8px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.logout-btn:hover {
  background: rgba(255,255,255,0.1);
}

.main-content {
  flex: 1;
  padding: 20px;
  background: #f0f2f5;
}
</style> 