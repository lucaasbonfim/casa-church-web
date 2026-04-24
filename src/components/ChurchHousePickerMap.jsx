import { useEffect } from "react";
import { Compass } from "lucide-react";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import Loader from "./Loader";

const DEFAULT_CENTER = [-22.9068, -43.1729];

function MapClickHandler({ onPick }) {
  useMapEvents({
    click(event) {
      onPick?.(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

function MapViewport({
  latitude,
  longitude,
  viewLatitude,
  viewLongitude,
  shouldAutoFocusView,
}) {
  const map = useMap();

  useEffect(() => {
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      map.flyTo([latitude, longitude], 16, { duration: 0.7 });
      return;
    }

    if (
      shouldAutoFocusView &&
      Number.isFinite(viewLatitude) &&
      Number.isFinite(viewLongitude)
    ) {
      map.flyTo([viewLatitude, viewLongitude], 14, { duration: 0.7 });
    }
  }, [
    latitude,
    longitude,
    map,
    shouldAutoFocusView,
    viewLatitude,
    viewLongitude,
  ]);

  return null;
}

export default function ChurchHousePickerMap({
  latitude,
  longitude,
  viewLatitude,
  viewLongitude,
  shouldAutoFocusView = false,
  onPick,
  onUseCurrentLocation,
  isLocating = false,
}) {
  const hasCoordinates =
    Number.isFinite(latitude) && Number.isFinite(longitude);
  const hasViewCoordinates =
    Number.isFinite(viewLatitude) && Number.isFinite(viewLongitude);

  const initialCenter = hasCoordinates
    ? [latitude, longitude]
    : hasViewCoordinates
    ? [viewLatitude, viewLongitude]
    : DEFAULT_CENTER;

  const initialZoom = hasCoordinates ? 16 : hasViewCoordinates ? 14 : 10;

  return (
    <div className="relative h-[320px] rounded-2xl overflow-hidden border border-white/10 bg-[#10151b]">
      <MapContainer center={initialCenter} zoom={initialZoom} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onPick={onPick} />
        <MapViewport
          latitude={latitude}
          longitude={longitude}
          viewLatitude={viewLatitude}
          viewLongitude={viewLongitude}
          shouldAutoFocusView={shouldAutoFocusView}
        />

        {hasViewCoordinates && (
          <CircleMarker
            center={[viewLatitude, viewLongitude]}
            radius={9}
            pathOptions={{
              color: "#60a5fa",
              fillColor: "#3b82f6",
              fillOpacity: 0.85,
              weight: 2,
            }}
          />
        )}

        {hasCoordinates && (
          <CircleMarker
            center={[latitude, longitude]}
            radius={11}
            pathOptions={{
              color: "#8b5cf6",
              fillColor: "#a78bfa",
              fillOpacity: 0.95,
              weight: 2,
            }}
          />
        )}
      </MapContainer>

      <button
        type="button"
        onClick={onUseCurrentLocation}
        disabled={isLocating}
        className="absolute bottom-4 right-4 z-[500] flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#11161d]/90 text-white shadow-[0_12px_30px_rgba(0,0,0,0.28)] backdrop-blur transition hover:bg-[#1a212b] disabled:cursor-not-allowed disabled:opacity-70"
        title="Ir para minha localizacao"
        aria-label="Ir para minha localizacao"
      >
        {isLocating ? (
          <Loader type="ClipLoader" size={18} color="#ffffff" />
        ) : (
          <Compass size={19} />
        )}
      </button>
    </div>
  );
}
