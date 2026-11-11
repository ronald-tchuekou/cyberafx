"use client";
import { CandlestickSeries, ColorType, LineSeries, createChart, type IChartApi, type ISeriesApi, type UTCTimestamp } from "lightweight-charts";
import { Layers, Play, Pause, Sparkles, Wand2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { consumeScan } from "../actions";
import { SYMBOLS, TIMEFRAMES, ema, generateCandles, type Timeframe } from "../lib/candles";
import { analyze, type Analysis } from "../lib/smc";
import { StrategyComposer } from "./strategy-composer";

type HistoryItem = { at: string; symbol: string; tf: string; trend: string; score: number; side?: string };
const HISTORY_KEY = "cyberafx:scan-history";

export function ChartWorkspace({ usage }: { usage: { used: number; limit: number | null; vip: boolean } }) {
  const [symbol, setSymbol] = useState<string>("XAUUSD");
  const [tf, setTf] = useState<Timeframe>("H1");
  const [used, setUsed] = useState(usage.used);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [showLayers, setShowLayers] = useState(true);
  const [replay, setReplay] = useState<number | null>(null); // nb de bougies visibles pendant le replay
  const [playing, setPlaying] = useState(false);
  const [composer, setComposer] = useState(false);
  const [chat, setChat] = useState<{ role: "me" | "ai"; text: string }[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]"); } catch { return []; }
  });
  const box = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const linesRef = useRef<ISeriesApi<"Line">[]>([]);

  const all = useMemo(() => generateCandles(symbol, tf), [symbol, tf]);
  const candles = useMemo(() => (replay == null ? all : all.slice(0, replay)), [all, replay]);
  const meta = SYMBOLS.find((s) => s.id === symbol)!;
  const last = candles.at(-1)!, first = candles[candles.length - 25] ?? candles[0];
  const change = ((last.close - first.close) / first.close) * 100;

  useEffect(() => {
    const chart = createChart(box.current!, {
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: "#8b93a7" },
      grid: { vertLines: { color: "rgba(255,255,255,0.04)" }, horzLines: { color: "rgba(255,255,255,0.04)" } },
      timeScale: { timeVisible: true, borderColor: "rgba(255,255,255,0.1)" },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.1)" },
    });
    chartRef.current = chart;
    candleRef.current = chart.addSeries(CandlestickSeries, { upColor: "#22c55e", downColor: "#ef4444", borderVisible: false, wickUpColor: "#22c55e", wickDownColor: "#ef4444" });
    linesRef.current = [
      chart.addSeries(LineSeries, { color: "#38bdf8", lineWidth: 1, priceLineVisible: false, lastValueVisible: false }),
      chart.addSeries(LineSeries, { color: "#f59e0b", lineWidth: 1, priceLineVisible: false, lastValueVisible: false }),
    ];
    return () => chart.remove();
  }, []);

  useEffect(() => {
    const t = (c: { time: number }) => c.time as UTCTimestamp;
    candleRef.current?.setData(candles.map((c) => ({ ...c, time: t(c) })));
    const closes = candles.map((c) => c.close);
    [20, 50].forEach((p, k) => linesRef.current[k]?.setData(ema(closes, p).map((v, i) => ({ time: t(candles[i]), value: v }))));
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  // Niveaux de l'idée de trade + zones affichées en lignes de prix.
  useEffect(() => {
    const s = candleRef.current;
    if (!s) return;
    const lines = !analysis || !showLayers ? [] : [
      ...(analysis.idea ? [
        s.createPriceLine({ price: analysis.idea.entry, color: "#818cf8", title: "ENTRY", lineWidth: 1 }),
        s.createPriceLine({ price: analysis.idea.takeProfit, color: "#22c55e", title: "TP", lineWidth: 1 }),
        s.createPriceLine({ price: analysis.idea.stopLoss, color: "#ef4444", title: "SL", lineWidth: 1 }),
      ] : []),
      ...analysis.zones.flatMap((z) => [z.top, z.bottom].map((p) =>
        s.createPriceLine({ price: p, color: z.kind === "OB" ? "#f59e0b66" : z.kind === "FVG" ? "#38bdf866" : "#a78bfa66", lineWidth: 1, lineStyle: 2, axisLabelVisible: false, title: z.kind }))),
    ];
    return () => lines.forEach((l) => s.removePriceLine(l));
  }, [analysis, showLayers]);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setReplay((r) => {
      const next = (r ?? all.length - 60) + 1;
      if (next >= all.length) { setPlaying(false); return all.length; }
      return next;
    }), 350);
    return () => clearInterval(t);
  }, [playing, all.length]);

  const limitLabel = usage.limit === null ? "Unlimited" : `${used}/${usage.limit}`;

  async function scan() {
    const r = await consumeScan({});
    if (!r.ok) return void toast.error(r.error);
    setUsed((u) => u + 1);
    const a = analyze(candles);
    setAnalysis(a);
    setChat((c) => [...c, { role: "ai", text: `Scan ${symbol} ${tf} : tendance ${a.trend}, structure ${a.structure}, confluence ${a.score}/6.` }]);
    const item: HistoryItem = { at: new Date().toISOString(), symbol, tf, trend: a.trend, score: a.score, side: a.idea?.side };
    setHistory((h) => {
      const next = [item, ...h].slice(0, 20);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function ask(q: string) {
    const text = q.trim().toLowerCase();
    if (!text) return;
    const a = analysis;
    const answer = !a ? "Lancez d'abord un scan (bouton Analyze)." :
      text.includes("entry") ? (a.idea ? `${a.idea.side} @ ${a.idea.entry.toFixed(meta.digits)} · SL ${a.idea.stopLoss.toFixed(meta.digits)} · TP ${a.idea.takeProfit.toFixed(meta.digits)} (R:R ${a.idea.rr})` : "Pas d'entrée : marché en range.") :
      text.includes("trend") ? `Tendance ${a.trend}, structure ${a.structure}.` :
      text.includes("risk") ? `ATR(14) ≈ ${a.atr.toFixed(meta.digits)}. ${a.idea ? `R:R ${a.idea.rr}` : "Aucune idée de trade."}` :
      text.includes("level") ? `Support ${a.levels.support.toFixed(meta.digits)} · Résistance ${a.levels.resistance.toFixed(meta.digits)}.` :
      "Essayez : entry, trend, risk, levels.";
    setChat((c) => [...c, { role: "me", text: q }, { role: "ai", text: answer }]);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-2">
        <select aria-label="Symbol" value={symbol} onChange={(e) => { setSymbol(e.target.value); setAnalysis(null); setReplay(null); }} className="h-8 rounded-lg border bg-input/30 px-2 text-sm font-semibold">
          {SYMBOLS.map((s) => <option key={s.id} value={s.id}>{s.id}</option>)}
        </select>
        <div className="flex gap-0.5">
          {(Object.keys(TIMEFRAMES) as Timeframe[]).map((k) => (
            <button key={k} onClick={() => { setTf(k); setAnalysis(null); setReplay(null); }} className={cn("rounded px-2 py-1 text-xs font-semibold", tf === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>{k}</button>
          ))}
        </div>
        <span className="rounded bg-muted px-2 py-1 text-[11px] font-semibold">CyberAFX AI</span>
        <button onClick={() => { setReplay((r) => (r == null ? all.length - 60 : null)); setPlaying(false); }} className={cn("rounded px-2 py-1 text-[11px] font-semibold", replay != null ? "bg-brand text-brand-foreground" : "bg-muted")}>
          🎮 {replay != null ? "EXIT REPLAY" : "SIMULATE / REPLAY"}
        </button>
        {replay != null && <Button size="icon-sm" variant="outline" aria-label={playing ? "Pause replay" : "Play replay"} onClick={() => setPlaying((p) => !p)}>{playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}</Button>}
        <span className="ml-auto flex items-center gap-3 text-xs">
          <b className={change >= 0 ? "text-success" : "text-destructive"}>{last.close.toFixed(meta.digits)} <span className="font-normal">{change >= 0 ? "+" : ""}{change.toFixed(2)}%</span></b>
          <Link href="/client/buy" className="rounded bg-brand/15 px-2 py-1 text-[11px] font-semibold text-brand">
            {usage.vip ? "Scans" : "Free Preview"}: {limitLabel}{!usage.vip && " (Upgrade)"}
          </Link>
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_20rem]">
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="flex items-center gap-2 border-b px-3 py-1.5">
            <Button size="sm" variant="outline" onClick={() => setComposer(true)}><Wand2 />Build Strategy <kbd className="ml-1 rounded bg-muted px-1 text-[11px]">⌘K</kbd></Button>
            <Button size="sm" variant="outline" onClick={() => setShowLayers((v) => !v)}><Layers />Layers</Button>
            <Button size="sm" className="bg-brand text-brand-foreground hover:bg-brand/80" onClick={scan}><Sparkles />Analyze</Button>
            <span className="ml-auto text-[11px] text-muted-foreground">{meta.name} · {tf} · {meta.group} · EMA(20) EMA(50)</span>
          </div>
          <div ref={box} className="h-[26rem] w-full" />
        </div>

        <div className="flex h-[30rem] flex-col rounded-xl border bg-card">
          <Tabs defaultValue="ai" className="flex min-h-0 flex-1 flex-col">
            <TabsList variant="line" className="w-full">
              <TabsTrigger value="ai">AI Analysis &amp; Chat</TabsTrigger><TabsTrigger value="strategy">Strategy v3</TabsTrigger><TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="ai" className="min-h-0 flex-1 overflow-y-auto p-3">
              {!analysis ? (
                <div className="rounded-lg border bg-muted/30 p-4 text-center">
                  <Sparkles className="mx-auto mb-2 size-5 text-brand" />
                  <p className="text-sm font-bold">Institutional SMC Chart Analyzer</p>
                  <p className="mt-1 text-xs text-muted-foreground">Click Analyze to scan {candles.length} {symbol} ({tf}) candles for Supply/Demand Order Blocks, Fair Value Gaps, BOS/CHoCH, OTE pockets and calibrated trade ideas.</p>
                  <Button className="mt-3 w-full bg-brand text-brand-foreground hover:bg-brand/80" onClick={scan}>Scan {symbol} · {tf} Now</Button>
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <p>Trend <b>{analysis.trend}</b> · Structure <b>{analysis.structure}</b> · Score <b>{analysis.score}/6</b></p>
                  {analysis.idea && (
                    <div className="rounded-lg border bg-muted/40 p-2 font-mono">
                      <b className={analysis.idea.side === "BUY" ? "text-success" : "text-destructive"}>{analysis.idea.side}</b> · R:R {analysis.idea.rr}
                      <div>Entry {analysis.idea.entry.toFixed(meta.digits)}</div><div>TP {analysis.idea.takeProfit.toFixed(meta.digits)}</div><div>SL {analysis.idea.stopLoss.toFixed(meta.digits)}</div>
                    </div>
                  )}
                  <p className="text-muted-foreground">{analysis.zones.length} zones (FVG / OB / OTE) tracées. Analyse indicative sur données simulées, pas un conseil financier.</p>
                </div>
              )}
              <div className="mt-3 space-y-1.5">{chat.map((m, i) => <p key={i} className={cn("rounded-lg px-2.5 py-1.5 text-xs", m.role === "me" ? "ml-6 bg-primary/20" : "mr-6 bg-muted")}>{m.text}</p>)}</div>
            </TabsContent>
            <TabsContent value="strategy" className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-3">
              {(analysis?.pillars ?? []).map((p) => (
                <div key={p.name} className="flex items-start gap-2 rounded-lg bg-muted/40 p-2 text-xs">
                  <span className={p.pass ? "text-success" : "text-destructive"}>{p.pass ? "✔" : "✘"}</span>
                  <div><p className="font-semibold">{p.name}</p><p className="text-muted-foreground">{p.detail}</p></div>
                </div>
              ))}
              {!analysis && <p className="text-xs text-muted-foreground">Lancez un scan pour évaluer les 6 piliers.</p>}
            </TabsContent>
            <TabsContent value="history" className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-3">
              {history.length === 0 && <p className="text-xs text-muted-foreground">Aucun scan pour l&apos;instant.</p>}
              {history.map((h) => (
                <div key={h.at} className="flex justify-between rounded-lg bg-muted/40 p-2 text-xs"><span className="font-semibold">{h.symbol} {h.tf}</span><span>{h.side ?? "—"} · {h.trend} · {h.score}/6</span></div>
              ))}
            </TabsContent>
          </Tabs>
          <form className="flex items-center gap-1.5 border-t p-2" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); ask(String(f.get("q") ?? "")); e.currentTarget.reset(); }}>
            {["Entry", "Trend", "Risk", "Key Levels"].map((q) => <button type="button" key={q} onClick={() => ask(q.replace("Key Levels", "levels"))} className="rounded bg-muted px-1.5 py-1 text-[11px] font-semibold">{q}</button>)}
            <Input name="q" placeholder="Ask AI Copilot…" className="h-7 text-xs" autoComplete="off" />
          </form>
        </div>
      </div>
      <StrategyComposer open={composer} onOpenChange={setComposer} />
    </div>
  );
}
