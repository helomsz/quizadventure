import { useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import { useMap } from 'react-leaflet';

export function MapFocus({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, Math.max(map.getZoom(), 1), { duration: 0.7 });
    }
  }, [map, position]);

  return null;
}

export function MapZoomControls() {
  const map = useMap();

  return (
    <div className="map-zoom-controls">
      <button
        type="button"
        className="map-glossy-icon-button"
        onClick={() => map.zoomIn()}
        aria-label="Aproximar mapa"
      >
        <Plus size={30} strokeWidth={4} />
      </button>
      <button
        type="button"
        className="map-glossy-icon-button"
        onClick={() => map.zoomOut()}
        aria-label="Reduzir mapa"
      >
        <Minus size={30} strokeWidth={4} />
      </button>
    </div>
  );
}
