<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTodos } from '@/composables/useTodos'

const auth = useAuthStore()
const router = useRouter()
const { todos, loading, error, fetchTodos, createTodo, toggleTodo, deleteTodo } = useTodos()

const newTitle = ref('')
const newDueDate = ref('')
const createError = ref('')
const creating = ref(false)
const toggleError = ref('')
const deletingId = ref<number | null>(null)

function formatDueDate(dueDate: string): string {
  const [year, month, day] = dueDate.split('-')
  return `${day}/${month}/${year}`
}

function isOverdue(todo: { completed: boolean; dueDate: string | null }): boolean {
  if (!todo.dueDate || todo.completed) return false
  const today = new Date()
  const localDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')
  return todo.dueDate < localDate
}

onMounted(fetchTodos)

async function handleCreate() {
  const title = newTitle.value.trim()
  if (title.length < 3) {
    createError.value = 'O título precisa de pelo menos 3 caracteres.'
    return
  }
  creating.value = true
  createError.value = ''
  try {
    await createTodo(title, newDueDate.value || null)
    newTitle.value = ''
    newDueDate.value = ''
  } catch (err: any) {
    createError.value = err.response?.data?.message ?? 'Erro ao criar tarefa.'
  } finally {
    creating.value = false
  }
}

async function handleToggle(id: number, completed: boolean) {
  if (deletingId.value !== null) return
  toggleError.value = ''
  try {
    await toggleTodo(id, completed)
  } catch (err: any) {
    toggleError.value = err.response?.data?.message ?? 'Erro ao atualizar tarefa.'
  }
}

async function handleDelete(id: number) {
  if (deletingId.value !== null) return
  deletingId.value = id
  try {
    await deleteTodo(id)
  } catch (err: any) {
    createError.value = err.response?.data?.message ?? 'Erro ao excluir tarefa.'
  } finally {
    deletingId.value = null
  }
}

async function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="page">
    <div class="container">
      <header class="header">
        <h1>Minhas Tarefas</h1>
        <div class="header-actions">
          <RouterLink to="/profile" class="btn-profile">Perfil</RouterLink>
          <button class="btn-logout" @click="handleLogout">Sair</button>
        </div>
      </header>

      <form class="add-form" @submit.prevent="handleCreate">
        <div class="add-input-wrapper">
          <input
            v-model="newTitle"
            type="text"
            placeholder="Nova tarefa..."
            :disabled="creating"
          />
          <button type="submit" class="btn-add" :disabled="creating">
            {{ creating ? '...' : 'Adicionar' }}
          </button>
        </div>
        <div class="due-date-row">
          <label class="due-date-label" for="newDueDate">Prazo</label>
          <input
            id="newDueDate"
            v-model="newDueDate"
            type="date"
            class="due-date-input"
            :disabled="creating"
          />
        </div>
        <span v-if="createError" class="error">{{ createError }}</span>
      </form>

      <div v-if="loading" class="state-message">Carregando...</div>

      <div v-else-if="error" class="state-message error">{{ error }}</div>

      <ul v-else-if="todos.length > 0" class="todo-list">
        <li
          v-for="todo in todos"
          :key="todo.id"
          class="todo-item"
          :class="{ 'todo-overdue': isOverdue(todo) }"
        >
          <label class="todo-label">
            <input
              type="checkbox"
              :checked="todo.completed"
              @change="handleToggle(todo.id, !todo.completed)"
            />
            <div class="todo-text">
              <span :class="{ completed: todo.completed }">{{ todo.title }}</span>
              <span
                v-if="todo.dueDate"
                class="due-badge"
                :class="{ 'due-badge--overdue': isOverdue(todo), 'due-badge--done': todo.completed }"
              >
                Prazo: {{ formatDueDate(todo.dueDate) }}
              </span>
            </div>
          </label>
          <button
            class="btn-delete"
            @click="handleDelete(todo.id)"
            :disabled="deletingId === todo.id"
            aria-label="Excluir tarefa"
          >
            ×
          </button>
        </li>
      </ul>

      <div v-else class="state-message">Nenhuma tarefa ainda. Adicione uma acima!</div>

      <span v-if="toggleError" class="error" style="text-align: center">{{ toggleError }}</span>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--color-background);
  padding: 2rem 1rem;
}

.container {
  max-width: 560px;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.75rem;
}

h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-heading);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-profile {
  padding: 0.4rem 0.875rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: transparent;
  color: var(--color-text);
  font-size: 0.875rem;
  text-decoration: none;
  transition: background 0.2s;
}

.btn-profile:hover {
  background: var(--color-background-soft);
}

.btn-logout {
  padding: 0.4rem 0.875rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: transparent;
  color: var(--color-text);
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-logout:hover {
  background: var(--color-background-soft);
}

.add-form {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.add-input-wrapper {
  display: flex;
  gap: 0.5rem;
}

.add-input-wrapper input {
  flex: 1;
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-soft);
  color: var(--color-text);
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

.add-input-wrapper input:focus {
  border-color: hsla(160, 100%, 37%, 1);
}

.due-date-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.due-date-label {
  font-size: 0.875rem;
  color: var(--color-text);
  opacity: 0.7;
  white-space: nowrap;
}

.due-date-input {
  padding: 0.375rem 0.625rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-soft);
  color: var(--color-text);
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
  cursor: pointer;
}

.due-date-input:focus {
  border-color: hsla(160, 100%, 37%, 1);
}

.due-date-input:disabled {
  opacity: 0.6;
}

.btn-add {
  padding: 0.625rem 1.125rem;
  background: hsla(160, 100%, 37%, 1);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;
}

.btn-add:hover:not(:disabled) {
  opacity: 0.85;
}

.btn-add:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  display: block;
  margin-top: 0.375rem;
  font-size: 0.8rem;
  color: #e53e3e;
}

.state-message {
  text-align: center;
  padding: 2rem;
  color: var(--color-text);
  opacity: 0.6;
  font-size: 0.95rem;
}

.todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  transition: border-color 0.2s;
}

.todo-item:hover {
  border-color: hsla(160, 100%, 37%, 0.4);
}

.todo-item.todo-overdue {
  border-color: hsla(0, 80%, 60%, 0.4);
}

.todo-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  flex: 1;
}

.todo-label input[type='checkbox'] {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
  flex-shrink: 0;
  accent-color: hsla(160, 100%, 37%, 1);
}

.todo-text {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.todo-text span {
  font-size: 0.95rem;
  color: var(--color-text);
  transition: opacity 0.2s;
}

.todo-text span.completed {
  text-decoration: line-through;
  opacity: 0.45;
}

.due-badge {
  font-size: 0.75rem;
  color: var(--color-text);
  opacity: 0.55;
}

.due-badge--overdue {
  color: #e53e3e;
  opacity: 1;
  font-weight: 500;
}

.due-badge--done {
  text-decoration: line-through;
  opacity: 0.35;
}

.btn-delete {
  padding: 0.125rem 0.5rem;
  background: transparent;
  border: none;
  color: var(--color-text);
  opacity: 0.4;
  font-size: 1.25rem;
  cursor: pointer;
  border-radius: 4px;
  transition: opacity 0.2s, color 0.2s;
  line-height: 1;
}

.btn-delete:hover {
  opacity: 1;
  color: #e53e3e;
}
</style>
