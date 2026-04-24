import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Compass, Search, Sparkles } from "lucide-react";
import Button from "../components/Button";
import ChurchHousesMap from "../components/ChurchHousesMap";
import Loader from "../components/Loader";
import Input from "../components/Input";
import { toastError } from "../utils/toastHelper";
import { findAllChurchHouses } from "../services/churchHouses/churchHousesService";
import { searchAddresses } from "../services/geocoding/geocodingService";
import {
  calculateDistanceInKm,
  formatDistance,
} from "../utils/churchHouseUtils";

function hasValidCoordinates(churchHouse) {
  return (
    Number.isFinite(churchHouse?.latitude) &&
    Number.isFinite(churchHouse?.longitude)
  );
}

export default function ChurchHouses() {
  const [addressQuery, setAddressQuery] = useState("");
  const [origin, setOrigin] = useState(null);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedChurchHouseId, setSelectedChurchHouseId] = useState();
  const [isDesktopLayout, setIsDesktopLayout] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia("(min-width: 1280px)").matches;
  });

  const { data, isLoading } = useQuery({
    queryKey: ["church-houses-public"],
    queryFn: () =>
      findAllChurchHouses({
        limit: 200,
        active: true,
        orderBy: "name",
        orderDirection: "ASC",
      }),
  });

  const churchHouses = useMemo(
    () =>
      (data?.churchHouses || []).map((churchHouse) => ({
        ...churchHouse,
        latitude: Number(churchHouse.latitude),
        longitude: Number(churchHouse.longitude),
      })),
    [data]
  );

  const rankedChurchHouses = useMemo(() => {
    const withDistance = churchHouses.map((churchHouse) => ({
      ...churchHouse,
      distanceInKm: origin
        ? calculateDistanceInKm(origin, churchHouse)
        : null,
    }));

    return withDistance.sort((left, right) => {
      if (origin) {
        return (left.distanceInKm ?? Infinity) - (right.distanceInKm ?? Infinity);
      }

      return left.name.localeCompare(right.name);
    });
  }, [churchHouses, origin]);

  useEffect(() => {
    if (!rankedChurchHouses.length) return;

    const firstMappableChurchHouse = rankedChurchHouses.find(hasValidCoordinates);

    if (selectedChurchHouseId === undefined) {
      setSelectedChurchHouseId(
        firstMappableChurchHouse?.id ?? rankedChurchHouses[0].id
      );
      return;
    }

    const selectedExists = rankedChurchHouses.some(
      (churchHouse) => churchHouse.id === selectedChurchHouseId
    );

    if (selectedChurchHouseId !== null && !selectedExists) {
      setSelectedChurchHouseId(
        firstMappableChurchHouse?.id ?? rankedChurchHouses[0].id
      );
    }
  }, [rankedChurchHouses, selectedChurchHouseId]);

  useEffect(() => {
    if (!navigator.geolocation || origin) return;

    const tryAutoLocate = async () => {
      try {
        const permissionStatus = await navigator.permissions?.query?.({
          name: "geolocation",
        });

        if (permissionStatus && permissionStatus.state !== "granted") {
          return;
        }
      } catch {
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setOrigin({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            label: "Sua localizacao atual",
          });
        },
        () => {}
      );
    };

    tryAutoLocate();
  }, [origin]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(min-width: 1280px)");
    const syncLayout = (event) => {
      setIsDesktopLayout(event.matches);
    };

    setIsDesktopLayout(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncLayout);
      return () => mediaQuery.removeEventListener("change", syncLayout);
    }

    mediaQuery.addListener(syncLayout);
    return () => mediaQuery.removeListener(syncLayout);
  }, []);

  const selectedChurchHouse =
    rankedChurchHouses.find(
      (churchHouse) => churchHouse.id === selectedChurchHouseId
    ) ||
    (selectedChurchHouseId === undefined
      ? rankedChurchHouses.find(hasValidCoordinates) ?? rankedChurchHouses[0]
      : null);

  const handleSearchAddress = async () => {
    if (!addressQuery.trim()) {
      toastError("Digite um endereco para localizar os CIs mais proximos");
      return;
    }

    setIsSearchingAddress(true);

    try {
      const [firstResult] = await searchAddresses(`${addressQuery}, Brasil`, {
        limit: 1,
      });

      if (!firstResult) {
        toastError("Nao foi possivel encontrar esse endereco");
        return;
      }

      setOrigin({
        latitude: firstResult.latitude,
        longitude: firstResult.longitude,
        label: firstResult.label,
      });
    } catch (error) {
      toastError(error?.message || "Erro ao buscar endereco");
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toastError("Seu navegador nao suporta geolocalizacao");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOrigin({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: "Sua localizacao atual",
        });
        setIsLocating(false);
      },
      () => {
        toastError("Nao foi possivel obter sua localizacao");
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  const searchPanel = (
    <div
      className={`rounded-[28px] border border-white/10 bg-black/20 backdrop-blur-sm ${
        isDesktopLayout ? "p-4 space-y-3" : "p-5 md:p-6 xl:p-5 space-y-4"
      }`}
    >
      <h2 className="text-xl font-semibold">Descobrir proximidade</h2>

      <Input
        placeholder="Digite seu endereco, bairro ou cidade"
        value={addressQuery}
        onChange={(event) => setAddressQuery(event.target.value)}
        icon={Search}
        allowClear
        onClear={() => setAddressQuery("")}
      />

      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          onClick={handleSearchAddress}
          loading={isSearchingAddress}
          fullWidth
        >
          Buscar por endereco
        </Button>
        <Button
          onClick={handleUseCurrentLocation}
          loading={isLocating}
          style={2}
          fullWidth
        >
          <Compass size={16} />
          Usar minha localizacao
        </Button>
      </div>

      <div
        className={`rounded-2xl border border-white/10 bg-white/5 px-4 text-white/65 ${
          isDesktopLayout ? "py-2 text-[13px]" : "py-3 text-sm"
        }`}
      >
        {origin ? (
          <>
            <span className="text-white/90 font-medium">Referencia:</span>{" "}
            {origin.label}
          </>
        ) : (
          "Use seu endereco ou geolocalizacao para ordenar os CIs pela distancia."
        )}
      </div>
    </div>
  );

  const churchHouseList = (
    <div
      className={`rounded-[28px] border border-white/10 bg-white/5 p-4 md:p-5 ${
        isDesktopLayout ? "min-h-0 flex flex-1 flex-col" : "space-y-3"
      }`}
    >
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-lg font-semibold">CIs encontrados</h3>
          <p className="text-sm text-white/50">
            Toque em um CI para abrir os detalhes no mapa.
          </p>
        </div>
        <span className="text-sm text-white/50 text-right leading-tight shrink-0">
          {rankedChurchHouses.length} unidades
        </span>
      </div>

      <div
        className={`space-y-3 overflow-auto pr-1 ${
          isDesktopLayout ? "mt-3 min-h-0 flex-1" : "max-h-[520px]"
        }`}
      >
        {rankedChurchHouses.map((churchHouse, index) => {
          const isSelected = selectedChurchHouse?.id === churchHouse.id;

          return (
            <button
              key={churchHouse.id}
              onClick={() => setSelectedChurchHouseId(churchHouse.id)}
              className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                isSelected
                  ? "border-violet-400/60 bg-violet-500/12 shadow-[0_0_0_1px_rgba(167,139,250,0.18)]"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-white/45 mb-2">
                    {origin ? `${index + 1} mais proximo` : "CI"}
                  </p>
                  <h4 className="font-semibold text-white">
                    {churchHouse.name}
                  </h4>
                  <p className="text-sm text-white/60 mt-1">
                    {churchHouse.neighborhood}, {churchHouse.city} -{" "}
                    {churchHouse.uf}
                  </p>
                </div>

                {origin && (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 whitespace-nowrap">
                    {formatDistance(churchHouse.distanceInKm)}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0c1117] text-white">
      <main className="mx-auto max-w-[1480px] px-4 py-8 md:py-12 xl:h-[calc(100vh-4.5rem)] xl:flex xl:flex-col xl:gap-4 xl:py-5">
        {!isDesktopLayout && (
          <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.22),_transparent_42%),linear-gradient(135deg,_rgba(255,255,255,0.06),_rgba(255,255,255,0.02))] overflow-hidden">
            <div className="grid gap-8 px-6 py-8 md:px-10 md:py-12 lg:grid-cols-[1.02fr_0.98fr]">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80">
                  <Sparkles size={16} className="text-violet-300" />
                  Casas Igreja espalhadas pela cidade
                </div>

                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                    Encontre o CI mais perto de voce
                  </h1>
                  <p className="max-w-2xl text-white/70 text-base md:text-lg">
                    Os CIs sao Casas Igreja onde a comunidade se encontra para
                    comunhao, discipulado, cuidado e oracao. Essa pagina usa uma
                    contextualizacao generica por enquanto, pronta para voce
                    personalizar depois com a identidade de cada casa.
                  </p>
                </div>
              </div>

              {searchPanel}
            </div>
          </section>
        )}

        {isLoading ? (
          <div className="min-h-[360px] flex items-center justify-center">
            <Loader />
          </div>
        ) : rankedChurchHouses.length ? (
          !isDesktopLayout ? (
            <section className="space-y-6">
              {churchHouseList}

              <ChurchHousesMap
                churchHouses={rankedChurchHouses}
                selectedChurchHouse={selectedChurchHouse}
                onSelect={(churchHouse) => setSelectedChurchHouseId(churchHouse.id)}
                onCloseSelected={() => setSelectedChurchHouseId(null)}
                origin={origin}
                onUseCurrentLocation={handleUseCurrentLocation}
                isLocating={isLocating}
              />
            </section>
          ) : (
            <section className="flex min-h-0 flex-1 flex-col gap-4">
              <section className="shrink-0 rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_left,_rgba(168,85,247,0.22),_transparent_52%),linear-gradient(135deg,_rgba(255,255,255,0.06),_rgba(255,255,255,0.02))] px-6 py-4">
                <div className="flex flex-col items-center text-center">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80">
                    <Sparkles size={16} className="text-violet-300" />
                    Casas Igreja espalhadas pela cidade
                  </div>

                  <h1 className="mt-3 text-[2.35rem] font-bold leading-[1.03]">
                    Encontre o CI mais perto de voce
                  </h1>

                  <p className="mt-2 max-w-[64ch] text-sm leading-6 text-white/70">
                    Os CIs sao Casas Igreja onde a comunidade se encontra para
                    comunhao, discipulado, cuidado e oracao.
                  </p>
                </div>
              </section>

              <section className="grid min-h-0 flex-1 grid-cols-[390px_minmax(0,1fr)] gap-5">
                <div className="flex min-h-0 flex-col gap-3">
                  {searchPanel}
                  {churchHouseList}
                </div>

                <ChurchHousesMap
                  churchHouses={rankedChurchHouses}
                  selectedChurchHouse={selectedChurchHouse}
                  onSelect={(churchHouse) => setSelectedChurchHouseId(churchHouse.id)}
                  onCloseSelected={() => setSelectedChurchHouseId(null)}
                  origin={origin}
                  onUseCurrentLocation={handleUseCurrentLocation}
                  isLocating={isLocating}
                  className="h-full min-h-[620px]"
                />
              </section>
            </section>
          )
        ) : (
          <div className="rounded-[28px] border border-dashed border-white/10 bg-white/5 p-12 text-center text-white/50">
            Nenhum CI disponivel no momento.
          </div>
        )}
      </main>
    </div>
  );
}
