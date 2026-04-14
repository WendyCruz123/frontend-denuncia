import Link from 'next/link'
import { PublicDenuncia } from '@/types/public'

interface PublicSolvedPreviewProps {
  denuncias: PublicDenuncia[]
}

function formatDate(date?: string) {
  if (!date) return 'Fecha no disponible'

  return new Intl.DateTimeFormat('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

function truncateText(text: string, max = 120) {
  if (text.length <= max) return text
  return `${text.slice(0, max)}...`
}

export default function PublicSolvedPreview({
  denuncias,
}: PublicSolvedPreviewProps) {
  const preview = denuncias.slice(0, 3)

  return (
    <section id="solucionadas" className="bg-[#f8fafc]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#F01D67]">
              Casos publicados
            </p>
            <h3 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              Denuncias solucionadas
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              Consulta algunos resultados publicados recientemente.
            </p>
          </div>

          <Link
            href="/solucionadas"
            className="inline-flex items-center justify-center rounded-md border border-[#F01D67] px-5 py-3 text-sm font-bold uppercase tracking-wide text-[#F01D67] transition hover:bg-[#F01D67] hover:text-white"
          >
            Ver todas
          </Link>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {preview.map((denuncia) => {
            const solucion = denuncia.soluciones?.[0]
            const totalArchivos = solucion?.archivos?.length ?? 0

            return (
              <article
                key={denuncia.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1"
              >
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#22B7F2]/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#22B7F2]">
                    {denuncia.categoria?.nombre ?? 'Sin categoría'}
                  </span>
                  <span className="rounded-full bg-[#F2DEA2]/50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#7a5b00]">
                    {denuncia.categoria?.area?.nombre ?? 'Sin área'}
                  </span>
                </div>

                <h4 className="mt-4 text-xl font-bold text-slate-900">
                  {solucion?.titulo?.trim() || 'Resultado publicado'}
                </h4>

                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {truncateText(denuncia.descripcion)}
                </p>

                <div className="mt-6 space-y-2 border-t border-slate-200 pt-4 text-sm text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-900">Fecha:</span>{' '}
                    {formatDate(denuncia.fechaCreacion)}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Ubicación:</span>{' '}
                    {denuncia.direccionTexto?.trim() || 'No especificada'}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Archivos:</span>{' '}
                    {totalArchivos}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}