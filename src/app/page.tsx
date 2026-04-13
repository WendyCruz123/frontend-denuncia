'use client'

import { useEffect, useState } from 'react'
import PublicHeader from '@/components/public/PublicHeader'
import HeroSection from '@/components/public/HeroSection'
import PublicStats from '@/components/public/PublicStats'
import HowItWorks from '@/components/public/HowItWorks'
import PublicSolvedPreview from '@/components/public/PublicSolvedPreview'
import PublicFooter from '@/components/public/PublicFooter'
import { getDashboardPublico } from '@/services/public.service'
import { PublicDenuncia } from '@/types/public'

export default function HomePage() {
  const [totalSolucionadas, setTotalSolucionadas] = useState(0)
  const [denunciasSolucionadas, setDenunciasSolucionadas] = useState<
    PublicDenuncia[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await getDashboardPublico()

        setTotalSolucionadas(data.totalSolucionadas || 0)
        setDenunciasSolucionadas(data.denunciasSolucionadas || [])
      } catch (err) {
        console.error('Error al cargar dashboard público:', err)
        setError(
          'No se pudo cargar la información pública en este momento. Intente nuevamente más tarde.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  return (
    <main className="min-h-screen bg-white">
      <PublicHeader />

      {loading ? (
        <>
          <section className="bg-gradient-to-br from-[#7f1417] via-[#9f1d20] to-[#c52a2e]">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
              <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-4">
                  <div className="h-6 w-40 animate-pulse bg-white/20" />
                  <div className="h-14 w-full max-w-3xl animate-pulse bg-white/20" />
                  <div className="h-6 w-full max-w-2xl animate-pulse bg-white/15" />
                  <div className="h-6 w-[85%] max-w-2xl animate-pulse bg-white/15" />
                  <div className="mt-8 flex gap-4">
                    <div className="h-12 w-44 animate-pulse bg-[#d4af37]/70" />
                    <div className="h-12 w-56 animate-pulse bg-white/20" />
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="h-40 animate-pulse border border-white/10 bg-white/10" />
                  <div className="h-40 animate-pulse border border-white/10 bg-white/10" />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-[#f7f4ee]">
            <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
              <div className="h-40 animate-pulse border border-black/10 bg-white" />
              <div className="h-40 animate-pulse bg-[#9f1d20]" />
            </div>
          </section>

          <HowItWorks />

          <section className="bg-[#f7f4ee]">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
              <div className="grid gap-5 lg:grid-cols-3">
                <div className="h-72 animate-pulse border border-black/10 bg-white" />
                <div className="h-72 animate-pulse border border-black/10 bg-white" />
                <div className="h-72 animate-pulse border border-black/10 bg-white" />
              </div>
            </div>
          </section>
        </>
      ) : error ? (
        <>
          <section className="bg-gradient-to-br from-[#7f1417] via-[#9f1d20] to-[#c52a2e]">
            <div className="mx-auto max-w-7xl px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24">
              <p className="mb-4 inline-block border border-[#d4af37]/50 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-[#f3d67a]">
                Atención ciudadana
              </p>

              <h2 className="max-w-4xl text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                Sistema público de recepción y seguimiento de denuncias
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
                Plataforma ciudadana para registrar denuncias y consultar los
                resultados publicados por la institución.
              </p>
            </div>
          </section>

          <section className="bg-[#f7f4ee]">
            <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
              <div className="border border-red-200 bg-red-50 p-6 text-red-700">
                <h3 className="text-lg font-bold">Error al cargar la información</h3>
                <p className="mt-2 text-sm leading-7">{error}</p>
              </div>
            </div>
          </section>

          <HowItWorks />
        </>
      ) : (
        <>
          <HeroSection totalSolucionadas={totalSolucionadas} />
          <PublicStats totalSolucionadas={totalSolucionadas} />
          <HowItWorks />
          <PublicSolvedPreview denuncias={denunciasSolucionadas} />
        </>
      )}

      <PublicFooter />
    </main>
  )
}