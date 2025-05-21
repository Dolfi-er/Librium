<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUsersStore } from '@/stores/users'
import type { UserCreateDto } from '@/types'

const usersStore = useUsersStore()
const selectedRole = ref('')
const showFields = ref(false)

// Форма пользователя
const userForm = ref({
  login: '',
  password: '',
  roleId: 0,
  fio: '',
  phone: '',
  ticketNumber: '',
  birthday: '',
  education: '',
  hallId: null as number | null
})

// Определяем ID роли на основе выбранного значения
const roleMapping = {
  'admin': 1,
  'librarian': 2,
  'reader': 3
}

// Показываем поля в зависимости от выбранной роли
const selectRole = (role: string) => {
  selectedRole.value = role
  userForm.value.roleId = roleMapping[role as keyof typeof roleMapping]
  showFields.value = true
}

// Валидация формы
const isFormValid = computed(() => {
  const { login, password, fio, phone } = userForm.value
  
  // Базовая валидация для всех ролей
  if (!login || !password || !fio || !phone) return false
  
  // Дополнительная валидация для конкретных ролей
  if (selectedRole.value === 'reader' && !userForm.value.ticketNumber) return false
  if (selectedRole.value === 'librarian' && !userForm.value.hallId) return false
  
  return true
})

// Отправка формы
const submit = async () => {
  if (!isFormValid.value) return
  
  const userData: UserCreateDto = {
    login: userForm.value.login,
    password: userForm.value.password,
    roleId: userForm.value.roleId,
    fio: userForm.value.fio,
    phone: userForm.value.phone
  }
  
  // Добавляем поля в зависимости от роли
  if (selectedRole.value === 'reader') {
    userData.ticketNumber = userForm.value.ticketNumber
    userData.birthday = userForm.value.birthday
  } else if (selectedRole.value === 'librarian') {
    userData.education = userForm.value.education
    userData.hallId = userForm.value.hallId
  }
  
  await usersStore.createUser(userData)
}
</script>

<template>
  <div class="modal-overlay">
    <div class="modal">
      <h2>Добавить пользователя</h2>
      
      <div v-if="!showFields" class="role-selection">
        <h3>Выберите роль пользователя</h3>
        <div class="role-buttons">
          <button @click="selectRole('admin')" class="role-button">
            <span class="role-icon">👑</span>
            <span class="role-name">Админ</span>
          </button>
          <button @click="selectRole('librarian')" class="role-button">
            <span class="role-icon">📚</span>
            <span class="role-name">Библиотекарь</span>
          </button>
          <button @click="selectRole('reader')" class="role-button">
            <span class="role-icon">📖</span>
            <span class="role-name">Читатель</span>
          </button>
        </div>
      </div>
      
      <div v-else class="user-form">
        <div class="selected-role">
          <span>Выбранная роль: </span>
          <strong>{{ selectedRole === 'admin' ? 'Админ' : selectedRole === 'librarian' ? 'Библиотекарь' : 'Читатель' }}</strong>
          <button @click="showFields = false" class="change-role-btn">Изменить</button>
        </div>
        
        <!-- Общие поля для всех ролей -->
        <div class="form-group">
          <label for="login">Логин*</label>
          <input id="login" v-model="userForm.login" type="text" required>
        </div>
        
        <div class="form-group">
          <label for="password">Пароль*</label>
          <input id="password" v-model="userForm.password" type="password" required>
        </div>
        
        <div class="form-group">
          <label for="fio">ФИО*</label>
          <input id="fio" v-model="userForm.fio" type="text" required>
        </div>
        
        <div class="form-group">
          <label for="phone">Телефон*</label>
          <input id="phone" v-model="userForm.phone" type="tel" required>
        </div>
        
        <!-- Поля для читателя -->
        <template v-if="selectedRole === 'reader'">
          <div class="form-group">
            <label for="ticketNumber">Номер читательского билета*</label>
            <input id="ticketNumber" v-model="userForm.ticketNumber" type="text" required>
          </div>
          
          <div class="form-group">
            <label for="birthday">Дата рождения</label>
            <input id="birthday" v-model="userForm.birthday" type="date">
          </div>
        </template>
        
        <!-- Поля для библиотекаря -->
        <template v-if="selectedRole === 'librarian'">
          <div class="form-group">
            <label for="education">Образование</label>
            <input id="education" v-model="userForm.education" type="text">
          </div>
          
          <div class="form-group">
            <label for="hallId">ID зала*</label>
            <input id="hallId" v-model.number="userForm.hallId" type="number" required>
          </div>
        </template>
      </div>
      
      <div class="modal-actions">
        <button @click="usersStore.showAddModal = false" class="cancel-btn">Отмена</button>
        <button 
          @click="submit" 
          :disabled="!isFormValid && showFields" 
          class="save-btn"
          :class="{ 'disabled': !isFormValid && showFields }"
        >
          Сохранить
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

h2 {
  margin-top: 0;
  margin-bottom: 24px;
  font-size: 1.5rem;
  color: #333;
  text-align: center;
}

h3 {
  font-size: 1.2rem;
  margin-bottom: 16px;
  color: #555;
  text-align: center;
}

.role-selection {
  margin-bottom: 20px;
}

.role-buttons {
  display: flex;
  justify-content: space-around;
  gap: 12px;
}

.role-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
}

.role-button:hover {
  background-color: #f0f0f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.role-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.role-name {
  font-weight: 500;
}

.selected-role {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 8px 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.change-role-btn {
  margin-left: auto;
  padding: 4px 8px;
  background-color: transparent;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #555;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn, .save-btn {
  padding: 10px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-btn {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  color: #555;
}

.save-btn {
  background-color: #4caf50;
  border: none;
  color: white;
}

.cancel-btn:hover {
  background-color: #eee;
}

.save-btn:hover {
  background-color: #43a047;
}

.save-btn.disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

.user-form {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 8px;
}
</style>