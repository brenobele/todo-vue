export interface Todo {
  id: number
  title: string
  completed: boolean
  userId: string
  createdAt: string
}

export interface TodosResponse {
  data: Todo[]
  updatedAt: string
  cached: boolean
}

export interface AuthResponse {
  token: string
}

export interface RegisterResponse {
  userId: string
}

export interface ApiError {
  message: string
}

export interface ValidationError {
  message: string
  errors: Record<string, string[]>
}
