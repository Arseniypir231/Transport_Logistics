import { useState } from "react";
import { downloadFile } from "../api/client";
import { PageHeader, ReportCard, Toast } from "../components/ui";

type ReportType = "shipments" | "fleet";
type ReportFormat = "pdf" | "xlsx";

const fileNames: Record<ReportType, Record<ReportFormat, string>> = {
  shipments: {
    pdf: "shipment-summary.pdf",
    xlsx: "svodka-reysov.xlsx"
  },
  fleet: {
    pdf: "fleet-utilization.pdf",
    xlsx: "zagruzka-avtoparka.xlsx"
  }
};

export function ReportsPage() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const downloadReport = async (type: ReportType, format: ReportFormat) => {
    setBusy(true);
    try {
      await downloadFile(`/reports/${type}.${format}`, fileNames[type][format]);
      setMessage(format === "xlsx" ? "Excel-отчет скачан" : "PDF-отчет скачан");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Отчеты"
        subtitle="PDF и Excel-отчеты по текущим данным перевозок и автопарка."
      />

      <Toast message={message} tone="success" />

      <section className="reports-grid">
        <ReportCard
          title="Сводка рейсов"
          text="Excel-файл содержит шапку, итоговые показатели, группировку по статусам и табличную часть с рейсами."
          busy={busy}
          onDownload={() => void downloadReport("shipments", "pdf")}
          onExcelDownload={() => void downloadReport("shipments", "xlsx")}
        />
        <ReportCard
          title="Загрузка автопарка"
          text="Excel-файл содержит шапку, итоги по автопарку, группировку по состоянию транспорта и табличную часть по машинам."
          busy={busy}
          onDownload={() => void downloadReport("fleet", "pdf")}
          onExcelDownload={() => void downloadReport("fleet", "xlsx")}
        />
      </section>
    </>
  );
}
