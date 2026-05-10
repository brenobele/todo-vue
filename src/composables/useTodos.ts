import { ref } from 'vue'
import { api } from '@/lib/api'
import type { Todo, TodosResponse } from '@/types/api'

export function useTodos() {
  const todos = ref<Todo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchTodos() {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get<TodosResponse>('/todos')
      todos.value = data.data
    } catch (err: any) {
      error.value = err.response?.data?.message ?? 'Erro ao carregar tarefas.'
    } finally {
      loading.value = false
    }
  }

  async function createTodo(title: string) {
    const { data } = await api.post<Todo>('/todos', { title })
    todos.value.push(data)
  }

  async function toggleTodo(id: number, completed: boolean) {
    const { data } = await api.patch<Todo>(`/todos/${id}`, { completed })
    const index = todos.value.findIndex((t) => t.id === id)
    if (index !== -1) todos.value[index] = data
  }

  async function deleteTodo(id: number) {
    await api.delete(`/todos/${id}`)
    todos.value = todos.value.filter((t) => t.id !== id)
  }

  return { todos, loading, error, fetchTodos, createTodo, toggleTodo, deleteTodo }
}
