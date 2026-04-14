'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import PublicHeader from '@/components/public/PublicHeader'
import PublicFooter from '@/components/public/PublicFooter'
import { getSeguimientoDenuncia } from '../../services/seguimiento-public.service'
import {
  SeguimientoDenunciaResponse,
  SeguimientoHistorialItem,
} from '../../types/seguimiento-public'
function formatDate(date?: string | null) {
  if (!date) return 'No disponible'

  return new Intl.DateTimeFormat('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

function getEstadoClasses(estado?: string | null) {
  const value = (estado || '').toUpperCase()

  if (value.includes('RECIBIDO')) {
    return 'bg-[#22B7F2]/10 text-[#22B7F2] border border-[#22B7F2]/20'
  }

  if (value.includes('PROCESO')) {
    return 'bg-[#F2DEA2]/50 text-[#8a6200] border border-[#F2DEA2]'
  }

  if (value.includes('SOLUCIONADO')) {
    return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  }

  if (value.includes('RECHAZADO')) {
    return 'bg-[#F01D67]/10 text-[#F01D67] border border-[#F01D67]/20'
  }

  return 'bg-slate-100 text-slate-700 border border-slate-200'
}

export default function SeguimientoPage() {
  const [codigo, setCodigo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<SeguimientoDenunciaResponse | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!codigo.trim()) {
      setError('Debes ingresar tu código de seguimiento.')
      setResult(null)
      return
    }

    try {
      setLoading(true)
      setError('')
      const data = await getSeguimientoDenuncia(codigo.trim())
      setResult(data)
    } catch (err: any) {
      console.error(err)
      setResult(null)

      const backendMessage =
        err?.response?.data?.message ||
        'No se pudo consultar la denuncia. Verifica tu código e intenta nuevamente.'

      setError(
        Array.isArray(backendMessage)
          ? backendMessage.join(', ')
          : backendMessage,
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef9ff_0%,#fffef8_100%)]">
      <PublicHeader />

      <section className="relative overflow-hidden border-b border-[#22B7F2]/10">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-[220px] -top-[220px] h-[900px] w-[900px] rounded-full bg-[#22B7F2]/35 blur-[170px]" />
          <div className="absolute -right-[180px] -top-[120px] h-[850px] w-[850px] rounded-full bg-[#F2DEA2]/75 blur-[180px]" />
          <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#22B7F2]/10 blur-[160px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(34,183,242,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,183,242,0.04)_1px,transparent_1px)] bg-[size:42px_42px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-4xl">
            <p className="inline-flex rounded-full border border-[#22B7F2]/25 bg-white/60 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-[#168ec0] shadow-sm backdrop-blur-sm">
              Seguimiento ciudadano
            </p>

            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-slate-950 sm:text-5xl">
              Consulta el estado de tu denuncia
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-700 sm:text-lg">
              Ingresa tu código de seguimiento para ver el estado actual y los datos registrados.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[28px] border border-[#22B7F2]/12 bg-white/80 p-6 shadow-[0_20px_45px_rgba(34,183,242,0.08)] backdrop-blur-sm sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#22B7F2]">
              Buscar denuncia
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-950">
              Ingresa tu código
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              El código se entrega al finalizar el registro de la denuncia.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Código de seguimiento
                </label>
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  placeholder="Ej. DEN-2026-000123"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 uppercase outline-none transition focus:border-[#22B7F2] focus:ring-4 focus:ring-[#22B7F2]/10"
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#F01D67] px-6 py-4 text-sm font-bold uppercase tracking-[0.15em] text-white shadow-[0_14px_30px_rgba(240,29,103,0.22)] transition hover:bg-[#d8185b] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Consultando...' : 'Consultar estado'}
              </button>
            </form>

            <div className="mt-6 rounded-[24px] border border-[#F2DEA2] bg-[#F2DEA2]/45 p-5">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#9b6a00]">
                Importante
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                Verifica que el código esté escrito correctamente, respetando letras, números y guiones.
              </p>
            </div>

            <div className="mt-4">
              <Link
                href="/denunciar"
                className="inline-flex items-center justify-center rounded-xl border border-[#22B7F2] bg-white px-5 py-3 text-sm font-semibold text-[#22B7F2] transition hover:bg-[#22B7F2] hover:text-white"
              >
                Registrar nueva denuncia
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#22B7F2]/12 bg-white/80 p-6 shadow-[0_20px_45px_rgba(34,183,242,0.08)] backdrop-blur-sm sm:p-8">
            {!result ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#22B7F2]/10 text-2xl text-[#22B7F2]">
                  ⌕
                </div>
                <h3 className="text-2xl font-bold text-slate-950">
                  Sin consulta realizada
                </h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-slate-600">
                  Ingresa tu código de seguimiento para visualizar el estado y la información registrada de la denuncia.
                </p>
              </div>
            ) : (
<div>
  <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#22B7F2]">
        Resultado de la consulta
      </p>
      <h2 className="mt-2 text-2xl font-bold text-slate-950">
        Denuncia encontrada
      </h2>
    </div>

    <span
      className={`inline-flex w-fit rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] ${getEstadoClasses(
        result.estadoActual,
      )}`}
    >
      {result.estadoActual || 'SIN ESTADO'}
    </span>
  </div>

  <div className="mt-6 grid gap-4 md:grid-cols-2">
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
        Código
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-900">
        {result.codigoSeguimiento}
      </p>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
        Fecha de registro
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-900">
        {formatDate(result.denuncia.fechaCreacion)}
      </p>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
        Categoría
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-900">
        {result.denuncia.categoria || 'No disponible'}
      </p>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
        Área
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-900">
        {result.denuncia.area || 'No disponible'}
      </p>
    </div>
  </div>

  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
      Descripción
    </p>
    <p className="mt-2 text-sm leading-7 text-slate-700">
      {result.denuncia.descripcion || 'No disponible'}
    </p>
  </div>

  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
      Dirección o referencia
    </p>
    <p className="mt-2 text-sm text-slate-700">
      {result.denuncia.direccionTexto || 'No especificada'}
    </p>
  </div>

  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
      Tipo de denuncia
    </p>
    <p className="mt-2 text-sm text-slate-700">
      {result.denuncia.anonimo ? 'Denuncia anónima' : 'Denuncia identificada'}
    </p>
  </div>

  {result.denuncia.detalleCategoriaOtro && (
    <div className="mt-4 rounded-2xl border border-[#F2DEA2] bg-[#F2DEA2]/40 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9b6a00]">
        Detalle adicional
      </p>
      <p className="mt-2 text-sm leading-7 text-slate-700">
        {result.denuncia.detalleCategoriaOtro}
      </p>
    </div>
  )}

  {result.historialEstados.length > 0 && (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
        Historial de estados
      </p>

      <div className="mt-4 space-y-3">
        {result.historialEstados.map((item, index) => (
          <div
            key={`${item.estado}-${index}`}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-bold text-slate-900">
                {item.estado}
              </span>
              <span className="text-xs text-slate-500">
                {formatDate(item.fechaCambio)}
              </span>
            </div>

            {item.comentario && (
              <p className="mt-2 text-sm text-slate-600">{item.comentario}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )}
</div>
            )}
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  )
}