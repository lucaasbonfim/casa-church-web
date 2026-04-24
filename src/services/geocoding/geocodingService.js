const NOMINATIM_URL = "https://nominatim.openstreetmap.org";

const BRAZILIAN_STATE_CODES = {
  acre: "AC",
  alagoas: "AL",
  amapa: "AP",
  amazonas: "AM",
  bahia: "BA",
  ceara: "CE",
  "distrito federal": "DF",
  "espirito santo": "ES",
  goias: "GO",
  maranhao: "MA",
  "mato grosso": "MT",
  "mato grosso do sul": "MS",
  "minas gerais": "MG",
  para: "PA",
  paraiba: "PB",
  parana: "PR",
  pernambuco: "PE",
  piaui: "PI",
  "rio de janeiro": "RJ",
  "rio grande do norte": "RN",
  "rio grande do sul": "RS",
  rondonia: "RO",
  roraima: "RR",
  "santa catarina": "SC",
  "sao paulo": "SP",
  sergipe: "SE",
  tocantins: "TO",
};

export function buildChurchHouseAddress(churchHouse) {
  return [
    churchHouse.street,
    churchHouse.number,
    churchHouse.complement,
    churchHouse.neighborhood,
    churchHouse.city,
    churchHouse.uf,
    churchHouse.zipCode,
    "Brasil",
  ]
    .filter(Boolean)
    .join(", ");
}

function normalizeText(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function extractUfCode(address = {}) {
  const candidates = [
    address.state_code,
    address["ISO3166-2-lvl4"],
    address["ISO3166-2-lvl6"],
    address.region_code,
  ].filter(Boolean);

  for (const candidate of candidates) {
    const match = String(candidate).toUpperCase().match(/(?:BR-)?([A-Z]{2})$/);
    if (match?.[1]) {
      return match[1];
    }
  }

  const normalizedState = normalizeText(address.state);
  return BRAZILIAN_STATE_CODES[normalizedState] || "";
}

function mapNominatimAddress(address = {}) {
  return {
    street:
      address.road ||
      address.pedestrian ||
      address.footway ||
      address.cycleway ||
      "",
    number: address.house_number || "",
    neighborhood:
      address.suburb ||
      address.neighbourhood ||
      address.quarter ||
      address.city_district ||
      "",
    city:
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      "",
    state: address.state || "",
    uf: extractUfCode(address),
    zipCode: address.postcode || "",
  };
}

function mapNominatimResult(result) {
  const normalizedAddress = mapNominatimAddress(result.address);

  return {
    label: result.display_name,
    latitude: Number(result.lat),
    longitude: Number(result.lon),
    address: normalizedAddress,
  };
}

export async function searchAddresses(query, { limit = 5 } = {}) {
  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    addressdetails: "1",
    countrycodes: "br",
    limit: String(limit),
  });

  const response = await fetch(`${NOMINATIM_URL}/search?${params.toString()}`, {
    headers: {
      "Accept-Language": "pt-BR",
    },
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel localizar o endereco informado.");
  }

  const results = await response.json();
  return results.map(mapNominatimResult);
}

export async function reverseGeocodeCoordinates(latitude, longitude) {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    format: "jsonv2",
    addressdetails: "1",
  });

  const response = await fetch(`${NOMINATIM_URL}/reverse?${params.toString()}`, {
    headers: {
      "Accept-Language": "pt-BR",
    },
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel identificar esse ponto no mapa.");
  }

  const result = await response.json();
  return mapNominatimResult(result);
}

export async function geocodeChurchHouseAddress(churchHouse) {
  const fullAddress = buildChurchHouseAddress(churchHouse);
  const [firstResult] = await searchAddresses(fullAddress, { limit: 1 });

  if (!firstResult) {
    throw new Error(
      "Nao foi possivel encontrar coordenadas para o endereco do CI."
    );
  }

  return firstResult;
}
