import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./features/auth/authSlice";
import { logisticsReducer } from "./features/logisticsSlice";
import { settingsReducer, SETTINGS_STORAGE_KEY } from "./features/settings/settingsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    logistics: logisticsReducer,
    settings: settingsReducer
  }
});

store.subscribe(() => {
  const { settings } = store.getState();
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
