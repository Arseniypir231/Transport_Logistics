import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export const SETTINGS_STORAGE_KEY = "tl_settings";

export type SettingsState = {
  theme: "light" | "contrast";
  density: "comfortable" | "compact";
  sidebarCollapsed: boolean;
  dashboardFocus: "shipments" | "fleet" | "orders";
  reduceMotion: boolean;
};

export const defaultSettings: SettingsState = {
  theme: "light",
  density: "comfortable",
  sidebarCollapsed: false,
  dashboardFocus: "shipments",
  reduceMotion: false
};

function loadSettings(): SettingsState {
  const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);

  if (!raw) {
    return defaultSettings;
  }

  try {
    return {
      ...defaultSettings,
      ...JSON.parse(raw)
    };
  } catch {
    return defaultSettings;
  }
}

const settingsSlice = createSlice({
  name: "settings",
  initialState: loadSettings,
  reducers: {
    setSetting<K extends keyof SettingsState>(
      state: SettingsState,
      action: PayloadAction<{ key: K; value: SettingsState[K] }>
    ) {
      state[action.payload.key] = action.payload.value;
    },
    resetSettings() {
      localStorage.removeItem("tl_order_filters");
      localStorage.removeItem("tl_shipment_filters");
      localStorage.removeItem("tl_fleet_tab");
      return defaultSettings;
    }
  }
});

export const { setSetting, resetSettings } = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;
