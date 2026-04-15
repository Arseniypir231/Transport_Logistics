import { useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchDashboard } from "../features/logisticsSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import { Button, Card, DataList, EmptyState, KPIBar, MetricGrid, PageHeader, SkeletonBlock, StatCard, StatusBadge } from "../components/ui";

export function DashboardPage() {
  const dispatch = useAppDispatch();
  const { dashboard, status } = useAppSelector((state) => state.logistics);
  const focus = useAppSelector((state) => state.settings.dashboardFocus);

  useEffect(() => {
    void dispatch(fetchDashboard());
  }, [dispatch]);

  return (
    <>
      <PageHeader
        title="Панель управления"
        subtitle="Оперативное состояние заказов, рейсов и автопарка."
        actions={
          <Button type="button" variant="secondary" onClick={() => void dispatch(fetchDashboard())}>
            Обновить
          </Button>
        }
      />

      {status === "loading" && !dashboard ? <SkeletonBlock /> : null}

      {dashboard ? (
        <>
          <MetricGrid>
            <StatCard label="Заявки" value={dashboard.metrics.ordersTotal} hint="Всего в системе" />
            <StatCard label="Рейсы" value={dashboard.metrics.shipmentsTotal} hint="Плановые и текущие" />
            <StatCard label="Активные" value={dashboard.metrics.activeShipments} hint="Погрузка и движение" />
            <StatCard label="Задержки" value={dashboard.metrics.delayedShipments} hint="Требуют внимания" />
            <StatCard label="Транспорт" value={dashboard.metrics.vehiclesTotal} hint="Единиц автопарка" />
            <StatCard label="Водители" value={dashboard.metrics.driversTotal} hint="В реестре" />
          </MetricGrid>

          <KPIBar
            items={[
              { label: "Фокус", value: focus === "fleet" ? "Автопарк" : focus === "orders" ? "Заявки" : "Рейсы" },
              { label: "Статусов рейсов", value: dashboard.shipmentsByStatus.length },
              { label: "Последних событий", value: dashboard.recentShipments.length }
            ]}
          />

          <section className="dashboard-grid">
            <Card>
              <h2>Рейсы по статусам</h2>
              <div className="status-chart">
                {dashboard.shipmentsByStatus.map((item) => (
                  <div key={item.status}>
                    <span>
                      <StatusBadge status={item.status} />
                    </span>
                    <strong>{item.count}</strong>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h2>Последние рейсы</h2>
              {dashboard.recentShipments.length ? (
                <DataList>
                  {dashboard.recentShipments.map((shipment) => (
                    <Link className="data-row" to={`/shipments/${shipment.id}`} key={shipment.id}>
                      <span>
                        <strong>{shipment.trackingNumber}</strong>
                        <small>{shipment.order.title}</small>
                      </span>
                      <StatusBadge status={shipment.status} />
                    </Link>
                  ))}
                </DataList>
              ) : (
                <EmptyState title="Рейсов пока нет" text="Создайте рейс на странице заявок или рейсов." />
              )}
            </Card>
          </section>
        </>
      ) : null}
    </>
  );
}
