'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import PublicHeader from '@/components/public/PublicHeader'
import PublicFooter from '@/components/public/PublicFooter'
import MapPicker from '@/components/public/MapPicker'
import { getCategoriasPublicas } from '@/services/categoria-public.service'
import {
  createDenunciaPublica,
  uploadArchivoPublico,
} from '@/services/denuncia-public.service'
import {
  CategoriaPublica,
  CreateDenunciaPublicaDto,
} from '@/types/denuncia-public'

interface FormState {
  categoriaId: string
  descripcion: string
  celularContacto: string
  nombresDenunciante: string
  apellidosDenunciante: string
  anonimo: boolean
  latitud: string
  longitud: string
  direccionTexto: string
  detalleCategoriaOtro: string
}

const initialForm: FormState = {
  categoriaId: '',
  descripcion: '',
  celularContacto: '',
  nombresDenunciante: '',
  apellidosDenunciante: '',
  anonimo: false,
  latitud: '',
  longitud: '',
  direccionTexto: '',
  detalleCategoriaOtro: '',
}

export default function DenunciarPage() {
  const [categorias, setCategorias] = useState<CategoriaPublica[]>([])
  const [form, setForm] = useState<FormState>(initialForm)
  const [files, setFiles] = useState<File[]>([])
  const [loadingCategorias, setLoadingCategorias] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const loadCategorias = async () => {
      try {
        setLoadingCategorias(true)
        const data = await getCategoriasPublicas()
        setCategorias(data)
      } catch (err) {
        console.error(err)
        setError('No se pudieron cargar las categorías públicas.')
      } finally {
        setLoadingCategorias(false)
      }
    }

    loadCategorias()
  }, [])

  const categoriaSeleccionada = useMemo(() => {
    return categorias.find((item) => item.id === form.categoriaId) || null
  }, [categorias, form.categoriaId])

  const esCategoriaOtro = useMemo(() => {
    return categoriaSeleccionada?.nombre?.trim().toUpperCase() === 'OTRO'
  }, [categoriaSeleccionada])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setForm((prev) => ({
        ...prev,
        [name]: checked,
      }))
      return
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAnonimoChange = (checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      anonimo: checked,
      nombresDenunciante: checked ? '' : prev.nombresDenunciante,
      apellidosDenunciante: checked ? '' : prev.apellidosDenunciante,
    }))
  }

  const handleMapSelect = (lat: number, lng: number) => {
    setForm((prev) => ({
      ...prev,
      latitud: String(lat),
      longitud: String(lng),
    }))
  }

  const handleFileSelection = (selectedList: FileList | null) => {
    if (!selectedList) return

    const selectedArray = Array.from(selectedList)
    const combined = [...files, ...selectedArray]

    if (combined.length > 3) {
      setError('Solo puedes adjuntar un máximo de 3 archivos.')
      return
    }

    setError('')
    setFiles(combined)
  }

  const handleInputFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelection(e.target.files)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    handleFileSelection(e.dataTransfer.files)
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    if (!form.categoriaId) {
      return 'Debes seleccionar una categoría.'
    }

    if (!form.descripcion.trim()) {
      return 'Debes describir la denuncia.'
    }

    if (!form.celularContacto.trim()) {
      return 'El número de celular es obligatorio.'
    }

    if (!form.anonimo) {
      if (!form.nombresDenunciante.trim()) {
        return 'Debes ingresar los nombres del denunciante o marcar la opción anónima.'
      }

      if (!form.apellidosDenunciante.trim()) {
        return 'Debes ingresar los apellidos del denunciante o marcar la opción anónima.'
      }
    }

    if (esCategoriaOtro && !form.detalleCategoriaOtro.trim()) {
      return 'Debes detallar la categoría cuando eliges OTRO.'
    }

    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setSending(true)

      const payload: CreateDenunciaPublicaDto = {
        categoriaId: form.categoriaId,
        descripcion: form.descripcion.trim(),
        celularContacto: form.celularContacto.trim(),
        anonimo: form.anonimo,
        direccionTexto: form.direccionTexto.trim() || undefined,
        latitud: form.latitud ? Number(form.latitud) : undefined,
        longitud: form.longitud ? Number(form.longitud) : undefined,
        detalleCategoriaOtro: esCategoriaOtro
          ? form.detalleCategoriaOtro.trim()
          : undefined,
        nombresDenunciante: form.anonimo
          ? undefined
          : form.nombresDenunciante.trim(),
        apellidosDenunciante: form.anonimo
          ? undefined
          : form.apellidosDenunciante.trim(),
      }

      const denuncia = await createDenunciaPublica(payload)

      if (files.length > 0) {
        for (const file of files) {
          await uploadArchivoPublico({
            denunciaId: denuncia.id,
            descripcion: `Archivo adjunto: ${file.name}`,
            file,
          })
        }
      }

      setForm(initialForm)
      setFiles([])
      setSuccessMessage(
        'Tu denuncia fue registrada correctamente y quedó en estado RECIBIDO.',
      )
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: any) {
      console.error(err)

      const backendMessage =
        err?.response?.data?.message ||
        'No se pudo registrar la denuncia. Intenta nuevamente.'

      setError(
        Array.isArray(backendMessage)
          ? backendMessage.join(', ')
          : backendMessage,
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee]">
      <PublicHeader />

      <section className="bg-gradient-to-br from-[#7f1417] via-[#9f1d20] to-[#c52a2e]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="inline-block border border-[#d4af37]/50 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-[#f3d67a]">
            Denuncia ciudadana
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            Registra tu denuncia de forma segura y ordenada
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-white/85 sm:text-lg">
            Completa el formulario, selecciona la ubicación en el mapa y adjunta
            hasta tres archivos de evidencia si lo necesitas.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="border border-black/10 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#9f1d20]">
                  Formulario público
                </p>
                <h2 className="mt-2 text-2xl font-bold text-neutral-900 sm:text-3xl">
                  Realizar denuncia
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

            {successMessage && (
              <div className="mt-6 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-neutral-800">
                    Categoría *
                  </label>
                  <select
                    name="categoriaId"
                    value={form.categoriaId}
                    onChange={handleChange}
                    disabled={loadingCategorias}
                    className="w-full border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#9f1d20]"
                    required
                  >
                    <option value="">
                      {loadingCategorias
                        ? 'Cargando categorías...'
                        : 'Selecciona una categoría'}
                    </option>

                    {categorias.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre} — {categoria.area.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {esCategoriaOtro && (
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-neutral-800">
                      Detalle de la categoría *
                    </label>
                    <input
                      type="text"
                      name="detalleCategoriaOtro"
                      value={form.detalleCategoriaOtro}
                      onChange={handleChange}
                      placeholder="Describe el tipo de denuncia"
                      className="w-full border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#9f1d20]"
                      required={esCategoriaOtro}
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-neutral-800">
                    Descripción de la denuncia *
                  </label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Describe con el mayor detalle posible lo ocurrido"
                    className="w-full resize-none border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#9f1d20]"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-neutral-800">
                    Número de celular *
                  </label>
                  <input
                    type="text"
                    name="celularContacto"
                    value={form.celularContacto}
                    onChange={handleChange}
                    placeholder="Ej. 77777777"
                    maxLength={30}
                    className="w-full border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#9f1d20]"
                    required
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex cursor-pointer items-center gap-3 border border-black/10 bg-[#faf8f3] px-4 py-3 text-sm font-medium text-neutral-800">
                    <input
                      type="checkbox"
                      checked={form.anonimo}
                      onChange={(e) => handleAnonimoChange(e.target.checked)}
                      className="h-4 w-4 accent-[#9f1d20]"
                    />
                    Presentar denuncia anónima
                  </label>
                </div>

                {!form.anonimo && (
                  <>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-neutral-800">
                        Nombres *
                      </label>
                      <input
                        type="text"
                        name="nombresDenunciante"
                        value={form.nombresDenunciante}
                        onChange={handleChange}
                        placeholder="Ingresa tus nombres"
                        className="w-full border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#9f1d20]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-neutral-800">
                        Apellidos *
                      </label>
                      <input
                        type="text"
                        name="apellidosDenunciante"
                        value={form.apellidosDenunciante}
                        onChange={handleChange}
                        placeholder="Ingresa tus apellidos"
                        className="w-full border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#9f1d20]"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <MapPicker
                  latitud={form.latitud ? Number(form.latitud) : undefined}
                  longitud={form.longitud ? Number(form.longitud) : undefined}
                  onSelect={handleMapSelect}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-neutral-800">
                      Latitud
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="latitud"
                      value={form.latitud}
                      onChange={handleChange}
                      placeholder="-16.5000"
                      className="w-full border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#9f1d20]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-neutral-800">
                      Longitud
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="longitud"
                      value={form.longitud}
                      onChange={handleChange}
                      placeholder="-68.1500"
                      className="w-full border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#9f1d20]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-neutral-800">
                    Dirección o referencia escrita (opcional)
                  </label>
                  <input
                    type="text"
                    name="direccionTexto"
                    value={form.direccionTexto}
                    onChange={handleChange}
                    placeholder="Ej. Av. 6 de Marzo, esquina plaza principal"
                    className="w-full border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#9f1d20]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-neutral-800">
                  Archivos de evidencia (máximo 3)
                </label>

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-[#9f1d20]/30 bg-[#faf8f3] p-6 text-center"
                >
                  <p className="text-sm font-semibold text-neutral-900">
                    Arrastra archivos aquí o selecciónalos desde tu dispositivo
                  </p>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    Se permiten imágenes, videos, audios, PDF y Word.
                  </p>

                  <label className="mt-5 inline-flex cursor-pointer items-center justify-center bg-[#9f1d20] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#86181b]">
                    Seleccionar archivos
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                      onChange={handleInputFiles}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="mt-4 space-y-3">
                  {files.length === 0 ? (
                    <p className="text-sm text-neutral-500">
                      No seleccionaste archivos todavía.
                    </p>
                  ) : (
                    files.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex flex-col gap-3 border border-black/10 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">
                            {file.name}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="border border-red-200 px-3 py-2 text-xs font-bold uppercase tracking-wide text-red-700 transition hover:bg-red-50"
                        >
                          Quitar
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="border-t border-black/10 pt-6">
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex w-full items-center justify-center bg-[#9f1d20] px-6 py-4 text-sm font-bold uppercase tracking-[0.15em] text-white transition hover:bg-[#86181b] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {sending ? 'Enviando denuncia...' : 'Registrar denuncia'}
                </button>
              </div>
            </form>
          </div>

          <aside className="space-y-6">
            <div className="border border-black/10 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#9f1d20]">
                Información importante
              </p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-neutral-600">
                <p>
                  La denuncia se registrará automáticamente con el estado{' '}
                  <span className="font-semibold text-neutral-900">RECIBIDO</span>.
                </p>
                <p>
                  El número de celular es obligatorio para contacto y seguimiento.
                </p>
                <p>
                  Puedes presentar la denuncia de forma anónima.
                </p>
                <p>
                  Puedes adjuntar hasta{' '}
                  <span className="font-semibold text-neutral-900">3 archivos</span>.
                </p>
              </div>
            </div>

            <div className="border border-black/10 bg-[#9f1d20] p-6 text-white shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#f3d67a]">
                Ubicación
              </p>
              <p className="mt-4 text-sm leading-7 text-white/90">
                Puedes seleccionar la ubicación directamente en el mapa. Al hacer
                clic se completarán automáticamente la latitud y la longitud.
              </p>
              <p className="mt-4 text-sm leading-7 text-white/90">
                También puedes complementar con una referencia escrita en el campo
                de dirección, si lo deseas.
              </p>
            </div>

            <div className="border border-black/10 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#9f1d20]">
                Categorías
              </p>
              <p className="mt-4 text-sm leading-7 text-neutral-600">
                Si eliges la categoría <span className="font-semibold">OTRO</span>,
                se habilitará un campo adicional para que detalles el tipo de
                denuncia.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <PublicFooter />
    </main>
  )
}