import api from '@/lib/axios'
import {
  AgrupadoPorEstadoResponse,
  CambiarEstadoPayload,
  CreateSolucionPayload,
  PanelArea,
  PanelCategoria,
  PanelFilters,
  ResumenGeneralResponse,
  ResumenPorEstadoItem,
  UpdateSolucionPayload,
  UploadArchivoInternoPayload,
} from '@/types/panel'

function buildParams(filters?: PanelFilters) {
  const params: Record<string, string> = {}

  if (filters?.areaId) params.areaId = filters.areaId
  if (filters?.categoriaId) params.categoriaId = filters.categoriaId
  if (filters?.estadoId) params.estadoId = filters.estadoId

  return params
}

export async function getAreas(): Promise<PanelArea[]> {
  const response = await api.get<PanelArea[]>('/area')
  return response.data
}

export async function getCategorias(): Promise<PanelCategoria[]> {
  const response = await api.get<PanelCategoria[]>('/categoria')
  return response.data
}

export async function getResumenGeneral(
  filters?: PanelFilters,
): Promise<ResumenGeneralResponse> {
  const response = await api.get<ResumenGeneralResponse>(
    '/reporte/resumen-general',
    {
      params: buildParams(filters),
    },
  )
  return response.data
}

export async function getResumenPorEstado(
  filters?: PanelFilters,
): Promise<ResumenPorEstadoItem[]> {
  const response = await api.get<ResumenPorEstadoItem[]>(
    '/reporte/resumen-por-estado',
    {
      params: buildParams(filters),
    },
  )
  return response.data
}

export async function getAgrupadoPorEstado(
  filters?: PanelFilters,
): Promise<AgrupadoPorEstadoResponse> {
  const response = await api.get<AgrupadoPorEstadoResponse>(
    '/reporte/agrupado-por-estado',
    {
      params: buildParams(filters),
    },
  )
  return response.data
}

export async function createSolucion(payload: CreateSolucionPayload) {
  const response = await api.post('/solucion', payload)
  return response.data
}

export async function updateSolucion(
  solucionId: string,
  payload: UpdateSolucionPayload,
) {
  const response = await api.patch(`/solucion/${solucionId}`, payload)
  return response.data
}

export async function uploadArchivoInterno({
  solucionId,
  denunciaId,
  descripcion,
  file,
}: UploadArchivoInternoPayload) {
  const formData = new FormData()

  if (solucionId) formData.append('solucionId', solucionId)
  if (denunciaId) formData.append('denunciaId', denunciaId)
  if (descripcion) formData.append('descripcion', descripcion)
  formData.append('file', file)

  const response = await api.post('/archivo/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

export async function cambiarEstado(payload: CambiarEstadoPayload) {
  const response = await api.post('/denuncia-estado', payload)
  return response.data
}