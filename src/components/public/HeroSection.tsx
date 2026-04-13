import Link from 'next/link'

interface HeroSectionProps {
  totalSolucionadas: number
}

export default function HeroSection({ totalSolucionadas }: HeroSectionProps) {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-gradient-to-br from-[#7f1417] via-[#9f1d20] to-[#c52a2e]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.20),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_30%)]" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-24">
        <div className="max-w-3xl">
          <p className="mb-4 inline-block border border-[#d4af37]/50 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-[#f3d67a]">
            Atención ciudadana
          </p>

          <h2 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
            Sistema público de recepción y seguimiento de denuncias
          </h2>

          <p className="mt-6 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
            Registra denuncias ciudadanas de forma rápida, segura y ordenada. La
            plataforma permite reportar problemas, consultar resultados públicos y
            fortalecer la atención institucional.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/denunciar"
              className="inline-flex items-center justify-center bg-[#d4af37] px-6 py-3 text-sm font-bold uppercase tracking-wide text-neutral-900 transition hover:bg-[#e2bf4d]"
            >
              Realizar denuncia
            </Link>

            <Link
              href="/solucionadas"
              className="inline-flex items-center justify-center border border-white/50 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-white hover:text-[#9f1d20]"
            >
              Ver denuncias solucionadas
            </Link>
          </div>
        </div>

        <div className="flex items-stretch">
          <div className="grid w-full gap-4">
            <div className="border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f3d67a]">
                Total público
              </p>
              <p className="mt-3 text-5xl font-extrabold text-white">
                {totalSolucionadas}
              </p>
              <p className="mt-3 text-sm leading-6 text-white/85">
                denuncias con resultado publicado y visibles para consulta pública.
              </p>
            </div>

            <div className="border border-white/15 bg-black/10 p-6 backdrop-blur-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f3d67a]">
                Flujo institucional
              </p>

              <div className="mt-4 grid gap-3 text-sm text-white/90">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span>1. Registro</span>
                  <span className="font-semibold">RECIBIDO</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span>2. Atención</span>
                  <span className="font-semibold">EN PROCESO</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>3. Resultado</span>
                  <span className="font-semibold">SOLUCIONADO / RECHAZADO</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}