<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ collapsed: isSidebarCollapsed }">
      <div class="sidebar-header">
        <img src="../assets/logo.svg" alt="Logo" class="logo">
        <h1 v-if="!isSidebarCollapsed">后台管理</h1>
        <button class="collapse-btn" @click="toggleSidebar">
          <i :class="['fas', isSidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left']"></i>
        </button>
      </div>
      
      <nav class="sidebar-nav">
        <router-link 
          v-for="item in menuItems" 
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :title="isSidebarCollapsed ? item.name : ''"
        >
          <i :class="['fas', item.icon]"></i>
          <span v-if="!isSidebarCollapsed">{{ item.name }}</span>
          <span 
            v-if="item.badge && !isSidebarCollapsed" 
            class="badge"
            :class="item.badgeType"
          >
            {{ item.badge }}
          </span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn" @click="logout">
          <i class="fas fa-sign-out-alt"></i>
          <span v-if="!isSidebarCollapsed">退出登录</span>
        </button>
      </div>
    </aside>

    <!-- 主要内容区 -->
    <main class="main-content" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <!-- 顶部栏 -->
      <header class="top-bar">
        <div class="breadcrumb">
          <span v-for="(item, index) in breadcrumb" :key="index">
            {{ item }}
            <i v-if="index < breadcrumb.length - 1" class="fas fa-chevron-right"></i>
          </span>
        </div>
        <div class="user-info">
          <span class="username">{{ username }}</span>
          <img :src="avatar" alt="Avatar" class="avatar">
        </div>
      </header>

      <!-- 路由视图 -->
      <div class="content-wrapper">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAdminStore } from '../stores/admin'

const router = useRouter()
const route = useRoute()
const adminStore = useAdminStore()

const isSidebarCollapsed = ref(false)
const username = computed(() => adminStore.user?.username || '管理员')
const avatar = computed(() => adminStore.user?.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGMEYwRjAiLz48cGF0aCBkPSJNODAgNjBDODAgNjAgMTAwIDgwIDEwMCAxMDBDMTAwIDEyMCA4MCAxNDAgODAgMTQwIiBzdHJva2U9IiNEOEQ4RDgiIHN0cm9rZS13aWR0aD0iOCIvPjxwYXRoIGQ9Ik0xMjAgNjBDMTIwIDYwIDEwMCA4MCAxMDAgMTAwQzEwMCAxMjAgMTIwIDE0MCAxMjAgMTQwIiBzdHJva2U9IiNEOEQ4RDgiIHN0cm9rZS13aWR0aD0iOCIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjkwIiByPSIxMCIgZmlsbD0iI0Q4RDhEOCIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iOTAiIHN0cm9rZT0iI0Q4RDhEOCIgc3Ryb2tlLXdpZHRoPSI4Ii8+PC9zdmc+')

// 菜单项配置
const menuItems = [
  {
    name: '订单管理',
    path: '/admin/orders',
    icon: 'fa-receipt',
    badge: '5',
    badgeType: 'warning'
  },
  {
    name: '商品管理',
    path: '/admin/products',
    icon: 'fa-box'
  },
  {
    name: '分类管理',
    path: '/admin/categories',
    icon: 'fa-tags'
  },
  {
    name: '用户管理',
    path: '/admin/users',
    icon: 'fa-users'
  },
  {
    name: '系统设置',
    path: '/admin/settings',
    icon: 'fa-cog'
  }
]

// 面包屑导航
const breadcrumb = computed(() => {
  const paths = route.path.split('/').filter(Boolean)
  return ['首页', ...paths.map(path => {
    const menuItem = menuItems.find(item => item.path.includes(path))
    return menuItem ? menuItem.name : path
  })]
})

// 切换侧边栏
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

// 退出登录
const logout = async () => {
  try {
    await adminStore.logout()
    router.push('/admin/login')
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}
</script>

<style scoped>
@import '../styles/variables.css';

.admin-layout {
  display: flex;
  min-height: 100vh;
}

/* 侧边栏样式 */
.sidebar {
  width: 240px;
  background-color: var(--bg-primary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width var(--transition-normal);
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  height: 64px;
  padding: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
}

.logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.sidebar-header h1 {
  margin: 0;
  font-size: var(--font-size-md);
  color: var(--text-primary);
  flex: 1;
  white-space: nowrap;
}

.collapse-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.collapse-btn:hover {
  color: var(--text-primary);
}

.sidebar-nav {
  flex: 1;
  padding: var(--spacing-md) 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
  position: relative;
}

.nav-item i {
  width: 24px;
  text-align: center;
  margin-right: var(--spacing-md);
}

.nav-item span {
  white-space: nowrap;
}

.nav-item:hover {
  color: var(--text-primary);
  background-color: var(--bg-secondary);
}

.nav-item.router-link-active {
  color: var(--primary-color);
  background-color: var(--primary-color-light);
}

.badge {
  position: absolute;
  right: var(--spacing-md);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: var(--font-size-xs);
  background-color: var(--bg-secondary);
}

.badge.warning {
  background-color: var(--warning-color);
  color: white;
}

.sidebar-footer {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

.logout-btn {
  width: 100%;
  padding: var(--spacing-sm);
  border: none;
  border-radius: var(--border-radius);
  background-color: var(--danger-color-light);
  color: var(--danger-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  transition: all var(--transition-fast);
}

.logout-btn:hover {
  background-color: var(--danger-color);
  color: white;
}

/* 主要内容区样式 */
.main-content {
  flex: 1;
  margin-left: 240px;
  transition: margin var(--transition-normal);
}

.main-content.sidebar-collapsed {
  margin-left: 64px;
}

.top-bar {
  height: 64px;
  padding: 0 var(--spacing-lg);
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
}

.breadcrumb i {
  font-size: var(--font-size-sm);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.username {
  color: var(--text-primary);
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.content-wrapper {
  padding: var(--spacing-lg);
  background-color: var(--bg-secondary);
  min-height: calc(100vh - 64px);
}

/* 路由过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-normal);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    z-index: 1000;
    transform: translateX(-100%);
  }

  .sidebar.collapsed {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0 !important;
  }

  .top-bar {
    padding: 0 var(--spacing-md);
  }

  .breadcrumb {
    display: none;
  }
}
</style> 