import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { AuthState, SettingsState, User } from "./types";

export const defaultSettings: SettingsState = {
  theme: "light",
  density: "comfortable",
  dashboardFocus: "shipments",
  sidebarCollapsed: false,
  reduceMotion: false
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function loadJson<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    if (!value) {
      return fallback;
    }

    const parsed = JSON.parse(value) as unknown;

    if (Array.isArray(fallback)) {
      return (Array.isArray(parsed) ? parsed : isRecord(parsed) ? Object.values(parsed) : fallback) as T;
    }

    if (isRecord(fallback)) {
      return (isRecord(parsed) ? { ...fallback, ...parsed } : fallback) as T;
    }

    if (fallback === null) {
      return parsed as T;
    }

    return typeof parsed === typeof fallback ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem("tl_token"),
    user: loadJson<User | null>("tl_user", null)
  } satisfies AuthState,
  reducers: {
    setAuth(state, action: PayloadAction<AuthState>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      action.payload.token ? localStorage.setItem("tl_token", action.payload.token) : localStorage.removeItem("tl_token");
      action.payload.user ? saveJson("tl_user", action.payload.user) : localStorage.removeItem("tl_user");
    },
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem("tl_token");
      localStorage.removeItem("tl_user");
    }
  }
});

const settingsSlice = createSlice({
  name: "settings",
  initialState: loadJson("tl_settings", defaultSettings),
  reducers: {
    updateSetting<K extends keyof SettingsState>(
      state: SettingsState,
      action: PayloadAction<{ key: K; value: SettingsState[K] }>
    ) {
      state[action.payload.key] = action.payload.value;
      saveJson("tl_settings", state);
    },
    resetSettings() {
      localStorage.removeItem("tl_settings");
      localStorage.removeItem("tl_order_filters");
      localStorage.removeItem("tl_shipment_filters");
      localStorage.removeItem("tl_fleet_tab");
      localStorage.removeItem("tl_favorite_orders");
      return defaultSettings;
    }
  }
});

export const { setAuth, logout } = authSlice.actions;
export const { updateSetting, resetSettings } = settingsSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    settings: settingsSlice.reducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
