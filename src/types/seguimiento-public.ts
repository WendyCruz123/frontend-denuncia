export interface SeguimientoHistorialItem {
  estado: string
  comentario?: string | null
  fechaCambio?: string | null
}

export interface SeguimientoArchivo {
  id: string
  urlArchivo: string
  tipoArchivo: string
  nombreOriginal?: string | null
  descripcion?: string | null
}

export interface SeguimientoSolucion {
  id: string
  titulo: string
  descripcion?: string | null
  fechaSolucion?: string | null
  archivos: SeguimientoArchivo[]
}

export interface SeguimientoDenunciaDetalle {
  id: string
  categoria: string
  area: string
  descripcion: string
  anonimo: boolean
  direccionTexto?: string | null
  detalleCategoriaOtro?: string | null
  fechaCreacion?: string | null
}

export interface SeguimientoDenunciaResponse {
  codigoSeguimiento: string
  estadoActual: string
  denuncia: SeguimientoDenunciaDetalle
  historialEstados: SeguimientoHistorialItem[]
  soluciones: SeguimientoSolucion[]
}