import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "@/utils/leafletDefaultIcons.js";
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";

/** Trung tâm mặc định: TP.HCM */
const DEFAULT_CENTER = [10.7769, 106.7009];
const DEFAULT_ZOOM = 13;

/** @param {string} [s] */
function looksLikePostalCode(s) {
  if (!s || typeof s !== "string") return false;
  return /^\d{4,10}$/.test(s.trim());
}

/**
 * Dùng cấu trúc `address` từ Nominatim (jsonv2) — tránh tách display_name (hay nhầm mã bưu chính / tỉnh).
 * @param {Record<string, unknown>|null|undefined} data
 * @returns {{ address: string, state: string, city: string, country: string }}
 */
function parseNominatimJson(data) {
  if (!data || typeof data !== "object") {
    return { address: "", state: "", city: "", country: "Việt Nam" };
  }

  const display = String(data.display_name || "").trim();
  const a = /** @type {Record<string, string>} */ (data.address || {});

  const line1 = [a.house_number, a.road || a.pedestrian || a.path || a.residential]
    .filter(Boolean)
    .join(" ")
    .trim();

  /** Quận / Huyện + cấp tương đương (không đưa tỉnh/TP vào đây) */
  const district =
    a.city_district || a.district || a.borough || a.county || "";
  const ward = a.suburb || a.quarter || a.hamlet || "";

  let stateField = "";
  if (district) stateField = district;
  else if (ward) stateField = ward;
  if (district && ward && district !== ward) {
    stateField = `${ward}, ${district}`;
  }

  /** Tỉnh / Thành phố — không dùng postcode */
  let cityField = a.city || a.town || a.municipality || a.village || "";

  if (!cityField && a.state) {
    const st = String(a.state).trim();
    if (st && !looksLikePostalCode(st)) cityField = st;
  }

  if (looksLikePostalCode(cityField)) cityField = "";
  if (looksLikePostalCode(stateField)) stateField = "";

  const country = a.country || "Việt Nam";

  const addressField = display || line1;

  return {
    address: addressField,
    state: stateField,
    city: cityField,
    country,
  };
}

async function reverseGeocodeJson(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
    lat,
  )}&lon=${encodeURIComponent(lng)}&accept-language=vi`;
  const res = await fetch(url, { headers: { "Accept-Language": "vi" } });
  if (!res.ok) return null;
  return res.json();
}

function GeoSearch({ onPick }) {
  const map = useMap();
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const control = new GeoSearchControl({
      provider,
      style: "bar",
      showMarker: false,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: false,
      searchLabel: "Tìm địa chỉ (OpenStreetMap)",
      autoComplete: true,
    });
    map.addControl(control);
    const handler = (e) => {
      const { x, y } = e.location;
      onPickRef.current({ lat: y, lng: x });
    };
    map.on("geosearch/showlocation", handler);
    return () => {
      map.off("geosearch/showlocation", handler);
      map.removeControl(control);
    };
  }, [map]);

  return null;
}

/**
 * Bản đồ OSM + tìm kiếm Nominatim (leaflet-geosearch). Không cần API key.
 * @param {{ onResolved: (p: { address: string, state: string, city: string, country: string }) => void }} props
 */
export function OpenStreetMapAddressPicker({ onResolved }) {
  const onResolvedRef = useRef(onResolved);
  onResolvedRef.current = onResolved;

  const [position, setPosition] = useState(() => [...DEFAULT_CENTER]);

  const resolveFromLatLng = useCallback(async (lat, lng) => {
    const data = await reverseGeocodeJson(lat, lng);
    if (data) {
      onResolvedRef.current(parseNominatimJson(data));
    }
  }, []);

  const handlePick = useCallback(
    async ({ lat, lng }) => {
      setPosition([lat, lng]);
      await resolveFromLatLng(lat, lng);
    },
    [resolveFromLatLng],
  );

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-600">
        Gõ ô tìm kiếm trên bản đồ hoặc kéo ghim để chọn điểm. Dữ liệu địa lý:{" "}
        <span className="font-medium">OpenStreetMap / Nominatim</span>.
      </p>
      <div className="relative z-0 h-[280px] w-full overflow-hidden rounded-lg border-2 border-gray-200 [&_.leaflet-control-container]:z-[1000] [&_.leaflet-control-geocoder]:min-w-[12rem] [&_.leaflet-control-geocoder]:shadow-md [&_.leaflet-pane]:z-[400]">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          className="h-full w-full"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <GeoSearch onPick={handlePick} />
          <Marker
            position={position}
            draggable
            eventHandlers={{
              dragend: async (e) => {
                const { lat, lng } = e.target.getLatLng();
                setPosition([lat, lng]);
                await resolveFromLatLng(lat, lng);
              },
            }}
          />
        </MapContainer>
      </div>
    </div>
  );
}
