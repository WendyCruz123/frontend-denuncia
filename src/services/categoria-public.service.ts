import api from '@/lib/axios'
import { CategoriaPublica } from '@/types/denuncia-public'

export async function getCategoriasPublicas(): Promise<CategoriaPublica[]> {
  const response = await api.get<CategoriaPublica[]>('/categoria/public')
  return response.data
}