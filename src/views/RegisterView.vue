<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const schema = toTypedSchema(
  z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  }),
)

const { defineField, handleSubmit, errors } = useForm({ validationSchema: schema })
const [name, nameAttrs] = defineField('name')
const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')

const auth = useAuthStore()
const router = useRouter()
const serverError = ref('')
const loading = ref(false)

const onSubmit = handleSubmit(async (values) => {
  loading.value = true
  serverError.value = ''
  try {
    await auth.register(values.name, values.email, values.password)
    await auth.login(values.email, values.password)
    router.push('/')
  } catch (err: any) {
    serverError.value = err.response?.data?.message ?? 'Erro ao criar conta.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <h1>Todo App</h1>
      <p class="subtitle">Crie sua conta</p>

      <form @submit.prevent="onSubmit">
        <div class="field">
          <label for="name">Nome</label>
          <input
            id="name"
            v-model="name"
            v-bind="nameAttrs"
            type="text"
            placeholder="Seu nome"
            autocomplete="name"
          />
          <span v-if="errors.name" class="error">{{ errors.name }}</span>
        </div>

        <div class="field">
          <label for="email">E-mail</label>
          <input
            id="email"
            v-model="email"
            v-bind="emailAttrs"
            type="email"
            placeholder="seu@email.com"
            autocomplete="email"
          />
          <span v-if="errors.email" class="error">{{ errors.email }}</span>
        </div>

        <div class="field">
          <label for="password">Senha</label>
          <input
            id="password"
            v-model="password"
            v-bind="passwordAttrs"
            type="password"
            placeholder="Mínimo 6 caracteres"
            autocomplete="new-password"
          />
          <span v-if="errors.password" class="error">{{ errors.password }}</span>
        </div>

        <span v-if="serverError" class="error server-error">{{ serverError }}</span>

        <button type="submit" :disabled="loading" class="btn-primary">
          {{ loading ? 'Criando conta...' : 'Criar conta' }}
        </button>
      </form>

      <p class="auth-link">
        Já tem conta?
        <RouterLink to="/login">Entrar</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background);
}

.auth-card {
  width: 100%;
  max-width: 380px;
  padding: 2.5rem;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
  color: var(--color-heading);
}

.subtitle {
  color: var(--color-text);
  opacity: 0.7;
  margin: 0 0 2rem;
  font-size: 0.95rem;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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
  transition: border-color 0.2s;
  outline: none;
}

input:focus {
  border-color: hsla(160, 100%, 37%, 1);
}

.error {
  font-size: 0.8rem;
  color: #e53e3e;
}

.server-error {
  text-align: center;
}

.btn-primary {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: hsla(160, 100%, 37%, 1);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.85;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-link {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-text);
}

.auth-link a {
  color: hsla(160, 100%, 37%, 1);
  font-weight: 500;
  text-decoration: none;
}
</style>
