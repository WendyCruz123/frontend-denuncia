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

function truncateText(text: string, max = 180) {
  if (text.length <= max) return text
  return `${text.slice(0, max)}...`
}

export default function PublicSolvedPreview({
  denuncias,
}: PublicSolvedPreviewProps) {
  const preview = denuncias.slice(0, 3)

  return (
    <section id="solucionadas" className="bg-[#f7f4ee]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#9f1d20]">
              Casos publicados
            </p>
            <h3 className="mt-3 text-3xl font-bold text-neutral-900 sm:text-4xl">
              Vista previa de denuncias solucionadas
            </h3>
            <p className="mt-4 text-sm leading-7 text-neutral-600 sm:text-base">
              Consulta algunos casos con resultado publicado y accede al detalle
              completo desde la sección pública correspondiente.
            </p>
          </div>

          <Link
            href="/solucionadas"
            className="inline-flex items-center justify-center border border-[#9f1d20] px-5 py-3 text-sm font-bold uppercase tracking-wide text-[#9f1d20] transition hover:bg-[#9f1d20] hover:text-white"
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
                className="border border-black/10 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap gap-2">
                  <span className="bg-[#9f1d20]/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#9f1d20]">
                    {denuncia.categoria?.nombre ?? 'Sin categoría'}
                  </span>
                  <span className="bg-[#d4af37]/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#755f12]">
                    {denuncia.categoria?.area?.nombre ?? 'Sin área'}
                  </span>
                </div>

                <h4 className="mt-4 text-xl font-bold text-neutral-900">
                  {solucion?.titulo?.trim() || 'Resultado publicado'}
                </h4>

                <p className="mt-4 text-sm leading-7 text-neutral-600">
                  {truncateText(denuncia.descripcion)}
                </p>

                <div className="mt-6 space-y-2 border-t border-black/10 pt-4 text-sm text-neutral-600">
                  <p>
                    <span className="font-semibold text-neutral-900">Fecha:</span>{' '}
                    {formatDate(denuncia.fechaCreacion)}
                  </p>
                  <p>
                    <span className="font-semibold text-neutral-900">Ubicación:</span>{' '}
                    {denuncia.direccionTexto?.trim() || 'No especificada'}
                  </p>
                  <p>
                    <span className="font-semibold text-neutral-900">Archivos de solución:</span>{' '}
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