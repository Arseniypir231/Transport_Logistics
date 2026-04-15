import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import { fetchOrders } from "../features/logisticsSlice";
import { useAppDispatch, useAppSelector, useLocalStorageState } from "../hooks";
import type { LogisticsOrder } from "../types";
import {
  Button,
  DataTable,
  EmptyState,
  FormGrid,
  Modal,
  PageHeader,
  PriorityPill,
  RoleGate,
  SearchInput,
  SelectField,
  StatusBadge,
  TextAreaField,
  TextInput,
  Toast,
  Toolbar
} from "../components/ui";

const initialOrderForm = {
  title: "",
  pickupAddress: "",
  deliveryAddress: "",
  pickupDate: "2026-04-12T08:00",
  deliveryDate: "2026-04-12T16:00",
  price: "1200",
  priority: "NORMAL",
  notes: "",
  cargoName: "",
  cargoType: "PALLET",
  weightKg: "1000",
  volumeM3: "12"
};

export function OrdersPage() {
  const dispatch = useAppDispatch();
  const { orders } = useAppSelector((state) => state.logistics);
  const [filters, setFilters] = useLocalStorageState("tl_order_filters", { search: "", status: "" });
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(initialOrderForm);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void dispatch(fetchOrders(filters));
  }, [dispatch, filters]);

  const columns = useMemo(
    () => [
      {
        key: "code",
        header: "Заявка",
        render: (order: LogisticsOrder) => (
          <span>
            <strong>{order.code}</strong>
            <small>{order.title}</small>
          </span>
        )
      },
      {
        key: "route",
        header: "Маршрут",
        render: (order: LogisticsOrder) => (
          <span>
            {order.pickupAddress}
            <small>{order.deliveryAddress}</small>
          </span>
        )
      },
      { key: "cargo", header: "Груз", render: (order: LogisticsOrder) => order.cargo.name },
      { key: "status", header: "Статус", render: (order: LogisticsOrder) => <StatusBadge status={order.status} /> },
      { key: "priority", header: "Приоритет", render: (order: LogisticsOrder) => <PriorityPill priority={order.priority} /> },
      {
        key: "actions",
        header: "Действия",
        render: (order: LogisticsOrder) => (
          <div className="button-row">
            {order.shipments?.[0] ? (
              <Link className="text-link" to={`/shipments/${order.shipments[0].id}`}>
                Рейс
              </Link>
            ) : (
              <span className="muted">Не назначен</span>
            )}
            <RoleGate roles={["dispatcher", "client"]}>
              <Button type="button" variant="ghost" onClick={() => void handleComplete(order.id)}>
                Закрыть
              </Button>
            </RoleGate>
          </div>
        )
      }
    ],
    []
  );

  const handleComplete = async (id: string) => {
    await apiRequest(`/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "COMPLETED" })
    });
    setMessage("Заявка обновлена");
    await dispatch(fetchOrders(filters));
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    await apiRequest("/orders", {
      method: "POST",
      body: JSON.stringify({
        title: form.title,
        pickupAddress: form.pickupAddress,
        deliveryAddress: form.deliveryAddress,
        pickupDate: form.pickupDate,
        deliveryDate: form.deliveryDate,
        price: form.price,
        priority: form.priority,
        notes: form.notes,
        cargo: {
          name: form.cargoName,
          type: form.cargoType,
          weightKg: form.weightKg,
          volumeM3: form.volumeM3
        }
      })
    });
    setCreateOpen(false);
    setForm(initialOrderForm);
    setMessage("Заявка создана");
    await dispatch(fetchOrders(filters));
  };

  return (
    <>
      <PageHeader
        title="Заявки"
        subtitle="Создание заказов на перевозку и контроль их статусов."
        actions={
          <RoleGate roles={["dispatcher", "client"]}>
            <Button type="button" onClick={() => setCreateOpen(true)}>
              Новая заявка
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
            { label: "Новые", value: "NEW" },
            { label: "В работе", value: "IN_PROGRESS" },
            { label: "Завершены", value: "COMPLETED" },
            { label: "Отменены", value: "CANCELLED" }
          ]}
        />
        <Button type="button" variant="ghost" onClick={() => setFilters({ search: "", status: "" })}>
          Сброс фильтров
        </Button>
      </Toolbar>

      <Toast message={message} tone="success" />

      {orders.length ? (
        <DataTable columns={columns} data={orders} getKey={(order) => order.id} />
      ) : (
        <EmptyState title="Заявок не найдено" text="Измените фильтр или создайте новую заявку." />
      )}

      <Modal title="Новая заявка" open={createOpen} onClose={() => setCreateOpen(false)}>
        <form onSubmit={handleCreate}>
          <FormGrid>
            <TextInput label="Название" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            <SelectField
              label="Приоритет"
              value={form.priority}
              onChange={(event) => setForm({ ...form, priority: event.target.value })}
              options={[
                { label: "Обычный", value: "NORMAL" },
                { label: "Высокий", value: "HIGH" },
                { label: "Срочный", value: "URGENT" }
              ]}
            />
            <TextInput
              label="Адрес погрузки"
              value={form.pickupAddress}
              onChange={(event) => setForm({ ...form, pickupAddress: event.target.value })}
            />
            <TextInput
              label="Адрес доставки"
              value={form.deliveryAddress}
              onChange={(event) => setForm({ ...form, deliveryAddress: event.target.value })}
            />
            <TextInput
              label="Дата погрузки"
              type="datetime-local"
              value={form.pickupDate}
              onChange={(event) => setForm({ ...form, pickupDate: event.target.value })}
            />
            <TextInput
              label="Дата доставки"
              type="datetime-local"
              value={form.deliveryDate}
              onChange={(event) => setForm({ ...form, deliveryDate: event.target.value })}
            />
            <TextInput label="Стоимость" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
            <TextInput
              label="Груз"
              value={form.cargoName}
              onChange={(event) => setForm({ ...form, cargoName: event.target.value })}
            />
            <SelectField
              label="Тип груза"
              value={form.cargoType}
              onChange={(event) => setForm({ ...form, cargoType: event.target.value })}
              options={[
                { label: "Паллеты", value: "PALLET" },
                { label: "Контейнер", value: "CONTAINER" },
                { label: "Рефрижератор", value: "REFRIGERATED" },
                { label: "Опасный", value: "HAZARDOUS" }
              ]}
            />
            <TextInput label="Вес, кг" value={form.weightKg} onChange={(event) => setForm({ ...form, weightKg: event.target.value })} />
            <TextInput label="Объем, м3" value={form.volumeM3} onChange={(event) => setForm({ ...form, volumeM3: event.target.value })} />
          </FormGrid>
          <TextAreaField label="Комментарий" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          <div className="modal-actions">
            <Button type="submit">Создать</Button>
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
              Отмена
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
