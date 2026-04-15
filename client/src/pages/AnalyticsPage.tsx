import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  ArcElement,
  PointElement,
  Title,
  Tooltip
} from "chart.js";
import type { ChartOptions } from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { apiRequest } from "../api/client";
import { EmptyState, MetricGrid, PageHeader, SelectField, SkeletonBlock, StatCard } from "../components/ui";
import { useLocalStorageState } from "../hooks";
import type { AnalyticsData } from "../types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Title, Tooltip, Legend);

type Period = "6m" | "12m";
type ChartCardId = "monthly" | "statuses" | "routes";

const defaultCardOrder: ChartCardId[] = ["monthly", "statuses", "routes"];

function formatMoney(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "BYN",
    maximumFractionDigits: 0
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 1
  }).format(value);
}

function SortableChartCard({ id, title, children }: { id: ChartCardId; title: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <article ref={setNodeRef} style={style} className={`chart-card ${isDragging ? "dragging" : ""}`}>
      <header>
        <h2>{title}</h2>
        <button type="button" className="drag-handle" {...attributes} {...listeners}>
          Перетащить
        </button>
      </header>
      <div className="chart-frame">{children}</div>
    </article>
  );
}

export function AnalyticsPage() {
  const [period, setPeriod] = useLocalStorageState<Period>("tl_analytics_period", "6m");
  const [cardOrder, setCardOrder] = useLocalStorageState<ChartCardId[]>("tl_analytics_cards", defaultCardOrder);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    setLoading(true);
    apiRequest<AnalyticsData>(`/analytics?period=${period}`)
      .then(setAnalytics)
      .finally(() => setLoading(false));
  }, [period]);

  const normalizedCardOrder = useMemo(() => {
    const knownCards = new Set(defaultCardOrder);
    const existing = cardOrder.filter((id) => knownCards.has(id));
    const missing = defaultCardOrder.filter((id) => !existing.includes(id));

    return [...existing, ...missing];
  }, [cardOrder]);

  const lineData = useMemo(
    () => ({
      labels: analytics?.monthly.map((item) => item.label) ?? [],
      datasets: [
        {
          label: "Сумма заявок, BYN",
          data: analytics?.monthly.map((item) => item.revenue) ?? [],
          borderColor: "#0f8f83",
          backgroundColor: "rgba(15, 143, 131, 0.18)",
          fill: true,
          tension: 0.35,
          yAxisID: "y"
        },
        {
          label: "Количество рейсов",
          data: analytics?.monthly.map((item) => item.shipments) ?? [],
          borderColor: "#d92d5c",
          backgroundColor: "rgba(217, 45, 92, 0.14)",
          fill: false,
          tension: 0.35,
          yAxisID: "y1"
        }
      ]
    }),
    [analytics]
  );

  const doughnutData = useMemo(
    () => ({
      labels: analytics?.shipmentsByStatus.map((item) => item.label) ?? [],
      datasets: [
        {
          label: "Рейсы",
          data: analytics?.shipmentsByStatus.map((item) => item.count) ?? [],
          backgroundColor: ["#0f8f83", "#c58a00", "#d92d5c", "#2f855a", "#6f5bd3", "#66736d"],
          borderColor: "#ffffff",
          borderWidth: 2
        }
      ]
    }),
    [analytics]
  );

  const barData = useMemo(
    () => ({
      labels: analytics?.topRoutes.map((item) => item.route) ?? [],
      datasets: [
        {
          label: "Количество рейсов",
          data: analytics?.topRoutes.map((item) => item.shipments) ?? [],
          backgroundColor: "#0f8f83",
          borderRadius: 6
        },
        {
          label: "Сумма заявок, BYN",
          data: analytics?.topRoutes.map((item) => item.revenue) ?? [],
          backgroundColor: "#c58a00",
          borderRadius: 6
        }
      ]
    }),
    [analytics]
  );

  const lineOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { position: "bottom" },
      title: { display: true, text: "Динамика заявок и рейсов по месяцам" },
      tooltip: { enabled: true }
    },
    scales: {
      x: { title: { display: true, text: "Месяц" } },
      y: { title: { display: true, text: "Сумма, BYN" }, beginAtZero: true },
      y1: { title: { display: true, text: "Количество рейсов" }, beginAtZero: true, position: "right", grid: { drawOnChartArea: false } }
    }
  };

  const doughnutOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      title: { display: true, text: "Распределение рейсов по статусам" },
      tooltip: { enabled: true }
    }
  };

  const barOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      title: { display: true, text: "Топ маршрутов по количеству рейсов и сумме заявок" },
      tooltip: { enabled: true }
    },
    scales: {
      x: { title: { display: true, text: "Маршрут" } },
      y: { title: { display: true, text: "Значение" }, beginAtZero: true }
    }
  };

  const cards: Record<ChartCardId, React.ReactNode> = {
    monthly: (
      <SortableChartCard id="monthly" title="Динамика по месяцам">
        <Line data={lineData} options={lineOptions} />
      </SortableChartCard>
    ),
    statuses: (
      <SortableChartCard id="statuses" title="Статусы рейсов">
        <Doughnut data={doughnutData} options={doughnutOptions} />
      </SortableChartCard>
    ),
    routes: (
      <SortableChartCard id="routes" title="Топ маршрутов">
        <Bar data={barData} options={barOptions} />
      </SortableChartCard>
    )
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = normalizedCardOrder.indexOf(active.id as ChartCardId);
    const newIndex = normalizedCardOrder.indexOf(over.id as ChartCardId);

    setCardOrder(arrayMove(normalizedCardOrder, oldIndex, newIndex));
  };

  return (
    <>
      <PageHeader
        title="Аналитика"
        subtitle="Графики строятся по текущим заявкам, рейсам, маршрутам и автопарку."
        actions={
          <SelectField
            label="Период"
            value={period}
            onChange={(event) => setPeriod(event.target.value as Period)}
            options={[
              { label: "6 месяцев", value: "6m" },
              { label: "12 месяцев", value: "12m" }
            ]}
          />
        }
      />

      {loading && !analytics ? <SkeletonBlock /> : null}

      {analytics ? (
        <>
          <MetricGrid>
            <StatCard label="Заявки" value={analytics.summary.orders} hint="За выбранный период" />
            <StatCard label="Рейсы" value={analytics.summary.shipments} hint="За выбранный период" />
            <StatCard label="Сумма заявок" value={formatMoney(analytics.summary.revenue)} hint="По текущим данным" />
            <StatCard label="Вес грузов" value={`${formatNumber(analytics.summary.cargoWeightKg)} кг`} hint="Суммарно" />
            <StatCard label="Транспорт" value={analytics.summary.vehicles} hint="Всего в автопарке" />
            <StatCard label="Водители" value={analytics.summary.drivers} hint="Всего в реестре" />
          </MetricGrid>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={normalizedCardOrder} strategy={rectSortingStrategy}>
              <section className="analytics-grid">{normalizedCardOrder.map((id) => cards[id])}</section>
            </SortableContext>
          </DndContext>
        </>
      ) : loading ? null : (
        <EmptyState title="Данные не загружены" text="Проверьте соединение с сервером и повторите запрос." />
      )}
    </>
  );
}
