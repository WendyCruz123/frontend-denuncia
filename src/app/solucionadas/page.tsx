'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import PublicHeader from '@/components/public/PublicHeader'
import PublicFooter from '@/components/public/PublicFooter'
import { getDenunciasSolucionadasPublicas } from '@/services/public.service'
import { PublicArchivo, PublicDenuncia } from '@/types/public'

function formatDate(date?: string) {
  if (!date) return 'Fecha no disponible'

  return new Intl.DateTimeFormat('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

function truncateText(text: string, max = 220) {
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

function getFileLabel(file: PublicArchivo) {
  if (isImageFile(file.tipoArchivo)) return 'Imagen'
  if (isVideoFile(file.tipoArchivo)) return 'Video'
  if (isAudioFile(file.tipoArchivo)) return 'Audio'
  if (file.tipoArchivo === 'application/pdf') return 'PDF'
  if (
    file.tipoArchivo === 'application/msword' ||
    file.tipoArchivo ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return 'Word'
  }
  return 'Archivo'
}

export default function SolucionadasPage() {
  const [denuncias, setDenuncias] = useState<PublicDenuncia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await getDenunciasSolucionadasPublicas()
        setDenuncias(data)
      } catch (err) {
        console.error(err)
        setError('No se pudo cargar la lista pública de denuncias solucionadas.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredDenuncias = useMemo(() => {
    const term = search.trim().toLowerCase()

    if (!term) return denuncias

    return denuncias.filter((denuncia) => {
      const categoria = denuncia.categoria?.nombre?.toLowerCase() || ''
      const area = denuncia.categoria?.area?.nombre?.toLowerCase() || ''
      const descripcion = denuncia.descripcion?.toLowerCase() || ''
      const direccion = denuncia.direccionTexto?.toLowerCase() || ''
      const tituloSolucion = denuncia.soluciones?.[0]?.titulo?.toLowerCase() || ''
      const descripcionSolucion =
        denuncia.soluciones?.[0]?.descripcion?.toLowerCase() || ''

      return (
        categoria.includes(term) ||
        area.includes(term) ||
        descripcion.includes(term) ||
        direccion.includes(term) ||
        tituloSolucion.includes(term) ||
        descripcionSolucion.includes(term)
      )
    })
  }, [denuncias, search])

  return (
    <main className="min-h-screen bg-[#f7f4ee]">
      <PublicHeader />

      <section className="bg-gradient-to-br from-[#7f1417] via-[#9f1d20] to-[#c52a2e]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="inline-block border border-[#d4af37]/50 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-[#f3d67a]">
            Consulta pública
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            Denuncias solucionadas
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-white/85 sm:text-lg">
            Consulta los casos que ya cuentan con solución registrada y archivos
            publicados para acceso ciudadano.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="border border-black/10 bg-white p-4 shadow-sm">
            <label className="mb-2 block text-sm font-semibold text-neutral-800">
              Buscar en denuncias solucionadas
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por categoría, área, descripción o solución"
              className="w-full border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#9f1d20]"
            />
          </div>

          <div className="border border-black/10 bg-white p-4 shadow-sm flex items-center justify-center min-w-[220px]">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#9f1d20]">
                Total visible
              </p>
              <p className="mt-3 text-4xl font-extrabold text-neutral-900">
                {loading ? '...' : filteredDenuncias.length}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="h-80 animate-pulse border border-black/10 bg-white" />
            <div className="h-80 animate-pulse border border-black/10 bg-white" />
            <div className="h-80 animate-pulse border border-black/10 bg-white" />
            <div className="h-80 animate-pulse border border-black/10 bg-white" />
          </div>
        ) : filteredDenuncias.length === 0 ? (
          <div className="border border-black/10 bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-neutral-900">
              No se encontraron denuncias solucionadas
            </h2>
            <p className="mt-4 text-sm leading-7 text-neutral-600">
              No hay registros públicos disponibles con los filtros actuales.
            </p>

            <Link
              href="/"
              className="mt-6 inline-flex items-center justify-center bg-[#9f1d20] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#86181b]"
            >
              Volver al inicio
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {filteredDenuncias.map((denuncia) => {
              const solucion = denuncia.soluciones?.[0]
              const archivos = solucion?.archivos || []

              return (
                <article
                  key={denuncia.id}
                  className="border border-black/10 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-[#9f1d20]/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#9f1d20]">
                      {denuncia.categoria?.nombre || 'Sin categoría'}
                    </span>
                    <span className="bg-[#d4af37]/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#755f12]">
                      {denuncia.categoria?.area?.nombre || 'Sin área'}
                    </span>
                    <span className="border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                      SOLUCIONADO
                    </span>
                  </div>

                  <h2 className="mt-4 text-2xl font-bold text-neutral-900">
                    {solucion?.titulo?.trim() || 'Resultado publicado'}
                  </h2>

                  <div className="mt-4 grid gap-2 text-sm text-neutral-600">
                    <p>
                      <span className="font-semibold text-neutral-900">Fecha:</span>{' '}
                      {formatDate(denuncia.fechaCreacion)}
                    </p>
                    <p>
                      <span className="font-semibold text-neutral-900">Ubicación:</span>{' '}
                      {denuncia.direccionTexto?.trim() || 'No especificada'}
                    </p>
                  </div>

                  <div className="mt-5">
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#9f1d20]">
                      Descripción de la denuncia
                    </p>
                    <p className="mt-3 text-sm leading-7 text-neutral-700">
                      {truncateText(denuncia.descripcion)}
                    </p>
                  </div>

                  {solucion?.descripcion && (
                    <div className="mt-5 border-t border-black/10 pt-5">
                      <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#9f1d20]">
                        Solución registrada
                      </p>
                      <p className="mt-3 text-sm leading-7 text-neutral-700">
                        {solucion.descripcion}
                      </p>
                    </div>
                  )}

                  <div className="mt-5 border-t border-black/10 pt-5">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#9f1d20]">
                        Archivos publicados
                      </p>
                      <span className="text-sm font-semibold text-neutral-600">
                        {archivos.length} archivo(s)
                      </span>
                    </div>

                    {archivos.length === 0 ? (
                      <p className="mt-3 text-sm text-neutral-500">
                        No hay archivos publicados para este caso.
                      </p>
                    ) : (
                      <div className="mt-4 grid gap-3">
                        {archivos.map((file) => (
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
                                  {getFileLabel(file)}
                                </p>
                              </div>

                              <a
                                href={`${process.env.NEXT_PUBLIC_API_URL}${file.urlArchivo}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center border border-[#9f1d20] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#9f1d20] transition hover:bg-[#9f1d20] hover:text-white"
                              >
                                Ver archivo
                              </a>
                            </div>

                            {isImageFile(file.tipoArchivo) && (
                              <img
                                src={`${process.env.NEXT_PUBLIC_API_URL}${file.urlArchivo}`}
                                alt={file.nombreOriginal || 'Archivo de solución'}
                                className="mt-4 h-auto w-full border border-black/10 object-cover"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <PublicFooter />
    </main>
  )
}