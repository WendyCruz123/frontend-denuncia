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
  const [showSuccessModal, setShowSuccessModal] = useState(false)

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
      celularContacto: checked ? '' : prev.celularContacto,
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
        celularContacto: form.anonimo
          ? undefined
          : form.celularContacto.trim(),
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
            denunciaId: denuncia.denuncia.id,
            descripcion: `Archivo adjunto: ${file.name}`,
            file,
          })
        }
      }

      setForm(initialForm)
      setFiles([])
      setSuccessMessage(
      `Tu denuncia fue registrada correctamente guarda tu codigo para el seguimiento de tu caso. \n\nCódigo de seguimiento: ${denuncia.codigoSeguimiento}\nEstado: RECIBIDO`
)
setShowSuccessModal(true)
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
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef9ff_0%,#fffef8_100%)]">
      <PublicHeader />

      <section className="relative overflow-hidden border-b border-[#22B7F2]/10">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-[220px] -top-[220px] h-[900px] w-[900px] rounded-full bg-[#22B7F2]/35 blur-[170px]" />
          <div className="absolute -right-[180px] -top-[120px] h-[850px] w-[850px] rounded-full bg-[#F2DEA2]/75 blur-[180px]" />
          <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#22B7F2]/10 blur-[160px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(34,183,242,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,183,242,0.04)_1px,transparent_1px)] bg-[size:42px_42px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-4xl">
            <p className="inline-flex rounded-full border border-[#22B7F2]/25 bg-white/60 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-[#168ec0] shadow-sm backdrop-blur-sm">
              Denuncia ciudadana
            </p>

            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-slate-950 sm:text-5xl">
              Registra tu denuncia de forma segura y ordenada
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-700 sm:text-lg">
              Completa el formulario, marca la ubicación si corresponde y adjunta evidencia de apoyo.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/seguimiento"
                className="inline-flex items-center justify-center rounded-xl border border-[#22B7F2] bg-white/70 px-6 py-3 text-sm font-bold uppercase tracking-wide text-[#22B7F2] shadow-sm backdrop-blur-sm transition hover:bg-[#22B7F2] hover:text-white"
              >
                Seguimiento de denuncia
              </Link>

              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white/70 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#F01D67] hover:text-[#F01D67]"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.18fr_0.82fr]">
          <div className="rounded-[28px] border border-[#22B7F2]/12 bg-white/80 p-6 shadow-[0_20px_45px_rgba(34,183,242,0.08)] backdrop-blur-sm sm:p-8">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#22B7F2]">
                  Formulario público
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
                  Realizar denuncia
                </h2>
              </div>

              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#F01D67] hover:text-[#F01D67]"
              >
                Volver
              </Link>
            </div>

            {error && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Categoría *
                  </label>
                  <select
                    name="categoriaId"
                    value={form.categoriaId}
                    onChange={handleChange}
                    disabled={loadingCategorias}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#22B7F2] focus:ring-4 focus:ring-[#22B7F2]/10"
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
                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                      Detalle de la categoría *
                    </label>
                    <input
                      type="text"
                      name="detalleCategoriaOtro"
                      value={form.detalleCategoriaOtro}
                      onChange={handleChange}
                      placeholder="Describe el tipo de denuncia"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#22B7F2] focus:ring-4 focus:ring-[#22B7F2]/10"
                      required={esCategoriaOtro}
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Descripción de la denuncia *
                  </label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Describe con el mayor detalle posible lo ocurrido"
                    className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#22B7F2] focus:ring-4 focus:ring-[#22B7F2]/10"
                    required
                  />
                </div>

                {!form.anonimo && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                      Número de celular (opcional)
                    </label>
                    <input
                      type="text"
                      name="celularContacto"
                      value={form.celularContacto}
                      onChange={handleChange}
                      placeholder="Ej. 77777777"
                      maxLength={30}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#22B7F2] focus:ring-4 focus:ring-[#22B7F2]/10"
                    />
                  </div>
                )}

                <div className="flex items-end">
                  <label className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-[#F2DEA2] bg-[#F2DEA2]/45 px-4 py-3 text-sm font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={form.anonimo}
                      onChange={(e) => handleAnonimoChange(e.target.checked)}
                      className="h-4 w-4 accent-[#F01D67]"
                    />
                    Presentar denuncia anónima
                  </label>
                </div>

                {!form.anonimo && (
                  <>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-800">
                        Nombres *
                      </label>
                      <input
                        type="text"
                        name="nombresDenunciante"
                        value={form.nombresDenunciante}
                        onChange={handleChange}
                        placeholder="Ingresa tus nombres"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#22B7F2] focus:ring-4 focus:ring-[#22B7F2]/10"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-800">
                        Apellidos *
                      </label>
                      <input
                        type="text"
                        name="apellidosDenunciante"
                        value={form.apellidosDenunciante}
                        onChange={handleChange}
                        placeholder="Ingresa tus apellidos"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#22B7F2] focus:ring-4 focus:ring-[#22B7F2]/10"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="rounded-[24px] border border-[#22B7F2]/12 bg-[#f8fdff] p-4 sm:p-5">
                <div className="mb-4">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#22B7F2]">
                    Ubicación
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Puedes marcar la ubicación en el mapa o escribir una referencia.
                  </p>
                </div>

                <div className="overflow-hidden rounded-[20px] border border-slate-200">
                  <MapPicker
                    latitud={form.latitud ? Number(form.latitud) : undefined}
                    longitud={form.longitud ? Number(form.longitud) : undefined}
                    onSelect={handleMapSelect}
                  />
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                      Latitud
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="latitud"
                      value={form.latitud}
                      onChange={handleChange}
                      placeholder="-16.5000"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#22B7F2] focus:ring-4 focus:ring-[#22B7F2]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                      Longitud
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="longitud"
                      value={form.longitud}
                      onChange={handleChange}
                      placeholder="-68.1500"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#22B7F2] focus:ring-4 focus:ring-[#22B7F2]/10"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Dirección o referencia escrita (opcional)
                  </label>
                  <input
                    type="text"
                    name="direccionTexto"
                    value={form.direccionTexto}
                    onChange={handleChange}
                    placeholder="Ej. Av. 6 de Marzo, esquina plaza principal"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#22B7F2] focus:ring-4 focus:ring-[#22B7F2]/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-slate-800">
                  Archivos de evidencia (máximo 3)
                </label>

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="rounded-[24px] border-2 border-dashed border-[#22B7F2]/25 bg-[#22B7F2]/5 p-6 text-center"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    Arrastra archivos aquí o selecciónalos desde tu dispositivo
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Se permiten imágenes, videos, audios y PDF.
                  </p>

                  <label className="mt-5 inline-flex cursor-pointer items-center justify-center rounded-xl bg-[#F01D67] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-[0_12px_28px_rgba(240,29,103,0.22)] transition hover:bg-[#d8185b]">
                    Seleccionar archivos
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*,audio/*,.pdf"
                      onChange={handleInputFiles}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="mt-4 space-y-3">
                  {files.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No seleccionaste archivos todavía.
                    </p>
                  ) : (
                    files.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="rounded-xl border border-red-200 px-3 py-2 text-xs font-bold uppercase tracking-wide text-red-700 transition hover:bg-red-50"
                        >
                          Quitar
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-[#F01D67] px-6 py-4 text-sm font-bold uppercase tracking-[0.15em] text-white shadow-[0_14px_30px_rgba(240,29,103,0.22)] transition hover:bg-[#d8185b] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {sending ? 'Enviando denuncia...' : 'Registrar denuncia'}
                </button>
              </div>
            </form>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[24px] border border-[#22B7F2]/12 bg-white/80 p-6 shadow-[0_18px_40px_rgba(34,183,242,0.08)] backdrop-blur-sm">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#22B7F2]">
                Información importante
              </p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                <p>
                  La denuncia se registrará automáticamente con el estado{' '}
                  <span className="font-semibold text-slate-900">RECIBIDO</span>.
                </p>
                <p>
                  Guarda el código de seguimiento que se te proporcionará al finalizar el registro para consultar el estado de tu denuncia.
                </p>
                <p>
                  Puedes presentar la denuncia de forma anónima.
                </p>
                <p>
                  Puedes adjuntar hasta{' '}
                  <span className="font-semibold text-slate-900">3 archivos</span>.
                </p>
              </div>
            </div>

            <div className="rounded-[24px] bg-[#F01D67] p-6 text-white shadow-[0_20px_45px_rgba(240,29,103,0.25)]">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-white/85">
                Ubicación
              </p>
              <p className="mt-4 text-sm leading-7 text-white/90">
                Puedes seleccionar la ubicación directamente en el mapa. Al hacer clic se completarán automáticamente la latitud y la longitud.
              </p>
              <p className="mt-4 text-sm leading-7 text-white/90">
                También puedes complementar con una referencia escrita en el campo de dirección.
              </p>
            </div>

            <div className="rounded-[24px] border border-[#F2DEA2] bg-[#F2DEA2]/45 p-6 shadow-[0_18px_40px_rgba(242,222,162,0.18)]">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#9b6a00]">
                Categorías
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-700">
                Si eliges la categoría <span className="font-semibold">OTRO</span>, se habilitará un campo adicional para que detalles el tipo de denuncia.
              </p>
            </div>
          </aside>
        </div>
      </section>
      {showSuccessModal && (
  <div className="fixed inset-0 z-[999] flex items-center justify-center">
    
    {/* fondo oscuro */}
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

    {/* card */}
    <div className="relative z-10 w-full max-w-md rounded-[24px] bg-white p-6 shadow-[0_25px_60px_rgba(0,0,0,0.25)]">
      
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F01D67]/10">
          <span className="text-2xl text-[#F01D67]">✓</span>
        </div>

        <h3 className="text-xl font-extrabold text-slate-900">
          Denuncia registrada
        </h3>

        <p className="mt-4 whitespace-pre-line text-sm text-slate-600">
          {successMessage}
        </p>
      </div>

      <button
        onClick={() => setShowSuccessModal(false)}
        className="mt-6 w-full rounded-xl bg-[#F01D67] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-[0_10px_25px_rgba(240,29,103,0.25)] transition hover:bg-[#d8185b]"
      >
        Aceptar
      </button>
    </div>
  </div>
)}v
      <PublicFooter />
    </main>
  )
}