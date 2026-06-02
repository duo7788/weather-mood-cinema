import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { LocationState } from '../types';

// Fix Leaflet's default icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  onLocationSelect: (location: Pick<LocationState, 'lat' | 'lng'>) => void;
  selectedLocation: Pick<LocationState, 'lat' | 'lng'> | null;
}

function LocationMarker({ onLocationSelect, selectedLocation }: MapProps) {
  useMapEvents({
    click(e) {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return selectedLocation ? (
    <Marker position={[selectedLocation.lat, selectedLocation.lng]} />
  ) : null;
}

// Dark/retro map tiles: standard OpenStreetMap with CSS filter, or CartoDB Dark Matter.
// Let's use CartoDB Dark Matter for that deep, restrained cinematic look out of the box.
const tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

export function MapComponent({ onLocationSelect, selectedLocation }: MapProps) {
  return (
    <div className="w-full h-full overflow-hidden mix-blend-luminosity opacity-80 hover:opacity-100 transition-opacity duration-700 relative">
      {/* Map styling circles from Design HTML */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-20 border-[0.5px] border-[#ffffff20] rounded-full pointer-events-none z-10"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] opacity-15 border-[0.5px] border-[#ffffff20] rounded-full pointer-events-none z-10"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] opacity-10 border-[0.5px] border-[#ffffff20] rounded-full pointer-events-none z-10"></div>

      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxBounds={[[-90, -180], [90, 180]]}
        className="w-full h-full bg-[#0E0F12]"
        zoomControl={false}
      >
        <TileLayer
          url={tileUrl}
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        <LocationMarker onLocationSelect={onLocationSelect} selectedLocation={selectedLocation} />
      </MapContainer>
    </div>
  );
}
