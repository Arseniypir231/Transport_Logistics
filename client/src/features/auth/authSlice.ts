import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest, AUTH_STORAGE_KEY } from "../../api/client";
import type { PublicUser } from "../../types";

type AuthResponse = {
  token: string;
  user: PublicUser;
};

type AuthState = {
  token: string | null;
  user: PublicUser | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

function loadAuth(): Pick<AuthState, "token" | "user"> {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!raw) {
    return { token: null, user: null };
  }

  try {
    return JSON.parse(raw) as Pick<AuthState, "token" | "user">;
  } catch {
    return { token: null, user: null };
  }
}

const savedAuth = loadAuth();

const initialState: AuthState = {
  token: savedAuth.token,
  user: savedAuth.user,
  status: "idle",
  error: null
};

export const login = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }) =>
    apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true
    })
);

export const register = createAsyncThunk(
  "auth/register",
  async (payload: { name: string; email: string; password: string; roleSlug: "client" | "carrier"; companyName: string }) =>
    apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true
    })
);

export const fetchMe = createAsyncThunk("auth/me", async () => apiRequest<{ user: PublicUser }>("/auth/me"));

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.status = "idle";
      state.error = null;
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: state.token, user: state.user }));
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Не удалось войти";
      })
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: state.token, user: state.user }));
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Не удалось зарегистрироваться";
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload.user;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: state.token, user: state.user }));
      });
  }
});

export const { logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
