import { createAsyncThunk, createSlice, isPending, isRejected } from "@reduxjs/toolkit";
import { apiRequest } from "../api/client";
import type { CatalogData, DashboardData, Driver, LogisticsOrder, Shipment, TransportRoute, Vehicle } from "../types";

type LogisticsState = {
  dashboard: DashboardData | null;
  orders: LogisticsOrder[];
  shipments: Shipment[];
  vehicles: Vehicle[];
  drivers: Driver[];
  routes: TransportRoute[];
  catalog: CatalogData | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: LogisticsState = {
  dashboard: null,
  orders: [],
  shipments: [],
  vehicles: [],
  drivers: [],
  routes: [],
  catalog: null,
  status: "idle",
  error: null
};

const withQuery = (path: string, params?: Record<string, string>) => {
  const query = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });

  return query.size ? `${path}?${query.toString()}` : path;
};

export const fetchDashboard = createAsyncThunk("logistics/dashboard", () =>
  apiRequest<DashboardData>("/dashboard")
);

export const fetchOrders = createAsyncThunk("logistics/orders", (filters?: Record<string, string>) =>
  apiRequest<{ orders: LogisticsOrder[] }>(withQuery("/orders", filters))
);

export const fetchShipments = createAsyncThunk("logistics/shipments", (filters?: Record<string, string>) =>
  apiRequest<{ shipments: Shipment[] }>(withQuery("/shipments", filters))
);

export const fetchVehicles = createAsyncThunk("logistics/vehicles", (filters?: Record<string, string>) =>
  apiRequest<{ vehicles: Vehicle[] }>(withQuery("/vehicles", filters))
);

export const fetchDrivers = createAsyncThunk("logistics/drivers", (filters?: Record<string, string>) =>
  apiRequest<{ drivers: Driver[] }>(withQuery("/drivers", filters))
);

export const fetchRoutes = createAsyncThunk("logistics/routes", () =>
  apiRequest<{ routes: TransportRoute[] }>("/routes")
);

export const fetchCatalog = createAsyncThunk("logistics/catalog", () => apiRequest<CatalogData>("/catalog"));

const logisticsSlice = createSlice({
  name: "logistics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.dashboard = action.payload;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.orders = action.payload.orders;
      })
      .addCase(fetchShipments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.shipments = action.payload.shipments;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.vehicles = action.payload.vehicles;
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.drivers = action.payload.drivers;
      })
      .addCase(fetchRoutes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.routes = action.payload.routes;
      })
      .addCase(fetchCatalog.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.catalog = action.payload;
      })
      .addMatcher(
        isPending(fetchDashboard, fetchOrders, fetchShipments, fetchVehicles, fetchDrivers, fetchRoutes, fetchCatalog),
        (state) => {
          state.status = "loading";
          state.error = null;
        }
      )
      .addMatcher(
        isRejected(fetchDashboard, fetchOrders, fetchShipments, fetchVehicles, fetchDrivers, fetchRoutes, fetchCatalog),
        (state, action) => {
          state.status = "failed";
          state.error = action.error.message ?? "Loading error";
        }
      );
  }
});

export const logisticsReducer = logisticsSlice.reducer;
