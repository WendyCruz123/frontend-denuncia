import Link from 'next/link'

export default function PublicFooter() {
  return (
    <footer className="border-t border-black/10 bg-neutral-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#d4af37]">
            El Alto te Escucha
          </p>
          <h4 className="mt-3 text-2xl font-bold">
            Plataforma pública de denuncias ciudadanas
          </h4>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
            Sistema orientado al registro, seguimiento y publicación de resultados
            de denuncias para fortalecer la atención institucional.
          </p>
        </div>

        <div className="grid gap-3 content-start">
          <Link
            href="/denunciar"
            className="text-sm font-medium text-white/80 transition hover:text-[#d4af37]"
          >
            Realizar denuncia
          </Link>
          <Link
            href="/solucionadas"
            className="text-sm font-medium text-white/80 transition hover:text-[#d4af37]"
          >
            Denuncias solucionadas
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-white/80 transition hover:text-[#d4af37]"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </footer>
  )
}