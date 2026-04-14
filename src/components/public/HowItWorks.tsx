export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Registra tu denuncia',
      description: 'Completa el formulario con la información necesaria.',
    },
    {
      number: '02',
      title: 'Se realiza la atención',
      description: 'La denuncia sigue el flujo institucional correspondiente.',
    },
    {
      number: '03',
      title: 'Consulta el resultado',
      description: 'Podrás revisar el estado y los resultados publicados.',
    },
  ]

  return (
    <section id="como-funciona" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#22B7F2]">
            Cómo funciona
          </p>
          <h3 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Un proceso simple y claro
          </h3>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            Diseñado para facilitar el registro y la consulta ciudadana.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.number}
              className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-6 shadow-sm transition hover:-translate-y-1"
            >
              <p className="text-sm font-extrabold tracking-[0.18em] text-[#F01D67]">
                {step.number}
              </p>
              <h4 className="mt-3 text-xl font-bold text-slate-900">
                {step.title}
              </h4>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}