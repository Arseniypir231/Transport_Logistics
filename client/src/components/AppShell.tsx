import { Boxes, FileText, LayoutDashboard, LogOut, Map, Menu, PackagePlus, PieChart, Settings, Truck } from "lucide-react";
import type { ReactNode } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { logout } from "../features/auth/authSlice";
import { setSetting } from "../features/settings/settingsSlice";
import { useAppDispatch, useAppSelector } from "../hooks";

const navItems = [
  { to: "/app", label: "Панель", icon: LayoutDashboard, roles: ["dispatcher", "client", "carrier"] },
  { to: "/analytics", label: "Аналитика", icon: PieChart, roles: ["dispatcher", "client", "carrier"] },
  { to: "/orders", label: "Заявки", icon: PackagePlus, roles: ["dispatcher", "client"] },
  { to: "/shipments", label: "Рейсы", icon: Truck, roles: ["dispatcher", "client", "carrier"] },
  { to: "/fleet", label: "Автопарк", icon: Boxes, roles: ["dispatcher", "carrier"] },
  { to: "/routes", label: "Маршруты", icon: Map, roles: ["dispatcher", "carrier"] },
  { to: "/reports", label: "Отчеты", icon: FileText, roles: ["dispatcher", "carrier"] },
  { to: "/settings", label: "Настройки", icon: Settings, roles: ["dispatcher", "client", "carrier"] }
];

function SideNav() {
  const role = useAppSelector((state) => state.auth.user?.role.slug);
  const collapsed = useAppSelector((state) => state.settings.sidebarCollapsed);
  const visibleItems = navItems.filter((item) => role && item.roles.includes(role));

  return (
    <aside className={`side-nav ${collapsed ? "collapsed" : ""}`}>
      <Link to="/" className="brand" aria-label="Перейти на лендинг">
        <span>TL</span>
        <strong>Transport Logistics</strong>
      </Link>
      <nav aria-label="Основная навигация">
        {visibleItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink key={item.to} to={item.to} end={item.to === "/app"}>
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

function MobileNav() {
  const role = useAppSelector((state) => state.auth.user?.role.slug);
  const visibleItems = navItems.filter((item) => role && item.roles.includes(role)).slice(0, 5);

  return (
    <nav className="mobile-nav" aria-label="Мобильная навигация">
      {visibleItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink key={item.to} to={item.to} end={item.to === "/app"}>
            <Icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

function TopBar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const collapsed = useAppSelector((state) => state.settings.sidebarCollapsed);

  return (
    <header className="top-bar">
      <button
        type="button"
        className="icon-button"
        aria-label="Свернуть меню"
        onClick={() => dispatch(setSetting({ key: "sidebarCollapsed", value: !collapsed }))}
      >
        <Menu size={20} />
      </button>
      <Link to="/" className="top-logo" aria-label="Перейти на лендинг">
        <span>TL</span>
        <strong>Transport Logistics</strong>
      </Link>
      <div className="top-user">
        <img
          src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=160&q=80"
          alt="Грузовой автомобиль"
        />
        <div>
          <strong>{user?.name}</strong>
          <span>{user?.role.name}</span>
        </div>
      </div>
      <button type="button" className="icon-button" aria-label="Выйти" onClick={() => dispatch(logout())}>
        <LogOut size={20} />
      </button>
    </header>
  );
}

export function AppShell() {
  return (
    <div className="app-shell">
      <SideNav />
      <div className="workspace">
        <TopBar />
        <main>
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

export function ReportLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <NavLink className="report-link" to={to}>
      <FileText size={16} />
      {children}
    </NavLink>
  );
}
