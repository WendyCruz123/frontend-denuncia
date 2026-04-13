'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PublicHeader from '@/components/public/PublicHeader'
import PublicFooter from '@/components/public/PublicFooter'
import { loginRequest } from '@/services/auth.service'
import { saveToken, saveUser } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    username: '',
    password: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await loginRequest({
        username: form.username.trim(),
        password: form.password,
      })

      saveToken(response.access_token)
      saveUser(response.user)

      router.push('/panel')
    } catch (err: any) {
      console.error(err)

      const backendMessage =
        err?.response?.data?.message || 'No se pudo iniciar sesión.'

      setError(
        Array.isArray(backendMessage)
          ? backendMessage.join(', ')
          : backendMessage,
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee]">
      <PublicHeader />

      <section className="bg-gradient-to-br from-[#7f1417] via-[#9f1d20] to-[#c52a2e]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="inline-block border border-[#d4af37]/50 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-[#f3d67a]">
            Acceso al sistema
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            Iniciar sesión
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-white/85 sm:text-lg">
            Accede con tu cuenta institucional para ingresar al panel del sistema.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#9f1d20]">
                Autenticación
              </p>
              <h2 className="mt-2 text-2xl font-bold text-neutral-900 sm:text-3xl">
                Panel interno
              </h2>
            </div>

            <Link
              href="/"
              className="border border-black/10 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-[#faf8f3]"
            >
              Volver
            </Link>
          </div>

          {error && (
            <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-neutral-800">
                Correo electrónico
              </label>
              <input
                type="email"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="usuario@ejemplo.com"
                className="w-full border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#9f1d20]"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-neutral-800">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Ingresa tu contraseña"
                className="w-full border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#9f1d20]"
                required
              />
            </div>

            <div className="border-t border-black/10 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center bg-[#9f1d20] px-6 py-4 text-sm font-bold uppercase tracking-[0.15em] text-white transition hover:bg-[#86181b] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Ingresando...' : 'Iniciar sesión'}
              </button>
            </div>
          </form>
        </div>
      </section>

      <PublicFooter />
    </main>
  )
}