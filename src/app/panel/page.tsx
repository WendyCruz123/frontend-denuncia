'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, isAuthenticated, logout } from '@/lib/auth'

export default function PanelPage() {
  const router = useRouter()

  const user = useMemo(() => getUser(), [])

  useEffect(() => {
    if (!isAuthenticated() || !user) {
      logout()
      router.replace('/login')
      return
    }

    const roles = user.roles || []

    if (roles.includes('ADMIN')) {
      router.replace('/panel/admin')
      return
    }

    if (roles.includes('FUNCIONARIO')) {
      router.replace('/panel/funcionario')
      return
    }

    logout()
    router.replace('/login')
  }, [router, user])

  return (
    <main className="min-h-screen bg-[#f7f4ee] flex items-center justify-center px-4">
      <div className="border border-black/10 bg-white p-8 shadow-sm text-center max-w-md w-full">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#9f1d20]">
          Panel interno
        </p>
        <h1 className="mt-3 text-2xl font-bold text-neutral-900">
          Redirigiendo...
        </h1>
        <p className="mt-4 text-sm leading-7 text-neutral-600">
          Estamos identificando el rol del usuario para cargar la vista correspondiente.
        </p>
      </div>
    </main>
  )
}