"use client";
/* eslint-disable @next/next/no-img-element */

import { Expand, MapPin, Minus, Plus, RotateCcw, Shrink } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const TILE_SIZE = 256;
const DEFAULT_CENTER = { lat: -7.782968, lng: 110.367013 };

export type InfrastructurePoint = {
  id: string;
  name: string;
  assetType: string;
  coordinate: string;
  status?: string;
};

function parseCoordinate(value?: string) {
  if (!value) return null;
  const [lat, lng] = value.split(",").map((item) => Number(item.trim()));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}

function lngToX(lng: number, zoom: number) {
  return ((lng + 180) / 360) * Math.pow(2, zoom) * TILE_SIZE;
}

function latToY(lat: number, zoom: number) {
  const sin = Math.sin((lat * Math.PI) / 180);
  const clamped = Math.min(Math.max(sin, -0.9999), 0.9999);
  return (0.5 - Math.log((1 + clamped) / (1 - clamped)) / (4 * Math.PI)) * Math.pow(2, zoom) * TILE_SIZE;
}

function xToLng(x: number, zoom: number) {
  return (x / (Math.pow(2, zoom) * TILE_SIZE)) * 360 - 180;
}

function yToLat(y: number, zoom: number) {
  const n = Math.PI - (2 * Math.PI * y) / (Math.pow(2, zoom) * TILE_SIZE);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

export default function InfrastructureMap({ points }: { points: InfrastructurePoint[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; centerX: number; centerY: number; moved: boolean } | null>(null);
  const [size, setSize] = useState({ width: 900, height: 450 });
  const [zoom, setZoom] = useState(13);
  const [fullscreen, setFullscreen] = useState(false);
  const [activePoint, setActivePoint] = useState<InfrastructurePoint | null>(null);

  const validPoints = useMemo(
    () => points.map((point) => ({ ...point, point: parseCoordinate(point.coordinate) })).filter((point) => point.point),
    [points]
  );

  const initialCenter = useMemo(() => {
    if (!validPoints.length) return DEFAULT_CENTER;
    return {
      lat: validPoints.reduce((sum, item) => sum + item.point!.lat, 0) / validPoints.length,
      lng: validPoints.reduce((sum, item) => sum + item.point!.lng, 0) / validPoints.length,
    };
  }, [validPoints]);

  const [center, setCenter] = useState(initialCenter);

  useEffect(() => {
    setCenter(initialCenter);
  }, [initialCenter]);

  useEffect(() => {
    if (!mapRef.current) return;
    const update = () => {
      const rect = mapRef.current?.getBoundingClientRect();
      if (rect) setSize({ width: rect.width, height: rect.height });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, [fullscreen]);

  const geometry = useMemo(() => {
    const centerX = lngToX(center.lng, zoom);
    const centerY = latToY(center.lat, zoom);
    const topLeftX = centerX - size.width / 2;
    const topLeftY = centerY - size.height / 2;
    const tiles = [];
    const minX = Math.floor(topLeftX / TILE_SIZE) - 1;
    const maxX = Math.floor((topLeftX + size.width) / TILE_SIZE) + 1;
    const minY = Math.floor(topLeftY / TILE_SIZE) - 1;
    const maxY = Math.floor((topLeftY + size.height) / TILE_SIZE) + 1;
    const tileCount = Math.pow(2, zoom);
    for (let x = minX; x <= maxX; x += 1) {
      for (let y = minY; y <= maxY; y += 1) {
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
  }, [center.lat, center.lng, size.height, size.width, zoom]);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    const centerX = lngToX(center.lng, zoom);
    const centerY = latToY(center.lat, zoom);
    dragRef.current = { x: event.clientX, y: event.clientY, centerX, centerY, moved: false };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // ignore
    }
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
    dragRef.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // ignore
    }
  }

  return (
    <div className={fullscreen ? "fixed inset-0 z-[100] bg-white p-4" : "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"}>
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h3 className="flex items-center gap-2 font-black text-slate-950">
            <MapPin size={20} className="text-indigo-600" /> Peta Jaringan FTTH
          </h3>
          <p className="mt-1 text-xs text-slate-500">{validPoints.length} titik infrastruktur dari database (geser peta dengan mouse / scroll untuk zoom)</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setCenter(initialCenter);
              setZoom(13);
            }}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
            title="Pusatkan Peta"
          >
            <RotateCcw size={14} /> Reset Posisi
          </button>
          <button
            type="button"
            onClick={() => setFullscreen((value) => !value)}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-3 text-xs font-bold text-white hover:bg-indigo-500"
          >
            {fullscreen ? <Shrink size={15} /> : <Expand size={15} />} {fullscreen ? "Tutup" : "Tampilan Penuh"}
          </button>
        </div>
      </div>

      <div
        ref={mapRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={(event) => {
          event.preventDefault();
          setZoom((prev) => Math.max(5, Math.min(18, prev + (event.deltaY < 0 ? 1 : -1))));
        }}
        className={`relative overflow-hidden bg-slate-200 touch-none select-none cursor-grab active:cursor-grabbing ${
          fullscreen ? "h-[calc(100vh-96px)]" : "h-[460px]"
        }`}
      >
        {geometry.tiles.map((tile) => (
          <img
            key={tile.key}
            src={tile.src}
            alt=""
            draggable={false}
            className="pointer-events-none absolute h-64 w-64 select-none"
            style={{ left: tile.left, top: tile.top }}
          />
        ))}

        {validPoints.map((item) => {
          const left = lngToX(item.point!.lng, zoom) - geometry.topLeftX;
          const top = latToY(item.point!.lat, zoom) - geometry.topLeftY;
          const isSelected = activePoint?.id === item.id;

          const typeColor =
            item.assetType?.toLowerCase() === "olt"
              ? "text-indigo-600"
              : item.assetType?.toLowerCase() === "router"
              ? "text-blue-600"
              : item.assetType?.toLowerCase() === "switch"
              ? "text-sky-600"
              : item.assetType?.toLowerCase() === "pop"
              ? "text-rose-600"
              : item.assetType?.toLowerCase() === "odc"
              ? "text-amber-600"
              : "text-emerald-600";

          return (
            <div
              key={item.id}
              onClick={(e) => {
                e.stopPropagation();
                setActivePoint(isSelected ? null : item);
              }}
              className="group absolute -translate-x-1/2 -translate-y-full cursor-pointer transition-transform hover:scale-125 z-10"
              style={{ left, top }}
            >
              <MapPin size={38} fill="currentColor" className={`${typeColor} drop-shadow-lg`} />
              
              <div
                className={`pointer-events-none absolute bottom-10 left-1/2 min-w-40 -translate-x-1/2 rounded-xl bg-slate-950/95 p-3 text-center text-xs text-white shadow-2xl backdrop-blur-sm ${
                  isSelected ? "block ring-2 ring-indigo-400" : "hidden group-hover:block"
                }`}
              >
                <strong className="block text-sm font-black text-white">{item.name}</strong>
                <span className="mt-0.5 inline-block rounded bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-200">
                  {item.assetType}
                </span>
                <p className="mt-1.5 text-[11px] font-mono text-slate-400">{item.coordinate}</p>
                {item.status ? (
                  <span className={`mt-1 inline-block text-[10px] font-bold ${item.status === "active" ? "text-emerald-400" : "text-amber-400"}`}>
                    ● {item.status.toUpperCase()}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}

        {!validPoints.length ? (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-slate-900/10">
            <div className="rounded-xl bg-white/95 px-5 py-4 text-center shadow-lg">
              <MapPin className="mx-auto text-slate-400" />
              <p className="mt-2 text-sm font-bold text-slate-700">Belum ada koordinat infrastruktur</p>
            </div>
          </div>
        ) : null}

        {/* Zoom Controls */}
        <div className="absolute left-4 top-4 z-30 overflow-hidden rounded-xl border border-slate-200 bg-white/95 shadow-xl backdrop-blur-sm">
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setZoom((value) => Math.min(18, value + 1));
            }}
            className="grid h-10 w-10 cursor-pointer place-items-center border-b border-slate-200 text-slate-700 transition hover:bg-slate-100 active:bg-indigo-50 active:text-indigo-600"
            title="Perbesar (Zoom In)"
          >
            <Plus size={18} />
          </button>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setZoom((value) => Math.max(5, value - 1));
            }}
            className="grid h-10 w-10 cursor-pointer place-items-center text-slate-700 transition hover:bg-slate-100 active:bg-indigo-50 active:text-indigo-600"
            title="Perkecil (Zoom Out)"
          >
            <Minus size={18} />
          </button>
        </div>

        <div className="absolute bottom-2 right-2 rounded-md bg-white/90 px-2 py-1 text-[10px] font-semibold text-slate-600 shadow-sm backdrop-blur-sm">
          © OpenStreetMap contributors
        </div>
      </div>
    </div>
  );
}
