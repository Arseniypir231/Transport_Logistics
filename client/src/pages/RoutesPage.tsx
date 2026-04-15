import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { fetchRoutes } from "../features/logisticsSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  Button,
  Card,
  DataList,
  EmptyState,
  FormGrid,
  Modal,
  PageHeader,
  RoleGate,
  RoutePreview,
  TextInput,
  Toast
} from "../components/ui";

const initialRouteForm = {
  name: "",
  origin: "",
  destination: "",
  distanceKm: "100",
  estimatedHours: "3",
  startAddress: "",
  startLatitude: "53.9045",
  startLongitude: "27.5615",
  finishAddress: "",
  finishLatitude: "53.6694",
  finishLongitude: "23.8131"
};

export function RoutesPage() {
  const dispatch = useAppDispatch();
  const routes = useAppSelector((state) => state.logistics.routes);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialRouteForm);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void dispatch(fetchRoutes());
  }, [dispatch]);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    await apiRequest("/routes", {
      method: "POST",
      body: JSON.stringify({
        name: form.name,
        origin: form.origin,
        destination: form.destination,
        distanceKm: form.distanceKm,
        estimatedHours: form.estimatedHours,
        points: [
          {
            sequence: 1,
            label: "Погрузка",
            address: form.startAddress,
            latitude: form.startLatitude,
            longitude: form.startLongitude
          },
          {
            sequence: 2,
            label: "Разгрузка",
            address: form.finishAddress,
            latitude: form.finishLatitude,
            longitude: form.finishLongitude
          }
        ]
      })
    });
    setOpen(false);
    setForm(initialRouteForm);
    setMessage("Маршрут создан");
    await dispatch(fetchRoutes());
  };

  return (
    <>
      <PageHeader
        title="Маршруты"
        subtitle="Справочник направлений и контрольных точек для рейсов."
        actions={
          <RoleGate roles={["dispatcher"]}>
            <Button type="button" onClick={() => setOpen(true)}>
              Новый маршрут
            </Button>
          </RoleGate>
        }
      />

      <Toast message={message} tone="success" />

      {routes.length ? (
        <DataList>
          {routes.map((route) => (
            <Card key={route.id} className="route-card">
              <div className="route-card-head">
                <div>
                  <h2>{route.name}</h2>
                  <p>
                    {route.origin} - {route.destination}
                  </p>
                </div>
                <strong>{route.distanceKm} км</strong>
              </div>
              <RoutePreview points={route.points} />
            </Card>
          ))}
        </DataList>
      ) : (
        <EmptyState title="Маршруты не найдены" text="Добавьте маршрут для планирования рейсов." />
      )}

      <Modal title="Новый маршрут" open={open} onClose={() => setOpen(false)}>
        <form onSubmit={handleCreate}>
          <FormGrid>
            <TextInput label="Название" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <TextInput label="Откуда" value={form.origin} onChange={(event) => setForm({ ...form, origin: event.target.value })} />
            <TextInput
              label="Куда"
              value={form.destination}
              onChange={(event) => setForm({ ...form, destination: event.target.value })}
            />
            <TextInput
              label="Расстояние, км"
              value={form.distanceKm}
              onChange={(event) => setForm({ ...form, distanceKm: event.target.value })}
            />
            <TextInput
              label="Часы в пути"
              value={form.estimatedHours}
              onChange={(event) => setForm({ ...form, estimatedHours: event.target.value })}
            />
            <TextInput
              label="Адрес погрузки"
              value={form.startAddress}
              onChange={(event) => setForm({ ...form, startAddress: event.target.value })}
            />
            <TextInput
              label="Широта погрузки"
              value={form.startLatitude}
              onChange={(event) => setForm({ ...form, startLatitude: event.target.value })}
            />
            <TextInput
              label="Долгота погрузки"
              value={form.startLongitude}
              onChange={(event) => setForm({ ...form, startLongitude: event.target.value })}
            />
            <TextInput
              label="Адрес разгрузки"
              value={form.finishAddress}
              onChange={(event) => setForm({ ...form, finishAddress: event.target.value })}
            />
            <TextInput
              label="Широта разгрузки"
              value={form.finishLatitude}
              onChange={(event) => setForm({ ...form, finishLatitude: event.target.value })}
            />
            <TextInput
              label="Долгота разгрузки"
              value={form.finishLongitude}
              onChange={(event) => setForm({ ...form, finishLongitude: event.target.value })}
            />
          </FormGrid>
          <div className="modal-actions">
            <Button type="submit">Сохранить</Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Отмена
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
