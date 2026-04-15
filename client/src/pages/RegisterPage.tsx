import type { FormEvent } from "react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { register } from "../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import { Button, SelectField, TextInput, Toast } from "../components/ui";

export function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { token, status, error } = useAppSelector((state) => state.auth);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    roleSlug: "client" as "client" | "carrier"
  });

  if (token) {
    return <Navigate to="/app" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await dispatch(register(form)).unwrap();
      navigate("/app");
    } catch {
      // The auth slice renders the server message in the form.
    }
  };

  return (
    <main className="auth-page compact-auth">
      <section className="auth-panel wide">
        <p className="eyebrow">Регистрация</p>
        <h2>Создать рабочий аккаунт</h2>
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Имя"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
          <TextInput
            label="Компания"
            value={form.companyName}
            onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))}
          />
          <TextInput
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
          <TextInput
            label="Пароль"
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
          <SelectField
            label="Роль"
            value={form.roleSlug}
            onChange={(event) => setForm((current) => ({ ...current, roleSlug: event.target.value as "client" | "carrier" }))}
            options={[
              { label: "Клиент", value: "client" },
              { label: "Перевозчик", value: "carrier" }
            ]}
          />
          <Toast message={error} tone="error" />
          <Button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Создаем..." : "Зарегистрироваться"}
          </Button>
        </form>
        <p>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </section>
    </main>
  );
}
