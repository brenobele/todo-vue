import { ref } from 'vue'
import { api } from '@/lib/api'
import type { UserProfile } from '@/types/api'

export function useProfile() {
  const profile = ref<UserProfile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchProfile() {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get<UserProfile>('/profile')
      profile.value = data
    } catch (err: any) {
      error.value = err.response?.data?.message ?? 'Erro ao carregar perfil.'
    } finally {
      loading.value = false
    }
  }

  async function updateName(name: string) {
    const { data } = await api.patch<UserProfile>('/profile', { name })
    if (profile.value) profile.value.name = data.name
    return data
  }

  async function updatePassword(currentPassword: string, newPassword: string) {
    await api.patch('/profile', { currentPassword, newPassword })
  }

  return { profile, loading, error, fetchProfile, updateName, updatePassword }
}
