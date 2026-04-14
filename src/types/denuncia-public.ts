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
  celularContacto?: string
  nombresDenunciante?: string
  apellidosDenunciante?: string
  anonimo?: boolean
  latitud?: number
  longitud?: number
  direccionTexto?: string
  detalleCategoriaOtro?: string
}
export interface DenunciaPublicaDetalle {
  id: string
  codigoSeguimiento: string
  categoriaId: string
  descripcion: string
  celularContacto?: string | null
  nombresDenunciante?: string | null
  apellidosDenunciante?: string | null
  anonimo: boolean
  latitud?: number | null
  longitud?: number | null
  direccionTexto?: string | null
  detalleCategoriaOtro?: string | null
  estadoRegistro?: string
  transaccion?: string
  fechaCreacion?: string
  fechaModificacion?: string | null
}
export interface DenunciaPublicaResponse {
  mensaje: string
  codigoSeguimiento: string
  denuncia: DenunciaPublicaDetalle
}

export interface UploadArchivoPublicoDto {
  denunciaId: string
  descripcion?: string
  file: File
}