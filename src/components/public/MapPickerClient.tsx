'use client'

import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapPickerClientProps {
  latitud?: number
  longitud?: number
  onSelect: (lat: number, lng: number) => void
}

const defaultCenter: [number, number] = [-16.4957, -68.1336]

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

function ClickHandler({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng)
    },
  })

  return null
}

export default function MapPickerClient({
  latitud,
  longitud,
  onSelect,
}: MapPickerClientProps) {
  const hasPosition =
    typeof latitud === 'number' && !Number.isNaN(latitud) &&
    typeof longitud === 'number' && !Number.isNaN(longitud)

  const center: [number, number] = hasPosition
    ? [latitud as number, longitud as number]
    : defaultCenter

  return (
    <div className="overflow-hidden border border-black/10 bg-white">
      <div className="border-b border-black/10 bg-[#faf8f3] px-4 py-3">
        <p className="text-sm font-semibold text-neutral-900">
          Selecciona la ubicación en el mapa
        </p>
        <p className="mt-1 text-xs leading-6 text-neutral-600">
          Haz clic en el punto aproximado del lugar de la denuncia.
        </p>
      </div>

      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom
        className="h-[360px] w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onSelect={onSelect} />
        {hasPosition && <Marker position={[latitud as number, longitud as number]} icon={markerIcon} />}
      </MapContainer>
    </div>
  )
}