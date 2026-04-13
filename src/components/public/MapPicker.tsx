'use client'

import dynamic from 'next/dynamic'

const ClientMapPicker = dynamic(() => import('./MapPickerClient'), {
  ssr: false,
  loading: () => (
    <div className="border border-black/10 bg-white p-4">
      <p className="text-sm text-neutral-600">Cargando mapa...</p>
    </div>
  ),
})

interface MapPickerProps {
  latitud?: number
  longitud?: number
  onSelect: (lat: number, lng: number) => void
}

export default function MapPicker(props: MapPickerProps) {
  return <ClientMapPicker {...props} />
}