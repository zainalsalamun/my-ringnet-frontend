"use client";

import api from "@/lib/api";
import { useAuthStore } from "@/hooks/useAuth";
import axios from "axios";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, LoaderCircle, MessageCircleMore, RefreshCcw, Send, Sparkles, X } from "lucide-react";

type ChatMessage = { role: "user" | "assistant"; content: string };

const greeting: ChatMessage = {
  role: "assistant",
  content: "Halo! Saya Asisten AI MyRingNet. Ada yang bisa saya bantu terkait operasional, pelanggan, billing, tiket, dokumen, atau jaringan?",
};

export default function MitraAiChat() {
  const user = useAuthStore((state) => state.user);
  const isAdministrator = ["admin", "super_admin", "superadmin"].includes(user?.role || "");
  const [open, setOpen] = useState(false);
  const [division, setDivision] = useState("NOC / Teknis");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([greeting]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const conversationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get("/mitra-portal/ai-chat/history").then((response) => {
      const history = response.data.data;
      if (!history) return;
      setConversationId(history.id);
      setDivision(history.division || "NOC / Teknis");
      setSubject(history.subject || "");
      setMessages([greeting, ...(history.messages || []).map((item: ChatMessage) => ({ role: item.role, content: item.content }))]);
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    conversationRef.current?.scrollTo({ top: conversationRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const cleanMessage = message.trim();
    if (!cleanMessage || loading) return;

    const userMessage: ChatMessage = { role: "user", content: cleanMessage };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/mitra-portal/ai-chat", {
        conversationId,
        division,
        subject,
        message: cleanMessage,
      });
      setConversationId(response.data.data.conversationId);
      setMessages((current) => [...current, { role: "assistant", content: response.data.data.message }]);
    } catch (requestError: unknown) {
      setError(axios.isAxiosError<{ message?: string }>(requestError) ? requestError.response?.data?.message || "Asisten AI belum dapat dihubungi. Silakan coba lagi." : "Asisten AI belum dapat dihubungi. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[70] sm:bottom-7 sm:right-7">
      {open ? (
        <section role="dialog" aria-modal="true" aria-label="Assistant AI MyRingNet" className="absolute bottom-20 right-0 flex max-h-[calc(100vh-8rem)] w-[calc(100vw-2.5rem)] max-w-[430px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
          <header className="flex items-start justify-between border-b border-slate-100 bg-gradient-to-r from-slate-900 to-indigo-950 px-5 py-4 text-white">
            <div className="flex gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-400 text-slate-900"><Sparkles size={21} /></span>
              <div><h2 className="font-black">Assistant AI MyRingNet</h2><p className="mt-0.5 text-xs text-slate-300">{isAdministrator ? "Bantuan cepat untuk Administrator" : "Bantuan cepat untuk Reseller / Mitra"}</p></div>
            </div>
            <div className="flex gap-1"><button type="button" onClick={() => { setConversationId(null); setMessages([greeting]); setSubject(""); setError(""); }} aria-label="Mulai percakapan baru" title="Percakapan baru" className="grid h-9 w-9 place-items-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white"><RefreshCcw size={18} /></button><button type="button" onClick={() => setOpen(false)} aria-label="Tutup asisten AI" className="grid h-9 w-9 place-items-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white"><X size={21} /></button></div>
          </header>

          <div className="grid gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4 sm:grid-cols-2">
            <label className="text-xs font-bold text-slate-600">Divisi Tujuan<select value={division} onChange={(event) => setDivision(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500"><option>NOC / Teknis</option><option>Billing / Keuangan</option><option>Legal / Kemitraan</option><option>Customer Service</option><option>Produk / Presales</option></select></label>
            <label className="text-xs font-bold text-slate-600">Subjek<input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Contoh: Kendala IP" maxLength={120} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-500" /></label>
          </div>

          <div ref={conversationRef} className="min-h-48 flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {messages.map((item, index) => <div key={`${item.role}-${index}`} className={`flex gap-2.5 ${item.role === "user" ? "justify-end" : "justify-start"}`}>{item.role === "assistant" ? <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo-100 text-indigo-600"><Bot size={16} /></span> : null}<div className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-5 ${item.role === "user" ? "rounded-br-md bg-indigo-600 text-white" : "rounded-bl-md bg-slate-100 text-slate-700"}`}>{item.content}</div></div>)}
            {loading ? <div className="flex items-center gap-2.5"><span className="grid h-8 w-8 place-items-center rounded-full bg-indigo-100 text-indigo-600"><Bot size={16} /></span><div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-slate-100 px-3.5 py-2.5 text-sm text-slate-500"><LoaderCircle size={15} className="animate-spin" /> Sedang menyiapkan jawaban...</div></div> : null}
          </div>

          <form onSubmit={submit} className="border-t border-slate-100 p-4">
            {error ? <p className="mb-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{error}</p> : null}
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tuliskan kendala atau bantuan yang Anda butuhkan..." rows={3} maxLength={4000} className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            <button type="submit" disabled={!message.trim() || loading} className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-400 text-sm font-black text-slate-900 shadow-lg shadow-amber-100 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"><Send size={18} /> Kirim ke Asisten AI</button>
            <p className="mt-2 text-center text-[10px] text-slate-400">AI dapat membuat kekeliruan. Verifikasi informasi penting dengan admin.</p>
          </form>
        </section>
      ) : null}

      <button type="button" onClick={() => setOpen((current) => !current)} aria-label={open ? "Tutup asisten AI" : "Buka asisten AI"} className="grid h-16 w-16 place-items-center rounded-full border-4 border-white bg-amber-400 text-slate-900 shadow-xl shadow-amber-200 transition hover:scale-105 hover:bg-amber-300 sm:h-[72px] sm:w-[72px]">
        {open ? <X size={28} /> : <MessageCircleMore size={31} />}
      </button>
    </div>
  );
}
