import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Factory,
  FileSpreadsheet,
  MapPinned,
  PackageCheck,
  Radar,
  Route,
  ShieldCheck,
  Truck,
  UsersRound,
  Wallet
} from "lucide-react";

const trustMetrics = [
  { value: "24/7", label: "контроль статусов и событий" },
  { value: "3 роли", label: "клиент, перевозчик, диспетчер" },
  { value: "REST API", label: "готовый контур интеграций" },
  { value: "PDF + Excel", label: "отчеты для управления" }
];

const painPoints = [
  "Заявки приходят в чатах, таблицах и звонках",
  "Статус рейса приходится уточнять вручную",
  "Маршруты, транспорт и водители живут в разных файлах",
  "Отчетность собирается после факта и с ошибками"
];

const benefits = [
  {
    icon: Clock3,
    title: "Быстрее обработка заявок",
    text: "Логист видит заявку, груз, адреса, даты и приоритет в одном интерфейсе, без ручной сборки контекста."
  },
  {
    icon: Radar,
    title: "Прозрачнее контроль перевозок",
    text: "События рейса, текущий статус, водитель, транспорт и маршрут доступны команде в реальном времени."
  },
  {
    icon: Wallet,
    title: "Ниже операционные издержки",
    text: "Меньше повторных звонков, сверок и ошибок в документах, больше времени на управление исключениями."
  }
];

const productFeatures = [
  {
    icon: ClipboardList,
    title: "Заявки и приоритеты",
    text: "Создание заявок, статусы, груз, стоимость, даты погрузки и доставки."
  },
  {
    icon: Route,
    title: "Маршруты и контрольные точки",
    text: "Маршрутная сетка, точки пути, расстояние, плановые сроки и назначенные рейсы."
  },
  {
    icon: Truck,
    title: "Автопарк и водители",
    text: "Транспорт, грузоподъемность, состояние машины, водитель, рейтинг и контакты."
  },
  {
    icon: BarChart3,
    title: "Аналитика по живым данным",
    text: "Графики по заявкам, статусам рейсов и топ маршрутам без ручной подготовки."
  },
  {
    icon: FileSpreadsheet,
    title: "Excel и PDF отчеты",
    text: "Шапка, группировки, табличные части, итоговые суммы и выгрузка текущего состояния."
  },
  {
    icon: ShieldCheck,
    title: "Роли и доступ",
    text: "Разные сценарии для клиента, перевозчика и диспетчера в одном защищенном контуре."
  }
];

const audiences = [
  {
    icon: Factory,
    title: "Производителям и дистрибьюторам",
    text: "Чтобы держать под контролем отгрузки, сроки и подрядчиков."
  },
  {
    icon: Truck,
    title: "Транспортным компаниям",
    text: "Чтобы управлять рейсами, автопарком, водителями и отчетностью."
  },
  {
    icon: UsersRound,
    title: "Логистическим отделам",
    text: "Чтобы убрать хаос из заявок, статусов и коммуникаций."
  }
];

const workflow = [
  { title: "Заявка", text: "Клиент или диспетчер создает перевозку с грузом, датами и адресами." },
  { title: "Планирование", text: "Назначается маршрут, водитель, транспорт и перевозчик." },
  { title: "Исполнение", text: "Команда видит статусы и события рейса по мере движения." },
  { title: "Аналитика", text: "Руководитель получает графики, сводки и выгрузки для решений." }
];

const impactMetrics = [
  { value: "-30%", label: "меньше ручной сверки статусов" },
  { value: "-25%", label: "меньше операционных ошибок" },
  { value: "x2", label: "быстрее подготовка отчетов" },
  { value: "1 окно", label: "для заявок, рейсов и аналитики" }
];

const faqs = [
  {
    question: "Можно ли использовать платформу без сложного внедрения?",
    answer: "Да. Базовый сценарий закрывает заявки, рейсы, маршруты, автопарк, аналитику и отчеты без внешних интеграций."
  },
  {
    question: "Данные в аналитике реальные?",
    answer: "Да. Графики и Excel-отчеты строятся по текущим данным PostgreSQL через backend API."
  },
  {
    question: "Подходит ли продукт для разных ролей?",
    answer: "Да. В системе есть отдельные сценарии для диспетчера, клиента и перевозчика."
  },
  {
    question: "Какие отчеты можно выгрузить?",
    answer: "Сводку рейсов и загрузку автопарка в PDF и Excel с шапкой, группировками, табличными частями и итогами."
  }
];

export function LandingPage() {
  return (
    <main className="landing-page">
      <section className="landing-hero">
        <img
          src="https://images.unsplash.com/photo-1494412519320-aa613dfb7738?auto=format&fit=crop&w=2200&q=85"
          alt="Грузовые автомобили на магистрали"
        />
        <div className="landing-hero-overlay" />
        <nav className="landing-nav" aria-label="Навигация лендинга">
          <Link to="/" className="landing-brand">
            <span>TL</span>
            Transport Logistics
          </Link>
          <div>
            <a href="#value">Возможности</a>
            <a href="#workflow">Процесс</a>
            <a href="#faq">FAQ</a>
            <Link to="/login">Войти</Link>
          </div>
        </nav>
        <div className="landing-hero-content">
          <p className="landing-kicker">B2B SaaS для управления перевозками</p>
          <h1>Логистика под контролем. От заявки до отчета.</h1>
          <p>
            Платформа помогает компаниям быстрее обрабатывать заявки, отслеживать рейсы, управлять маршрутами и
            автопарком, снижать ручные ошибки и видеть аналитику по текущим перевозкам.
          </p>
          <div className="landing-actions">
            <Link to="/register" className="landing-button primary">
              Запросить демо <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="landing-button secondary">
              Открыть кабинет
            </Link>
          </div>
          <div className="landing-hero-note">
            <CheckCircle2 size={18} />
            Для логистических отделов, перевозчиков, дистрибьюторов и производственных компаний
          </div>
        </div>
      </section>

      <section className="landing-proof" aria-label="Ключевые показатели">
        {trustMetrics.map((item) => (
          <div key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </section>

      <section className="landing-section landing-problem" id="value">
        <div className="landing-section-copy">
          <p className="landing-kicker">Проблема рынка</p>
          <h2>Большинство задержек начинается не на дороге, а в неструктурированных процессах.</h2>
          <p>
            Когда заявки, статусы, маршруты и документы живут в разных местах, менеджеры тратят время на поиск
            информации вместо управления перевозкой.
          </p>
        </div>
        <div className="landing-pain-list">
          {painPoints.map((item) => (
            <div key={item}>
              <CheckCircle2 size={18} />
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="landing-benefits">
        {benefits.map((item) => (
          <article key={item.title} className="landing-benefit">
            <item.icon size={26} />
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <section className="landing-section landing-product">
        <div className="landing-image-panel">
          <img
            src="https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&w=1200&q=85"
            alt="Складская логистика и погрузка"
          />
        </div>
        <div className="landing-section-copy">
          <p className="landing-kicker">Что внутри продукта</p>
          <h2>Единый рабочий контур для заявок, рейсов, маршрутов и аналитики.</h2>
          <p>
            Система объединяет операционную работу логистов и управленческие отчеты: от создания заявки до Excel-сводки
            по автопарку.
          </p>
        </div>
      </section>

      <section className="landing-capabilities">
        {productFeatures.map((item) => (
          <article key={item.title} className="landing-feature">
            <item.icon size={24} />
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <section className="landing-section landing-audience">
        <div>
          <p className="landing-kicker">Для кого</p>
          <h2>Подходит командам, где цена ошибки в перевозке слишком высока.</h2>
        </div>
        <div className="landing-audience-grid">
          {audiences.map((item) => (
            <article key={item.title}>
              <item.icon size={24} />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-flow" id="workflow">
        <div>
          <p className="landing-kicker">Как это работает</p>
          <h2>Простой процесс без ручного хаоса и потери контекста.</h2>
        </div>
        <ol>
          {workflow.map((item, index) => (
            <li key={item.title}>
              <span>{index + 1}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="landing-section landing-impact">
        <div className="landing-section-copy">
          <p className="landing-kicker">Бизнес-эффект</p>
          <h2>Фокус не на “еще одной системе”, а на управляемости перевозок.</h2>
          <p>
            Платформа помогает быстрее находить узкие места, снижать количество ручных уточнений и принимать решения на
            основе статусов, маршрутов и отчетов.
          </p>
        </div>
        <div className="landing-impact-grid">
          {impactMetrics.map((item) => (
            <div key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section landing-showcase">
        <img
          src="https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1400&q=85"
          alt="Логистический склад с грузами"
        />
        <div>
          <MapPinned size={32} />
          <h2>Контроль рейса не должен зависеть от звонков и ручных таблиц.</h2>
          <ul>
            <li>
              <CheckCircle2 size={18} />
              статусы, водитель, транспорт и маршрут в одной карточке;
            </li>
            <li>
              <CheckCircle2 size={18} />
              графики по заявкам, статусам и маршрутам;
            </li>
            <li>
              <CheckCircle2 size={18} />
              Excel и PDF для отчетности руководителю.
            </li>
          </ul>
          <Link to="/register" className="landing-button primary">
            Запросить демо <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="landing-section landing-faq" id="faq">
        <div>
          <p className="landing-kicker">FAQ</p>
          <h2>Коротко о внедрении и возможностях.</h2>
        </div>
        <div className="landing-faq-list">
          {faqs.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="landing-section landing-final">
        <img
          src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1600&q=85"
          alt="Грузовой автомобиль на дороге"
        />
        <div>
          <PackageCheck size={34} />
          <h2>Начните с прозрачного контура перевозок уже сегодня.</h2>
          <p>
            Проверьте, как заявки, рейсы, маршруты, аналитика и отчеты работают вместе в одном веб-приложении.
          </p>
          <div className="landing-actions">
            <Link to="/register" className="landing-button primary">
              Оставить заявку <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="landing-button secondary dark">
              Войти в кабинет
            </Link>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-brand">
          <Link to="/" className="landing-brand">
            <span>TL</span>
            Transport Logistics
          </Link>
          <p>
            Веб-платформа для прозрачного управления заявками, рейсами, маршрутами, автопарком и отчетностью.
          </p>
        </div>
        <div>
          <h3>Продукт</h3>
          <a href="#value">Возможности</a>
          <a href="#workflow">Как это работает</a>
          <a href="#faq">FAQ</a>
        </div>
        <div>
          <h3>Сценарии</h3>
          <span>Заявки и рейсы</span>
          <span>Маршруты и автопарк</span>
          <span>Аналитика и Excel-отчеты</span>
        </div>
        <div>
          <h3>Начать работу</h3>
          <Link to="/register">Запросить демо</Link>
          <Link to="/login">Войти в кабинет</Link>
          <span>© 2026 Transport Logistics</span>
        </div>
      </footer>
    </main>
  );
}
