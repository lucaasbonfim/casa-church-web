import { useEffect } from "react";
import { Compass, MapPin, Navigation, Phone, X } from "lucide-react";
import { CircleMarker, MapContainer, TileLayer, useMap } from "react-leaflet";
import { buildChurchHouseAddress } from "../utils/churchHouseUtils";
import Loader from "./Loader";

const DEFAULT_CENTER = [-22.9068, -43.1729];

function toCoordinate(value) {
  const parsed =
    typeof value === "string" ? Number.parseFloat(value) : Number(value);

  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function getLatLng(value) {
  const latitude = toCoordinate(value?.latitude);
  const longitude = toCoordinate(value?.longitude);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    return null;
  }

  return [latitude, longitude];
}

function hasValidCoordinates(value) {
  return Boolean(getLatLng(value));
}

function MapViewport({ churchHouses, selectedChurchHouse, origin }) {
  const map = useMap();

  useEffect(() => {
    const selectedLatLng = getLatLng(selectedChurchHouse);
    if (selectedLatLng) {
      map.flyTo(selectedLatLng, hasValidCoordinates(origin) ? 12 : 13, {
        duration: 0.7,
      });
      return;
    }

    const originLatLng = getLatLng(origin);
    if (originLatLng) {
      map.flyTo(originLatLng, 12, { duration: 0.7 });
      return;
    }

    const firstChurchHouseLatLng = churchHouses
      .map(getLatLng)
      .find(Boolean);

    if (firstChurchHouseLatLng) {
      map.flyTo(firstChurchHouseLatLng, 11, {
        duration: 0.7,
      });
    }
  }, [churchHouses, map, origin, selectedChurchHouse]);

  return null;
}

function ChurchHouseMarker({ churchHouse, isSelected, onSelect }) {
  const latLng = getLatLng(churchHouse);

  if (!latLng) {
    return null;
  }

  return (
    <CircleMarker
      center={latLng}
      radius={isSelected ? 12 : 8}
      eventHandlers={{
        click: () => onSelect?.(churchHouse),
      }}
      pathOptions={{
        color: isSelected ? "#8b5cf6" : "#7c3aed",
        fillColor: isSelected ? "#c4b5fd" : "#a78bfa",
        fillOpacity: 0.95,
        weight: 2,
      }}
    />
  );
}

export default function ChurchHousesMap({
  churchHouses,
  selectedChurchHouse,
  onSelect,
  onCloseSelected,
  origin,
  onUseCurrentLocation,
  isLocating = false,
  className = "",
}) {
  const mappableChurchHouses = churchHouses.filter(hasValidCoordinates);
  const hasValidOrigin = hasValidCoordinates(origin);
  const hasValidSelectedChurchHouse = hasValidCoordinates(selectedChurchHouse);
  const originLatLng = getLatLng(origin);

  return (
    <div
      className={`relative h-[420px] md:h-[620px] xl:h-[calc(100vh-20rem)] xl:min-h-[430px] rounded-[28px] overflow-hidden border border-white/10 bg-[#11161d] ${className}`}
    >
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={11}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewport
          churchHouses={churchHouses}
          selectedChurchHouse={selectedChurchHouse}
          origin={origin}
        />

        {hasValidOrigin && (
          <CircleMarker
            center={originLatLng}
            radius={10}
            pathOptions={{
              color: "#60a5fa",
              fillColor: "#3b82f6",
              fillOpacity: 0.9,
              weight: 2,
            }}
          />
        )}

        {mappableChurchHouses.map((churchHouse) => (
          <ChurchHouseMarker
            key={churchHouse.id}
            churchHouse={churchHouse}
            isSelected={selectedChurchHouse?.id === churchHouse.id}
            onSelect={onSelect}
          />
        ))}
      </MapContainer>

      <button
        type="button"
        onClick={onUseCurrentLocation}
        disabled={isLocating}
        className="absolute bottom-4 right-4 z-[500] flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-[#11161d]/90 text-white shadow-[0_12px_30px_rgba(0,0,0,0.28)] backdrop-blur transition hover:bg-[#1a212b] disabled:cursor-not-allowed disabled:opacity-70"
        title="Ir para minha localizacao"
        aria-label="Ir para minha localizacao"
      >
        {isLocating ? (
          <Loader type="ClipLoader" size={18} color="#ffffff" />
        ) : (
          <Compass size={20} />
        )}
      </button>

      {hasValidOrigin && (
        <div className="pointer-events-none absolute left-4 top-4 z-[500] max-w-[280px] rounded-2xl border border-white/10 bg-[#11161d]/88 px-4 py-3 text-sm text-white/75 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.24em] text-violet-300/80">
            Referencia ativa
          </p>
          <p className="mt-1 text-white/90">{origin.label}</p>
        </div>
      )}

      {hasValidSelectedChurchHouse && (
        <div className="absolute inset-x-3 bottom-3 z-[500] md:bottom-4 md:left-4 md:right-auto md:w-[380px]">
          <div className="rounded-[26px] border border-violet-400/25 bg-[linear-gradient(180deg,rgba(18,16,27,0.96),rgba(12,17,23,0.96))] p-5 text-white shadow-[0_24px_80px_rgba(6,8,12,0.5)] backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.28em] text-violet-300/80">
                  CI selecionado
                </p>
                <h3 className="mt-2 text-2xl font-semibold leading-tight">
                  {selectedChurchHouse.name}
                </h3>
              </div>

              <button
                type="button"
                onClick={onCloseSelected}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Fechar detalhes do CI"
                title="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-4 text-sm leading-6 text-white/70">
              {selectedChurchHouse.description ||
                "Um espaco acolhedor da Casa Church para encontros durante a semana, relacionamento e crescimento em comunidade."}
            </p>

            <div className="mt-5 space-y-3 text-sm text-white/78">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-violet-300" />
                <span>{buildChurchHouseAddress(selectedChurchHouse)}</span>
              </div>

              {selectedChurchHouse.meetingSchedule && (
                <div className="flex items-start gap-3">
                  <Navigation
                    size={16}
                    className="mt-0.5 shrink-0 text-violet-300"
                  />
                  <span>{selectedChurchHouse.meetingSchedule}</span>
                </div>
              )}

              {selectedChurchHouse.contactPhone && (
                <div className="flex items-start gap-3">
                  <Phone size={16} className="mt-0.5 shrink-0 text-violet-300" />
                  <span>{selectedChurchHouse.contactPhone}</span>
                </div>
              )}
            </div>

            <div className="mt-5 flex gap-3">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedChurchHouse.latitude},${selectedChurchHouse.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-violet-500 px-4 py-3 font-medium text-white transition hover:bg-violet-400"
              >
                Abrir rota
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
