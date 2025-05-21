import { defineStore } from 'pinia'
import type { User, UserCreateDto, UserUpdateDto } from '@/types' // Добавлен type-only импорт

interface UsersState {
  users: User[]
  showAddModal: boolean
  showEditModal: boolean
  showDeleteModal: boolean
  selectedUser: User | null
}

interface UsersState {
  users: User[]
  showAddModal: boolean
  showEditModal: boolean
  showDeleteModal: boolean
  selectedUser: User | null
}

export const useUsersStore = defineStore('users', {
  state: (): UsersState => ({
    users: [],
    showAddModal: false,
    showEditModal: false,
    showDeleteModal: false,
    selectedUser: null
  }),
  
  actions: {
    async fetchUsers() {
      try {
        const response = await fetch('/api/User')
        this.users = await response.json()
      } catch (error) {
        console.error('Ошибка при загрузке пользователей:', error)
      }
    },

    async createUser(userData: UserCreateDto) {
      try {
        const response = await fetch('/api/User', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        })
        const newUser = await response.json()
        this.users.push(newUser)
        this.showAddModal = false
      } catch (error) {
        console.error('Ошибка при создании пользователя:', error)
      }
    },

    async updateUser(id: number, userData: UserUpdateDto) {
      try {
        await fetch(`/api/User/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        })
        await this.fetchUsers() // Обновляем список
        this.showEditModal = false
      } catch (error) {
        console.error('Ошибка при обновлении пользователя:', error)
      }
    },

    async deleteUser() {
      if (!this.selectedUser) return
      try {
        await fetch(`/api/User/${this.selectedUser.id}`, {
          method: 'DELETE'
        })
        this.users = this.users.filter(u => u.id !== this.selectedUser!.id)
        this.showDeleteModal = false
      } catch (error) {
        console.error('Ошибка при удалении пользователя:', error)
      }
    },

    openAddModal() {
      this.showAddModal = true
    },

    openEditModal(user: User) {
      this.selectedUser = user
      this.showEditModal = true
    },

    openDeleteModal(user: User) {
      this.selectedUser = user
      this.showDeleteModal = true
    }
  }
})