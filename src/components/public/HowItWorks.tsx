export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Registra tu denuncia',
      description:
        'Completa el formulario, adjunta hasta tres archivos y proporciona un número de celular obligatorio para contacto.',
    },
    {
      number: '02',
      title: 'La entidad la atiende',
      description:
        'La denuncia ingresa con estado RECIBIDO y sigue el flujo institucional correspondiente hasta su revisión.',
    },
    {
      number: '03',
      title: 'Se publica el resultado',
      description:
        'Cuando el caso tiene resultado, se registra la solución o el rechazo con respaldo documental para consulta.',
    },
  ]

  return (
    <section id="como-funciona" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#9f1d20]">
            Cómo funciona
          </p>
          <h3 className="mt-3 text-3xl font-bold text-neutral-900 sm:text-4xl">
            Proceso claro, ordenado y accesible para la ciudadanía
          </h3>
          <p className="mt-4 text-sm leading-7 text-neutral-600 sm:text-base">
            El sistema está diseñado para facilitar la presentación de denuncias y
            permitir una consulta pública transparente de los resultados.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.number}
              className="border border-black/10 bg-[#faf8f3] p-6 shadow-sm"
            >
              <p className="text-sm font-extrabold tracking-[0.18em] text-[#d4af37]">
                {step.number}
              </p>
              <h4 className="mt-3 text-xl font-bold text-neutral-900">
                {step.title}
              </h4>
              <p className="mt-4 text-sm leading-7 text-neutral-600">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}