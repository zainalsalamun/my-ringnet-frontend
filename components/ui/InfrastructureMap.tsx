"use client";
/* eslint-disable @next/next/no-img-element */

import { Expand, MapPin, Minus, Plus, Shrink } from "lucide-react";
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

function lngToX(lng: number, zoom: number) { return ((lng + 180) / 360) * Math.pow(2, zoom) * TILE_SIZE; }
function latToY(lat: number, zoom: number) {
  const sin = Math.sin((lat * Math.PI) / 180);
  return (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * Math.pow(2, zoom) * TILE_SIZE;
}

export default function InfrastructureMap({ points }: { points: InfrastructurePoint[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 900, height: 450 });
  const [zoom, setZoom] = useState(13);
  const [fullscreen, setFullscreen] = useState(false);
  const validPoints = useMemo(() => points.map((point) => ({ ...point, point: parseCoordinate(point.coordinate) })).filter((point) => point.point), [points]);
  const center = useMemo(() => {
    if (!validPoints.length) return DEFAULT_CENTER;
    return {
      lat: validPoints.reduce((sum, item) => sum + item.point!.lat, 0) / validPoints.length,
      lng: validPoints.reduce((sum, item) => sum + item.point!.lng, 0) / validPoints.length,
    };
  }, [validPoints]);

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
        tiles.push({ key: `${zoom}-${x}-${y}`, src: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${y}.png`, left: x * TILE_SIZE - topLeftX, top: y * TILE_SIZE - topLeftY });
      }
    }
    return { topLeftX, topLeftY, tiles };
  }, [center.lat, center.lng, size.height, size.width, zoom]);

  return (
    <div className={fullscreen ? "fixed inset-0 z-[100] bg-white p-4" : "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"}>
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h3 className="flex items-center gap-2 font-black text-slate-950"><MapPin size={20} className="text-indigo-600" /> Peta Jaringan FTTH</h3>
          <p className="mt-1 text-xs text-slate-500">{validPoints.length} titik infrastruktur dari database</p>
        </div>
        <button type="button" onClick={() => setFullscreen((value) => !value)} className="inline-flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-3 text-xs font-bold text-white hover:bg-indigo-500">
          {fullscreen ? <Shrink size={15} /> : <Expand size={15} />} {fullscreen ? "Tutup" : "Tampilan Penuh"}
        </button>
      </div>
      <div ref={mapRef} className={`relative overflow-hidden bg-slate-200 ${fullscreen ? "h-[calc(100vh-96px)]" : "h-[460px]"}`}>
        {geometry.tiles.map((tile) => <img key={tile.key} src={tile.src} alt="" draggable={false} className="absolute h-64 w-64 select-none" style={{ left: tile.left, top: tile.top }} />)}
        {validPoints.map((item) => {
          const left = lngToX(item.point!.lng, zoom) - geometry.topLeftX;
          const top = latToY(item.point!.lat, zoom) - geometry.topLeftY;
          return <div key={item.id} className="group absolute -translate-x-1/2 -translate-y-full" style={{ left, top }}><MapPin size={38} fill="currentColor" className="text-indigo-600 drop-shadow-lg" /><div className="pointer-events-none absolute bottom-10 left-1/2 hidden min-w-36 -translate-x-1/2 rounded-lg bg-slate-950 px-3 py-2 text-center text-xs text-white shadow-xl group-hover:block"><strong className="block">{item.name}</strong><span className="uppercase text-slate-300">{item.assetType}</span></div></div>;
        })}
        {!validPoints.length ? <div className="absolute inset-0 grid place-items-center bg-slate-900/10"><div className="rounded-xl bg-white/95 px-5 py-4 text-center shadow-lg"><MapPin className="mx-auto text-slate-400" /><p className="mt-2 text-sm font-bold text-slate-700">Belum ada koordinat infrastruktur</p></div></div> : null}
        <div className="absolute left-4 top-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"><button type="button" onClick={() => setZoom((value) => Math.min(18, value + 1))} className="grid h-10 w-10 place-items-center border-b border-slate-200 hover:bg-slate-50"><Plus size={18} /></button><button type="button" onClick={() => setZoom((value) => Math.max(5, value - 1))} className="grid h-10 w-10 place-items-center hover:bg-slate-50"><Minus size={18} /></button></div>
        <div className="absolute bottom-2 right-2 rounded bg-white/90 px-2 py-1 text-[10px] font-semibold text-slate-600">© OpenStreetMap contributors</div>
      </div>
    </div>
  );
}
