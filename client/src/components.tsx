import { Download, PackagePlus } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { downloadReport } from "./api";
import { loadJson, saveJson, useAppSelector } from "./store";
import type { Column, RoleSlug, RoutePoint, ShipmentEvent } from "./types";

export function usePersistentState<T>(key: string, fallback: T) {
  const [state, setState] = useState<T>(() => loadJson(key, fallback));
  const keyRef = useRef(key);

  useEffect(() => {
    if (keyRef.current !== key) {
      keyRef.current = key;
      setState(loadJson(key, fallback));
      return;
    }
    saveJson(key, state);
  }, [key, state]);

  return [state, setState] as const;
}

export function money(value: string | number) {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "BYN" }).format(Number(value));
}

export function date(value: string) {
  return new Date(value).toLocaleDateString("ru-RU");
}

export function statusLabel(status: string) {
  const labels: Record<string, string> = {
    NEW: "Новая",
    IN_PROGRESS: "В работе",
    COMPLETED: "Завершена",
    CANCELLED: "Отменена",
    PLANNED: "План",
    LOADING: "Погрузка",
    IN_TRANSIT: "В пути",
    DELIVERED: "Доставлен",
    DELAYED: "Задержка",
    AVAILABLE: "Доступен",
    ASSIGNED: "Назначен",
    MAINTENANCE: "Сервис",
    ON_ROUTE: "В рейсе",
    VACATION: "Отпуск"
  };
  return labels[status] ?? status;
}

export function eventTypeLabel(type: string) {
  const labels: Record<string, string> = {
    CREATED: "Создан",
    LOADED: "Погрузка",
    DEPARTED: "Отправлен",
    CHECKPOINT: "Контрольная точка",
    ARRIVED: "Прибыл",
    DELIVERED: "Доставка",
    PROBLEM: "Проблема"
  };
  return labels[type] ?? type;
}

export function priorityLabel(priority: string) {
  const labels: Record<string, string> = {
    LOW: "Низкий",
    NORMAL: "Обычный",
    HIGH: "Высокий",
    URGENT: "Срочный"
  };
  return labels[priority] ?? priority;
}

export function Button({
  children,
  variant = "primary",
  ...props
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`btn btn-${variant}`} {...props}>
      {children}
    </button>
  );
}

export function IconButton({
  children,
  label,
  ...props
}: { children: ReactNode; label: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className="icon-button" aria-label={label} title={label} {...props}>
      {children}
    </button>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`surface ${className}`}>{children}</section>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">Transport Logistics</p>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </header>
  );
}

export function StatCard({ label, value, icon }: { label: string; value: ReactNode; icon: ReactNode }) {
  return (
    <article className="stat-card">
      <span>{icon}</span>
      <strong>{value}</strong>
      <small>{label}</small>
    </article>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return <span className={`status status-${status.toLowerCase()}`}>{statusLabel(status)}</span>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  return <span className={`priority priority-${priority.toLowerCase()}`}>{priorityLabel(priority)}</span>;
}

export function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} />
    </label>
  );
}

export function SelectField({
  label,
  options,
  ...props
}: {
  label: string;
  options: { label: string; value: string }[];
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="field">
      <span>{label}</span>
      <select {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function TextAreaField({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="field full">
      <span>{label}</span>
      <textarea {...props} />
    </label>
  );
}

export function FormGrid({ children }: { children: ReactNode }) {
  return <div className="form-grid">{children}</div>;
}

export function FilterPanel({ children }: { children: ReactNode }) {
  return <section className="filter-panel">{children}</section>;
}

export function DataTable<T extends { id: string }>({ columns, data }: { columns: Column<T>[]; data: T[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              {columns.map((column) => (
                <td key={column.key}>{column.render(item)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Modal({
  title,
  open,
  onClose,
  children
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <h2>{title}</h2>
          <IconButton label="Закрыть" onClick={onClose}>
            x
          </IconButton>
        </div>
        {children}
      </section>
    </div>
  );
}

export function Toast({ message, tone = "success" }: { message: string | null; tone?: "success" | "danger" }) {
  return message ? <p className={`toast toast-${tone}`}>{message}</p> : null;
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <Card className="empty-state">
      <PackagePlus />
      <h2>{title}</h2>
      <p>{text}</p>
    </Card>
  );
}

export function RoleGate({ roles, children }: { roles: RoleSlug[]; children: ReactNode }) {
  const user = useAppSelector((state) => state.auth.user);
  return user && roles.includes(user.role.slug) ? <>{children}</> : null;
}

export function Tabs({
  tabs,
  active,
  onChange
}: {
  tabs: { value: string; label: string }[];
  active: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((tab) => (
        <button key={tab.value} className={active === tab.value ? "active" : ""} onClick={() => onChange(tab.value)} type="button">
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

export function Timeline({ events = [] }: { events?: ShipmentEvent[] }) {
  return (
    <ol className="timeline">
      {events.map((event) => (
        <li key={event.id}>
          <span>{eventTypeLabel(event.type)}</span>
          <strong>{event.message}</strong>
          <small>{event.location ?? "Без локации"} · {new Date(event.createdAt).toLocaleString("ru-RU")}</small>
        </li>
      ))}
    </ol>
  );
}

export function RoutePoints({ points = [] }: { points?: RoutePoint[] }) {
  return (
    <ol className="route-points">
      {points.map((point) => (
        <li key={`${point.sequence}-${point.address}`}>
          <span>{point.sequence}</span>
          <div>
            <strong>{point.label}</strong>
            <small>{point.address}</small>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function KpiBar({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <div className="kpi-bar">
      {items.map((item) => (
        <span key={item.label}>
          <strong>{item.value}</strong>
          {item.label}
        </span>
      ))}
    </div>
  );
}

export function BarList({ title, rows }: { title: string; rows: { label: string; value: number }[] }) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  return (
    <Card>
      <h2>{title}</h2>
      <div className="bar-list">
        {rows.map((row) => (
          <div key={row.label}>
            <span>{row.label}</span>
            <meter min={0} max={max} value={row.value} />
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function FavoriteButton({ id }: { id: string }) {
  const userId = useAppSelector((state) => state.auth.user?.id);
  const storageKey = userId ? `tl_favorite_orders:${userId}` : "tl_favorite_orders:guest";
  const [favorites, setFavorites] = usePersistentState<string[]>(storageKey, []);
  const selected = favorites.includes(id);

  return (
    <Button
      type="button"
      variant={selected ? "secondary" : "ghost"}
      onClick={() => setFavorites(selected ? favorites.filter((item) => item !== id) : [...favorites, id])}
    >
      {selected ? "В избранном" : "В избранное"}
    </Button>
  );
}

export function ReportCard({ title, text, type }: { title: string; text: string; type: "shipments" | "fleet" }) {
  const [message, setMessage] = useState<string | null>(null);

  async function handle(format: "pdf" | "xlsx") {
    await downloadReport(type, format);
    setMessage(`Отчет ${format.toUpperCase()} сформирован`);
  }

  return (
    <Card className="report-card">
      <Download />
      <h2>{title}</h2>
      <p>{text}</p>
      <div className="button-row">
        <Button type="button" onClick={() => handle("pdf")}>PDF</Button>
        <Button type="button" variant="secondary" onClick={() => handle("xlsx")}>Excel</Button>
      </div>
      <Toast message={message} />
    </Card>
  );
}

export function StrongLink({ to, children }: { to: string; children: ReactNode }) {
  return <Link className="text-link strong-link" to={to}>{children}</Link>;
}
