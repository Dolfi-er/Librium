<script setup lang="ts">
    import Sidebar from '@/components/Sidebar.vue'
    import UserGreeting from '@/components/UserGreeting.vue'
    import StatsPanel from '@/components/StatsPanel.vue'
    import UsersTable from '@/components/UsersTable.vue'
</script>

<template>
  <div class="users-page">
    <Sidebar />
    
    <main class="content">
      <header class="top-panel">
        <UserGreeting />
        <StatsPanel />
      </header>

      <UsersTable />
    </main>
  </div>
</template>

<style scoped>
.users-page {
  display: flex;
}

.content {
  width: 82%;
  margin-left: 18%;
  padding: 2rem;
}

.top-panel {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
}
</style>