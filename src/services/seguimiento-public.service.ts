import axios from 'axios'
import { SeguimientoDenunciaResponse } from '@/types/seguimiento-public'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export async function getSeguimientoDenuncia(
  codigo: string,
): Promise<SeguimientoDenunciaResponse> {
  const response = await axios.get(
    `${API_URL}/denuncia/seguimiento/${codigo}`,
  )

  return response.data
}