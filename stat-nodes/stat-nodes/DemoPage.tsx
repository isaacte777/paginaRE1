import { BarChartNode, DonutChartNode, FunnelNode, GaugeNode, LineChartNode } from "./StatNodes";

/*
 * Página de demostración con datos de EJEMPLO.
 * Reemplaza los arrays `data` por tus propios datos.
 * Cada nodo es independiente: puedes usar solo los que necesites.
 */
export default function DemoPage() {
  return (
    <div className="canvas-dots flex min-h-screen flex-wrap items-start justify-center gap-10 p-12">
      {/* 1. Tendencia en el tiempo (línea) */}
      <LineChartNode
        title="Performance"
        subtitle="ROI semanal"
        unit="%"
        data={[12, 15, 14, 19, 17, 22, 21, 25, 24, 27].map((v, i) => ({ label: `Semana ${i + 1}`, value: v }))}
      />

      {/* 2. Comparación de categorías (barras, actual vs anterior) */}
      <BarChartNode
        title="Leads por canal"
        subtitle="este mes vs anterior"
        data={[
          { label: "SEO", value: 420, previous: 360 },
          { label: "Ads", value: 310, previous: 340 },
          { label: "Email", value: 190, previous: 150 },
          { label: "Social", value: 260, previous: 210 },
          { label: "Ref", value: 120, previous: 130 },
        ]}
      />

      {/* 3. Distribución de un total (donut) */}
      <DonutChartNode
        title="Tráfico por dispositivo"
        centerLabel="visitas"
        data={[
          { label: "Desktop", value: 5400 },
          { label: "Móvil", value: 3900 },
          { label: "Tablet", value: 900 },
          { label: "Otros", value: 300 },
        ]}
      />

      {/* 4. Progreso hacia una meta (gauge/velocímetro) */}
      <GaugeNode title="Meta mensual" subtitle="ingresos" value={7400} target={10000} unit="$" />

      {/* 5. Conversión entre etapas (embudo) */}
      <FunnelNode
        title="Conversión"
        subtitle="página comparación"
        data={[
          { label: "Visitas", value: 14000 },
          { label: "Scroll 50%", value: 8200 },
          { label: "Clic CTA", value: 2100 },
          { label: "Registro", value: 640 },
          { label: "Compra", value: 180 },
        ]}
      />
    </div>
  );
}
