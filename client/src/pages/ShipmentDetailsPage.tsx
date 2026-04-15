import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../api/client";
import type { Shipment } from "../types";
import {
  Button,
  Card,
  EmptyState,
  FormGrid,
  PageHeader,
  RoleGate,
  RoutePreview,
  SelectField,
  StatusBadge,
  TextAreaField,
  TextInput,
  Timeline,
  Toast
} from "../components/ui";

export function ShipmentDetailsPage() {
  const { id } = useParams();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState({
    type: "CHECKPOINT",
    message: "",
    location: "",
    latitude: "",
    longitude: ""
  });

  const loadShipment = async () => {
    if (!id) {
      return;
    }

    const response = await apiRequest<{ shipment: Shipment }>(`/shipments/${id}`);
    setShipment(response.shipment);
  };

  useEffect(() => {
    void loadShipment();
  }, [id]);

  const handleAddEvent = async (event: FormEvent) => {
    event.preventDefault();

    if (!id) {
      return;
    }

    await apiRequest(`/shipments/${id}/events`, {
      method: "POST",
      body: JSON.stringify({
        ...eventForm,
        latitude: eventForm.latitude || undefined,
        longitude: eventForm.longitude || undefined
      })
    });
    setEventForm({ type: "CHECKPOINT", message: "", location: "", latitude: "", longitude: "" });
    setMessage("Событие добавлено");
    await loadShipment();
  };

  if (!shipment) {
    return <EmptyState title="Рейс загружается" text="Данные рейса будут показаны после ответа сервера." />;
  }

  return (
    <>
      <PageHeader
        title={shipment.trackingNumber}
        subtitle={`${shipment.order.title} · ${shipment.carrier.name}`}
        actions={<StatusBadge status={shipment.status} />}
      />

      <section className="details-grid">
        <Card>
          <h2>Сводка</h2>
          <dl className="summary-list">
            <div>
              <dt>Заявка</dt>
              <dd>{shipment.order.code}</dd>
            </div>
            <div>
              <dt>Клиент</dt>
              <dd>{shipment.order.client.name}</dd>
            </div>
            <div>
              <dt>Водитель</dt>
              <dd>{shipment.driver.name}</dd>
            </div>
            <div>
              <dt>Транспорт</dt>
              <dd>{shipment.vehicle.plateNumber}</dd>
            </div>
            <div>
              <dt>План</dt>
              <dd>{new Date(shipment.plannedStart).toLocaleString("ru-RU")}</dd>
            </div>
            <div>
              <dt>Финиш</dt>
              <dd>{new Date(shipment.plannedFinish).toLocaleString("ru-RU")}</dd>
            </div>
          </dl>
          <Link className="text-link" to="/shipments">
            Назад к рейсам
          </Link>
        </Card>

        <Card>
          <h2>Маршрут</h2>
          {shipment.route?.points?.length ? (
            <RoutePreview points={shipment.route.points} />
          ) : (
            <EmptyState title="Маршрут не назначен" text="Назначьте маршрут на странице рейсов." />
          )}
        </Card>
      </section>

      <section className="details-grid">
        <Card>
          <h2>История событий</h2>
          <Timeline events={shipment.events} />
        </Card>

        <RoleGate roles={["dispatcher", "carrier"]}>
          <Card>
            <h2>Добавить событие</h2>
            <Toast message={message} tone="success" />
            <form onSubmit={handleAddEvent}>
              <FormGrid>
                <SelectField
                  label="Тип"
                  value={eventForm.type}
                  onChange={(event) => setEventForm({ ...eventForm, type: event.target.value })}
                  options={[
                    { label: "Контрольная точка", value: "CHECKPOINT" },
                    { label: "Проблема", value: "PROBLEM" },
                    { label: "Погружен", value: "LOADED" },
                    { label: "Доставлен", value: "DELIVERED" }
                  ]}
                />
                <TextInput
                  label="Локация"
                  value={eventForm.location}
                  onChange={(event) => setEventForm({ ...eventForm, location: event.target.value })}
                />
                <TextInput
                  label="Широта"
                  value={eventForm.latitude}
                  onChange={(event) => setEventForm({ ...eventForm, latitude: event.target.value })}
                />
                <TextInput
                  label="Долгота"
                  value={eventForm.longitude}
                  onChange={(event) => setEventForm({ ...eventForm, longitude: event.target.value })}
                />
              </FormGrid>
              <TextAreaField
                label="Комментарий"
                value={eventForm.message}
                onChange={(event) => setEventForm({ ...eventForm, message: event.target.value })}
              />
              <Button type="submit">Добавить</Button>
            </form>
          </Card>
        </RoleGate>
      </section>
    </>
  );
}
