<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const login = ref('')
const password = ref('')
const authStore = useAuthStore()

const handleSubmit = async () => {
  const success = await authStore.login(login.value, password.value)
  if (success) {
    window.location.href = '/'
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h2>Авторизация</h2>
      <div v-if="authStore.error" class="error-message">{{ authStore.error }}</div>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Логин</label>
          <input
            type="text"
            v-model="login"
            placeholder="Введите ваш логин"
          />
        </div>
        <div class="form-group">
          <label>Пароль</label>
          <input
            type="password"
            v-model="password"
            placeholder="Введите пароль"
          />
        </div>
        <button type="submit">Войти</button>
      </form>
      <div class="register-link">
        Нет аккаунта? Попросите вашего руководителя создать его
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Стили из предыдущего ответа */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f0f2f5;
}

.login-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  width: 400px;
}

/* ... остальные стили ... */
</style>