export interface PublicArchivo {
  id: string
  urlArchivo: string
  tipoArchivo: string
  nombreOriginal?: string | null
  descripcion?: string | null
}

export interface PublicArea {
  id: string
  nombre: string
}

export interface PublicCategoria {
  id: string
  nombre: string
  area: PublicArea
}

export interface PublicEstado {
  id: string
  nombre: string
  orden?: number
}

export interface PublicHistorialEstado {
  id: string
  fechaCambio?: string
  estado: PublicEstado
}

export interface PublicSolucion {
  id: string
  titulo?: string | null
  descripcion?: string | null
  archivos: PublicArchivo[]
}

export interface PublicDenuncia {
  id: string
  descripcion: string
  fechaCreacion?: string
  direccionTexto?: string | null
  latitud?: number | null
  longitud?: number | null
  categoria: PublicCategoria
  soluciones: PublicSolucion[]
  historialEstados: PublicHistorialEstado[]
}

export interface DashboardPublicoResponse {
  totalSolucionadas: number
  denunciasSolucionadas: PublicDenuncia[]
}