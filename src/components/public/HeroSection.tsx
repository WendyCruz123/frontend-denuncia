import Link from 'next/link'

interface HeroSectionProps {
  totalSolucionadas: number
}

export default function HeroSection({ totalSolucionadas }: HeroSectionProps) {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-[linear-gradient(135deg,#eef9ff_0%,#fffef8_100%)]"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-[260px] -top-[220px] h-[1200px] w-[1200px] rounded-full bg-[#22B7F2]/55 blur-[220px]" />
        <div className="absolute -right-[260px] -top-[80px] h-[1200px] w-[1200px] rounded-full bg-[#F2DEA2]/85 blur-[220px]" />
        <div className="absolute left-1/2 top-1/2 h-[1000px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#22B7F2]/18 blur-[200px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(34,183,242,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,183,242,0.04)_1px,transparent_1px)] bg-[size:42px_42px]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-20">
        <div className="max-w-3xl">
          <p className="inline-flex rounded-full border border-[#22B7F2]/25 bg-white/55 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#168ec0] shadow-sm backdrop-blur-sm">
            Atención ciudadana
          </p>

          <h2 className="mt-6 text-4xl font-extrabold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Denuncias ciudadanas con registro claro y seguimiento simple
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
            Presenta tu denuncia de forma ordenada y consulta su estado con tu código de seguimiento.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/denunciar"
              className="inline-flex items-center justify-center rounded-xl bg-[#F01D67] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-[0_14px_30px_rgba(240,29,103,0.24)] transition hover:-translate-y-0.5 hover:bg-[#d8185b]"
            >
              Realizar denuncia
            </Link>

            <Link
              href="/seguimiento"
              className="inline-flex items-center justify-center rounded-xl border border-[#22B7F2] bg-white/70 px-6 py-3 text-sm font-bold uppercase tracking-wide text-[#22B7F2] shadow-sm backdrop-blur-sm transition hover:bg-[#22B7F2] hover:text-white"
            >
              Seguimiento
            </Link>
          </div>
        </div>

        <div className="grid gap-5">
          <div className="rounded-[24px] border border-[#22B7F2]/15 bg-white/80 p-7 shadow-[0_18px_40px_rgba(34,183,242,0.10)] backdrop-blur-sm">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#22B7F2]">
              Casos publicados
            </p>
            <p className="mt-3 text-5xl font-extrabold text-slate-950">
              {totalSolucionadas}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              denuncias solucionadas visibles para consulta pública.
            </p>
          </div>

          <div className="rounded-[24px] bg-[#F01D67] p-7 shadow-[0_20px_45px_rgba(240,29,103,0.28)]">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-white/85">
              Flujo
            </p>

            <div className="mt-5 grid gap-3 text-sm text-white">
              <div className="flex items-center justify-between rounded-xl bg-white/14 px-4 py-3 backdrop-blur-sm">
                <span>Registro</span>
                <span className="font-bold">RECIBIDO</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/14 px-4 py-3 backdrop-blur-sm">
                <span>Atención</span>
                <span className="font-bold">EN PROCESO</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/14 px-4 py-3 backdrop-blur-sm">
                <span>Resultado</span>
                <span className="font-bold">SOLUCIONADO</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}