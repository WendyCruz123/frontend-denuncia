import Link from 'next/link'

interface PublicStatsProps {
  totalSolucionadas: number
}

export default function PublicStats({ totalSolucionadas }: PublicStatsProps) {
  return (
    <section className="bg-[#f8fafc]">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#F01D67]">
            Transparencia pública
          </p>
          <h3 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
            Resultados publicados para consulta ciudadana
          </h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Revisa los casos que ya cuentan con resolución y publicación.
          </p>
        </div>

        <Link
          href="/solucionadas"
          className="group rounded-2xl border border-[#22B7F2]/20 bg-[#22B7F2] p-6 text-white shadow-[0_12px_32px_rgba(34,183,242,0.18)] transition hover:-translate-y-0.5 hover:bg-[#169fdb]"
        >
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#F2DEA2]">
            Consulta pública
          </p>

          <div className="mt-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-5xl font-extrabold">{totalSolucionadas}</p>
              <p className="mt-2 text-sm text-white/90">
                casos solucionados visibles
              </p>
            </div>

            <span className="text-sm font-semibold uppercase tracking-wide text-[#F2DEA2] transition group-hover:translate-x-1">
              Ver detalle →
            </span>
          </div>
        </Link>
      </div>
    </section>
  )
}