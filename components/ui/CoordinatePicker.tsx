"use client";

import { Loader2, MapPin, Minus, Plus, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const TILE_SIZE = 256;
const DEFAULT_CENTER = { lat: -7.782968, lng: 110.367013 };

function lngToX(lng: number, zoom: number) {
  return ((lng + 180) / 360) * Math.pow(2, zoom) * TILE_SIZE;
}

function latToY(lat: number, zoom: number) {
  const sin = Math.sin((lat * Math.PI) / 180);
  return (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * Math.pow(2, zoom) * TILE_SIZE;
}

function xToLng(x: number, zoom: number) {
  return (x / (Math.pow(2, zoom) * TILE_SIZE)) * 360 - 180;
}

function yToLat(y: number, zoom: number) {
  const n = Math.PI - (2 * Math.PI * y) / (Math.pow(2, zoom) * TILE_SIZE);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

function parseCoordinate(value?: string) {
  if (!value) return null;
  const [lat, lng] = value.split(",").map((item) => Number(item.trim()));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

function formatCoordinate(lat: number, lng: number) {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

type CoordinatePickerProps = {
  open: boolean;
  value: string;
  onClose: () => void;
  onSave: (value: string) => void;
};

export default function CoordinatePicker({ open, value, onClose, onSave }: CoordinatePickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; centerX: number; centerY: number; moved: boolean } | null>(null);
  const [size, setSize] = useState({ width: 900, height: 500 });
  const [zoom, setZoom] = useState(13);
  const initial = parseCoordinate(value) || DEFAULT_CENTER;
  const [center, setCenter] = useState(initial);
  const [selected, setSelected] = useState(parseCoordinate(value) || initial);
  const [coordinateInput, setCoordinateInput] = useState(value || formatCoordinate(initial.lat, initial.lng));
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    if (!open) return;
    const next = parseCoordinate(value) || DEFAULT_CENTER;
    setCenter(next);
    setSelected(next);
    setCoordinateInput(formatCoordinate(next.lat, next.lng));
    setSearchError("");
  }, [open, value]);

  useEffect(() => {
    if (!open || !mapRef.current) return;
    const updateSize = () => {
      const rect = mapRef.current?.getBoundingClientRect();
      if (rect) setSize({ width: rect.width, height: rect.height });
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, [open]);

  const geometry = useMemo(() => {
    const centerX = lngToX(center.lng, zoom);
    const centerY = latToY(center.lat, zoom);
    const topLeftX = centerX - size.width / 2;
    const topLeftY = centerY - size.height / 2;
    const tiles = [];
    const minTileX = Math.floor(topLeftX / TILE_SIZE) - 1;
    const maxTileX = Math.floor((topLeftX + size.width) / TILE_SIZE) + 1;
    const minTileY = Math.floor(topLeftY / TILE_SIZE) - 1;
    const maxTileY = Math.floor((topLeftY + size.height) / TILE_SIZE) + 1;
    const tileCount = Math.pow(2, zoom);
    for (let x = minTileX; x <= maxTileX; x += 1) {
      for (let y = minTileY; y <= maxTileY; y += 1) {
        if (y < 0 || y >= tileCount) continue;
        const wrappedX = ((x % tileCount) + tileCount) % tileCount;
        tiles.push({
          key: `${zoom}-${x}-${y}`,
          src: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${y}.png`,
          left: x * TILE_SIZE - topLeftX,
          top: y * TILE_SIZE - topLeftY,
        });
      }
    }
    return { topLeftX, topLeftY, tiles };
  }, [center, size.height, size.width, zoom]);

  const marker = useMemo(() => {
    if (!selected) return null;
    return {
      left: lngToX(selected.lng, zoom) - geometry.topLeftX,
      top: latToY(selected.lat, zoom) - geometry.topLeftY,
    };
  }, [geometry.topLeftX, geometry.topLeftY, selected, zoom]);

  if (!open) return null;

  function updateZoom(nextZoom: number) {
    setZoom(Math.max(5, Math.min(18, nextZoom)));
  }

  function applyCoordinateInput(nextValue: string) {
    setCoordinateInput(nextValue);
    const parsed = parseCoordinate(nextValue);
    if (!parsed) return;
    setSelected(parsed);
    setCenter(parsed);
  }

  async function searchLocation() {
    const query = searchQuery.trim();
    if (!query) {
      setSearchError("Masukkan nama wilayah atau alamat.");
      return;
    }

    setSearching(true);
    setSearchError("");
    try {
      const params = new URLSearchParams({
        q: query,
        format: "json",
        limit: "1",
        countrycodes: "id",
      });
      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Search failed");
      const results = await res.json();
      const first = Array.isArray(results) ? results[0] : null;
      if (!first) {
        setSearchError("Wilayah tidak ditemukan.");
        return;
      }
      const next = { lat: Number(first.lat), lng: Number(first.lon) };
      if (!Number.isFinite(next.lat) || !Number.isFinite(next.lng)) {
        setSearchError("Koordinat hasil pencarian tidak valid.");
        return;
      }
      setCenter(next);
      setSelected(next);
      setCoordinateInput(formatCoordinate(next.lat, next.lng));
      setZoom(15);
    } catch {
      setSearchError("Gagal mencari wilayah. Coba lagi.");
    } finally {
      setSearching(false);
    }
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const centerX = lngToX(center.lng, zoom);
    const centerY = latToY(center.lat, zoom);
    dragRef.current = { x: event.clientX, y: event.clientY, centerX, centerY, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.moved = true;
    const nextX = drag.centerX - dx;
    const nextY = drag.centerY - dy;
    setCenter({ lat: yToLat(nextY, zoom), lng: xToLng(nextX, zoom) });
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    if (drag?.moved) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = geometry.topLeftX + event.clientX - rect.left;
    const y = geometry.topLeftY + event.clientY - rect.top;
    const next = { lat: yToLat(y, zoom), lng: xToLng(x, zoom) };
    setSelected(next);
    setCoordinateInput(formatCoordinate(next.lat, next.lng));
  }

  const selectedValue = selected ? formatCoordinate(selected.lat, selected.lng) : "";

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-black text-slate-950">Pilih Koordinat dari Maps</h2>
            <p className="text-sm text-slate-500">Klik titik lokasi pelanggan pada peta, lalu simpan.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900">
            <X size={16} />
          </button>
        </div>

        <div
          ref={mapRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={(event) => {
            event.preventDefault();
            updateZoom(zoom + (event.deltaY < 0 ? 1 : -1));
          }}
          className="relative min-h-[420px] flex-1 cursor-crosshair overflow-hidden bg-slate-200 touch-none"
        >
          <div className="absolute left-4 top-4 z-10 w-[min(calc(100%-2rem),620px)] rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/15">
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      searchLocation();
                    }
                  }}
                  placeholder="Cari wilayah, alamat, atau nama tempat..."
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <button
                type="button"
                onClick={searchLocation}
                disabled={searching}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#6366F1] px-4 text-sm font-bold text-white shadow-sm shadow-indigo-200 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
              >
                {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                Cari
              </button>
            </div>
            {searchError ? <p className="mt-2 px-1 text-xs font-semibold text-rose-600">{searchError}</p> : null}
          </div>

          {geometry.tiles.map((tile) => (
            <img
              key={tile.key}
              src={tile.src}
              alt=""
              draggable={false}
              className="absolute h-64 w-64 select-none"
              style={{ left: tile.left, top: tile.top }}
            />
          ))}
          {marker ? (
            <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-full text-rose-500 drop-shadow-lg" style={{ left: marker.left, top: marker.top }}>
              <MapPin size={44} fill="currentColor" className="text-rose-500" />
            </div>
          ) : null}

          <div className="absolute left-4 top-24 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
            <button type="button" onClick={() => updateZoom(zoom + 1)} className="grid h-10 w-10 place-items-center border-b border-slate-200 text-slate-700 hover:bg-slate-50">
              <Plus size={18} />
            </button>
            <button type="button" onClick={() => updateZoom(zoom - 1)} className="grid h-10 w-10 place-items-center text-slate-700 hover:bg-slate-50">
              <Minus size={18} />
            </button>
          </div>
        </div>

        <div className="grid gap-3 border-t border-slate-200 p-4 md:grid-cols-[1fr_220px_220px]">
          <input value={coordinateInput} onChange={(event) => applyCoordinateInput(event.target.value)} placeholder="-7.782968, 110.367013" className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
          <button type="button" onClick={() => onSave(selectedValue || coordinateInput)} className="h-11 rounded-lg bg-[#6366F1] px-4 text-sm font-bold text-white shadow-sm shadow-indigo-200 hover:bg-indigo-500">Simpan</button>
          <button type="button" onClick={onClose} className="h-11 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-600 hover:bg-slate-50">Batal</button>
        </div>
      </div>
    </div>
  );
}
