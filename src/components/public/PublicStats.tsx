import Link from 'next/link'

interface PublicStatsProps {
  totalSolucionadas: number
}

export default function PublicStats({ totalSolucionadas }: PublicStatsProps) {
  return (
    <section className="bg-[#f7f4ee]">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div className="border border-black/10 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#9f1d20]">
            Transparencia pública
          </p>
          <h3 className="mt-3 text-2xl font-bold text-neutral-900 sm:text-3xl">
            Denuncias solucionadas publicadas
          </h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">
            La ciudadanía puede consultar los casos que ya cuentan con solución
            registrada y archivos asociados, fortaleciendo la visibilidad del proceso.
          </p>
        </div>

        <Link
          href="/solucionadas"
          className="group border border-[#d4af37]/40 bg-[#9f1d20] p-6 text-white shadow-sm transition hover:bg-[#86181b]"
        >
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#f3d67a]">
            Consulta pública
          </p>
          <div className="mt-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-5xl font-extrabold">{totalSolucionadas}</p>
              <p className="mt-2 text-sm text-white/85">
                casos solucionados visibles
              </p>
            </div>

            <span className="text-sm font-semibold uppercase tracking-wide text-[#f3d67a] transition group-hover:translate-x-1">
              Ver detalle →
            </span>
          </div>
        </Link>
      </div>
    </section>
  )
}