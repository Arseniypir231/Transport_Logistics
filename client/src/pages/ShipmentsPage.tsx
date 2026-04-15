import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import { fetchCatalog, fetchShipments } from "../features/logisticsSlice";
import { useAppDispatch, useAppSelector, useLocalStorageState } from "../hooks";
import type { Shipment } from "../types";
import {
  Button,
  DataTable,
  EmptyState,
  FormGrid,
  Modal,
  PageHeader,
  RoleGate,
  SearchInput,
  SelectField,
  StatusBadge,
  TextInput,
  Toast,
  Toolbar
} from "../components/ui";

const initialShipmentForm = {
  orderId: "",
  carrierId: "",
  driverId: "",
  vehicleId: "",
  routeId: "",
  plannedStart: "2026-04-13T09:00",
  plannedFinish: "2026-04-13T18:00"
};

export function ShipmentsPage() {
  const dispatch = useAppDispatch();
  const { shipments, catalog } = useAppSelector((state) => state.logistics);
  const [filters, setFilters] = useLocalStorageState("tl_shipment_filters", { search: "", status: "" });
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(initialShipmentForm);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void dispatch(fetchShipments(filters));
    void dispatch(fetchCatalog());
  }, [dispatch, filters]);

  useEffect(() => {
    if (catalog) {
      setForm((current) => ({
        ...current,
        orderId: current.orderId || catalog.orders[0]?.id || "",
        carrierId: current.carrierId || catalog.companies.find((company) => company.type === "CARRIER")?.id || "",
        driverId: current.driverId || catalog.drivers[0]?.id || "",
        vehicleId: current.vehicleId || catalog.vehicles[0]?.id || "",
        routeId: current.routeId || catalog.routes[0]?.id || ""
      }));
    }
  }, [catalog]);

  const columns = useMemo(
    () => [
      {
        key: "track",
        header: "Трекинг",
        render: (shipment: Shipment) => (
          <Link className="text-link strong-link" to={`/shipments/${shipment.id}`}>
            {shipment.trackingNumber}
          </Link>
        )
      },
      {
        key: "order",
        header: "Заявка",
        render: (shipment: Shipment) => (
          <span>
            {shipment.order.code}
            <small>{shipment.order.title}</small>
          </span>
        )
      },
      { key: "driver", header: "Водитель", render: (shipment: Shipment) => shipment.driver.name },
      { key: "vehicle", header: "Транспорт", render: (shipment: Shipment) => shipment.vehicle.plateNumber },
      { key: "status", header: "Статус", render: (shipment: Shipment) => <StatusBadge status={shipment.status} /> },
      {
        key: "actions",
        header: "Действия",
        render: (shipment: Shipment) => (
          <RoleGate roles={["dispatcher", "carrier"]}>
            <SelectField
              label="Сменить"
              value={shipment.status}
              onChange={(event) => void handleStatusChange(shipment.id, event.target.value)}
              options={[
                { label: "Запланирован", value: "PLANNED" },
                { label: "Погрузка", value: "LOADING" },
                { label: "В пути", value: "IN_TRANSIT" },
                { label: "Доставлен", value: "DELIVERED" },
                { label: "Задержка", value: "DELAYED" }
              ]}
            />
          </RoleGate>
        )
      }
    ],
    []
  );

  const handleStatusChange = async (id: string, status: string) => {
    await apiRequest(`/shipments/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
    setMessage("Статус рейса обновлен");
    await dispatch(fetchShipments(filters));
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    await apiRequest("/shipments", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        routeId: form.routeId || undefined,
        plannedStart: form.plannedStart,
        plannedFinish: form.plannedFinish
      })
    });
    setCreateOpen(false);
    setForm(initialShipmentForm);
    setMessage("Рейс создан");
    await dispatch(fetchShipments(filters));
  };

  return (
    <>
      <PageHeader
        title="Рейсы"
        subtitle="Планирование перевозок и обновление текущего статуса."
        actions={
          <RoleGate roles={["dispatcher", "carrier"]}>
            <Button type="button" onClick={() => setCreateOpen(true)}>
              Новый рейс
            </Button>
          </RoleGate>
        }
      />

      <Toolbar>
        <SearchInput value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} />
        <SelectField
          label="Статус"
          value={filters.status}
          onChange={(event) => setFilters({ ...filters, status: event.target.value })}
          options={[
            { label: "Все", value: "" },
            { label: "Запланированы", value: "PLANNED" },
            { label: "В пути", value: "IN_TRANSIT" },
            { label: "Доставлены", value: "DELIVERED" },
            { label: "С задержкой", value: "DELAYED" }
          ]}
        />
        <Button type="button" variant="ghost" onClick={() => setFilters({ search: "", status: "" })}>
          Сброс фильтров
        </Button>
      </Toolbar>

      <Toast message={message} tone="success" />

      {shipments.length ? (
        <DataTable columns={columns} data={shipments} getKey={(shipment) => shipment.id} />
      ) : (
        <EmptyState title="Рейсов не найдено" text="Создайте рейс или измените фильтр." />
      )}

      <Modal title="Новый рейс" open={createOpen} onClose={() => setCreateOpen(false)}>
        <form onSubmit={handleCreate}>
          <FormGrid>
            <SelectField
              label="Заявка"
              value={form.orderId}
              onChange={(event) => setForm({ ...form, orderId: event.target.value })}
              options={(catalog?.orders ?? []).map((order) => ({ label: `${order.code} · ${order.title}`, value: order.id }))}
            />
            <SelectField
              label="Перевозчик"
              value={form.carrierId}
              onChange={(event) => setForm({ ...form, carrierId: event.target.value })}
              options={(catalog?.companies ?? [])
                .filter((company) => company.type === "CARRIER")
                .map((company) => ({ label: company.name, value: company.id }))}
            />
            <SelectField
              label="Водитель"
              value={form.driverId}
              onChange={(event) => setForm({ ...form, driverId: event.target.value })}
              options={(catalog?.drivers ?? []).map((driver) => ({ label: driver.name, value: driver.id }))}
            />
            <SelectField
              label="Транспорт"
              value={form.vehicleId}
              onChange={(event) => setForm({ ...form, vehicleId: event.target.value })}
              options={(catalog?.vehicles ?? []).map((vehicle) => ({ label: vehicle.plateNumber, value: vehicle.id }))}
            />
            <SelectField
              label="Маршрут"
              value={form.routeId}
              onChange={(event) => setForm({ ...form, routeId: event.target.value })}
              options={(catalog?.routes ?? []).map((route) => ({ label: route.name, value: route.id }))}
            />
            <TextInput
              label="Начало"
              type="datetime-local"
              value={form.plannedStart}
              onChange={(event) => setForm({ ...form, plannedStart: event.target.value })}
            />
            <TextInput
              label="Финиш"
              type="datetime-local"
              value={form.plannedFinish}
              onChange={(event) => setForm({ ...form, plannedFinish: event.target.value })}
            />
          </FormGrid>
          <div className="modal-actions">
            <Button type="submit">Создать рейс</Button>
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
              Отмена
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
