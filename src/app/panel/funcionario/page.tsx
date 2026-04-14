'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import PanelShell from '@/components/panel/PanelShell'
import { getUser, isAuthenticated, logout } from '@/lib/auth'
import { AuthUser } from '@/types/auth'
import { generarReporteDenuncias } from '@/lib/reportes'
import {
  AgrupadoPorEstadoResponse,
  PanelCategoria,
  PanelDenuncia,
  PanelFilters,
  ResumenPorEstadoItem,
} from '@/types/panel'
import {
  cambiarEstado,
  createSolucion,
  getAgrupadoPorEstado,
  getCategorias,
  getResumenGeneral,
  getResumenPorEstado,
  updateSolucion,
  uploadArchivoInterno,
} from '@/services/panel.service'

const ESTADOS_CLAVE = ['RECIBIDO', 'EN PROCESO', 'SOLUCIONADO', 'RECHAZADO']

function formatDate(date?: string) {
  if (!date) return 'Fecha no disponible'

  return new Intl.DateTimeFormat('es-BO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date))
}

function truncateText(text: string, max = 140) {
  if (!text) return ''
  if (text.length <= max) return text
  return `${text.slice(0, max)}...`
}
function isImageFile(tipo?: string) {
  return !!tipo && tipo.startsWith('image/')
}

function isVideoFile(tipo?: string) {
  return !!tipo && tipo.startsWith('video/')
}

function isAudioFile(tipo?: string) {
  return !!tipo && tipo.startsWith('audio/')
}

function getFileLabel(tipo?: string) {
  if (isImageFile(tipo)) return 'Imagen'
  if (isVideoFile(tipo)) return 'Video'
  if (isAudioFile(tipo)) return 'Audio'
  if (tipo === 'application/pdf') return 'PDF'
  if (
    tipo === 'application/msword' ||
    tipo ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return 'Word'
  }
  return 'Archivo'
}

function getFileUrl(urlArchivo?: string) {
  if (!urlArchivo) return '#'
  if (urlArchivo.startsWith('http')) return urlArchivo
  return `${process.env.NEXT_PUBLIC_API_URL}${urlArchivo}`
}
function getEstadoTotal(items: ResumenPorEstadoItem[], estadoNombre: string) {
  return items.find((item) => item.nombre === estadoNombre)?.total ?? 0
}

export default function PanelFuncionarioPage() {
  const router = useRouter()

  const [user, setUser] = useState<AuthUser | null>(null)
  const [categorias, setCategorias] = useState<PanelCategoria[]>([])
  const [resumenPorEstado, setResumenPorEstado] = useState<ResumenPorEstadoItem[]>([])
  const [agrupado, setAgrupado] = useState<AgrupadoPorEstadoResponse>({})
  const [totalDenuncias, setTotalDenuncias] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState('')

  const [filters, setFilters] = useState<PanelFilters>({
    categoriaId: '',
  })

  const [selectedDenuncia, setSelectedDenuncia] = useState<PanelDenuncia | null>(null)
  const [detailDenuncia, setDetailDenuncia] = useState<PanelDenuncia | null>(null)
  const [selectedEstadoId, setSelectedEstadoId] = useState('')
  const [comentario, setComentario] = useState('')
  const [solucionTitulo, setSolucionTitulo] = useState('')
  const [solucionDescripcion, setSolucionDescripcion] = useState('')
  const [solucionFiles, setSolucionFiles] = useState<File[]>([])
  const [modalError, setModalError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const currentUser = getUser()

    if (!isAuthenticated() || !currentUser) {
      logout()
      router.replace('/login')
      return
    }

    if (!currentUser.roles?.includes('FUNCIONARIO')) {
      router.replace('/panel')
      return
    }

    setUser(currentUser)
    setLoading(false)
  }, [router])

  useEffect(() => {
    if (!user) return

    const loadCategorias = async () => {
      try {
        const data = await getCategorias()
        const categoriasDeSuArea = data.filter(
          (categoria) => categoria.areaId === user.area?.id,
        )
        setCategorias(categoriasDeSuArea)
      } catch (err) {
        console.error(err)
        setError('No se pudieron cargar las categorías del área.')
      }
    }

    loadCategorias()
  }, [user])

  const loadDashboard = async (currentFilters: PanelFilters) => {
    try {
      setLoadingData(true)
      setError('')

      const normalizedFilters: PanelFilters = {
        categoriaId: currentFilters.categoriaId || undefined,
      }

      const [resumenGeneralData, resumenEstadoData, agrupadoData] =
        await Promise.all([
          getResumenGeneral(normalizedFilters),
          getResumenPorEstado(normalizedFilters),
          getAgrupadoPorEstado(normalizedFilters),
        ])

      setTotalDenuncias(resumenGeneralData.totalDenuncias)
      setResumenPorEstado(resumenEstadoData)
      setAgrupado(agrupadoData)
    } catch (err) {
      console.error(err)
      setError('No se pudo cargar la información del dashboard.')
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    if (!user) return
    loadDashboard(filters)
  }, [user, filters])

  const orderedSections = useMemo(() => {
    const ordered = [...resumenPorEstado].sort((a, b) => a.orden - b.orden)
    return ordered.map((item) => item.nombre)
  }, [resumenPorEstado])

  const availableTransitions = useMemo(() => {
    if (!selectedDenuncia) return []

    const estadoActual =
      selectedDenuncia.historialEstados?.[0]?.estado?.nombre?.trim().toUpperCase() || ''

    if (estadoActual === 'RECIBIDO') {
      return resumenPorEstado.filter((item) => item.nombre === 'EN PROCESO')
    }

    if (estadoActual === 'EN PROCESO') {
      return resumenPorEstado.filter(
        (item) => item.nombre === 'SOLUCIONADO' || item.nombre === 'RECHAZADO',
      )
    }

    return []
  }, [selectedDenuncia, resumenPorEstado])

  const estadoDestino = useMemo(() => {
    return availableTransitions.find((item) => item.estadoId === selectedEstadoId)
  }, [availableTransitions, selectedEstadoId])

  const necesitaSolucion = useMemo(() => {
    const nombre = estadoDestino?.nombre?.trim().toUpperCase() || ''
    return nombre === 'SOLUCIONADO' || nombre === 'RECHAZADO'
  }, [estadoDestino])

  const solucionExistente = useMemo(() => {
    return selectedDenuncia?.soluciones?.[0] || null
  }, [selectedDenuncia])

  const totalArchivosExistentes = solucionExistente?.archivos?.length ?? 0

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({
      categoriaId: e.target.value,
    })
  }

  const clearFilters = () => {
    setFilters({
      categoriaId: '',
    })
  }

  const resetModal = () => {
    setSelectedDenuncia(null)
    setSelectedEstadoId('')
    setComentario('')
    setSolucionTitulo('')
    setSolucionDescripcion('')
    setSolucionFiles([])
    setModalError('')
    setActionLoading(false)
  }
  const closeDetailModal = () => {
  setDetailDenuncia(null)
}

  const openGestionModal = (denuncia: PanelDenuncia) => {
    const solucion = denuncia.soluciones?.[0]

    setSelectedDenuncia(denuncia)
    setSelectedEstadoId('')
    setComentario('')
    setSolucionTitulo(solucion?.titulo || '')
    setSolucionDescripcion(solucion?.descripcion || '')
    setSolucionFiles([])
    setModalError('')
  }

  const handleModalFileSelection = (selectedList: FileList | null) => {
    if (!selectedList) return

    const selectedArray = Array.from(selectedList)
    const combined = [...solucionFiles, ...selectedArray]

    if (combined.length + totalArchivosExistentes > 3) {
      setModalError(
        `Solo puedes tener hasta 3 archivos en la solución. Ya existen ${totalArchivosExistentes}.`,
      )
      return
    }

    setModalError('')
    setSolucionFiles(combined)
  }

  const handleInputFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleModalFileSelection(e.target.files)
    e.target.value = ''
  }

  const removeModalFile = (index: number) => {
    setSolucionFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleGestionar = async () => {
    if (!selectedDenuncia) return

    if (!selectedEstadoId) {
      setModalError('Debes seleccionar el siguiente estado.')
      return
    }

    try {
      setActionLoading(true)
      setModalError('')

      if (!necesitaSolucion) {
        await cambiarEstado({
          denunciaId: selectedDenuncia.id,
          estadoId: selectedEstadoId,
          comentario: comentario.trim() || undefined,
        })

        await loadDashboard(filters)
        resetModal()
        return
      }

      let solucionId = solucionExistente?.id

      if (!solucionExistente) {
        if (!solucionTitulo.trim()) {
          setModalError('Debes ingresar el título de la solución.')
          setActionLoading(false)
          return
        }

        if (!solucionDescripcion.trim()) {
          setModalError('Debes ingresar la descripción de la solución.')
          setActionLoading(false)
          return
        }

        if (solucionFiles.length < 1) {
          setModalError(
            'Debes adjuntar al menos un archivo para cerrar la denuncia.',
          )
          setActionLoading(false)
          return
        }

        const nuevaSolucion = await createSolucion({
          denunciaId: selectedDenuncia.id,
          areaId: selectedDenuncia.categoria.areaId,
          titulo: solucionTitulo.trim(),
          descripcion: solucionDescripcion.trim(),
        })

        solucionId = nuevaSolucion.id
      } else {
        if (!solucionTitulo.trim()) {
          setModalError('El título de la solución no puede quedar vacío.')
          setActionLoading(false)
          return
        }

        if (!solucionDescripcion.trim()) {
          setModalError('La descripción de la solución no puede quedar vacía.')
          setActionLoading(false)
          return
        }

        const tituloCambio = solucionTitulo.trim() !== solucionExistente.titulo
        const descripcionCambio =
          solucionDescripcion.trim() !== solucionExistente.descripcion

        if (tituloCambio || descripcionCambio) {
          await updateSolucion(solucionExistente.id, {
            titulo: solucionTitulo.trim(),
            descripcion: solucionDescripcion.trim(),
          })
        }

        if (solucionExistente.archivos.length + solucionFiles.length < 1) {
          setModalError(
            'La solución debe tener al menos un archivo para cerrar la denuncia.',
          )
          setActionLoading(false)
          return
        }

        solucionId = solucionExistente.id
      }

      for (const file of solucionFiles) {
        await uploadArchivoInterno({
          solucionId,
          descripcion: `Archivo de solución: ${file.name}`,
          file,
        })
      }

      await cambiarEstado({
        denunciaId: selectedDenuncia.id,
        estadoId: selectedEstadoId,
        comentario: comentario.trim() || undefined,
      })

      await loadDashboard(filters)
      resetModal()
    } catch (err: any) {
      console.error(err)

      const backendMessage =
        err?.response?.data?.message ||
        'No se pudo gestionar el cambio de estado.'

      setModalError(
        Array.isArray(backendMessage)
          ? backendMessage.join(', ')
          : backendMessage,
      )
    } finally {
      setActionLoading(false)
    }
  }

  if (loading || !user) {
    return (
      <main className="min-h-screen bg-[#f5f2eb] flex items-center justify-center px-4">
        <div className="border border-black/10 bg-white p-8 shadow-sm text-center">
          <p className="text-sm text-neutral-600">
            Cargando panel de funcionario...
          </p>
        </div>
      </main>
    )
  }

  return (
    <>
      <PanelShell
        title="Dashboard de Funcionario"
        subtitle="Consulta denuncias de tu área, filtra por categoría y gestiona estados."
        user={user}
      >
        {error && (
          <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="border border-black/10 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9f1d20]">
              Total
            </p>
            <p className="mt-3 text-4xl font-extrabold text-neutral-900">
              {loadingData ? '...' : totalDenuncias}
            </p>
          </div>

          <div className="border border-black/10 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9f1d20]">
              Recibidas
            </p>
            <p className="mt-3 text-4xl font-extrabold text-neutral-900">
              {loadingData ? '...' : getEstadoTotal(resumenPorEstado, 'RECIBIDO')}
            </p>
          </div>

          <div className="border border-black/10 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9f1d20]">
              En proceso
            </p>
            <p className="mt-3 text-4xl font-extrabold text-neutral-900">
              {loadingData ? '...' : getEstadoTotal(resumenPorEstado, 'EN PROCESO')}
            </p>
          </div>

          <div className="border border-black/10 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9f1d20]">
              Solucionadas
            </p>
            <p className="mt-3 text-4xl font-extrabold text-neutral-900">
              {loadingData ? '...' : getEstadoTotal(resumenPorEstado, 'SOLUCIONADO')}
            </p>
          </div>

          <div className="border border-black/10 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9f1d20]">
              Rechazadas
            </p>
            <p className="mt-3 text-4xl font-extrabold text-neutral-900">
              {loadingData ? '...' : getEstadoTotal(resumenPorEstado, 'RECHAZADO')}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="border border-black/10 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#9f1d20]">
              Filtros
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-800">
                  Categoría
                </label>
                <select
                  value={filters.categoriaId}
                  onChange={handleFilterChange}
                  className="w-full border border-black/15 bg-white px-4 py-3 outline-none"
                >
                  <option value="">Todas las categorías de tu área</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="w-full border border-black/10 px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-[#faf8f3]"
              >
                Limpiar filtros
              </button>

              <button
  type="button"
  onClick={async () => {
    const todas = Object.values(agrupado).flat()

    await generarReporteDenuncias({
      denuncias: todas,
      titulo: 'Reporte de Denuncias - Funcionario',
      filtros: filters.categoriaId
        ? `Categoría seleccionada`
        : 'Sin filtros',
    })
  }}
  className="w-full bg-[#9f1d20] px-4 py-3 text-sm font-bold uppercase tracking-[0.15em] text-white transition hover:bg-[#86181b]"
>
  Generar reporte PDF
</button>
            </div>
          </aside>

          <section className="border border-black/10 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#9f1d20]">
              Denuncias agrupadas por estado
            </p>

            <div className="mt-6 space-y-6">
              {(orderedSections.length > 0 ? orderedSections : ESTADOS_CLAVE).map((estado) => {
                const denuncias = agrupado[estado] || []

                return (
                  <div key={estado} className="border border-black/10 bg-[#faf8f3] p-4">
                    <div className="flex flex-col gap-2 border-b border-black/10 pb-3 sm:flex-row sm:items-center sm:justify-between">
                      <h2 className="text-lg font-bold text-neutral-900">{estado}</h2>
                      <span className="inline-flex w-fit items-center border border-[#9f1d20]/20 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#9f1d20]">
                        {denuncias.length} registro(s)
                      </span>
                    </div>

                    {denuncias.length === 0 ? (
                      <p className="pt-4 text-sm text-neutral-500">
                        No hay denuncias en este estado con los filtros actuales.
                      </p>
                    ) : (
                      <div className="mt-4 grid gap-4 xl:grid-cols-2">
                        {denuncias.map((denuncia: PanelDenuncia) => {
                          const estadoActual =
                            denuncia.historialEstados?.[0]?.estado?.nombre || 'SIN ESTADO'

                          const puedeGestionar =
                            estadoActual === 'RECIBIDO' || estadoActual === 'EN PROCESO'

                          return (
                            <article
                              key={denuncia.id}
                              className="border border-black/10 bg-white p-4"
                            >
                              <div className="flex flex-wrap gap-2">
                                <span className="bg-[#9f1d20]/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#9f1d20]">
                                  {denuncia.categoria?.nombre}
                                </span>
                                <span className="bg-[#d4af37]/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#755f12]">
                                  {denuncia.categoria?.area?.nombre}
                                </span>
                                <span className="border border-black/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-neutral-700">
                                  {estadoActual}
                                </span>
                              </div>

                              <p className="mt-4 text-sm leading-7 text-neutral-700">
                                {truncateText(denuncia.descripcion)}
                              </p>

                              <div className="mt-4 grid gap-2 text-sm text-neutral-600">
                                <p>
                                  <span className="font-semibold text-neutral-900">
                                    Fecha:
                                  </span>{' '}
                                  {formatDate(denuncia.fechaCreacion)}
                                </p>
                                <p>
                                  <span className="font-semibold text-neutral-900">
                                    Denunciante:
                                  </span>{' '}
                                  {denuncia.anonimo
                                    ? 'Anónimo'
                                    : `${denuncia.nombresDenunciante || ''} ${denuncia.apellidosDenunciante || ''}`.trim() || 'No registrado'}
                                </p>
                                <p>
                                  <span className="font-semibold text-neutral-900">
                                    Celular:
                                  </span>{' '}
                                  {denuncia.celularContacto || 'No disponible'}
                                </p>
                                <p>
                                  <span className="font-semibold text-neutral-900">
                                    Dirección:
                                  </span>{' '}
                                  {denuncia.direccionTexto || 'No especificada'}
                                </p>
                              </div>

                              <div className="mt-5 border-t border-black/10 pt-4">
  <div className="grid gap-3 sm:grid-cols-2">
<button
  onClick={() => {
    console.log('DENUNCIA DETALLE =>', denuncia)
    console.log('ARCHIVOS DENUNCIA =>', denuncia.archivos)
    setDetailDenuncia(denuncia)
  }}
>
  Ver más
</button>

    <button
      type="button"
      disabled={!puedeGestionar}
      onClick={() => openGestionModal(denuncia)}
      className="w-full border border-[#9f1d20] px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[#9f1d20] transition hover:bg-[#9f1d20] hover:text-white disabled:cursor-not-allowed disabled:border-black/10 disabled:text-neutral-400 disabled:hover:bg-transparent"
    >
      {puedeGestionar ? 'Gestionar estado' : 'Sin acciones'}
    </button>
  </div>
</div>
                            </article>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </PanelShell>
      {detailDenuncia && (
  <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/45 px-4 py-6">
    <div className="max-h-[95vh] w-full max-w-5xl overflow-y-auto border border-black/10 bg-white shadow-2xl">
      <div className="border-b border-black/10 px-6 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#9f1d20]">
              Detalle de denuncia
            </p>
            <h2 className="mt-2 text-2xl font-bold text-neutral-900">
              Información completa del caso
            </h2>
          </div>

          <button
            type="button"
            onClick={closeDetailModal}
            className="border border-black/10 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-[#faf8f3]"
          >
            Cerrar
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="flex flex-wrap gap-2">
          <span className="bg-[#9f1d20]/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#9f1d20]">
            {detailDenuncia.categoria?.nombre || 'Sin categoría'}
          </span>
          <span className="bg-[#d4af37]/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#755f12]">
            {detailDenuncia.categoria?.area?.nombre || 'Sin área'}
          </span>
          <span className="border border-black/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-neutral-700">
            {detailDenuncia.historialEstados?.[0]?.estado?.nombre || 'SIN ESTADO'}
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="border border-black/10 bg-[#faf8f3] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">
              Fecha de registro
            </p>
            <p className="mt-2 text-sm font-semibold text-neutral-900">
              {formatDate(detailDenuncia.fechaCreacion)}
            </p>
          </div>

          <div className="border border-black/10 bg-[#faf8f3] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">
              Denunciante
            </p>
            <p className="mt-2 text-sm font-semibold text-neutral-900">
              {detailDenuncia.anonimo
                ? 'Anónimo'
                : `${detailDenuncia.nombresDenunciante || ''} ${detailDenuncia.apellidosDenunciante || ''}`.trim() ||
                  'No registrado'}
            </p>
          </div>

          <div className="border border-black/10 bg-[#faf8f3] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">
              Celular
            </p>
            <p className="mt-2 text-sm font-semibold text-neutral-900">
              {detailDenuncia.celularContacto || 'No disponible'}
            </p>
          </div>

          <div className="border border-black/10 bg-[#faf8f3] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">
              Dirección
            </p>
            <p className="mt-2 text-sm font-semibold text-neutral-900">
              {detailDenuncia.direccionTexto || 'No especificada'}
            </p>
          </div>

          <div className="border border-black/10 bg-[#faf8f3] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">
              Latitud
            </p>
            <p className="mt-2 text-sm font-semibold text-neutral-900">
              {detailDenuncia.latitud ?? 'No disponible'}
            </p>
          </div>

          <div className="border border-black/10 bg-[#faf8f3] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">
              Longitud
            </p>
            <p className="mt-2 text-sm font-semibold text-neutral-900">
              {detailDenuncia.longitud ?? 'No disponible'}
            </p>
          </div>
        </div>

        <div className="mt-6 border border-black/10 bg-white p-5">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#9f1d20]">
            Descripción completa
          </p>
          <p className="mt-3 text-sm leading-7 text-neutral-700">
            {detailDenuncia.descripcion || 'No disponible'}
          </p>
        </div>

        {detailDenuncia.archivos?.length > 0 && (
          <div className="mt-6 border border-black/10 bg-white p-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#9f1d20]">
                Archivos de la denuncia
              </p>
              <span className="text-sm font-semibold text-neutral-600">
                {detailDenuncia.archivos.length} archivo(s)
              </span>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {detailDenuncia.archivos.map((file) => (
                <div
                  key={file.id}
                  className="border border-black/10 bg-[#faf8f3] p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">
                        {file.nombreOriginal || 'Archivo adjunto'}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {getFileLabel(file.tipoArchivo)}
                      </p>
                    </div>

                    <a
                      href={getFileUrl(file.urlArchivo)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center border border-[#9f1d20] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#9f1d20] transition hover:bg-[#9f1d20] hover:text-white"
                    >
                      Ver archivo
                    </a>
                  </div>

                  {isImageFile(file.tipoArchivo) && (
                    <img
                      src={getFileUrl(file.urlArchivo)}
                      alt={file.nombreOriginal || 'Archivo de denuncia'}
                      className="mt-4 h-auto w-full border border-black/10 object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {detailDenuncia.soluciones?.length > 0 && (
          <div className="mt-6 border border-black/10 bg-white p-5">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#9f1d20]">
              Solución registrada
            </p>

            <div className="mt-4 border border-black/10 bg-[#faf8f3] p-4">
              <p className="text-sm font-semibold text-neutral-900">
                {detailDenuncia.soluciones[0].titulo}
              </p>
              <p className="mt-3 text-sm leading-7 text-neutral-700">
                {detailDenuncia.soluciones[0].descripcion}
              </p>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {detailDenuncia.soluciones[0].archivos.map((file) => (
                <div
                  key={file.id}
                  className="border border-black/10 bg-[#faf8f3] p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">
                        {file.nombreOriginal || 'Archivo de solución'}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {getFileLabel(file.tipoArchivo)}
                      </p>
                    </div>

                    <a
                      href={getFileUrl(file.urlArchivo)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center border border-[#9f1d20] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#9f1d20] transition hover:bg-[#9f1d20] hover:text-white"
                    >
                      Ver archivo
                    </a>
                  </div>

                  {isImageFile(file.tipoArchivo) && (
                    <img
                      src={getFileUrl(file.urlArchivo)}
                      alt={file.nombreOriginal || 'Archivo de solución'}
                      className="mt-4 h-auto w-full border border-black/10 object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {detailDenuncia.historialEstados?.length > 0 && (
          <div className="mt-6 border border-black/10 bg-white p-5">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#9f1d20]">
              Historial de estados
            </p>

            <div className="mt-4 space-y-3">
              {detailDenuncia.historialEstados.map((item) => (
                <div
                  key={item.id}
                  className="border border-black/10 bg-[#faf8f3] px-4 py-3"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm font-bold text-neutral-900">
                      {item.estado.nombre}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {formatDate(item.fechaCambio)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end border-t border-black/10 pt-5">
          <button
            type="button"
            onClick={closeDetailModal}
            className="border border-black/10 px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-[#faf8f3]"
          >
            Cerrar detalle
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      {selectedDenuncia && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="max-h-[95vh] w-full max-w-3xl overflow-y-auto border border-black/10 bg-white shadow-2xl">
            <div className="border-b border-black/10 px-6 py-5">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#9f1d20]">
                Gestión de estado
              </p>
              <h2 className="mt-2 text-2xl font-bold text-neutral-900">
                Actualizar denuncia
              </h2>
              <p className="mt-3 text-sm leading-7 text-neutral-600">
                Estado actual:{' '}
                <span className="font-semibold text-neutral-900">
                  {selectedDenuncia.historialEstados?.[0]?.estado?.nombre || 'SIN ESTADO'}
                </span>
              </p>
            </div>

            <div className="px-6 py-5">
              {modalError && (
                <div className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {modalError}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-neutral-800">
                    Siguiente estado
                  </label>
                  <select
                    value={selectedEstadoId}
                    onChange={(e) => setSelectedEstadoId(e.target.value)}
                    className="w-full border border-black/15 bg-white px-4 py-3 outline-none"
                  >
                    <option value="">Selecciona un estado</option>
                    {availableTransitions.map((estado) => (
                      <option key={estado.estadoId} value={estado.estadoId}>
                        {estado.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-neutral-800">
                    Comentario (opcional)
                  </label>
                  <textarea
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    rows={3}
                    className="w-full resize-none border border-black/15 bg-white px-4 py-3 outline-none"
                    placeholder="Añade un comentario del cambio de estado"
                  />
                </div>

                {necesitaSolucion && (
                  <div className="space-y-5 border border-[#9f1d20]/15 bg-[#faf8f3] p-5">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#9f1d20]">
                        Solución obligatoria
                      </p>
                      <p className="mt-2 text-sm leading-7 text-neutral-600">
                        Para cerrar la denuncia como SOLUCIONADO o RECHAZADO debes
                        registrar la solución y asegurarte de que tenga al menos un archivo.
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-neutral-800">
                        Título de la solución
                      </label>
                      <input
                        type="text"
                        value={solucionTitulo}
                        onChange={(e) => setSolucionTitulo(e.target.value)}
                        className="w-full border border-black/15 bg-white px-4 py-3 outline-none"
                        placeholder="Ej. Intervención realizada"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-neutral-800">
                        Descripción de la solución
                      </label>
                      <textarea
                        value={solucionDescripcion}
                        onChange={(e) => setSolucionDescripcion(e.target.value)}
                        rows={4}
                        className="w-full resize-none border border-black/15 bg-white px-4 py-3 outline-none"
                        placeholder="Describe la solución o el motivo del rechazo"
                      />
                    </div>

                    <div className="rounded-none border border-black/10 bg-white p-4">
                      <p className="text-sm font-semibold text-neutral-900">
                        Archivos actuales de la solución: {totalArchivosExistentes}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        Puedes tener hasta 3 archivos en total.
                      </p>

                      <label className="mt-4 inline-flex cursor-pointer items-center justify-center bg-[#9f1d20] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#86181b]">
                        Seleccionar archivos
                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                          onChange={handleInputFiles}
                          className="hidden"
                        />
                      </label>

                      <div className="mt-4 space-y-3">
                        {solucionFiles.length === 0 ? (
                          <p className="text-sm text-neutral-500">
                            No seleccionaste archivos nuevos.
                          </p>
                        ) : (
                          solucionFiles.map((file, index) => (
                            <div
                              key={`${file.name}-${index}`}
                              className="flex flex-col gap-3 border border-black/10 bg-[#faf8f3] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div>
                                <p className="text-sm font-semibold text-neutral-900">
                                  {file.name}
                                </p>
                                <p className="text-xs text-neutral-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeModalFile(index)}
                                className="border border-red-200 px-3 py-2 text-xs font-bold uppercase tracking-wide text-red-700 transition hover:bg-red-50"
                              >
                                Quitar
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 border-t border-black/10 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={resetModal}
                    className="border border-black/10 px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-[#faf8f3]"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={handleGestionar}
                    disabled={actionLoading}
                    className="bg-[#9f1d20] px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#86181b] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {actionLoading ? 'Procesando...' : 'Guardar cambio'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}