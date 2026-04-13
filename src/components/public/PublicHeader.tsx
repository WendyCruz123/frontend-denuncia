import Image from 'next/image'
import Link from 'next/link'

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden">
            <Image
  src="/logo.png"
  alt="Logo El Alto te Escucha"
  fill
  sizes="48px"
  className="object-contain"
  priority
/>
          </div>

          <div className="leading-tight">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9f1d20]">
              Plataforma Ciudadana
            </p>
            <h1 className="text-base font-bold text-neutral-900 sm:text-lg">
              El Alto te Escucha
            </h1>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="/"
            className="text-sm font-medium text-neutral-700 transition hover:text-[#9f1d20]"
          >
            Inicio
          </a>
          <a
            href="#como-funciona"
            className="text-sm font-medium text-neutral-700 transition hover:text-[#9f1d20]"
          >
            Cómo funciona
          </a>
          <a
            href="#solucionadas"
            className="text-sm font-medium text-neutral-700 transition hover:text-[#9f1d20]"
          >
            Solucionadas
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden border border-[#9f1d20] px-4 py-2 text-sm font-semibold text-[#9f1d20] transition hover:bg-[#9f1d20] hover:text-white sm:inline-flex"
          >
            Iniciar sesión
          </Link>

          <Link
            href="/denunciar"
            className="inline-flex items-center justify-center bg-[#9f1d20] px-4 py-2 text-sm font-semibold text-white shadow-[0_0_0_0_rgba(159,29,32,0.35)] transition hover:bg-[#86181b] animate-pulse"
          >
            Denunciar
          </Link>
        </div>
      </div>
    </header>
  )
}