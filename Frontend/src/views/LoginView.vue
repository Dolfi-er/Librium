<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const login = ref('')
const password = ref('')
const authStore = useAuthStore()
const router = useRouter()
const isLoading = ref(false)

// Инициализируем перехватчики axios при монтировании компонента
onMounted(() => {
  authStore.initializeAxiosInterceptors()
})

const handleSubmit = async () => {
  if (!login.value || !password.value) {
    authStore.error = 'Пожалуйста, заполните все поля'
    return
  }
  
  isLoading.value = true
  const success = await authStore.login(login.value, password.value)
  isLoading.value = false
  
  if (success) {
    router.push('/')
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
          <label for="login">Логин</label>
          <input
            id="login"
            type="text"
            v-model="login"
            placeholder="Введите ваш логин"
            :disabled="isLoading"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">Пароль</label>
          <input
            id="password"
            type="password"
            v-model="password"
            placeholder="Введите пароль"
            :disabled="isLoading"
            required
          />
        </div>
        <button type="submit" :disabled="isLoading">
          <span v-if="isLoading">Вход...</span>
          <span v-else>Войти</span>
        </button>
      </form>
      <div class="register-link">
        Нет аккаунта? Попросите вашего руководителя создать его
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  max-width: 90%;
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1rem;
}

button:hover {
  background-color: #43a047;
}

button:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

.error-message {
  background-color: #ffebee;
  color: #d32f2f;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.register-link {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #666;
}

@media (max-width: 480px) {
  .login-box {
    padding: 1.5rem;
  }
}
</style>