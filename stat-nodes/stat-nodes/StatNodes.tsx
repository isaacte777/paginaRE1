import { useMemo, useState, type ReactNode } from "react";

/* ---------- Shared node shell ---------- */
type ShellProps = {
  title: string;
  subtitle?: string | undefined;
  accent?: string; // css var name e.g. "var(--viz-1)"
  badge?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
};

export function NodeShell({ title, subtitle, accent = "var(--viz-1)", badge, children, footer, width = 340 }: ShellProps) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-node-border bg-node font-mono text-node-text shadow-2xl"
      style={{ width }}
    >
      <div className="absolute inset-y-0 left-0 w-1" style={{ background: accent }} />
      <div className="flex items-start justify-between gap-2 px-4 pt-3 pl-5">
        <div className="min-w-0">
          <div className="truncate text-xs font-semibold tracking-wide">{title}</div>
          {subtitle && <div className="truncate text-[10px] text-node-muted">{subtitle}</div>}
        </div>
        {badge && (
          <span
            className="shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase"
            style={{ color: accent, borderColor: accent }}
          >
            {badge}
          </span>
        )}
      </div>
      <div className="px-4 pb-3 pl-5 pt-2">{children}</div>
      {footer && <div className="border-t border-node-border px-4 py-2 pl-5 text-[10px] text-node-muted">{footer}</div>}
      {/* connection handles */}
      <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-node-border bg-node" />
      <span className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rounded-full border border-node-border bg-node" />
    </div>
  );
}

const fmt = (n: number) =>
  Math.abs(n) >= 1e6 ? (n / 1e6).toFixed(1) + "M" : Math.abs(n) >= 1e3 ? (n / 1e3).toFixed(1) + "k" : n.toFixed(n % 1 ? 1 : 0);

function Delta({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span className="text-[11px] font-semibold" style={{ color: up ? "var(--viz-up)" : "var(--viz-down)" }}>
      {up ? "▲" : "▼"} {Math.abs(value).toFixed(1)}%
    </span>
  );
}

/* ---------- 1. Line / Area: tendencias en el tiempo ---------- */
export type Point = { label: string; value: number };

export function LineChartNode({
  title, subtitle, data, unit = "", accent = "var(--viz-1)",
}: { title: string; subtitle?: string | undefined; data: Point[]; unit?: string; accent?: string }) {
  const W = 300, H = 110, P = 6;
  const [hover, setHover] = useState<number | null>(null);
  const { pts, path, area, min, max } = useMemo(() => {
    const vals = data.map((d) => d.value);
    const min = Math.min(...vals), max = Math.max(...vals);
    const span = max - min || 1;
    const pts = data.map((d, i) => ({
      x: P + (i * (W - P * 2)) / Math.max(1, data.length - 1),
      y: P + (1 - (d.value - min) / span) * (H - P * 2 - 10),
    }));
    // smooth curve
    let path = `M${pts[0]!.x},${pts[0]!.y}`;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1]!, b = pts[i]!, cx = (a.x + b.x) / 2;
      path += ` C${cx},${a.y} ${cx},${b.y} ${b.x},${b.y}`;
    }
    const area = `${path} L${pts[pts.length - 1]!.x},${H} L${pts[0]!.x},${H} Z`;
    return { pts, path, area, min, max };
  }, [data]);
  const last = data[data.length - 1]?.value ?? 0;
  const first = data[0]?.value || 1;
  const change = ((last - first) / Math.abs(first)) * 100;
  const shown = hover !== null ? data[hover] : data[data.length - 1];
  const gid = useMemo(() => "g" + Math.random().toString(36).slice(2), []);

  return (
    <NodeShell title={title} subtitle={subtitle} accent={accent} badge="trend"
      footer={<div className="flex justify-between"><span>min {fmt(min)}{unit}</span><span>max {fmt(max)}{unit}</span></div>}>
      <div className="mb-1 flex items-baseline justify-between">
        <div>
          <span className="text-2xl font-bold">{fmt(shown!.value)}</span>
          <span className="ml-1 text-xs text-node-muted">{unit}</span>
          <div className="text-[10px] text-node-muted">{shown!.label}</div>
        </div>
        <Delta value={change} />
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width) * W;
          let best = 0;
          pts.forEach((p, i) => { if (Math.abs(p.x - x) < Math.abs(pts[best]!.x - x)) best = i; });
          setHover(best);
        }}>
        <defs>
          <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.45" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={0} x2={W} y1={H * f} y2={H * f} stroke="var(--node-border)" strokeDasharray="2 4" />
        ))}
        <path d={area} fill={`url(#${gid})`} className="viz-fade" />
        <path d={path} fill="none" stroke={accent} strokeWidth={2} pathLength={1} className="viz-draw" />
        {hover !== null && (
          <line x1={pts[hover]!.x} x2={pts[hover]!.x} y1={0} y2={H} stroke="var(--node-muted)" strokeDasharray="3 3" />
        )}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={hover === i ? 4.5 : 2.5} fill="var(--node)" stroke={accent} strokeWidth={2} />
        ))}
      </svg>
    </NodeShell>
  );
}

/* ---------- 2. Bar: comparar categorías ---------- */
export type Bar = { label: string; value: number; previous?: number };

export function BarChartNode({
  title, subtitle, data, unit = "", accent = "var(--viz-3)",
}: { title: string; subtitle?: string | undefined; data: Bar[]; unit?: string; accent?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.flatMap((d) => [d.value, d.previous ?? 0])) || 1;
  const total = data.reduce((s, d) => s + d.value, 0);
  const H = 110;
  return (
    <NodeShell title={title} subtitle={subtitle} accent={accent} badge="compare"
      footer={<div className="flex items-center gap-3">
        <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-sm" style={{ background: accent }} />actual</span>
        <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-node-border" />anterior</span>
        <span className="ml-auto">total {fmt(total)}{unit}</span>
      </div>}>
      <div className="mb-2 h-9">
        {hover !== null ? (
          <div>
            <div className="text-[10px] text-node-muted">{data[hover]!.label}</div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold">{fmt(data[hover]!.value)}{unit}</span>
              {data[hover]!.previous ? <Delta value={((data[hover]!.value - data[hover]!.previous!) / data[hover]!.previous!) * 100} /> : null}
            </div>
          </div>
        ) : (
          <div className="pt-3 text-[10px] text-node-muted">Pasa el cursor sobre una barra</div>
        )}
      </div>
      <div className="flex items-end gap-2" style={{ height: H }} onMouseLeave={() => setHover(null)}>
        {data.map((d, i) => (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-1" onMouseEnter={() => setHover(i)}>
            <div className="flex w-full items-end justify-center gap-0.5" style={{ height: H - 16 }}>
              {d.previous !== undefined && (
                <div className="viz-grow w-1/3 rounded-t-sm bg-node-border"
                  style={{ height: `${(d.previous / max) * 100}%`, animationDelay: `${i * 60}ms` }} />
              )}
              <div className="viz-grow w-1/2 rounded-t-sm transition-opacity"
                style={{ height: `${(d.value / max) * 100}%`, background: accent, opacity: hover === null || hover === i ? 1 : 0.35, animationDelay: `${i * 60}ms` }} />
            </div>
            <span className="truncate text-[9px] text-node-muted">{d.label}</span>
          </div>
        ))}
      </div>
    </NodeShell>
  );
}

/* ---------- 3. Donut: distribución / proporciones ---------- */
export type Slice = { label: string; value: number; color?: string };
const PALETTE = ["var(--viz-1)", "var(--viz-2)", "var(--viz-3)", "var(--viz-4)", "var(--viz-5)"];

export function DonutChartNode({
  title, subtitle, data, centerLabel = "total", accent = "var(--viz-2)",
}: { title: string; subtitle?: string | undefined; data: Slice[]; centerLabel?: string; accent?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const R = 46, C = 2 * Math.PI * R;
  let acc = 0;
  const shown = hover !== null ? data[hover] : null;
  return (
    <NodeShell title={title} subtitle={subtitle} accent={accent} badge="share">
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 120 120" className="h-32 w-32 shrink-0 -rotate-90" onMouseLeave={() => setHover(null)}>
          <circle cx={60} cy={60} r={R} fill="none" stroke="var(--node-border)" strokeWidth={14} />
          {data.map((d, i) => {
            const len = (d.value / total) * C;
            const el = (
              <circle key={d.label} cx={60} cy={60} r={R} fill="none"
                stroke={d.color ?? PALETTE[i % PALETTE.length]}
                strokeWidth={hover === i ? 18 : 14}
                strokeDasharray={`${Math.max(0, len - 2)} ${C}`} strokeDashoffset={-acc}
                className="viz-fade cursor-pointer transition-all"
                style={{ opacity: hover === null || hover === i ? 1 : 0.35, animationDelay: `${i * 90}ms` }}
                onMouseEnter={() => setHover(i)} />
            );
            acc += len;
            return el;
          })}
          <g className="rotate-90" style={{ transformOrigin: "60px 60px" }}>
            <text x={60} y={58} textAnchor="middle" fill="var(--node-text)" fontSize={18} fontWeight={700}>
              {shown ? Math.round((shown!.value / total) * 100) + "%" : fmt(total)}
            </text>
            <text x={60} y={74} textAnchor="middle" fill="var(--node-muted)" fontSize={9}>
              {shown ? shown.label : centerLabel}
            </text>
          </g>
        </svg>
        <ul className="min-w-0 flex-1 space-y-1.5">
          {data.map((d, i) => (
            <li key={d.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
              className="flex cursor-default items-center gap-2 text-[11px]" style={{ opacity: hover === null || hover === i ? 1 : 0.45 }}>
              <i className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: d.color ?? PALETTE[i % PALETTE.length] }} />
              <span className="truncate">{d.label}</span>
              <span className="ml-auto text-node-muted">{fmt(d.value)}</span>
            </li>
          ))}
        </ul>
      </div>
    </NodeShell>
  );
}

/* ---------- 4. Gauge: progreso hacia una meta / KPI ---------- */
export function GaugeNode({
  title, subtitle, value, target, unit = "", thresholds = [0.5, 0.85],
}: { title: string; subtitle?: string | undefined; value: number; target: number; unit?: string; thresholds?: [number, number] }) {
  const pct = Math.max(0, Math.min(1, value / (target || 1)));
  const color = pct < thresholds[0] ? "var(--viz-down)" : pct < thresholds[1] ? "var(--viz-3)" : "var(--viz-up)";
  const status = pct < thresholds[0] ? "en riesgo" : pct < thresholds[1] ? "en camino" : "meta ok";
  const R = 70, arc = Math.PI * R;
  const angle = Math.PI * (1 - pct);
  const nx = 90 + Math.cos(angle) * (R - 18), ny = 90 - Math.sin(angle) * (R - 18);
  return (
    <NodeShell title={title} subtitle={subtitle} accent={color} badge={status}
      footer={<div className="flex justify-between"><span>actual {fmt(value)}{unit}</span><span>meta {fmt(target)}{unit}</span></div>}>
      <svg viewBox="0 0 180 122" className="mx-auto w-full max-w-[260px]">
        <path d="M20,90 A70,70 0 0 1 160,90" fill="none" stroke="var(--node-border)" strokeWidth={12} strokeLinecap="round" />
        <path d="M20,90 A70,70 0 0 1 160,90" fill="none" stroke={color} strokeWidth={12} strokeLinecap="round"
          strokeDasharray={`${arc * pct} ${arc}`} style={{ transition: "stroke-dasharray 1s ease" }} />
        {Array.from({ length: 11 }).map((_, i) => {
          const a = Math.PI * (1 - i / 10);
          return <line key={i} x1={90 + Math.cos(a) * 54} y1={90 - Math.sin(a) * 54} x2={90 + Math.cos(a) * 49} y2={90 - Math.sin(a) * 49}
            stroke="var(--node-muted)" strokeWidth={i % 5 ? 1 : 2} />;
        })}
        <line x1={90} y1={90} x2={nx} y2={ny} stroke="var(--node-text)" strokeWidth={2} strokeLinecap="round" style={{ transition: "all 1s ease" }} />
        <circle cx={90} cy={90} r={4} fill="var(--node-text)" />
        <text x={90} y={116} textAnchor="middle" fill="var(--node-text)" fontSize={18} fontWeight={700}>{Math.round(pct * 100)}%</text>
      </svg>
    </NodeShell>
  );
}

/* ---------- 5. Funnel: conversión entre etapas ---------- */
export type Stage = { label: string; value: number };

export function FunnelNode({
  title, subtitle, data, accent = "var(--viz-5)",
}: { title: string; subtitle?: string | undefined; data: Stage[]; accent?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const top = data[0]?.value || 1;
  const last = data[data.length - 1]?.value ?? 0;
  return (
    <NodeShell title={title} subtitle={subtitle} accent={accent} badge="funnel"
      footer={<div className="flex justify-between"><span>conversión total</span><span className="font-bold text-node-text">{((last / top) * 100).toFixed(1)}%</span></div>}>
      <div className="space-y-1.5" onMouseLeave={() => setHover(null)}>
        {data.map((s, i) => {
          const w = (s.value / top) * 100;
          const step = i > 0 ? (s.value / (data[i - 1]!.value || 1)) * 100 : 100;
          return (
            <div key={s.label} onMouseEnter={() => setHover(i)}>
              <div className="mb-0.5 flex justify-between text-[10px]">
                <span className={hover === i ? "text-node-text" : "text-node-muted"}>{s.label}</span>
                <span>
                  <b>{fmt(s.value)}</b>
                  {i > 0 && <span className="ml-2" style={{ color: step < 40 ? "var(--viz-down)" : "var(--node-muted)" }}>{step.toFixed(0)}%</span>}
                </span>
              </div>
              <div className="h-4 rounded-sm bg-canvas">
                <div className="mx-auto h-full rounded-sm transition-all duration-700"
                  style={{ width: `${Math.max(w, 2)}%`, background: accent, opacity: 1 - i * (0.55 / Math.max(1, data.length - 1)), outline: hover === i ? "1px solid var(--node-text)" : "none" }} />
              </div>
            </div>
          );
        })}
      </div>
    </NodeShell>
  );
}
