import Link from 'next/link'

export default function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#22B7F2]">
            El Alto te Escucha
          </p>
          <h4 className="mt-3 text-2xl font-bold">
            Plataforma pública de denuncias ciudadanas
          </h4>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
            Registro, seguimiento y consulta pública de resultados.
          </p>
        </div>

        <div className="grid content-start gap-3">
          <Link
            href="/denunciar"
            className="text-sm font-medium text-white/80 transition hover:text-[#22B7F2]"
          >
            Realizar denuncia
          </Link>
          <Link
            href="/seguimiento"
            className="text-sm font-medium text-white/80 transition hover:text-[#22B7F2]"
          >
            Seguimiento
          </Link>
          <Link
            href="/solucionadas"
            className="text-sm font-medium text-white/80 transition hover:text-[#22B7F2]"
          >
            Denuncias solucionadas
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-white/80 transition hover:text-[#22B7F2]"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </footer>
  )
}