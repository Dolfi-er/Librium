<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUsersStore } from '@/stores/users'
import AddUserModal from '@/components/AddUserModal.vue'
import EditUserModal from '@/components/EditUserModal.vue'
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal.vue'

const usersStore = useUsersStore()
const searchQuery = ref('')
const selectedRole = ref('all')

// Загружаем пользователей при монтировании компонента
onMounted(async () => {
  await usersStore.fetchUsers()
})

// Исправленная фильтрация пользователей
const filteredUsers = computed(() => {
  return usersStore.users.filter(user => {
    // Проверяем, что user.info существует
    if (!user.info) return false
    
    // Фильтрация по ФИО
    const matchesSearch = user.info.fio.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    // Фильтрация по роли
    let matchesRole = true
    if (selectedRole.value !== 'all') {
      const roleMapping = {
        'admin': 1,
        'librarian': 2,
        'reader': 3
      }
      matchesRole = user.role.id === roleMapping[selectedRole.value]
    }
    
    return matchesSearch && matchesRole
  })
})

// Получение названия роли
const getRoleName = (roleId) => {
  switch (roleId) {
    case 1: return 'Админ'
    case 2: return 'Библиотекарь'
    case 3: return 'Читатель'
    default: return 'Неизвестная роль'
  }
}
</script>

<template>
  <div class="users-table">
    <div class="table-controls">
      <button @click="usersStore.openAddModal" class="add-button">
        Добавить пользователя
      </button>
      
      <div class="filters">
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Поиск по ФИО"
          class="search-input"
        >

        <select v-model="selectedRole" class="role-filter">
          <option value="all">Все роли</option>
          <option value="admin">Админ</option>
          <option value="librarian">Библиотекарь</option>
          <option value="reader">Читатель</option>
        </select>
      </div>
    </div>

    <div v-if="usersStore.users.length === 0" class="no-users">
      <p>Нет данных о пользователях. Проверьте соединение с сервером или добавьте нового пользователя.</p>
    </div>

    <table v-else>
      <thead>
        <tr>
          <th>ФИО</th>
          <th>Логин</th>
          <th>Роль</th>
          <th>Телефон</th>
          <th>Действия</th>
        </tr>
      </thead>
      
      <tbody>
        <tr v-for="user in filteredUsers" :key="user.id">
          <td>{{ user.info.fio }}</td>
          <td>{{ user.login }}</td>
          <td>{{ getRoleName(user.role.id) }}</td>
          <td>{{ user.info.phone }}</td>
          <td class="actions-cell">
            <button @click="usersStore.openEditModal(user)" class="edit-btn" title="Редактировать">
              ✏️
            </button>
            <button @click="usersStore.openDeleteModal(user)" class="delete-btn" title="Удалить">
              🗑️
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="filteredUsers.length === 0 && usersStore.users.length > 0" class="no-results">
      <p>Нет пользователей, соответствующих критериям поиска</p>
    </div>

    <AddUserModal v-if="usersStore.showAddModal" />
    <EditUserModal 
      v-if="usersStore.showEditModal" 
      :user="usersStore.selectedUser"
    />
    <DeleteConfirmationModal 
      v-if="usersStore.showDeleteModal"
      :user="usersStore.selectedUser"
    />
  </div>
</template>

<style scoped>
.users-table {
  width: 100%;
  padding: 20px;
}

.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.add-button {
  padding: 10px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.add-button:hover {
  background-color: #43a047;
}

.search-input, .role-filter {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.search-input {
  min-width: 200px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

th, td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f5f5f5;
  font-weight: 600;
  color: #333;
}

tr:hover {
  background-color: #f9f9f9;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.edit-btn, .delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.edit-btn:hover, .delete-btn:hover {
  background-color: #f0f0f0;
}

.no-users, .no-results {
  text-align: center;
  padding: 40px 0;
  color: #666;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .table-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filters {
    flex-direction: column;
  }
  
  table {
    display: block;
    overflow-x: auto;
  }
}
</style>