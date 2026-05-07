import { useEffect, useRef } from "react";
import { Compass, MapPin, Navigation, Phone, X } from "lucide-react";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  useMap,
  ZoomControl,
} from "react-leaflet";
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

function getLatLngKey(value) {
  const latLng = getLatLng(value);
  return latLng ? `${latLng[0]},${latLng[1]}` : "";
}

function isLatLngComfortablyVisible(map, latLng) {
  if (!map.getBounds().contains(latLng)) {
    return false;
  }

  const point = map.latLngToContainerPoint(latLng);
  const size = map.getSize();
  const horizontalMargin = Math.min(120, size.x * 0.22);
  const verticalMargin = Math.min(120, size.y * 0.22);

  return (
    point.x >= horizontalMargin &&
    point.x <= size.x - horizontalMargin &&
    point.y >= verticalMargin &&
    point.y <= size.y - verticalMargin
  );
}

function MapViewport({
  churchHouses,
  selectedChurchHouse,
  origin,
  originFocusRequest,
}) {
  const map = useMap();
  const didInitializeRef = useRef(false);
  const previousOriginKeyRef = useRef("");
  const previousSelectedIdRef = useRef(undefined);

  useEffect(() => {
    const originKey = getLatLngKey(origin);
    const originChanged = previousOriginKeyRef.current !== originKey;

    if (didInitializeRef.current && !originChanged) {
      return;
    }

    previousOriginKeyRef.current = originKey;
    didInitializeRef.current = true;

    const visiblePoints = [
      getLatLng(origin),
      ...churchHouses.map(getLatLng),
    ].filter(Boolean);

    if (visiblePoints.length > 1) {
      map.flyToBounds(visiblePoints, {
        duration: 0.7,
        maxZoom: 12,
        padding: [44, 44],
      });
      return;
    }

    if (visiblePoints.length === 1) {
      map.flyTo(visiblePoints[0], 12, { duration: 0.7 });
      return;
    }

    map.flyTo(DEFAULT_CENTER, 11, { duration: 0.7 });
  }, [churchHouses, map, origin]);

  useEffect(() => {
    const selectedId = selectedChurchHouse?.id ?? null;
    const previousSelectedId = previousSelectedIdRef.current;
    previousSelectedIdRef.current = selectedId;

    if (previousSelectedId === undefined || !selectedId) {
      return;
    }

    if (selectedId === previousSelectedId) {
      return;
    }

    const selectedLatLng = getLatLng(selectedChurchHouse);
    if (!selectedLatLng || isLatLngComfortablyVisible(map, selectedLatLng)) {
      return;
    }

    map.flyTo(selectedLatLng, Math.max(map.getZoom(), 13), {
      duration: 0.55,
    });
  }, [map, selectedChurchHouse]);

  useEffect(() => {
    if (!originFocusRequest) {
      return;
    }

    const originLatLng = getLatLng(origin);
    if (!originLatLng) {
      return;
    }

    map.flyTo(originLatLng, Math.max(map.getZoom(), 14), {
      duration: 0.65,
    });
  }, [map, origin, originFocusRequest]);

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
  originFocusRequest = 0,
  className = "",
}) {
  const mappableChurchHouses = churchHouses.filter(hasValidCoordinates);
  const hasValidOrigin = hasValidCoordinates(origin);
  const hasValidSelectedChurchHouse = hasValidCoordinates(selectedChurchHouse);
  const originLatLng = getLatLng(origin);

  return (
    <div
      className={`ci-map relative h-[480px] overflow-hidden rounded-[28px] border border-white/10 bg-[#11161d] md:h-[620px] xl:h-[calc(100vh-20rem)] xl:min-h-[430px] ${className}`}
    >
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={11}
        zoomControl={false}
        scrollWheelZoom
        className="h-full w-full"
      >
        <ZoomControl position="topright" />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewport
          churchHouses={churchHouses}
          selectedChurchHouse={selectedChurchHouse}
          origin={origin}
          originFocusRequest={originFocusRequest}
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
        className="absolute bottom-4 right-4 z-[520] flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#11161d]/92 text-white shadow-[0_12px_30px_rgba(0,0,0,0.28)] backdrop-blur transition hover:bg-[#1a212b] disabled:cursor-not-allowed disabled:opacity-70"
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
        <div className="pointer-events-none absolute left-4 top-4 z-[500] max-w-[min(20rem,calc(100%-6.5rem))] rounded-2xl border border-white/10 bg-[#11161d]/90 px-4 py-3 text-sm text-white/75 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur">
          <p className="text-[10px] uppercase tracking-[0.24em] text-violet-300/80">
            Referencia ativa
          </p>
          <p className="mt-1 line-clamp-2 text-white/90">{origin.label}</p>
        </div>
      )}

      {hasValidSelectedChurchHouse && (
        <div className="absolute inset-x-4 bottom-4 z-[500] md:left-4 md:right-auto md:w-[380px]">
          <div className="max-h-[62vh] overflow-y-auto rounded-[26px] border border-violet-400/25 bg-[linear-gradient(180deg,rgba(18,16,27,0.96),rgba(12,17,23,0.96))] p-5 text-white shadow-[0_24px_80px_rgba(6,8,12,0.5)] backdrop-blur-xl">
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
