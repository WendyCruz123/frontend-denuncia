import api from '@/lib/axios'
import { LoginDto, LoginResponse, ProfileResponse } from '@/types/auth'

export async function loginRequest(data: LoginDto): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', data)
  return response.data
}

export async function profileRequest(): Promise<ProfileResponse> {
  const response = await api.get<ProfileResponse>('/auth/profile')
  return response.data
}