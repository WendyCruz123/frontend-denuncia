import api from '@/lib/axios'
import {
  CreateDenunciaPublicaDto,
  DenunciaPublicaResponse,
} from '@/types/denuncia-public'

export async function createDenunciaPublica(
  payload: CreateDenunciaPublicaDto,
): Promise<DenunciaPublicaResponse> {
  const response = await api.post<DenunciaPublicaResponse>('/denuncia', payload)
  return response.data
}

export async function uploadArchivoPublico(params: {
  denunciaId: string
  descripcion?: string
  file: File
}) {
  const formData = new FormData()
  formData.append('denunciaId', params.denunciaId)

  if (params.descripcion?.trim()) {
    formData.append('descripcion', params.descripcion.trim())
  }

  formData.append('file', params.file)

  const response = await api.post('/archivo/upload-public', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}