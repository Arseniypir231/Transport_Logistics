import { resetSettings, setSetting } from "../features/settings/settingsSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import { Button, Card, FormGrid, PageHeader, SelectField, SettingsToggle } from "../components/ui";

export function SettingsPage() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);

  return (
    <>
      <PageHeader
        title="Настройки"
        subtitle="Параметры интерфейса сохраняются в localStorage после перезагрузки страницы."
        actions={
          <Button type="button" variant="danger" onClick={() => dispatch(resetSettings())}>
            Сброс настроек
          </Button>
        }
      />

      <Card>
        <h2>Параметры пользователя</h2>
        <FormGrid>
          <SelectField
            label="Тема"
            value={settings.theme}
            onChange={(event) => dispatch(setSetting({ key: "theme", value: event.target.value as "light" | "contrast" }))}
            options={[
              { label: "Светлая", value: "light" },
              { label: "Контрастная", value: "contrast" }
            ]}
          />
          <SelectField
            label="Плотность"
            value={settings.density}
            onChange={(event) =>
              dispatch(setSetting({ key: "density", value: event.target.value as "comfortable" | "compact" }))
            }
            options={[
              { label: "Комфортная", value: "comfortable" },
              { label: "Компактная", value: "compact" }
            ]}
          />
          <SelectField
            label="Фокус панели"
            value={settings.dashboardFocus}
            onChange={(event) =>
              dispatch(setSetting({ key: "dashboardFocus", value: event.target.value as "shipments" | "fleet" | "orders" }))
            }
            options={[
              { label: "Рейсы", value: "shipments" },
              { label: "Автопарк", value: "fleet" },
              { label: "Заявки", value: "orders" }
            ]}
          />
        </FormGrid>
        <div className="settings-list">
          <SettingsToggle
            label="Свернуть боковое меню"
            checked={settings.sidebarCollapsed}
            onChange={(checked) => dispatch(setSetting({ key: "sidebarCollapsed", value: checked }))}
          />
          <SettingsToggle
            label="Уменьшить анимации"
            checked={settings.reduceMotion}
            onChange={(checked) => dispatch(setSetting({ key: "reduceMotion", value: checked }))}
          />
        </div>
      </Card>

      <Card>
        <h2>Сохраняемые ключи</h2>
        <p className="muted">
          tl_settings, tl_order_filters, tl_shipment_filters, tl_fleet_tab. Кнопка сброса очищает настройки интерфейса и
          пользовательские фильтры.
        </p>
      </Card>
    </>
  );
}
