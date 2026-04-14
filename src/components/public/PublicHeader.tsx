import Image from 'next/image'
import Link from 'next/link'

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#22B7F2]/15 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden sm:h-20 sm:w-20">
            <Image
              src="/logo2.png"
              alt="Logo El Alto te Escucha"
              fill
              sizes="80px"
              className="object-contain"
              priority
            />
          </div>

          <div className="leading-tight">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#22B7F2] sm:text-xs">
              Canal de atención ciudadana
            </p>
            <h1 className="text-lg font-extrabold text-slate-900 sm:text-2xl">
              El Alto te Escucha
            </h1>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="/"
            className="text-sm font-medium text-slate-600 transition hover:text-[#F01D67]"
          >
            Inicio
          </a>
          <a
            href="#como-funciona"
            className="text-sm font-medium text-slate-600 transition hover:text-[#F01D67]"
          >
            Cómo funciona
          </a>
          <a
            href="#solucionadas"
            className="text-sm font-medium text-slate-600 transition hover:text-[#F01D67]"
          >
            Solucionadas
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#22B7F2] hover:text-[#22B7F2] sm:inline-flex"
          >
            Iniciar sesión
          </Link>

          <Link
            href="/seguimiento"
            className="hidden rounded-xl border border-[#22B7F2] bg-[#22B7F2]/8 px-4 py-2 text-sm font-semibold text-[#22B7F2] transition hover:bg-[#22B7F2] hover:text-white lg:inline-flex"
          >
            Seguimiento
          </Link>

          <Link
            href="/denunciar"
            className="inline-flex items-center justify-center rounded-xl bg-[#F01D67] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(240,29,103,0.25)] transition hover:-translate-y-0.5 hover:bg-[#d8185b]"
          >
            Denunciar
          </Link>
        </div>
      </div>

      <div className="h-[3px] w-full bg-gradient-to-r from-[#22B7F2] via-[#F2DEA2] to-[#F01D67]" />
    </header>
  )
}