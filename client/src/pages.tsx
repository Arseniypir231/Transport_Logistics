import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from "chart.js";
import type { ChartData, ChartOptions } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import {
  BarChart3,
  Boxes,
  CheckCircle2,
  ClipboardList,
  Download,
  Gauge,
  LayoutDashboard,
  Map,
  PackagePlus,
  Plus,
  RefreshCcw,
  Settings,
  ShieldCheck,
  Truck,
  UserPlus,
  Users
} from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "./api";
import {
  BarList,
  Button,
  Card,
  DataTable,
  EmptyState,
  FavoriteButton,
  Field,
  FilterPanel,
  FormGrid,
  KpiBar,
  Modal,
  PageHeader,
  PriorityBadge,
  ReportCard,
  RoleGate,
  RoutePoints,
  SelectField,
  StatCard,
  StatusBadge,
  StrongLink,
  Tabs,
  TextAreaField,
  Timeline,
  Toast,
  ToggleRow,
  date,
  money,
  statusLabel,
  usePersistentState
} from "./components";
import { resetSettings, setAuth, updateSetting, useAppDispatch, useAppSelector } from "./store";
import type {
  AuthState,
  Catalog,
  Column,
  Company,
  Driver,
  LogisticsRoute,
  Order,
  SettingsState,
  Shipment,
  User,
  Vehicle
} from "./types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Title, Tooltip, Legend, zoomPlugin);

const landingPhotos = {
  hero: "https://images.unsplash.com/photo-1664635032368-28eeb16de0d9?auto=format&fit=crop&w=1500&q=82",
  route: "https://images.unsplash.com/photo-1766785368863-f2188a8c8b32?auto=format&fit=crop&w=1300&q=82",
  fleet: "https://images.unsplash.com/photo-1681514583222-0579e6835666?auto=format&fit=crop&w=1300&q=82"
};

export function LandingPage() {
  return (
    <main className="landing-page">
      <section className="landing-hero">
        <nav className="landing-nav" aria-label="Главная навигация">
          <Link className="landing-brand" to="/">
            <span>TL</span>
            Transport Logistics
          </Link>
          <div>
            <a href="#product">Возможности</a>
            <a href="#audience">Роли</a>
            <a href="#workflow">Процесс</a>
            <a href="#impact">Эффект</a>
            <Link to="/login">Войти</Link>
          </div>
        </nav>
        <div className="landing-hero-grid">
          <div className="landing-copy">
            <p className="eyebrow">Курсовое web-приложение для транспортной логистики</p>
            <h1>Управляйте перевозками как единым операционным центром</h1>
            <p>
              Transport Logistics объединяет заявки клиентов, планирование рейсов, автопарк, водителей, маршруты,
              трекинг событий и отчеты в одной аккуратной web-платформе.
            </p>
            <div className="button-row">
              <Link className="landing-button primary" to="/login">Открыть демо</Link>
              <Link className="landing-button secondary" to="/register">Регистрация</Link>
            </div>
            <div className="landing-badges" aria-label="Технологии проекта">
              <span>React + Redux</span>
              <span>REST API</span>
              <span>PostgreSQL</span>
              <span>PDF/Excel</span>
            </div>
          </div>
          <figure className="landing-visual hero-visual photo-visual">
            <img src={landingPhotos.hero} alt="Складская зона с желтым погрузчиком и грузовым транспортом" />
            <figcaption>
              <strong>522</strong>
              <span>демо-записи для проверки сценариев</span>
            </figcaption>
          </figure>
        </div>
      </section>
      <section className="landing-proof" aria-label="Ключевые показатели">
        <StatCard label="ролей доступа" value="3" icon={<ShieldCheck />} />
        <StatCard label="страниц приложения" value="9+" icon={<LayoutDashboard />} />
        <StatCard label="функций" value="15+" icon={<Gauge />} />
        <StatCard label="таблиц БД" value="12" icon={<Boxes />} />
      </section>
      <section id="product" className="landing-section landing-product">
        <div>
          <p className="eyebrow">Продукт</p>
          <h2>Не просто таблица рейсов, а рабочее место логиста</h2>
          <p>
            Главная ценность системы — связать все сущности перевозки между собой. Диспетчер видит заявку,
            назначает ресурс, отслеживает событие в карточке рейса и получает готовую отчетность без ручной сборки данных.
          </p>
          <ul className="landing-checklist">
            <li><CheckCircle2 /> Единые справочники компаний, водителей, транспорта и маршрутов.</li>
            <li><CheckCircle2 /> Разные сценарии для клиента, перевозчика и диспетчера.</li>
            <li><CheckCircle2 /> Сохранение фильтров и настроек интерфейса в localStorage.</li>
          </ul>
        </div>
        <div className="landing-feature-grid">
          <Card><ClipboardList /><h3>Заявки</h3><p>Создание, поиск, фильтрация, сортировка, статусы и избранное.</p></Card>
          <Card><Truck /><h3>Рейсы</h3><p>Планирование, назначение ресурсов, смена статуса и карточка рейса.</p></Card>
          <Card><PackagePlus /><h3>Грузы</h3><p>Тип, вес, объем, температурный режим и связь с заказом.</p></Card>
          <Card><BarChart3 /><h3>Аналитика</h3><p>Группировки по статусам, типам грузов и выручке.</p></Card>
          <Card><Download /><h3>Отчеты</h3><p>Скачиваемые PDF и Excel отчеты по рейсам и автопарку.</p></Card>
          <Card><Settings /><h3>Настройки</h3><p>Тема, плотность интерфейса, меню и режим уменьшенных анимаций.</p></Card>
        </div>
      </section>
      <section id="audience" className="landing-section landing-audience">
        <div>
          <p className="eyebrow">Для кого</p>
          <h2>Три роли, три разных набора задач</h2>
          <p>
            Курсовой проект закрывает требование к принципиально разным ролям и показывает, как один продукт обслуживает
            несколько участников логистической цепочки.
          </p>
        </div>
        <div className="landing-role-cards">
          <article>
            <UserPlus />
            <h3>Клиент</h3>
            <p>Создает заявки на перевозку, отслеживает статус доставки и видит историю рейсов по своим отправкам.</p>
          </article>
          <article>
            <ShieldCheck />
            <h3>Диспетчер</h3>
            <p>Координирует заявки, назначает транспорт и водителей, контролирует задержки и формирует отчеты.</p>
          </article>
          <article>
            <Truck />
            <h3>Перевозчик</h3>
            <p>Управляет автопарком, водителями, текущими рейсами и добавляет события прохождения маршрута.</p>
          </article>
        </div>
      </section>
      <section id="workflow" className="landing-section landing-workflow">
        <figure className="landing-visual photo-visual">
          <img
            src={landingPhotos.route}
            alt="Две фуры едут по горной трассе"
            loading="lazy"
            decoding="async"
          />
          <figcaption className="landing-photo-caption">Маршрутная сеть: трасса, контрольные точки и ETA</figcaption>
        </figure>
        <div>
          <p className="eyebrow">Процесс</p>
          <h2>Прозрачный жизненный цикл перевозки</h2>
          <ol className="landing-steps">
            <li><span>1</span><div><strong>Клиент создает заявку</strong><p>Фиксируются адреса, груз, сроки, приоритет и стоимость.</p></div></li>
            <li><span>2</span><div><strong>Диспетчер планирует рейс</strong><p>Назначает перевозчика, водителя, транспорт и маршрут.</p></div></li>
            <li><span>3</span><div><strong>Перевозчик обновляет события</strong><p>Погрузка, контрольные точки, доставка и проблемы попадают в ленту.</p></div></li>
            <li><span>4</span><div><strong>Руководитель скачивает отчет</strong><p>Доступны PDF и Excel выгрузки по рейсам и автопарку.</p></div></li>
          </ol>
        </div>
      </section>
      <section id="impact" className="landing-section landing-impact">
        <div>
          <p className="eyebrow">Эффект</p>
          <h2>Больше контроля без перегрузки интерфейса</h2>
          <p>
            Лендинг и приложение демонстрируют не только набор CRUD-форм, но и бизнес-ценность: меньше ручных сверок,
            понятнее ответственность ролей, быстрее доступ к статусам и отчетности.
          </p>
          <div className="landing-metrics">
            <div><strong>8+</strong><span>внутренних разделов приложения</span></div>
            <div><strong>4</strong><span>формата отчетных выгрузок</span></div>
            <div><strong>320px</strong><span>минимальная поддерживаемая ширина</span></div>
          </div>
        </div>
        <figure className="landing-visual photo-visual">
          <img
            src={landingPhotos.fleet}
            alt="Грузовые автомобили и паллеты внутри складской зоны"
            loading="lazy"
            decoding="async"
          />
          <figcaption className="landing-photo-caption">Автопарк и складская операционная зона в одном контуре</figcaption>
        </figure>
      </section>
      <section className="landing-final-cta">
        <div>
          <p className="eyebrow">Демо готово к проверке</p>
          <h2>Откройте систему и пройдите сценарий от заявки до отчета</h2>
          <p>Используйте демо-пользователей из README или зарегистрируйте нового клиента/перевозчика.</p>
        </div>
        <div className="button-row">
          <Link className="landing-button primary" to="/login">Войти в систему</Link>
          <Link className="landing-button secondary dark" to="/register">Создать аккаунт</Link>
        </div>
      </section>
    </main>
  );
}

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: mode === "login" ? "dispatcher@transport.test" : "",
    password: mode === "login" ? "password123" : "",
    roleSlug: "client",
    companyName: ""
  });

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : {
              name: form.name,
              email: form.email,
              password: form.password,
              roleSlug: form.roleSlug,
              companyName: form.companyName
            };
      const response = await api<AuthState>(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      dispatch(setAuth(response));
      navigate("/app");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ошибка авторизации");
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <Link className="brand-inline" to="/"><span>TL</span>Transport Logistics</Link>
        <h1>{mode === "login" ? "Вход в систему" : "Регистрация"}</h1>
        <p>
          Демо-доступ: dispatcher@transport.test / password123. Для проверки ролей также доступны client@transport.test и
          carrier@transport.test.
        </p>
        <Toast message={message} tone="danger" />
        <form onSubmit={submit}>
          {mode === "register" ? (
            <>
              <Field label="Имя" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
              <Field label="Компания" value={form.companyName} onChange={(event) => setForm({ ...form, companyName: event.target.value })} required />
              <SelectField
                label="Роль"
                value={form.roleSlug}
                onChange={(event) => setForm({ ...form, roleSlug: event.target.value })}
                options={[
                  { label: "Клиент", value: "client" },
                  { label: "Перевозчик", value: "carrier" }
                ]}
              />
            </>
          ) : null}
          <Field label="E-mail" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          <Field label="Пароль" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} minLength={6} required />
          <Button type="submit">{mode === "login" ? "Войти" : "Создать аккаунт"}</Button>
        </form>
        <Link className="text-link" to={mode === "login" ? "/register" : "/login"}>
          {mode === "login" ? "Нужна регистрация?" : "Уже есть аккаунт?"}
        </Link>
      </section>
    </main>
  );
}

export function DashboardPage() {
  const [data, setData] = useState<{
    metrics: Record<string, number>;
    lastShipments: Shipment[];
    vehicleStatuses: { status: string; _count: { _all: number } }[];
  } | null>(null);

  useEffect(() => {
    api<typeof data>("/dashboard").then(setData).catch(console.error);
  }, []);

  const metrics = data?.metrics ?? {};

  return (
    <>
      <PageHeader title="Панель управления" subtitle="Оперативные показатели заявок, рейсов и ресурсов." />
      <section className="metric-grid">
        <StatCard label="заявок" value={metrics.ordersTotal ?? 0} icon={<ClipboardList />} />
        <StatCard label="активных заявок" value={metrics.activeOrders ?? 0} icon={<Gauge />} />
        <StatCard label="рейсов" value={metrics.shipmentsTotal ?? 0} icon={<Truck />} />
        <StatCard label="задержек" value={metrics.delayedShipments ?? 0} icon={<RefreshCcw />} />
        <StatCard label="свободный транспорт" value={metrics.vehiclesAvailable ?? 0} icon={<Boxes />} />
        <StatCard label="свободные водители" value={metrics.driversAvailable ?? 0} icon={<Users />} />
      </section>
      <section className="dashboard-grid">
        <Card>
          <h2>Последние рейсы</h2>
          {data?.lastShipments?.length ? (
            <div className="data-list">
              {data.lastShipments.map((shipment) => (
                <Link key={shipment.id} className="data-row" to={`/shipments/${shipment.id}`}>
                  <span>
                    <strong>{shipment.trackingNumber}</strong>
                    <small>{shipment.order.title}</small>
                  </span>
                  <StatusBadge status={shipment.status} />
                </Link>
              ))}
            </div>
          ) : (
            <p className="muted">Данные появятся после seed базы.</p>
          )}
        </Card>
        <BarList
          title="Состояние автопарка"
          rows={(data?.vehicleStatuses ?? []).map((item) => ({ label: statusLabel(item.status), value: item._count._all }))}
        />
      </section>
    </>
  );
}

type AnalyticsFilters = {
  months: string;
  cargoType: string;
  orderStatus: string;
  shipmentStatus: string;
};

type AnalyticsData = {
  totals: {
    revenue: number;
    orders: number;
    shipments: number;
    averageOrderPrice: number;
    delayedShipments: number;
  };
  monthlyRevenue: {
    key: string;
    label: string;
    revenue: number;
    orders: number;
    shipments: number;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
  }[];
  priceComparison: {
    key: string;
    label: string;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
  }[];
  ordersByStatus: { key: string; value: number }[];
  shipmentsByStatus: { key: string; value: number }[];
  cargoByType: { type: string; value: number; revenue: number }[];
  topCargo: { key: string; label: string; value: number; revenue: number }[];
  topClients: { key: string; label: string; value: number; revenue: number }[];
  filterOptions: {
    months: number[];
    cargoTypes: string[];
    orderStatuses: string[];
    shipmentStatuses: string[];
  };
};

const defaultAnalyticsFilters: AnalyticsFilters = {
  months: "12",
  cargoType: "",
  orderStatus: "",
  shipmentStatus: ""
};

const emptyAnalytics: AnalyticsData = {
  totals: { revenue: 0, orders: 0, shipments: 0, averageOrderPrice: 0, delayedShipments: 0 },
  monthlyRevenue: [],
  priceComparison: [],
  ordersByStatus: [],
  shipmentsByStatus: [],
  cargoByType: [],
  topCargo: [],
  topClients: [],
  filterOptions: {
    months: [3, 6, 12, 24],
    cargoTypes: ["PALLET", "BULK", "CONTAINER", "REFRIGERATED", "HAZARDOUS"],
    orderStatuses: ["DRAFT", "NEW", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
    shipmentStatuses: ["PLANNED", "LOADING", "IN_TRANSIT", "DELIVERED", "DELAYED", "CANCELLED"]
  }
};

const chartColors = ["#0d8d77", "#d99c25", "#2f6fed", "#c93c55", "#7251b5", "#3d8b37", "#ef7b45", "#186b8f", "#9b5de5", "#2d6a4f"];

function cargoTypeLabel(type: string) {
  const labels: Record<string, string> = {
    PALLET: "Паллеты",
    BULK: "Навалочный груз",
    CONTAINER: "Контейнеры",
    REFRIGERATED: "Рефрижератор",
    HAZARDOUS: "Опасный груз"
  };
  return labels[type] ?? type;
}

function chartNumber(value: string | number) {
  return Number(value).toLocaleString("ru-RU");
}

function resetChartZoom(chart: ChartJS<"line"> | null) {
  (chart as (ChartJS<"line"> & { resetZoom?: () => void }) | null)?.resetZoom?.();
}

function analyticsQuery(filters: AnalyticsFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });
  return params.toString();
}

export function AnalyticsPage() {
  const revenueChartRef = useRef<ChartJS<"line"> | null>(null);
  const priceChartRef = useRef<ChartJS<"line"> | null>(null);
  const [filters, setFilters] = usePersistentState<AnalyticsFilters>("tl_analytics_filters", defaultAnalyticsFilters);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api<AnalyticsData>(`/analytics?${analyticsQuery(filters)}`)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Не удалось загрузить аналитику"))
      .finally(() => setLoading(false));
  }, [filters.months, filters.cargoType, filters.orderStatus, filters.shipmentStatus]);

  const analytics = data ?? emptyAnalytics;
  const monthLabels = analytics.monthlyRevenue.map((item) => item.label);
  const revenueLineData: ChartData<"line"> = {
    labels: monthLabels,
    datasets: [
      {
        label: "Выручка, BYN",
        data: analytics.monthlyRevenue.map((item) => item.revenue),
        borderColor: "#0d8d77",
        backgroundColor: "rgba(13, 141, 119, 0.18)",
        fill: true,
        tension: 0.36,
        pointRadius: 4,
        pointHoverRadius: 7
      },
      {
        label: "Количество заявок",
        data: analytics.monthlyRevenue.map((item) => item.orders),
        borderColor: "#d99c25",
        backgroundColor: "rgba(217, 156, 37, 0.16)",
        tension: 0.36,
        yAxisID: "orders"
      }
    ]
  };
  const priceAreaData: ChartData<"line"> = {
    labels: analytics.priceComparison.map((item) => item.label),
    datasets: [
      {
        label: "Средняя цена, BYN",
        data: analytics.priceComparison.map((item) => item.averagePrice),
        borderColor: "#0d8d77",
        backgroundColor: "rgba(13, 141, 119, 0.22)",
        fill: true,
        tension: 0.35
      },
      {
        label: "Минимальная цена, BYN",
        data: analytics.priceComparison.map((item) => item.minPrice),
        borderColor: "#2f6fed",
        backgroundColor: "rgba(47, 111, 237, 0.1)",
        fill: true,
        tension: 0.35
      },
      {
        label: "Максимальная цена, BYN",
        data: analytics.priceComparison.map((item) => item.maxPrice),
        borderColor: "#c93c55",
        backgroundColor: "rgba(201, 60, 85, 0.08)",
        fill: false,
        tension: 0.35
      }
    ]
  };
  const cargoPieData: ChartData<"doughnut"> = {
    labels: analytics.cargoByType.map((item) => cargoTypeLabel(item.type)),
    datasets: [
      {
        label: "Заявки",
        data: analytics.cargoByType.map((item) => item.value),
        backgroundColor: chartColors,
        borderColor: "#ffffff",
        borderWidth: 2
      }
    ]
  };
  const topCargoBarData: ChartData<"bar"> = {
    labels: analytics.topCargo.map((item) => item.label),
    datasets: [
      {
        label: "Количество заявок",
        data: analytics.topCargo.map((item) => item.value),
        backgroundColor: "rgba(13, 141, 119, 0.84)",
        borderColor: "#086857",
        borderWidth: 1,
        borderRadius: 10
      },
      {
        label: "Выручка, тыс. BYN",
        data: analytics.topCargo.map((item) => Math.round(item.revenue / 1000)),
        backgroundColor: "rgba(217, 156, 37, 0.72)",
        borderColor: "#b98400",
        borderWidth: 1,
        borderRadius: 10
      }
    ]
  };
  const revenueOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: true, position: "bottom" },
      title: { display: true, text: "Динамика выручки и заявок по месяцам" },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.dataset.yAxisID === "orders" ? chartNumber(context.parsed.y ?? 0) : money(context.parsed.y ?? 0)}`
        }
      },
      zoom: {
        pan: { enabled: true, mode: "x" },
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          drag: { enabled: true, backgroundColor: "rgba(13, 141, 119, 0.12)" },
          mode: "x"
        }
      }
    },
    scales: {
      x: { title: { display: true, text: "Месяц" } },
      y: {
        beginAtZero: true,
        title: { display: true, text: "Выручка, BYN" },
        ticks: { callback: (value) => `${chartNumber(value)} BYN` }
      },
      orders: {
        beginAtZero: true,
        position: "right",
        grid: { drawOnChartArea: false },
        title: { display: true, text: "Количество заявок" },
        ticks: { precision: 0 }
      }
    }
  };
  const priceOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: true, position: "bottom" },
      title: { display: true, text: "Сравнение цен перевозок по месяцам" },
      tooltip: {
        enabled: true,
        callbacks: { label: (context) => `${context.dataset.label}: ${money(context.parsed.y ?? 0)}` }
      },
      zoom: {
        pan: { enabled: true, mode: "x" },
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          drag: { enabled: true, backgroundColor: "rgba(217, 156, 37, 0.12)" },
          mode: "x"
        }
      }
    },
    scales: {
      x: { title: { display: true, text: "Месяц" } },
      y: {
        beginAtZero: true,
        title: { display: true, text: "Цена перевозки, BYN" },
        ticks: { callback: (value) => `${chartNumber(value)} BYN` }
      }
    }
  };
  const doughnutOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "bottom" },
      title: { display: true, text: "Распределение заявок по типам грузов" },
      tooltip: { enabled: true }
    }
  };
  const barOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y",
    plugins: {
      legend: { display: true, position: "bottom" },
      title: { display: true, text: "Топ-10 грузов по количеству заявок и выручке" },
      tooltip: { enabled: true }
    },
    scales: {
      x: { beginAtZero: true, title: { display: true, text: "Количество / тыс. BYN" } },
      y: { title: { display: true, text: "Груз" }, ticks: { autoSkip: false } }
    }
  };

  return (
    <>
      <PageHeader title="Аналитика" subtitle="Интерактивные графики по реальным заявкам, рейсам, грузам и выручке." />
      <FilterPanel>
        <SelectField
          label="Масштаб / zoom-период"
          value={filters.months}
          onChange={(event) => setFilters({ ...filters, months: event.target.value })}
          options={analytics.filterOptions.months.map((value) => ({ label: `Последние ${value} мес.`, value: String(value) }))}
        />
        <SelectField
          label="Тип груза"
          value={filters.cargoType}
          onChange={(event) => setFilters({ ...filters, cargoType: event.target.value })}
          options={[{ label: "Все типы", value: "" }, ...analytics.filterOptions.cargoTypes.map((value) => ({ label: cargoTypeLabel(value), value }))]}
        />
        <SelectField
          label="Статус заявки"
          value={filters.orderStatus}
          onChange={(event) => setFilters({ ...filters, orderStatus: event.target.value })}
          options={[{ label: "Все заявки", value: "" }, ...analytics.filterOptions.orderStatuses.map((value) => ({ label: statusLabel(value), value }))]}
        />
        <SelectField
          label="Статус рейса"
          value={filters.shipmentStatus}
          onChange={(event) => setFilters({ ...filters, shipmentStatus: event.target.value })}
          options={[{ label: "Все рейсы", value: "" }, ...analytics.filterOptions.shipmentStatuses.map((value) => ({ label: statusLabel(value), value }))]}
        />
        <Button type="button" variant="ghost" onClick={() => setFilters(defaultAnalyticsFilters)}>
          Сброс фильтров
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            resetChartZoom(revenueChartRef.current);
            resetChartZoom(priceChartRef.current);
          }}
        >
          Сбросить zoom
        </Button>
      </FilterPanel>
      <p className="muted chart-hint">
        Tooltip появляется при наведении. Для zoom на линейном и area-графике прокрутите колесо мыши или выделите область, для перемещения потяните график по горизонтали.
      </p>
      <Toast message={error} tone="danger" />
      {loading ? <p className="muted">Обновляем графики из базы данных...</p> : null}
      <KpiBar
        items={[
          { label: "выручка за период", value: money(analytics.totals.revenue) },
          { label: "заявок", value: analytics.totals.orders },
          { label: "рейсов", value: analytics.totals.shipments },
          { label: "средний чек", value: money(analytics.totals.averageOrderPrice) },
          { label: "задержек", value: analytics.totals.delayedShipments }
        ]}
      />
      <section className="chart-grid">
        <Card className="chart-card chart-card-wide">
          <div className="chart-card-head">
            <div>
              <p className="eyebrow">Линейный график</p>
              <h2>Динамика продаж по месяцам</h2>
            </div>
            <Button type="button" variant="ghost" onClick={() => resetChartZoom(revenueChartRef.current)}>
              Сброс zoom
            </Button>
          </div>
          <div className="chart-box">
            <Line ref={revenueChartRef} data={revenueLineData} options={revenueOptions} />
          </div>
        </Card>
        <Card className="chart-card">
          <div className="chart-card-head">
            <div>
              <p className="eyebrow">Круговая диаграмма</p>
              <h2>Распределение грузов</h2>
            </div>
          </div>
          <div className="chart-box chart-box-pie">
            <Doughnut data={cargoPieData} options={doughnutOptions} />
          </div>
        </Card>
        <Card className="chart-card">
          <div className="chart-card-head">
            <div>
              <p className="eyebrow">Столбчатая диаграмма</p>
              <h2>Топ-10 популярных грузов</h2>
            </div>
          </div>
          <div className="chart-box">
            <Bar data={topCargoBarData} options={barOptions} />
          </div>
        </Card>
        <Card className="chart-card chart-card-wide">
          <div className="chart-card-head">
            <div>
              <p className="eyebrow">Area-график</p>
              <h2>Сравнение цен перевозок</h2>
            </div>
            <Button type="button" variant="ghost" onClick={() => resetChartZoom(priceChartRef.current)}>
              Сброс zoom
            </Button>
          </div>
          <div className="chart-box">
            <Line ref={priceChartRef} data={priceAreaData} options={priceOptions} />
          </div>
        </Card>
      </section>
      <section className="analytics-summary">
        <BarList title="Заявки по статусам" rows={analytics.ordersByStatus.map((item) => ({ label: statusLabel(item.key), value: item.value }))} />
        <BarList title="Рейсы по статусам" rows={analytics.shipmentsByStatus.map((item) => ({ label: statusLabel(item.key), value: item.value }))} />
        <BarList title="Клиенты по выручке" rows={analytics.topClients.map((item) => ({ label: item.label, value: Math.round(item.revenue) }))} />
      </section>
    </>
  );
}

export function useCatalog() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);

  useEffect(() => {
    api<Catalog>("/catalog").then(setCatalog).catch(console.error);
  }, []);

  return catalog;
}

export function OrdersPage() {
  const catalog = useCatalog();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filters, setFilters] = usePersistentState("tl_order_filters", { search: "", status: "", sort: "createdAt" });
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "Перевозка сборного груза",
    clientId: "",
    pickupAddress: "Минск, склад 1",
    deliveryAddress: "Гомель, РЦ 2",
    pickupDate: "2026-04-20T09:00",
    deliveryDate: "2026-04-21T18:00",
    price: "850",
    priority: "NORMAL",
    cargoName: "Паллетированный груз",
    cargoType: "PALLET",
    weightKg: "1200",
    volumeM3: "12"
  });

  async function loadOrders() {
    const response = await api<{ orders: Order[] }>(`/orders?${new URLSearchParams(filters).toString()}`);
    setOrders(response.orders);
  }

  useEffect(() => {
    loadOrders().catch(console.error);
  }, [filters.search, filters.status, filters.sort]);

  useEffect(() => {
    if (catalog?.companies.length && !form.clientId) {
      const client = catalog.companies.find((company) => company.type === "CLIENT") ?? catalog.companies[0];
      setForm((current) => ({ ...current, clientId: client.id }));
    }
  }, [catalog, form.clientId]);

  async function createOrder(event: FormEvent) {
    event.preventDefault();
    await api("/orders", {
      method: "POST",
      body: JSON.stringify({
        title: form.title,
        clientId: form.clientId,
        priority: form.priority,
        pickupAddress: form.pickupAddress,
        deliveryAddress: form.deliveryAddress,
        pickupDate: form.pickupDate,
        deliveryDate: form.deliveryDate,
        price: form.price,
        cargo: {
          name: form.cargoName,
          type: form.cargoType,
          weightKg: form.weightKg,
          volumeM3: form.volumeM3
        }
      })
    });
    setOpen(false);
    setMessage("Заявка создана");
    await loadOrders();
  }

  const columns: Column<Order>[] = [
    { key: "code", header: "Код", render: (order) => <strong>{order.code}</strong> },
    { key: "title", header: "Заявка", render: (order) => <span>{order.title}<small>{order.client.name}</small></span> },
    { key: "route", header: "Маршрут", render: (order) => `${order.pickupAddress} -> ${order.deliveryAddress}` },
    { key: "priority", header: "Приоритет", render: (order) => <PriorityBadge priority={order.priority} /> },
    { key: "status", header: "Статус", render: (order) => <StatusBadge status={order.status} /> },
    { key: "price", header: "Стоимость", render: (order) => money(order.price) },
    { key: "favorite", header: "Избранное", render: (order) => <FavoriteButton id={order.id} /> }
  ];

  return (
    <>
      <PageHeader
        title="Заявки"
        subtitle="Создание, фильтрация, сортировка и отслеживание заявок клиентов."
        actions={
          <RoleGate roles={["dispatcher", "client"]}>
            <Button type="button" onClick={() => setOpen(true)}><Plus /> Новая заявка</Button>
          </RoleGate>
        }
      />
      <FilterPanel>
        <Field label="Поиск" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} />
        <SelectField
          label="Статус"
          value={filters.status}
          onChange={(event) => setFilters({ ...filters, status: event.target.value })}
          options={[
            { label: "Все", value: "" },
            { label: "Новая", value: "NEW" },
            { label: "В работе", value: "IN_PROGRESS" },
            { label: "Завершена", value: "COMPLETED" }
          ]}
        />
        <SelectField
          label="Сортировка"
          value={filters.sort}
          onChange={(event) => setFilters({ ...filters, sort: event.target.value })}
          options={[
            { label: "По дате", value: "createdAt" },
            { label: "По цене", value: "price" },
            { label: "По приоритету", value: "priority" }
          ]}
        />
        <Button type="button" variant="ghost" onClick={() => setFilters({ search: "", status: "", sort: "createdAt" })}>
          Сброс фильтров
        </Button>
      </FilterPanel>
      <Toast message={message} />
      {orders.length ? <DataTable columns={columns} data={orders} /> : <EmptyState title="Заявок нет" text="Создайте заявку или измените фильтр." />}
      <Modal title="Новая заявка" open={open} onClose={() => setOpen(false)}>
        <form onSubmit={createOrder}>
          <FormGrid>
            <Field label="Название" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
            <SelectField
              label="Клиент"
              value={form.clientId}
              onChange={(event) => setForm({ ...form, clientId: event.target.value })}
              options={(catalog?.companies ?? []).filter((company) => company.type === "CLIENT").map((company) => ({ label: company.name, value: company.id }))}
            />
            <Field label="Адрес погрузки" value={form.pickupAddress} onChange={(event) => setForm({ ...form, pickupAddress: event.target.value })} required />
            <Field label="Адрес доставки" value={form.deliveryAddress} onChange={(event) => setForm({ ...form, deliveryAddress: event.target.value })} required />
            <Field label="Погрузка" type="datetime-local" value={form.pickupDate} onChange={(event) => setForm({ ...form, pickupDate: event.target.value })} />
            <Field label="Доставка" type="datetime-local" value={form.deliveryDate} onChange={(event) => setForm({ ...form, deliveryDate: event.target.value })} />
            <Field label="Стоимость" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
            <SelectField
              label="Приоритет"
              value={form.priority}
              onChange={(event) => setForm({ ...form, priority: event.target.value })}
              options={[
                { label: "Низкий", value: "LOW" },
                { label: "Обычный", value: "NORMAL" },
                { label: "Высокий", value: "HIGH" },
                { label: "Срочный", value: "URGENT" }
              ]}
            />
            <Field label="Груз" value={form.cargoName} onChange={(event) => setForm({ ...form, cargoName: event.target.value })} />
            <SelectField
              label="Тип груза"
              value={form.cargoType}
              onChange={(event) => setForm({ ...form, cargoType: event.target.value })}
              options={[
                { label: "Паллеты", value: "PALLET" },
                { label: "Навалочный груз", value: "BULK" },
                { label: "Контейнеры", value: "CONTAINER" },
                { label: "Рефрижератор", value: "REFRIGERATED" },
                { label: "Опасный груз", value: "HAZARDOUS" }
              ]}
            />
            <Field label="Вес, кг" value={form.weightKg} onChange={(event) => setForm({ ...form, weightKg: event.target.value })} />
            <Field label="Объем, м3" value={form.volumeM3} onChange={(event) => setForm({ ...form, volumeM3: event.target.value })} />
          </FormGrid>
          <div className="modal-actions">
            <Button type="submit">Сохранить</Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Отмена</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export function ShipmentsPage() {
  const catalog = useCatalog();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filters, setFilters] = usePersistentState("tl_shipment_filters", { search: "", status: "" });
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    orderId: "",
    carrierId: "",
    driverId: "",
    vehicleId: "",
    routeId: "",
    plannedStart: "2026-04-20T09:00",
    plannedFinish: "2026-04-21T18:00"
  });

  async function loadShipments() {
    const response = await api<{ shipments: Shipment[] }>(`/shipments?${new URLSearchParams(filters).toString()}`);
    setShipments(response.shipments);
  }

  useEffect(() => {
    loadShipments().catch(console.error);
  }, [filters.search, filters.status]);

  useEffect(() => {
    if (catalog) {
      setForm((current) => ({
        ...current,
        orderId: current.orderId || catalog.orders[0]?.id || "",
        carrierId: current.carrierId || catalog.companies.find((company) => company.type === "CARRIER")?.id || "",
        driverId: current.driverId || catalog.drivers[0]?.id || "",
        vehicleId: current.vehicleId || catalog.vehicles[0]?.id || "",
        routeId: current.routeId || catalog.routes[0]?.id || ""
      }));
    }
  }, [catalog]);

  async function updateStatus(id: string, status: string) {
    await api(`/shipments/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    setMessage("Статус рейса обновлен");
    await loadShipments();
  }

  async function createShipment(event: FormEvent) {
    event.preventDefault();
    await api("/shipments", { method: "POST", body: JSON.stringify(form) });
    setOpen(false);
    setMessage("Рейс создан");
    await loadShipments();
  }

  const columns: Column<Shipment>[] = [
    { key: "tracking", header: "Трекинг", render: (shipment) => <StrongLink to={`/shipments/${shipment.id}`}>{shipment.trackingNumber}</StrongLink> },
    { key: "order", header: "Заявка", render: (shipment) => <span>{shipment.order.code}<small>{shipment.order.title}</small></span> },
    { key: "driver", header: "Водитель", render: (shipment) => shipment.driver.name },
    { key: "vehicle", header: "Транспорт", render: (shipment) => shipment.vehicle.plateNumber },
    { key: "status", header: "Статус", render: (shipment) => <StatusBadge status={shipment.status} /> },
    {
      key: "actions",
      header: "Действия",
      render: (shipment) => (
        <RoleGate roles={["dispatcher", "carrier"]}>
          <SelectField
            label="Сменить"
            value={shipment.status}
            onChange={(event) => updateStatus(shipment.id, event.target.value)}
            options={["PLANNED", "LOADING", "IN_TRANSIT", "DELIVERED", "DELAYED"].map((value) => ({ label: statusLabel(value), value }))}
          />
        </RoleGate>
      )
    }
  ];

  return (
    <>
      <PageHeader title="Рейсы" subtitle="Планирование перевозок, обновление статусов и переход в карточку рейса." actions={<RoleGate roles={["dispatcher", "carrier"]}><Button type="button" onClick={() => setOpen(true)}><Plus /> Новый рейс</Button></RoleGate>} />
      <FilterPanel>
        <Field label="Поиск" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} />
        <SelectField label="Статус" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} options={[{ label: "Все", value: "" }, { label: "План", value: "PLANNED" }, { label: "В пути", value: "IN_TRANSIT" }, { label: "Доставлен", value: "DELIVERED" }, { label: "Задержка", value: "DELAYED" }]} />
        <Button type="button" variant="ghost" onClick={() => setFilters({ search: "", status: "" })}>Сброс фильтров</Button>
      </FilterPanel>
      <Toast message={message} />
      {shipments.length ? <DataTable columns={columns} data={shipments} /> : <EmptyState title="Рейсов нет" text="Создайте рейс или измените фильтр." />}
      <Modal title="Новый рейс" open={open} onClose={() => setOpen(false)}>
        <form onSubmit={createShipment}>
          <FormGrid>
            <SelectField label="Заявка" value={form.orderId} onChange={(event) => setForm({ ...form, orderId: event.target.value })} options={(catalog?.orders ?? []).map((order) => ({ label: `${order.code} · ${order.title}`, value: order.id }))} />
            <SelectField label="Перевозчик" value={form.carrierId} onChange={(event) => setForm({ ...form, carrierId: event.target.value })} options={(catalog?.companies ?? []).filter((company) => company.type === "CARRIER").map((company) => ({ label: company.name, value: company.id }))} />
            <SelectField label="Водитель" value={form.driverId} onChange={(event) => setForm({ ...form, driverId: event.target.value })} options={(catalog?.drivers ?? []).map((driver) => ({ label: driver.name, value: driver.id }))} />
            <SelectField label="Транспорт" value={form.vehicleId} onChange={(event) => setForm({ ...form, vehicleId: event.target.value })} options={(catalog?.vehicles ?? []).map((vehicle) => ({ label: vehicle.plateNumber, value: vehicle.id }))} />
            <SelectField label="Маршрут" value={form.routeId} onChange={(event) => setForm({ ...form, routeId: event.target.value })} options={(catalog?.routes ?? []).map((route) => ({ label: route.name, value: route.id }))} />
            <Field label="Начало" type="datetime-local" value={form.plannedStart} onChange={(event) => setForm({ ...form, plannedStart: event.target.value })} />
            <Field label="Финиш" type="datetime-local" value={form.plannedFinish} onChange={(event) => setForm({ ...form, plannedFinish: event.target.value })} />
          </FormGrid>
          <div className="modal-actions"><Button type="submit">Создать рейс</Button><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Отмена</Button></div>
        </form>
      </Modal>
    </>
  );
}

export function ShipmentDetailsPage() {
  const { id } = useParams();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState({ type: "CHECKPOINT", message: "", location: "" });

  async function loadShipment() {
    if (!id) return;
    const response = await api<{ shipment: Shipment }>(`/shipments/${id}`);
    setShipment(response.shipment);
  }

  useEffect(() => {
    loadShipment().catch(console.error);
  }, [id]);

  async function addEvent(event: FormEvent) {
    event.preventDefault();
    await api(`/shipments/${id}/events`, { method: "POST", body: JSON.stringify(eventForm) });
    setEventForm({ type: "CHECKPOINT", message: "", location: "" });
    setMessage("Событие добавлено");
    await loadShipment();
  }

  if (!shipment) {
    return <EmptyState title="Рейс загружается" text="Данные появятся после ответа сервера." />;
  }

  return (
    <>
      <PageHeader title={shipment.trackingNumber} subtitle={`${shipment.order.title} · ${shipment.carrier.name}`} actions={<StatusBadge status={shipment.status} />} />
      <section className="details-grid">
        <Card>
          <h2>Сводка</h2>
          <dl className="summary-list">
            <div><dt>Заявка</dt><dd>{shipment.order.code}</dd></div>
            <div><dt>Клиент</dt><dd>{shipment.order.client.name}</dd></div>
            <div><dt>Водитель</dt><dd>{shipment.driver.name}</dd></div>
            <div><dt>Транспорт</dt><dd>{shipment.vehicle.plateNumber}</dd></div>
            <div><dt>План</dt><dd>{date(shipment.plannedStart)}</dd></div>
            <div><dt>Финиш</dt><dd>{date(shipment.plannedFinish)}</dd></div>
          </dl>
          <Link className="text-link" to="/shipments">Назад к рейсам</Link>
        </Card>
        <Card>
          <h2>Маршрут</h2>
          <RoutePoints points={shipment.route?.points} />
        </Card>
      </section>
      <section className="details-grid">
        <Card>
          <h2>История событий</h2>
          <Timeline events={shipment.events} />
        </Card>
        <RoleGate roles={["dispatcher", "carrier"]}>
          <Card>
            <h2>Добавить событие</h2>
            <Toast message={message} />
            <form onSubmit={addEvent}>
              <FormGrid>
                <SelectField
                  label="Тип"
                  value={eventForm.type}
                  onChange={(event) => setEventForm({ ...eventForm, type: event.target.value })}
                  options={[
                    { label: "Контрольная точка", value: "CHECKPOINT" },
                    { label: "Проблема", value: "PROBLEM" },
                    { label: "Погрузка", value: "LOADED" },
                    { label: "Доставка", value: "DELIVERED" }
                  ]}
                />
                <Field label="Локация" value={eventForm.location} onChange={(event) => setEventForm({ ...eventForm, location: event.target.value })} />
              </FormGrid>
              <TextAreaField label="Комментарий" value={eventForm.message} onChange={(event) => setEventForm({ ...eventForm, message: event.target.value })} required />
              <Button type="submit">Добавить</Button>
            </form>
          </Card>
        </RoleGate>
      </section>
    </>
  );
}

export function FleetPage() {
  const catalog = useCatalog();
  const [activeTab, setActiveTab] = usePersistentState("tl_fleet_tab", "vehicles");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [open, setOpen] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({
    plateNumber: "8888 TL-7",
    type: "Тентованный грузовик",
    make: "MAN",
    model: "TGX",
    year: "2024",
    capacityKg: "18000",
    capacityM3: "82",
    status: "AVAILABLE",
    companyId: ""
  });
  const [driverForm, setDriverForm] = useState({
    licenseNumber: "DL-99999",
    name: "Новый водитель",
    phone: "+375291112233",
    email: "new-driver@transport.test",
    rating: "4.9",
    status: "AVAILABLE",
    companyId: ""
  });

  async function loadFleet() {
    const [vehicleResponse, driverResponse] = await Promise.all([
      api<{ vehicles: Vehicle[] }>("/vehicles"),
      api<{ drivers: Driver[] }>("/drivers")
    ]);
    setVehicles(vehicleResponse.vehicles);
    setDrivers(driverResponse.drivers);
  }

  useEffect(() => {
    loadFleet().catch(console.error);
  }, []);

  useEffect(() => {
    const carrier = catalog?.companies.find((company) => company.type === "CARRIER");
    if (carrier) {
      setVehicleForm((current) => ({ ...current, companyId: current.companyId || carrier.id }));
      setDriverForm((current) => ({ ...current, companyId: current.companyId || carrier.id }));
    }
  }, [catalog]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    await api(activeTab === "vehicles" ? "/vehicles" : "/drivers", {
      method: "POST",
      body: JSON.stringify(activeTab === "vehicles" ? vehicleForm : driverForm)
    });
    setOpen(false);
    await loadFleet();
  }

  const vehicleColumns: Column<Vehicle>[] = [
    { key: "plate", header: "Номер", render: (vehicle) => <strong>{vehicle.plateNumber}</strong> },
    { key: "type", header: "Тип", render: (vehicle) => vehicle.type },
    { key: "capacity", header: "Вместимость", render: (vehicle) => `${vehicle.capacityKg} кг · ${vehicle.capacityM3} м3` },
    { key: "status", header: "Статус", render: (vehicle) => <StatusBadge status={vehicle.status} /> }
  ];
  const driverColumns: Column<Driver>[] = [
    { key: "name", header: "Водитель", render: (driver) => <strong>{driver.name}</strong> },
    { key: "license", header: "Права", render: (driver) => driver.licenseNumber },
    { key: "phone", header: "Телефон", render: (driver) => driver.phone },
    { key: "rating", header: "Рейтинг", render: (driver) => driver.rating },
    { key: "status", header: "Статус", render: (driver) => <StatusBadge status={driver.status} /> }
  ];

  return (
    <>
      <PageHeader title="Автопарк" subtitle="Управление транспортом и водителями с сохранением выбранной вкладки." actions={<RoleGate roles={["dispatcher", "carrier"]}><Button type="button" onClick={() => setOpen(true)}><Plus /> Добавить</Button></RoleGate>} />
      <Tabs tabs={[{ label: "Транспорт", value: "vehicles" }, { label: "Водители", value: "drivers" }]} active={activeTab} onChange={setActiveTab} />
      {activeTab === "vehicles" ? <DataTable columns={vehicleColumns} data={vehicles} /> : <DataTable columns={driverColumns} data={drivers} />}
      <Modal title={activeTab === "vehicles" ? "Новый транспорт" : "Новый водитель"} open={open} onClose={() => setOpen(false)}>
        <form onSubmit={submit}>
          {activeTab === "vehicles" ? (
            <FormGrid>
              <Field label="Номер" value={vehicleForm.plateNumber} onChange={(event) => setVehicleForm({ ...vehicleForm, plateNumber: event.target.value })} />
              <Field label="Тип" value={vehicleForm.type} onChange={(event) => setVehicleForm({ ...vehicleForm, type: event.target.value })} />
              <Field label="Марка" value={vehicleForm.make} onChange={(event) => setVehicleForm({ ...vehicleForm, make: event.target.value })} />
              <Field label="Модель" value={vehicleForm.model} onChange={(event) => setVehicleForm({ ...vehicleForm, model: event.target.value })} />
              <Field label="Год" value={vehicleForm.year} onChange={(event) => setVehicleForm({ ...vehicleForm, year: event.target.value })} />
              <Field label="Кг" value={vehicleForm.capacityKg} onChange={(event) => setVehicleForm({ ...vehicleForm, capacityKg: event.target.value })} />
              <Field label="М3" value={vehicleForm.capacityM3} onChange={(event) => setVehicleForm({ ...vehicleForm, capacityM3: event.target.value })} />
            </FormGrid>
          ) : (
            <FormGrid>
              <Field label="Права" value={driverForm.licenseNumber} onChange={(event) => setDriverForm({ ...driverForm, licenseNumber: event.target.value })} />
              <Field label="Имя" value={driverForm.name} onChange={(event) => setDriverForm({ ...driverForm, name: event.target.value })} />
              <Field label="Телефон" value={driverForm.phone} onChange={(event) => setDriverForm({ ...driverForm, phone: event.target.value })} />
              <Field label="E-mail" value={driverForm.email} onChange={(event) => setDriverForm({ ...driverForm, email: event.target.value })} />
              <Field label="Рейтинг" value={driverForm.rating} onChange={(event) => setDriverForm({ ...driverForm, rating: event.target.value })} />
            </FormGrid>
          )}
          <div className="modal-actions"><Button type="submit">Сохранить</Button></div>
        </form>
      </Modal>
    </>
  );
}

export function RoutesPage() {
  const [routes, setRoutes] = useState<LogisticsRoute[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "Минск - Гродно express",
    origin: "Минск",
    destination: "Гродно",
    distanceKm: "280",
    estimatedHours: "5",
    startAddress: "Минск, терминал",
    finishAddress: "Гродно, склад",
    startLatitude: "53.9023",
    startLongitude: "27.5619",
    finishLatitude: "53.6694",
    finishLongitude: "23.8131"
  });

  async function loadRoutes() {
    const response = await api<{ routes: LogisticsRoute[] }>("/routes");
    setRoutes(response.routes);
  }

  useEffect(() => {
    loadRoutes().catch(console.error);
  }, []);

  async function createRoute(event: FormEvent) {
    event.preventDefault();
    await api("/routes", {
      method: "POST",
      body: JSON.stringify({
        name: form.name,
        origin: form.origin,
        destination: form.destination,
        distanceKm: form.distanceKm,
        estimatedHours: form.estimatedHours,
        points: [
          { sequence: 1, label: "Погрузка", address: form.startAddress, latitude: form.startLatitude, longitude: form.startLongitude },
          { sequence: 2, label: "Разгрузка", address: form.finishAddress, latitude: form.finishLatitude, longitude: form.finishLongitude }
        ]
      })
    });
    setOpen(false);
    await loadRoutes();
  }

  return (
    <>
      <PageHeader title="Маршруты" subtitle="Маршруты и точки следования для планирования рейсов." actions={<RoleGate roles={["dispatcher", "carrier"]}><Button type="button" onClick={() => setOpen(true)}><Plus /> Новый маршрут</Button></RoleGate>} />
      <section className="route-grid">
        {routes.map((route) => (
          <Card key={route.id}>
            <div className="route-card-head">
              <h2>{route.name}</h2>
              <span>{route.distanceKm} км</span>
            </div>
            <p>{route.origin}{" -> "}{route.destination} · {route.estimatedHours} ч.</p>
            <RoutePoints points={route.points} />
          </Card>
        ))}
      </section>
      <Modal title="Новый маршрут" open={open} onClose={() => setOpen(false)}>
        <form onSubmit={createRoute}>
          <FormGrid>
            <Field label="Название" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            <Field label="Пункт отправления" value={form.origin} onChange={(event) => setForm({ ...form, origin: event.target.value })} required />
            <Field label="Пункт назначения" value={form.destination} onChange={(event) => setForm({ ...form, destination: event.target.value })} required />
            <Field label="Расстояние, км" type="number" value={form.distanceKm} onChange={(event) => setForm({ ...form, distanceKm: event.target.value })} required />
            <Field label="Расчётное время, ч" type="number" value={form.estimatedHours} onChange={(event) => setForm({ ...form, estimatedHours: event.target.value })} required />
            <Field label="Адрес погрузки" value={form.startAddress} onChange={(event) => setForm({ ...form, startAddress: event.target.value })} required />
            <Field label="Адрес разгрузки" value={form.finishAddress} onChange={(event) => setForm({ ...form, finishAddress: event.target.value })} required />
            <Field label="Широта погрузки" value={form.startLatitude} onChange={(event) => setForm({ ...form, startLatitude: event.target.value })} required />
            <Field label="Долгота погрузки" value={form.startLongitude} onChange={(event) => setForm({ ...form, startLongitude: event.target.value })} required />
            <Field label="Широта разгрузки" value={form.finishLatitude} onChange={(event) => setForm({ ...form, finishLatitude: event.target.value })} required />
            <Field label="Долгота разгрузки" value={form.finishLongitude} onChange={(event) => setForm({ ...form, finishLongitude: event.target.value })} required />
          </FormGrid>
          <div className="modal-actions"><Button type="submit">Сохранить</Button></div>
        </form>
      </Modal>
    </>
  );
}

export function ReportsPage() {
  return (
    <>
      <PageHeader title="Отчеты" subtitle="Минимум два отчета, доступные для скачивания в PDF и Excel." />
      <section className="reports-grid">
        <ReportCard type="shipments" title="Сводка рейсов" text="Статусы, заявки, водители, транспорт и плановые даты." />
        <ReportCard type="fleet" title="Загрузка автопарка" text="Состояние транспорта, компании и грузоподъемность." />
      </section>
    </>
  );
}

export function SettingsPage() {
  const settings = useAppSelector((state) => state.settings);
  const dispatch = useAppDispatch();

  return (
    <>
      <PageHeader title="Настройки" subtitle="Параметры интерфейса сохраняются в localStorage и восстанавливаются после перезагрузки." actions={<Button type="button" variant="danger" onClick={() => dispatch(resetSettings())}>Сброс настроек</Button>} />
      <Card>
        <h2>Параметры пользователя</h2>
        <FormGrid>
          <SelectField label="Тема" value={settings.theme} onChange={(event) => dispatch(updateSetting({ key: "theme", value: event.target.value as SettingsState["theme"] }))} options={[{ label: "Светлая", value: "light" }, { label: "Контрастная", value: "contrast" }]} />
          <SelectField label="Плотность" value={settings.density} onChange={(event) => dispatch(updateSetting({ key: "density", value: event.target.value as SettingsState["density"] }))} options={[{ label: "Комфортная", value: "comfortable" }, { label: "Компактная", value: "compact" }]} />
          <SelectField label="Фокус панели" value={settings.dashboardFocus} onChange={(event) => dispatch(updateSetting({ key: "dashboardFocus", value: event.target.value as SettingsState["dashboardFocus"] }))} options={[{ label: "Рейсы", value: "shipments" }, { label: "Автопарк", value: "fleet" }, { label: "Заявки", value: "orders" }]} />
        </FormGrid>
        <div className="settings-list">
          <ToggleRow label="Свернуть боковое меню" checked={settings.sidebarCollapsed} onChange={(value) => dispatch(updateSetting({ key: "sidebarCollapsed", value }))} />
          <ToggleRow label="Уменьшить анимации" checked={settings.reduceMotion} onChange={(value) => dispatch(updateSetting({ key: "reduceMotion", value }))} />
        </div>
      </Card>
    </>
  );
}
