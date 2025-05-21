<template>
  <nav class="sidebar">
    <div class="logo">Librium</div>
    <router-link to="/users" class="nav-item">Пользователи</router-link>
    <router-link to="/books" class="nav-item">Книги</router-link>
    <router-link to="/transmissions" class="nav-item">Выдачи</router-link>
  </nav>
</template>

<style scoped>
.sidebar {
  width: 18%;
  height: 100vh;
  position: fixed;
  background: #2c3e50;
  padding: 1rem;
  color: white;
}

.nav-item {
  display: block;
  padding: 1rem;
  color: white;
  text-decoration: none;
  transition: 0.3s;
}

.nav-item:hover {
  background: #34495e;
}

.logo {
  font-size: 1.5rem;
  padding: 1rem;
  border-bottom: 1px solid #34495e;
  margin-bottom: 1rem;
}
</style>