<template>
  <div class="products-page">
    <div class="page-header">
      <h2>商品管理</h2>
      <button @click="showAddModal = true" class="add-btn">
        添加商品
      </button>
    </div>

    <div class="products-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>图片</th>
            <th>商品名称</th>
            <th>分类</th>
            <th>价格</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in menuStore.products" :key="product.id">
            <td>{{ product.id }}</td>
            <td>
              <div class="product-image">
                <img 
                  :src="product.image" 
                  :alt="product.name"
                >
                <input
                  type="file"
                  accept="image/*"
                  class="image-input"
                  @change="(e) => handleImageUpload(e, product.id)"
                >
                <button class="upload-btn">上传图片</button>
              </div>
            </td>
            <td>{{ product.name }}</td>
            <td>{{ getCategoryName(product.categoryId) }}</td>
            <td>¥{{ product.price }}</td>
            <td>
              <button 
                @click="editProduct(product)"
                class="edit-btn"
              >编辑</button>
              <button 
                @click="deleteProduct(product.id)"
                class="delete-btn"
              >删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 添加/编辑商品弹窗 -->
    <div v-if="showAddModal || editingProduct" class="modal">
      <div class="modal-content">
        <h3>{{ editingProduct ? '编辑商品' : '添加商品' }}</h3>
        <div class="form-group">
          <label>商品图片</label>
          <div class="image-preview">
            <img 
              :src="productForm.image" 
              :alt="productForm.name || '商品图片'"
            >
            <input
              type="file"
              accept="image/*"
              class="image-input"
              @change="handleModalImageUpload"
            >
            <button class="upload-btn">选择图片</button>
          </div>
        </div>
        <div class="form-group">
          <label>商品名称</label>
          <input v-model="productForm.name" type="text">
        </div>
        <div class="form-group">
          <label>分类</label>
          <select v-model="productForm.categoryId">
            <option 
              v-for="category in menuStore.categories" 
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>价格</label>
          <input v-model="productForm.price" type="number" step="0.01">
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="cancel-btn">取消</button>
          <button @click="saveProduct" class="save-btn">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMenuStore } from '../../stores/menu'

const menuStore = useMenuStore()
const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGMEYwRjAiLz48cGF0aCBkPSJNODAgNjBIMTIwVjE0MEg4MFY2MFoiIGZpbGw9IiNEOEQ4RDgiLz48cGF0aCBkPSJNMTAwIDkwQzEwNS41MjMgOTAgMTEwIDg1LjUyMjggMTEwIDgwQzExMCA3NC40NzcyIDEwNS41MjMgNzAgMTAwIDcwQzk0LjQ3NzIgNzAgOTAgNzQuNDc3MiA5MCA4MEM5MCA4NS41MjI4IDk0LjQ3NzIgOTAgMTAwIDkwWiIgZmlsbD0iI0Q4RDhEOCIvPjwvc3ZnPg=='

const showAddModal = ref(false)
const editingProduct = ref(null)
const productForm = ref({
  name: '',
  categoryId: 1,
  price: 0,
  image: defaultImage
})

const getCategoryName = (categoryId) => {
  const category = menuStore.categories.find(c => c.id === categoryId)
  return category ? category.name : ''
}

const handleImageUpload = async (event, productId) => {
  const file = event.target.files[0]
  if (!file) return
  
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    alert('请上传图片文件')
    return
  }
  
  // 验证文件大小（限制为 2MB）
  if (file.size > 2 * 1024 * 1024) {
    alert('图片大小不能超过 2MB')
    return
  }

  try {
    const base64 = await convertToBase64(file)
    menuStore.updateProductImage(productId, base64)
  } catch (error) {
    alert('图片上传失败')
  }
}

const handleModalImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  if (!file.type.startsWith('image/')) {
    alert('请上传图片文件')
    return
  }
  
  if (file.size > 2 * 1024 * 1024) {
    alert('图片大小不能超过 2MB')
    return
  }

  try {
    const base64 = await convertToBase64(file)
    productForm.value.image = base64
  } catch (error) {
    alert('图片上传失败')
  }
}

const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const editProduct = (product) => {
  editingProduct.value = product
  productForm.value = { ...product }
  showAddModal.value = true
}

const deleteProduct = (productId) => {
  if (confirm('确定要删除这个商品吗？')) {
    const index = menuStore.products.findIndex(p => p.id === productId)
    if (index > -1) {
      menuStore.products.splice(index, 1)
    }
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingProduct.value = null
  productForm.value = {
    name: '',
    categoryId: 1,
    price: 0,
    image: defaultImage
  }
}

const saveProduct = () => {
  if (!productForm.value.name || productForm.value.price <= 0) {
    alert('请填写完整的商品信息')
    return
  }

  if (editingProduct.value) {
    // 编辑现有商品
    const index = menuStore.products.findIndex(p => p.id === editingProduct.value.id)
    if (index > -1) {
      menuStore.products[index] = {
        ...menuStore.products[index],
        ...productForm.value
      }
    }
  } else {
    // 添加新商品
    const newProduct = {
      id: menuStore.products.length + 1,
      ...productForm.value
    }
    menuStore.products.push(newProduct)
  }

  closeModal()
}
</script>

<style scoped>
.products-page {
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-btn {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.products-table {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

th {
  background: #fafafa;
  font-weight: 500;
}

.product-image {
  position: relative;
  width: 80px;
  height: 80px;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.image-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.upload-btn {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.5);
  color: white;
  border: none;
  padding: 4px;
  font-size: 12px;
  cursor: pointer;
  display: none;
}

.product-image:hover .upload-btn {
  display: block;
}

.image-preview {
  position: relative;
  width: 200px;
  height: 200px;
  margin-bottom: 10px;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.edit-btn, .delete-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;
}

.edit-btn {
  background: #1890ff;
  color: white;
}

.delete-btn {
  background: #ff4d4f;
  color: white;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #666;
}

input, select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.modal-footer {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn, .save-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background: #f0f0f0;
}

.save-btn {
  background: #1890ff;
  color: white;
}
</style> 