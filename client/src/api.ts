import { store } from "./store";

const API_BASE =
  window.location.port === "4000" || window.location.pathname.startsWith("/app")
    ? "/api"
    : "http://localhost:4000/api";

export async function api<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = store.getState().auth.token;
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({ message: "Ошибка запроса" }))) as { message?: string };
    throw new Error(error.message ?? "Ошибка запроса");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function downloadReport(type: "shipments" | "fleet", format: "pdf" | "xlsx") {
  const token = store.getState().auth.token;
  const response = await fetch(`${API_BASE}/reports/${type}.${format}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });

  if (!response.ok) {
    throw new Error("Не удалось сформировать отчет");
  }

  const blob = await response.blob();
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = `${type}-report.${format}`;
  link.click();
  URL.revokeObjectURL(href);
}
