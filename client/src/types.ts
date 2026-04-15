export type Role = {
  id: string;
  slug: "dispatcher" | "client" | "carrier";
  name: string;
};

export type Company = {
  id: string;
  name: string;
  type: "CLIENT" | "CARRIER" | "PARTNER";
  taxNumber?: string | null;
  address?: string | null;
  contactEmail?: string | null;
  phone?: string | null;
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  status: string;
  role: Role;
  company: Pick<Company, "id" | "name" | "type"> | null;
};

export type Cargo = {
  id: string;
  name: string;
  type: string;
  weightKg: string;
  volumeM3: string;
  temperatureFrom?: number | null;
  temperatureTo?: number | null;
  hazardClass?: string | null;
};

export type LogisticsOrder = {
  id: string;
  code: string;
  title: string;
  status: "DRAFT" | "NEW" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  pickupAddress: string;
  deliveryAddress: string;
  pickupDate: string;
  deliveryDate: string;
  price: string;
  notes?: string | null;
  client: Company;
  cargo: Cargo;
  shipments?: Pick<Shipment, "id" | "trackingNumber" | "status">[];
};

export type Vehicle = {
  id: string;
  plateNumber: string;
  type: string;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  capacityKg: string;
  capacityM3: string;
  status: "AVAILABLE" | "ASSIGNED" | "MAINTENANCE";
  company: Company;
  shipments?: Pick<Shipment, "id" | "trackingNumber" | "status">[];
};

export type Driver = {
  id: string;
  licenseNumber: string;
  name: string;
  phone: string;
  email?: string | null;
  rating: string;
  status: "AVAILABLE" | "ON_ROUTE" | "VACATION";
  company: Company;
  shipments?: Pick<Shipment, "id" | "trackingNumber" | "status">[];
};

export type RoutePoint = {
  id: string;
  sequence: number;
  label: string;
  address: string;
  latitude: string;
  longitude: string;
  plannedArrival?: string | null;
};

export type TransportRoute = {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distanceKm: string;
  estimatedHours: number;
  points: RoutePoint[];
  shipments?: Pick<Shipment, "id" | "trackingNumber" | "status">[];
};

export type ShipmentEvent = {
  id: string;
  type: string;
  message: string;
  location?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  createdAt: string;
  createdBy?: Pick<PublicUser, "id" | "name"> | null;
};

export type Shipment = {
  id: string;
  trackingNumber: string;
  status: "PLANNED" | "LOADING" | "IN_TRANSIT" | "DELIVERED" | "DELAYED" | "CANCELLED";
  plannedStart: string;
  actualStart?: string | null;
  plannedFinish: string;
  actualFinish?: string | null;
  currentLatitude?: string | null;
  currentLongitude?: string | null;
  order: LogisticsOrder;
  carrier: Company;
  driver: Driver;
  vehicle: Vehicle;
  route?: TransportRoute | null;
  events: ShipmentEvent[];
};

export type DashboardData = {
  metrics: {
    ordersTotal: number;
    shipmentsTotal: number;
    vehiclesTotal: number;
    driversTotal: number;
    activeShipments: number;
    delayedShipments: number;
  };
  shipmentsByStatus: Array<{
    status: Shipment["status"];
    count: number;
  }>;
  recentShipments: Shipment[];
};

export type CatalogData = {
  companies: Company[];
  orders: LogisticsOrder[];
  vehicles: Vehicle[];
  drivers: Driver[];
  routes: TransportRoute[];
};

export type AnalyticsData = {
  period: "6m" | "12m";
  summary: {
    orders: number;
    shipments: number;
    vehicles: number;
    drivers: number;
    revenue: number;
    cargoWeightKg: number;
  };
  monthly: Array<{
    key: string;
    label: string;
    revenue: number;
    orders: number;
    shipments: number;
  }>;
  shipmentsByStatus: Array<{
    status: string;
    label: string;
    count: number;
  }>;
  topRoutes: Array<{
    route: string;
    shipments: number;
    revenue: number;
    weightKg: number;
  }>;
};
