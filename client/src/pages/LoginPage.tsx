import type { FormEvent } from "react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { login } from "../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import { Button, TextInput, Toast } from "../components/ui";

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { token, status, error } = useAppSelector((state) => state.auth);
  const [form, setForm] = useState({
    email: "dispatcher@transport.test",
    password: "password123"
  });

  if (token) {
    return <Navigate to="/app" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await dispatch(login(form)).unwrap();
      navigate("/app");
    } catch {
      // The auth slice renders the server message in the form.
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <img
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=80"
          alt="Складская зона транспортной логистики"
        />
        <div>
          <p>Онлайн-платформа транспортной логистики</p>
          <h1>Заявки, рейсы и отчеты в одном рабочем контуре.</h1>
        </div>
      </section>
      <section className="auth-panel">
        <p className="eyebrow">Вход</p>
        <h2>Добро пожаловать</h2>
        <form onSubmit={handleSubmit}>
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
          <Toast message={error} tone="error" />
          <Button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Входим..." : "Войти"}
          </Button>
        </form>
        <p>
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
        <div className="test-users">
          <span>dispatcher@transport.test</span>
          <span>client@transport.test</span>
          <span>carrier@transport.test</span>
        </div>
      </section>
    </main>
  );
}
