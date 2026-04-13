import api from '@/lib/axios'
import { DashboardPublicoResponse, PublicDenuncia } from '@/types/public'

export async function getDashboardPublico(): Promise<DashboardPublicoResponse> {
  const response = await api.get<DashboardPublicoResponse>('/reporte/dashboard-publico')
  return response.data
}

export async function getDenunciasSolucionadasPublicas(): Promise<PublicDenuncia[]> {
  const response = await api.get<PublicDenuncia[]>('/denuncia/public/solucionadas')
  return response.data
}