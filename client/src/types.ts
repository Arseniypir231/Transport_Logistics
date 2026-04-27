import type { ReactNode } from "react";

export type RoleSlug = "dispatcher" | "client" | "carrier";

export type Company = {
  id: string;
  name: string;
  type: "CLIENT" | "CARRIER" | "PARTNER";
  contactEmail?: string;
  phone?: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  status: string;
  role: { slug: RoleSlug; name: string };
  company?: Company | null;
};

export type Cargo = {
  id: string;
  name: string;
  type: string;
  weightKg: string | number;
  volumeM3: string | number;
};

export type Order = {
  id: string;
  code: string;
  title: string;
  status: string;
  priority: string;
  pickupAddress: string;
  deliveryAddress: string;
  pickupDate: string;
  deliveryDate: string;
  price: string | number;
  notes?: string;
  client: Company;
  cargo: Cargo;
  shipments?: Pick<Shipment, "id" | "trackingNumber" | "status">[];
};

export type Vehicle = {
  id: string;
  plateNumber: string;
  type: string;
  make?: string;
  model?: string;
  year?: number;
  capacityKg: string | number;
  capacityM3: string | number;
  status: string;
  companyId: string;
  company?: Company;
};

export type Driver = {
  id: string;
  licenseNumber: string;
  name: string;
  phone: string;
  email?: string;
  rating: string | number;
  status: string;
  companyId: string;
  company?: Company;
};

export type RoutePoint = {
  id?: string;
  sequence: number;
  label: string;
  address: string;
  latitude: string | number;
  longitude: string | number;
};

export type LogisticsRoute = {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distanceKm: string | number;
  estimatedHours: number;
  points?: RoutePoint[];
};

export type ShipmentEvent = {
  id: string;
  type: string;
  message: string;
  location?: string;
  createdAt: string;
  createdBy?: Pick<User, "id" | "name">;
};

export type Shipment = {
  id: string;
  trackingNumber: string;
  status: string;
  order: Order;
  carrier: Company;
  driver: Driver;
  vehicle: Vehicle;
  route?: LogisticsRoute | null;
  events?: ShipmentEvent[];
  plannedStart: string;
  plannedFinish: string;
};

export type Catalog = {
  companies: Company[];
  cargo: Cargo[];
  orders: Order[];
  drivers: Driver[];
  vehicles: Vehicle[];
  routes: LogisticsRoute[];
};

export type SettingsState = {
  theme: "light" | "contrast";
  density: "comfortable" | "compact";
  dashboardFocus: "shipments" | "fleet" | "orders";
  sidebarCollapsed: boolean;
  reduceMotion: boolean;
};

export type AuthState = {
  token: string | null;
  user: User | null;
};

export type Column<T> = {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
};
