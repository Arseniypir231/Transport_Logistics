import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client";
import { fetchDrivers, fetchVehicles } from "../features/logisticsSlice";
import { useAppDispatch, useAppSelector, useLocalStorageState } from "../hooks";
import type { Driver, Vehicle } from "../types";
import {
  Button,
  DataTable,
  EmptyState,
  FormGrid,
  MobileTabs,
  Modal,
  PageHeader,
  RoleGate,
  StatusBadge,
  TextInput,
  Toast
} from "../components/ui";

const vehicleFormInitial = {
  plateNumber: "",
  type: "Tent truck",
  make: "",
  model: "",
  year: "2024",
  capacityKg: "20000",
  capacityM3: "90"
};

const driverFormInitial = {
  name: "",
  phone: "",
  email: "",
  licenseNumber: "",
  rating: "5"
};

export function FleetPage() {
  const dispatch = useAppDispatch();
  const { vehicles, drivers } = useAppSelector((state) => state.logistics);
  const [tab, setTab] = useLocalStorageState("tl_fleet_tab", "vehicles");
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [driverOpen, setDriverOpen] = useState(false);
  const [vehicleForm, setVehicleForm] = useState(vehicleFormInitial);
  const [driverForm, setDriverForm] = useState(driverFormInitial);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void dispatch(fetchVehicles());
    void dispatch(fetchDrivers());
  }, [dispatch]);

  const vehicleColumns = useMemo(
    () => [
      { key: "plate", header: "Номер", render: (vehicle: Vehicle) => <strong>{vehicle.plateNumber}</strong> },
      { key: "type", header: "Тип", render: (vehicle: Vehicle) => vehicle.type },
      { key: "capacity", header: "Грузоподъемность", render: (vehicle: Vehicle) => `${vehicle.capacityKg} кг / ${vehicle.capacityM3} м3` },
      { key: "company", header: "Перевозчик", render: (vehicle: Vehicle) => vehicle.company.name },
      { key: "status", header: "Статус", render: (vehicle: Vehicle) => <StatusBadge status={vehicle.status} /> }
    ],
    []
  );

  const driverColumns = useMemo(
    () => [
      { key: "name", header: "Водитель", render: (driver: Driver) => <strong>{driver.name}</strong> },
      { key: "phone", header: "Телефон", render: (driver: Driver) => driver.phone },
      { key: "license", header: "Удостоверение", render: (driver: Driver) => driver.licenseNumber },
      { key: "rating", header: "Рейтинг", render: (driver: Driver) => driver.rating },
      { key: "status", header: "Статус", render: (driver: Driver) => <StatusBadge status={driver.status} /> }
    ],
    []
  );

  const handleVehicleCreate = async (event: FormEvent) => {
    event.preventDefault();
    await apiRequest("/vehicles", {
      method: "POST",
      body: JSON.stringify(vehicleForm)
    });
    setVehicleOpen(false);
    setVehicleForm(vehicleFormInitial);
    setMessage("Транспорт добавлен");
    await dispatch(fetchVehicles());
  };

  const handleDriverCreate = async (event: FormEvent) => {
    event.preventDefault();
    await apiRequest("/drivers", {
      method: "POST",
      body: JSON.stringify(driverForm)
    });
    setDriverOpen(false);
    setDriverForm(driverFormInitial);
    setMessage("Водитель добавлен");
    await dispatch(fetchDrivers());
  };

  return (
    <>
      <PageHeader
        title="Автопарк"
        subtitle="Транспортные средства и водители перевозчика."
        actions={
          <RoleGate roles={["dispatcher", "carrier"]}>
            <div className="button-row">
              <Button type="button" onClick={() => setVehicleOpen(true)}>
                Добавить машину
              </Button>
              <Button type="button" variant="secondary" onClick={() => setDriverOpen(true)}>
                Добавить водителя
              </Button>
            </div>
          </RoleGate>
        }
      />

      <MobileTabs
        value={tab}
        onChange={setTab}
        options={[
          { label: "Транспорт", value: "vehicles" },
          { label: "Водители", value: "drivers" }
        ]}
      />

      <Toast message={message} tone="success" />

      {tab === "vehicles" ? (
        vehicles.length ? (
          <DataTable columns={vehicleColumns} data={vehicles} getKey={(vehicle) => vehicle.id} />
        ) : (
          <EmptyState title="Транспорт не найден" text="Добавьте машину перевозчика." />
        )
      ) : drivers.length ? (
        <DataTable columns={driverColumns} data={drivers} getKey={(driver) => driver.id} />
      ) : (
        <EmptyState title="Водители не найдены" text="Добавьте водителя перевозчика." />
      )}

      <Modal title="Добавить транспорт" open={vehicleOpen} onClose={() => setVehicleOpen(false)}>
        <form onSubmit={handleVehicleCreate}>
          <FormGrid>
            <TextInput
              label="Госномер"
              value={vehicleForm.plateNumber}
              onChange={(event) => setVehicleForm({ ...vehicleForm, plateNumber: event.target.value })}
            />
            <TextInput label="Тип" value={vehicleForm.type} onChange={(event) => setVehicleForm({ ...vehicleForm, type: event.target.value })} />
            <TextInput label="Марка" value={vehicleForm.make} onChange={(event) => setVehicleForm({ ...vehicleForm, make: event.target.value })} />
            <TextInput label="Модель" value={vehicleForm.model} onChange={(event) => setVehicleForm({ ...vehicleForm, model: event.target.value })} />
            <TextInput label="Год" value={vehicleForm.year} onChange={(event) => setVehicleForm({ ...vehicleForm, year: event.target.value })} />
            <TextInput
              label="Грузоподъемность, кг"
              value={vehicleForm.capacityKg}
              onChange={(event) => setVehicleForm({ ...vehicleForm, capacityKg: event.target.value })}
            />
            <TextInput
              label="Объем, м3"
              value={vehicleForm.capacityM3}
              onChange={(event) => setVehicleForm({ ...vehicleForm, capacityM3: event.target.value })}
            />
          </FormGrid>
          <div className="modal-actions">
            <Button type="submit">Сохранить</Button>
            <Button type="button" variant="ghost" onClick={() => setVehicleOpen(false)}>
              Отмена
            </Button>
          </div>
        </form>
      </Modal>

      <Modal title="Добавить водителя" open={driverOpen} onClose={() => setDriverOpen(false)}>
        <form onSubmit={handleDriverCreate}>
          <FormGrid>
            <TextInput label="ФИО" value={driverForm.name} onChange={(event) => setDriverForm({ ...driverForm, name: event.target.value })} />
            <TextInput
              label="Телефон"
              value={driverForm.phone}
              onChange={(event) => setDriverForm({ ...driverForm, phone: event.target.value })}
            />
            <TextInput
              label="E-mail"
              type="email"
              value={driverForm.email}
              onChange={(event) => setDriverForm({ ...driverForm, email: event.target.value })}
            />
            <TextInput
              label="Удостоверение"
              value={driverForm.licenseNumber}
              onChange={(event) => setDriverForm({ ...driverForm, licenseNumber: event.target.value })}
            />
            <TextInput
              label="Рейтинг"
              value={driverForm.rating}
              onChange={(event) => setDriverForm({ ...driverForm, rating: event.target.value })}
            />
          </FormGrid>
          <div className="modal-actions">
            <Button type="submit">Сохранить</Button>
            <Button type="button" variant="ghost" onClick={() => setDriverOpen(false)}>
              Отмена
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
