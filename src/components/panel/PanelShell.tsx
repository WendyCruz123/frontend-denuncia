'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthUser } from '@/types/auth'
import { logout } from '@/lib/auth'

interface PanelShellProps {
  title: string
  subtitle: string
  user: AuthUser
  children: React.ReactNode
}

export default function PanelShell({
  title,
  subtitle,
  user,
  children,
}: PanelShellProps) {
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <main className="min-h-screen bg-[#f5f2eb]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#9f1d20]">
              El Alto te Escucha
            </p>
            <h1 className="mt-1 text-2xl font-bold text-neutral-900">{title}</h1>
            <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="border border-black/10 bg-[#faf8f3] px-4 py-3 text-sm">
              <p className="font-semibold text-neutral-900">{user.username}</p>
              <p className="text-neutral-600">
                {user.roles?.join(', ') || 'Sin rol'}
                {user.area?.nombre ? ` · ${user.area.nombre}` : ''}
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center border border-black/10 px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-[#faf8f3]"
            >
              Ir al inicio
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center bg-[#9f1d20] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#86181b]"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </section>
    </main>
  )
}