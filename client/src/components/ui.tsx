import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes
} from "react";
import { useAppSelector } from "../hooks";
import type { RoutePoint, ShipmentEvent } from "../types";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ children, className = "", variant = "primary", ...props }: ButtonProps) {
  return (
    <button className={`btn btn-${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`surface ${className}`}>{children}</section>;
}

export function PageHeader({
  title,
  subtitle,
  actions
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
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

export function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {hint ? <small>{hint}</small> : null}
    </article>
  );
}

export function MetricGrid({ children }: { children: ReactNode }) {
  return <div className="metric-grid">{children}</div>;
}

const statusLabels: Record<string, string> = {
  NEW: "Новая",
  DRAFT: "Черновик",
  IN_PROGRESS: "В работе",
  COMPLETED: "Завершена",
  CANCELLED: "Отменена",
  PLANNED: "Запланирован",
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

export function StatusBadge({ status }: { status: string }) {
  return <span className={`status status-${status.toLowerCase()}`}>{statusLabels[status] ?? status}</span>;
}

export function PriorityPill({ priority }: { priority: string }) {
  const labels: Record<string, string> = {
    LOW: "Низкий",
    NORMAL: "Обычный",
    HIGH: "Высокий",
    URGENT: "Срочный"
  };

  return <span className={`priority priority-${priority.toLowerCase()}`}>{labels[priority] ?? priority}</span>;
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="toolbar">{children}</div>;
}

export function SearchInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="field search-input" type="search" placeholder="Поиск" {...props} />;
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: Array<{ label: string; value: string }>;
};

export function SelectField({ label, options, className = "", ...props }: SelectFieldProps) {
  return (
    <label className={`field-label ${className}`}>
      <span>{label}</span>
      <select className="field" {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function TextInput({ label, className = "", ...props }: TextInputProps) {
  return (
    <label className={`field-label ${className}`}>
      <span>{label}</span>
      <input className="field" {...props} />
    </label>
  );
}

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
};

export function TextAreaField({ label, className = "", ...props }: TextAreaFieldProps) {
  return (
    <label className={`field-label ${className}`}>
      <span>{label}</span>
      <textarea className="field" rows={3} {...props} />
    </label>
  );
}

export function FormGrid({ children }: { children: ReactNode }) {
  return <div className="form-grid">{children}</div>;
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{text}</p>
      {action}
    </div>
  );
}

export function SkeletonBlock() {
  return (
    <div className="skeleton-stack" aria-label="Загрузка данных">
      <span />
      <span />
      <span />
    </div>
  );
}

type DataTableColumn<T> = {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
};

export function DataTable<T>({ columns, data, getKey }: { columns: DataTableColumn<T>[]; data: T[]; getKey: (item: T) => string }) {
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
            <tr key={getKey(item)}>
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
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <header>
          <h2>{title}</h2>
          <button type="button" aria-label="Закрыть" onClick={onClose}>
            x
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

export function Toast({ message, tone = "info" }: { message: string | null; tone?: "info" | "success" | "error" }) {
  return message ? <div className={`toast toast-${tone}`}>{message}</div> : null;
}

export function Timeline({ events }: { events: ShipmentEvent[] }) {
  return (
    <ol className="timeline">
      {events.map((event) => (
        <li key={event.id}>
          <span />
          <div>
            <strong>{statusLabels[event.type] ?? event.type}</strong>
            <p>{event.message}</p>
            <small>
              {event.location ?? "Без геометки"} · {new Date(event.createdAt).toLocaleString("ru-RU")}
            </small>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function RoutePreview({ points }: { points: RoutePoint[] }) {
  return (
    <div className="route-preview">
      {points.map((point) => (
        <div key={point.id} className="route-point">
          <span>{point.sequence}</span>
          <div>
            <strong>{point.label}</strong>
            <p>{point.address}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReportCard({
  title,
  text,
  onDownload,
  onExcelDownload,
  busy
}: {
  title: string;
  text: string;
  onDownload: () => void;
  onExcelDownload: () => void;
  busy?: boolean;
}) {
  return (
    <article className="report-card">
      <h2>{title}</h2>
      <p>{text}</p>
      <div className="button-row">
        <Button type="button" onClick={onDownload} disabled={busy}>
          Скачать PDF
        </Button>
        <Button type="button" variant="secondary" onClick={onExcelDownload} disabled={busy}>
          Скачать Excel
        </Button>
      </div>
    </article>
  );
}

export function SettingsToggle({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

export function RoleGate({ roles, children }: { roles: string[]; children: ReactNode }) {
  const role = useAppSelector((state) => state.auth.user?.role.slug);

  if (!role || !roles.includes(role)) {
    return null;
  }

  return <>{children}</>;
}

export function DataList({ children }: { children: ReactNode }) {
  return <div className="data-list">{children}</div>;
}

export function KPIBar({ items }: { items: Array<{ label: string; value: string | number }> }) {
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

export function MobileTabs({
  value,
  options,
  onChange
}: {
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mobile-tabs">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={value === option.value ? "active" : ""}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
