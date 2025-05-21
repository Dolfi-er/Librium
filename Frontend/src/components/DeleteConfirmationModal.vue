<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUsersStore } from '@/stores/users'
import type { User, UserUpdateDto } from '@/types'

const props = defineProps<{
  user: User | null
}>()

const usersStore = useUsersStore()
const userRole = computed(() => {
  if (!props.user) return ''
  
  const roleId = props.user.role.id
  if (roleId === 1) return 'admin'
  if (roleId === 2) return 'librarian'
  if (roleId === 3) return 'reader'
  return ''
})

// Форма редактирования
const userForm = ref({
  login: '',
  password: '',
  fio: '',
  phone: '',
  ticketNumber: '',
  birthday: '',
  education: '',
  hallId: null as number | null
})

// Заполняем форму данными пользователя
onMounted(() => {
  if (!props.user) return
  
  userForm.value = {
    login: props.user.login,
    password: '',
    fio: props.user.info.fio,
    phone: props.user.info.phone,
    ticketNumber: props.user.info.ticketNumber || '',
    birthday: props.user.info.birthday || '',
    education: props.user.info.education || '',
    hallId: props.user.info.hallId || null
  }
})

// Валидация формы
const isFormValid = computed(() => {
  const { login, fio, phone } = userForm.value
  
  // Базовая валидация для всех ролей
  if (!login || !fio || !phone) return false
  
  // Дополнительная валидация для конкретных ролей
  if (userRole.value === 'reader' && !userForm.value.ticketNumber) return false
  if (userRole.value === 'librarian' && !userForm.value.hallId) return false
  
  return true
})

// Отправка формы
const submit = async () => {
  if (!isFormValid.value || !props.user) return
  
  const userData: UserUpdateDto = {
    login: userForm.value.login,
    fio: userForm.value.fio,
    phone: userForm.value.phone
  }
  
  // Добавляем пароль только если он был изменен
  if (userForm.value.password) {
    userData.password = userForm.value.password
  }
  
  // Добавляем поля в зависимости от роли
  if (userRole.value === 'reader') {
    userData.ticketNumber = userForm.value.ticketNumber
    userData.birthday = userForm.value.birthday
  } else if (userRole.value === 'librarian') {
    userData.education = userForm.value.education
    userData.hallId = userForm.value.hallId
  }
  
  await usersStore.updateUser(props.user.id, userData)
}
</script>

<template>
  <div class="modal-overlay">
    <div class="modal">
      <h2>Редактировать пользователя</h2>
      
      <div v-if="user" class="user-form">
        <div class="selected-role">
          <span>Роль пользователя: </span>
          <strong>{{ userRole === 'admin' ? 'Админ' : userRole === 'librarian' ? 'Библиотекарь' : 'Читатель' }}</strong>
        </div>
        
        <!-- Общие поля для всех ролей -->
        <div class="form-group">
          <label for="login">Логин*</label>
          <input id="login" v-model="userForm.login" type="text" required>
        </div>
        
        <div class="form-group">
          <label for="password">Пароль (оставьте пустым, чтобы не менять)</label>
          <input id="password" v-model="userForm.password" type="password">
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
        <template v-if="userRole === 'reader'">
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
        <template v-if="userRole === 'librarian'">
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
        <button @click="usersStore.showEditModal = false" class="cancel-btn">Отмена</button>
        <button 
          @click="submit" 
          :disabled="!isFormValid" 
          class="save-btn"
          :class="{ 'disabled': !isFormValid }"
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

.selected-role {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 8px 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
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