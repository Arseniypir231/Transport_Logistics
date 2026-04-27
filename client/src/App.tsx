import { LayoutDashboard, LogOut, Map, Menu, Settings, Truck, Users, BarChart3, ClipboardList, Download } from "lucide-react";
import { type ReactNode, useEffect } from "react";
import { Link, NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { api } from "./api";
import { IconButton } from "./components";
import {
  AnalyticsPage,
  AuthPage,
  DashboardPage,
  FleetPage,
  LandingPage,
  OrdersPage,
  ReportsPage,
  RoutesPage,
  SettingsPage,
  ShipmentDetailsPage,
  ShipmentsPage
} from "./pages";
import { logout, setAuth, updateSetting, useAppDispatch, useAppSelector } from "./store";
import type { User } from "./types";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = useAppSelector((state) => state.auth.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppLayout() {
  const settings = useAppSelector((state) => state.settings);
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const nav = [
    { to: "/app", label: "Панель", icon: <LayoutDashboard /> },
    { to: "/analytics", label: "Аналитика", icon: <BarChart3 /> },
    { to: "/orders", label: "Заявки", icon: <ClipboardList /> },
    { to: "/shipments", label: "Рейсы", icon: <Truck /> },
    { to: "/fleet", label: "Автопарк", icon: <Users /> },
    { to: "/routes", label: "Маршруты", icon: <Map /> },
    { to: "/reports", label: "Отчеты", icon: <Download /> },
    { to: "/settings", label: "Настройки", icon: <Settings /> }
  ];

  return (
    <div className={`app-shell ${settings.sidebarCollapsed ? "collapsed" : ""}`}>
      <aside className="side-nav">
        <Link className="brand" to="/app"><span>TL</span><strong>Transport Logistics</strong></Link>
        <nav aria-label="Разделы приложения">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/app"}>
              {item.icon}<span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="workspace">
        <header className="top-bar">
          <IconButton
            label="Свернуть меню"
            onClick={() => dispatch(updateSetting({ key: "sidebarCollapsed", value: !settings.sidebarCollapsed }))}
          >
            <Menu />
          </IconButton>
          <div className="top-user">
            <span className="avatar">{user?.name.slice(0, 1) ?? "U"}</span>
            <div>
              <strong>{user?.name}</strong>
              <small>{user?.role.name} · {user?.company?.name ?? "Без компании"}</small>
            </div>
            <IconButton
              label="Выйти"
              onClick={() => {
                dispatch(logout());
                navigate("/login");
              }}
            >
              <LogOut />
            </IconButton>
          </div>
        </header>
        <main>
          <Routes>
            <Route path="/app" element={<DashboardPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/shipments" element={<ShipmentsPage />} />
            <Route path="/shipments/:id" element={<ShipmentDetailsPage />} />
            <Route path="/fleet" element={<FleetPage />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export function App() {
  const settings = useAppSelector((state) => state.settings);
  const token = useAppSelector((state) => state.auth.token);
  const dispatch = useAppDispatch();

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
    document.documentElement.dataset.density = settings.density;
    document.documentElement.dataset.motion = settings.reduceMotion ? "reduced" : "full";
  }, [settings]);

  useEffect(() => {
    if (token) {
      api<{ user: User }>("/auth/me")
        .then((response) => dispatch(setAuth({ token, user: response.user })))
        .catch(() => dispatch(logout()));
    }
  }, [dispatch, token]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
    </Routes>
  );
}
