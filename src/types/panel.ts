export interface PanelArea {
  id: string
  nombre: string
  descripcion?: string | null
}

export interface PanelCategoria {
  id: string
  nombre: string
  descripcion?: string | null
  areaId: string
  area: PanelArea
}

export interface ResumenGeneralEstadoItem {
  estado: string
  total: number
}

export interface ResumenGeneralAreaItem {
  area: string
  total: number
}

export interface ResumenGeneralResponse {
  totalDenuncias: number
  porEstado: ResumenGeneralEstadoItem[]
  porArea: ResumenGeneralAreaItem[]
}

export interface ResumenPorEstadoItem {
  estadoId: string
  nombre: string
  orden: number
  total: number
}

export interface PanelArchivo {
  id: string
  urlArchivo: string
  tipoArchivo: string
  nombreOriginal?: string | null
  descripcion?: string | null
}

export interface PanelSolucion {
  id: string
  titulo: string
  descripcion: string
  archivos: PanelArchivo[]
}

export interface PanelHistorialEstado {
  id: string
  fechaCambio: string
  estado: {
    id: string
    nombre: string
    orden: number
  }
}

export interface PanelDenuncia {
  id: string
  descripcion: string
  celularContacto?: string
  nombresDenunciante?: string | null
  apellidosDenunciante?: string | null
  anonimo?: boolean
  direccionTexto?: string | null
  latitud?: number | null
  longitud?: number | null
  fechaCreacion?: string
  categoria: {
    id: string
    nombre: string
    areaId: string
    area: PanelArea
  }
  archivos: PanelArchivo[]
  soluciones: PanelSolucion[]
  historialEstados: PanelHistorialEstado[]
}

export type AgrupadoPorEstadoResponse = Record<string, PanelDenuncia[]>

export interface PanelFilters {
  areaId?: string
  categoriaId?: string
  estadoId?: string
}

export interface CreateSolucionPayload {
  denunciaId: string
  areaId: string
  titulo: string
  descripcion: string
}

export interface UpdateSolucionPayload {
  titulo?: string
  descripcion?: string
}

export interface CambiarEstadoPayload {
  denunciaId: string
  estadoId: string
  comentario?: string
}

export interface UploadArchivoInternoPayload {
  solucionId?: string
  denunciaId?: string
  descripcion?: string
  file: File
}