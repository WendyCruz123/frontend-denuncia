export interface AuthPersona {
  id?: string
  nombres?: string | null
  apellidos?: string | null
  nombreCompleto?: string | null
  celular?: string | null
}

export interface AuthArea {
  id: string
  nombre: string
  descripcion?: string | null
}

export interface AuthUser {
  id: string
  username: string
  persona?: AuthPersona | null
  area?: AuthArea | null
  roles: string[]
}

export interface LoginDto {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  user: AuthUser
}

export interface ProfileResponse {
  sub: string
  username: string
  personaId?: string | null
  areaId?: string | null
  roles: string[]
}