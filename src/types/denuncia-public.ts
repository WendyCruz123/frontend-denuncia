export interface CategoriaPublicaArea {
  id: string
  nombre: string
  descripcion?: string | null
}

export interface CategoriaPublica {
  id: string
  nombre: string
  descripcion?: string | null
  areaId: string
  leyRespaldo?: string | null
  area: CategoriaPublicaArea
}

export interface CreateDenunciaPublicaDto {
  categoriaId: string
  descripcion: string
  celularContacto: string
  nombresDenunciante?: string
  apellidosDenunciante?: string
  anonimo?: boolean
  latitud?: number
  longitud?: number
  direccionTexto?: string
  detalleCategoriaOtro?: string
}

export interface DenunciaPublicaResponse {
  id: string
  categoriaId: string
  descripcion: string
  celularContacto: string
  nombresDenunciante?: string | null
  apellidosDenunciante?: string | null
  anonimo?: boolean
  latitud?: number | null
  longitud?: number | null
  direccionTexto?: string | null
  detalleCategoriaOtro?: string | null
  fechaCreacion?: string
}

export interface UploadArchivoPublicoDto {
  denunciaId: string
  descripcion?: string
  file: File
}