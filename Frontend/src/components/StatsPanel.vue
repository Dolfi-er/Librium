<script setup lang="ts">
const stats = {
  readers: 245,
  books: 1893,
  halls: 12
}
</script>

<template>
  <div class="stats-panel">
    <div class="stat-item">
      <div class="stat-value">{{ stats.readers }}</div>
      <div class="stat-label">Читателей</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">{{ stats.books }}</div>
      <div class="stat-label">Книг</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">{{ stats.halls }}</div>
      <div class="stat-label">Залов</div>
    </div>
  </div>
</template>

<style scoped>
.stats-panel {
  display: flex;
  gap: 2rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  min-width: 100px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9rem;
}
</style>