<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProfile } from '@/composables/useProfile'

const { profile, loading, error, fetchProfile, updateName, updatePassword } = useProfile()

const nameInput = ref('')
const nameError = ref('')
const nameSuccess = ref('')
const savingName = ref(false)

const currentPassword = ref('')
const newPassword = ref('')
const passwordError = ref('')
const passwordSuccess = ref('')
const savingPassword = ref(false)

onMounted(async () => {
  await fetchProfile()
  if (profile.value) nameInput.value = profile.value.name
})

async function handleUpdateName() {
  const name = nameInput.value.trim()
  if (name.length < 2) {
    nameError.value = 'Nome deve ter pelo menos 2 caracteres.'
    return
  }
  savingName.value = true
  nameError.value = ''
  nameSuccess.value = ''
  try {
    await updateName(name)
    nameSuccess.value = 'Nome atualizado com sucesso.'
  } catch (err: any) {
    nameError.value = err.response?.data?.message ?? 'Erro ao atualizar nome.'
  } finally {
    savingName.value = false
  }
}

async function handleUpdatePassword() {
  if (!currentPassword.value) {
    passwordError.value = 'Informe a senha atual.'
    return
  }
  if (newPassword.value.length < 6) {
    passwordError.value = 'Nova senha deve ter pelo menos 6 caracteres.'
    return
  }
  savingPassword.value = true
  passwordError.value = ''
  passwordSuccess.value = ''
  try {
    await updatePassword(currentPassword.value, newPassword.value)
    passwordSuccess.value = 'Senha alterada com sucesso.'
    currentPassword.value = ''
    newPassword.value = ''
  } catch (err: any) {
    passwordError.value = err.response?.data?.message ?? 'Erro ao alterar senha.'
  } finally {
    savingPassword.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="container">
      <header class="header">
        <RouterLink to="/" class="back-link">← Voltar</RouterLink>
        <h1>Meu Perfil</h1>
      </header>

      <div v-if="loading" class="state-message">Carregando...</div>
      <div v-else-if="error" class="state-message error-text">{{ error }}</div>

      <template v-else-if="profile">
        <div class="card">
          <p class="email-label">E-mail</p>
          <p class="email-value">{{ profile.email }}</p>
        </div>

        <div class="card">
          <h2>Nome de usuário</h2>
          <form @submit.prevent="handleUpdateName">
            <div class="field">
              <input
                v-model="nameInput"
                type="text"
                placeholder="Seu nome"
                :disabled="savingName"
              />
              <span v-if="nameError" class="error-text">{{ nameError }}</span>
              <span v-if="nameSuccess" class="success-text">{{ nameSuccess }}</span>
            </div>
            <button type="submit" class="btn-primary" :disabled="savingName">
              {{ savingName ? 'Salvando...' : 'Salvar nome' }}
            </button>
          </form>
        </div>

        <div class="card">
          <h2>Alterar senha</h2>
          <form @submit.prevent="handleUpdatePassword">
            <div class="field">
              <label>Senha atual</label>
              <input
                v-model="currentPassword"
                type="password"
                placeholder="••••••"
                autocomplete="current-password"
                :disabled="savingPassword"
              />
            </div>
            <div class="field">
              <label>Nova senha</label>
              <input
                v-model="newPassword"
                type="password"
                placeholder="Mínimo 6 caracteres"
                autocomplete="new-password"
                :disabled="savingPassword"
              />
            </div>
            <span v-if="passwordError" class="error-text">{{ passwordError }}</span>
            <span v-if="passwordSuccess" class="success-text">{{ passwordSuccess }}</span>
            <button type="submit" class="btn-primary" :disabled="savingPassword">
              {{ savingPassword ? 'Alterando...' : 'Alterar senha' }}
            </button>
          </form>
        </div>
      </template>
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
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.back-link {
  color: var(--color-text);
  text-decoration: none;
  font-size: 0.9rem;
  opacity: 0.7;
  transition: opacity 0.2s;
  white-space: nowrap;
}

.back-link:hover {
  opacity: 1;
}

h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-heading);
  margin: 0;
}

.card {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

h2 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-heading);
  margin: 0;
}

.email-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
  opacity: 0.7;
  margin: 0;
}

.email-value {
  font-size: 0.95rem;
  color: var(--color-text);
  margin: 0;
}

form {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}

input {
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

input:focus {
  border-color: hsla(160, 100%, 37%, 1);
}

input:disabled {
  opacity: 0.6;
}

.error-text {
  font-size: 0.8rem;
  color: #e53e3e;
}

.success-text {
  font-size: 0.8rem;
  color: hsla(160, 100%, 37%, 1);
  font-weight: 500;
}

.state-message {
  text-align: center;
  padding: 2rem;
  color: var(--color-text);
  opacity: 0.6;
}

.btn-primary {
  padding: 0.625rem 1rem;
  background: hsla(160, 100%, 37%, 1);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  align-self: flex-start;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.85;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
