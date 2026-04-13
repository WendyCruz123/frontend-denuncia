'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import PanelShell from '@/components/panel/PanelShell'
import { getUser, isAuthenticated, logout } from '@/lib/auth'
import { AuthUser } from '@/types/auth'
import {
  AgrupadoPorEstadoResponse,
  PanelArea,
  PanelCategoria,
  PanelDenuncia,
  PanelFilters,
  ResumenPorEstadoItem,
} from '@/types/panel'
import {
  getAgrupadoPorEstado,
  getAreas,
  getCategorias,
  getResumenGeneral,
  getResumenPorEstado,
} from '@/services/panel.service'
import { generarReporteDenuncias } from '@/lib/reportes'

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

function getEstadoTotal(items: ResumenPorEstadoItem[], estadoNombre: string) {
  return items.find((item) => item.nombre === estadoNombre)?.total ?? 0
}

export default function PanelAdminPage() {
  const router = useRouter()

  const [user, setUser] = useState<AuthUser | null>(null)
  const [areas, setAreas] = useState<PanelArea[]>([])
  const [categorias, setCategorias] = useState<PanelCategoria[]>([])
  const [resumenPorEstado, setResumenPorEstado] = useState<ResumenPorEstadoItem[]>([])
  const [agrupado, setAgrupado] = useState<AgrupadoPorEstadoResponse>({})
  const [totalDenuncias, setTotalDenuncias] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)

  const [filters, setFilters] = useState<PanelFilters>({
    areaId: '',
    categoriaId: '',
  })

  useEffect(() => {
    const currentUser = getUser()

    if (!isAuthenticated() || !currentUser) {
      logout()
      router.replace('/login')
      return
    }

    if (!currentUser.roles?.includes('ADMIN')) {
      router.replace('/panel')
      return
    }

    setUser(currentUser)
    setLoading(false)
  }, [router])

  useEffect(() => {
    if (!user) return

    const loadCatalogs = async () => {
      try {
        const [areasData, categoriasData] = await Promise.all([
          getAreas(),
          getCategorias(),
        ])
        setAreas(areasData)
        setCategorias(categoriasData)
      } catch (err) {
        console.error(err)
        setError('No se pudieron cargar áreas y categorías.')
      }
    }

    loadCatalogs()
  }, [user])

  useEffect(() => {
    if (!user) return

    const loadDashboard = async () => {
      try {
        setLoadingData(true)
        setError('')

        const normalizedFilters: PanelFilters = {
          areaId: filters.areaId || undefined,
          categoriaId: filters.categoriaId || undefined,
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

    loadDashboard()
  }, [user, filters])

  const categoriasFiltradas = useMemo(() => {
    if (!filters.areaId) return categorias

    return categorias.filter((categoria) => categoria.areaId === filters.areaId)
  }, [categorias, filters.areaId])

  const orderedSections = useMemo(() => {
    const ordered = [...resumenPorEstado].sort((a, b) => a.orden - b.orden)
    return ordered.map((item) => item.nombre)
  }, [resumenPorEstado])

  const allVisibleDenuncias = useMemo(() => {
    return Object.values(agrupado).flat() as PanelDenuncia[]
  }, [agrupado])

  const selectedArea = useMemo(() => {
    return areas.find((area) => area.id === filters.areaId) || null
  }, [areas, filters.areaId])

  const selectedCategoria = useMemo(() => {
    return categorias.find((categoria) => categoria.id === filters.categoriaId) || null
  }, [categorias, filters.categoriaId])

  const filtrosTexto = useMemo(() => {
    const partes: string[] = []

    if (selectedArea) {
      partes.push(`Área: ${selectedArea.nombre}`)
    }

    if (selectedCategoria) {
      partes.push(`Categoría: ${selectedCategoria.nombre}`)
    }

    return partes.length > 0 ? partes.join(' | ') : 'Sin filtros'
  }, [selectedArea, selectedCategoria])

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const { name, value } = e.target

    setFilters((prev) => {
      const next = {
        ...prev,
        [name]: value,
      }

      if (name === 'areaId') {
        next.categoriaId = ''
      }

      return next
    })
  }

  const clearFilters = () => {
    setFilters({
      areaId: '',
      categoriaId: '',
    })
  }

  const handleGenerarPdf = async () => {
    try {
      setPdfLoading(true)

      await generarReporteDenuncias({
        denuncias: allVisibleDenuncias,
        titulo: 'Reporte General de Denuncias',
        subtitulo: 'Panel de Administración',
        filtros: filtrosTexto,
      })
    } catch (err) {
      console.error(err)
      setError('No se pudo generar el reporte PDF.')
    } finally {
      setPdfLoading(false)
    }
  }

  if (loading || !user) {
    return (
      <main className="min-h-screen bg-[#f5f2eb] flex items-center justify-center px-4">
        <div className="border border-black/10 bg-white p-8 shadow-sm text-center">
          <p className="text-sm text-neutral-600">
            Cargando panel de administración...
          </p>
        </div>
      </main>
    )
  }

  return (
    <PanelShell
      title="Dashboard de Administración"
      subtitle="Consulta general de denuncias, filtros y reportes globales."
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
                Área
              </label>
              <select
                name="areaId"
                value={filters.areaId}
                onChange={handleFilterChange}
                className="w-full border border-black/15 bg-white px-4 py-3 outline-none"
              >
                <option value="">Todas las áreas</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-neutral-800">
                Categoría
              </label>
              <select
                name="categoriaId"
                value={filters.categoriaId}
                onChange={handleFilterChange}
                className="w-full border border-black/15 bg-white px-4 py-3 outline-none"
              >
                <option value="">Todas las categorías</option>
                {categoriasFiltradas.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre} — {categoria.area.nombre}
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
              onClick={handleGenerarPdf}
              disabled={pdfLoading || loadingData || allVisibleDenuncias.length === 0}
              className="w-full bg-[#9f1d20] px-4 py-3 text-sm font-bold uppercase tracking-[0.15em] text-white transition hover:bg-[#86181b] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pdfLoading ? 'Generando PDF...' : 'Generar reporte PDF'}
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
                    <h2 className="text-lg font-bold text-neutral-900">
                      {estado}
                    </h2>
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
  )
}