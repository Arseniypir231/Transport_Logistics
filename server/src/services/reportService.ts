import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import type { ReportType, ShipmentStatus, VehicleStatus } from "@prisma/client";
import { prisma } from "../prisma.js";

type ReportResult = {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  title: string;
};

type WorkbookWriter = (workbook: ExcelJS.Workbook) => void;

const shipmentStatusLabels: Record<ShipmentStatus, string> = {
  PLANNED: "Запланирован",
  LOADING: "Погрузка",
  IN_TRANSIT: "В пути",
  DELIVERED: "Доставлен",
  DELAYED: "Задержан",
  CANCELLED: "Отменен"
};

const vehicleStatusLabels: Record<VehicleStatus, string> = {
  AVAILABLE: "Доступен",
  ASSIGNED: "Назначен",
  MAINTENANCE: "На обслуживании"
};

const activeShipmentStatuses: ShipmentStatus[] = ["PLANNED", "LOADING", "IN_TRANSIT", "DELAYED"];

function numberValue(value: unknown) {
  return Number(value ?? 0);
}

function buildPdf(title: string, writer: (doc: PDFKit.PDFDocument) => void) {
  return new Promise<Buffer>((resolve) => {
    const doc = new PDFDocument({ margin: 48, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    doc.fontSize(20).text(title);
    doc.moveDown();
    doc.fontSize(10).fillColor("#555").text(`Generated at: ${new Date().toISOString()}`);
    doc.moveDown();
    doc.fillColor("#111");

    writer(doc);
    doc.end();
  });
}

async function buildWorkbook(title: string, writer: WorkbookWriter) {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "Transport Logistics";
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.subject = title;
  workbook.company = "Transport Logistics";

  writer(workbook);

  const buffer = await workbook.xlsx.writeBuffer();

  return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
}

function styleWorksheet(worksheet: ExcelJS.Worksheet) {
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.font = {
        name: "Calibri",
        size: 11,
        ...cell.font
      };
      cell.alignment = {
        vertical: "middle",
        wrapText: true,
        ...cell.alignment
      };
    });
  });
}

function addHeader(worksheet: ExcelJS.Worksheet, title: string, subtitle: string, lastColumn: string) {
  worksheet.mergeCells(`A1:${lastColumn}1`);
  worksheet.getCell("A1").value = title;
  worksheet.getCell("A1").font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
  worksheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F8F83" } };
  worksheet.getCell("A1").alignment = { vertical: "middle", horizontal: "center" };
  worksheet.getRow(1).height = 30;

  worksheet.mergeCells(`A2:${lastColumn}2`);
  worksheet.getCell("A2").value = subtitle;
  worksheet.getCell("A2").font = { italic: true, color: { argb: "FF66736D" } };
  worksheet.getCell("A2").alignment = { vertical: "middle", horizontal: "center" };
  worksheet.getRow(2).height = 24;
}

function styleTitleRow(worksheet: ExcelJS.Worksheet, rowNumber: number, lastColumn: string) {
  worksheet.mergeCells(`A${rowNumber}:${lastColumn}${rowNumber}`);
  worksheet.getCell(`A${rowNumber}`).font = { bold: true, size: 13, color: { argb: "FF18211F" } };
  worksheet.getCell(`A${rowNumber}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEAF5F0" } };
}

function styleTableHeader(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF18211F" } };
    cell.border = {
      top: { style: "thin", color: { argb: "FFD9E1DC" } },
      left: { style: "thin", color: { argb: "FFD9E1DC" } },
      bottom: { style: "thin", color: { argb: "FFD9E1DC" } },
      right: { style: "thin", color: { argb: "FFD9E1DC" } }
    };
  });
}

function styleDataRows(worksheet: ExcelJS.Worksheet, fromRow: number, toRow: number) {
  for (let rowNumber = fromRow; rowNumber <= toRow; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFD9E1DC" } },
        left: { style: "thin", color: { argb: "FFD9E1DC" } },
        bottom: { style: "thin", color: { argb: "FFD9E1DC" } },
        right: { style: "thin", color: { argb: "FFD9E1DC" } }
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: rowNumber % 2 === 0 ? "FFFFFFFF" : "FFF7FAF8" }
      };
    });
  }
}

function addEmptyRow(worksheet: ExcelJS.Worksheet, columns: number, message: string) {
  const row = worksheet.addRow([message, ...Array.from({ length: columns - 1 }, () => "")]);
  row.font = { italic: true, color: { argb: "FF66736D" } };
}

export async function createShipmentSummaryReport(): Promise<ReportResult> {
  const shipments = await prisma.shipment.findMany({
    orderBy: { plannedStart: "desc" },
    take: 50,
    include: {
      order: {
        include: {
          client: true,
          cargo: true
        }
      },
      driver: true,
      vehicle: true,
      route: true
    }
  });

  const buffer = await buildPdf("Shipment summary report", (doc) => {
    if (!shipments.length) {
      doc.text("No shipment data available.");
      return;
    }

    shipments.forEach((shipment, index) => {
      doc.fontSize(12).text(`${index + 1}. ${shipment.trackingNumber} - ${shipment.status}`, { continued: false });
      doc.fontSize(10).text(`Order: ${shipment.order.code} | Client: ${shipment.order.client.name}`);
      doc.text(`Cargo: ${shipment.order.cargo.name} | Driver: ${shipment.driver.name}`);
      doc.text(`Vehicle: ${shipment.vehicle.plateNumber} | Route: ${shipment.route?.name ?? "not assigned"}`);
      doc.moveDown(0.7);
    });
  });

  return {
    buffer,
    fileName: "shipment-summary.pdf",
    mimeType: "application/pdf",
    title: "Shipment summary report"
  };
}

export async function createFleetUtilizationReport(): Promise<ReportResult> {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { plateNumber: "asc" },
    include: {
      company: true,
      shipments: {
        include: {
          order: true
        }
      }
    }
  });

  const buffer = await buildPdf("Fleet utilization report", (doc) => {
    if (!vehicles.length) {
      doc.text("No fleet data available.");
      return;
    }

    vehicles.forEach((vehicle, index) => {
      const activeShipments = vehicle.shipments.filter((shipment) => activeShipmentStatuses.includes(shipment.status));

      doc.fontSize(12).text(`${index + 1}. ${vehicle.plateNumber} - ${vehicle.status}`);
      doc.fontSize(10).text(`Carrier: ${vehicle.company.name} | Type: ${vehicle.type} | Capacity: ${vehicle.capacityKg} kg`);
      doc.text(`Active shipments: ${activeShipments.length} | Total shipments: ${vehicle.shipments.length}`);
      doc.moveDown(0.7);
    });
  });

  return {
    buffer,
    fileName: "fleet-utilization.pdf",
    mimeType: "application/pdf",
    title: "Fleet utilization report"
  };
}

export async function createShipmentSummaryWorkbook(): Promise<ReportResult> {
  const shipments = await prisma.shipment.findMany({
    orderBy: [{ status: "asc" }, { plannedStart: "asc" }],
    include: {
      order: {
        include: {
          client: true,
          cargo: true
        }
      },
      carrier: true,
      driver: true,
      vehicle: true,
      route: true
    }
  });

  const totalPrice = shipments.reduce((sum, shipment) => sum + numberValue(shipment.order.price), 0);
  const totalWeight = shipments.reduce((sum, shipment) => sum + numberValue(shipment.order.cargo.weightKg), 0);
  const byStatus = shipments.reduce<Record<ShipmentStatus, { count: number; price: number; weight: number }>>(
    (acc, shipment) => {
      acc[shipment.status].count += 1;
      acc[shipment.status].price += numberValue(shipment.order.price);
      acc[shipment.status].weight += numberValue(shipment.order.cargo.weightKg);
      return acc;
    },
    {
      PLANNED: { count: 0, price: 0, weight: 0 },
      LOADING: { count: 0, price: 0, weight: 0 },
      IN_TRANSIT: { count: 0, price: 0, weight: 0 },
      DELIVERED: { count: 0, price: 0, weight: 0 },
      DELAYED: { count: 0, price: 0, weight: 0 },
      CANCELLED: { count: 0, price: 0, weight: 0 }
    }
  );

  const buffer = await buildWorkbook("Сводка рейсов", (workbook) => {
    const summary = workbook.addWorksheet("Сводка рейсов", {
      views: [{ state: "frozen", xSplit: 0, ySplit: 9 }]
    });

    summary.columns = [
      { key: "status", width: 20 },
      { key: "count", width: 16 },
      { key: "weight", width: 18 },
      { key: "price", width: 18 },
      { key: "share", width: 18 }
    ];

    addHeader(summary, "Сводка рейсов", `Сформировано: ${new Date().toLocaleString("ru-RU")}`, "E");
    summary.addRow([]);
    summary.addRow(["Итог по отчету", "", "", "", ""]);
    styleTitleRow(summary, 4, "E");
    summary.addRow(["Всего рейсов", shipments.length]);
    summary.addRow(["Общий вес, кг", totalWeight]);
    summary.addRow(["Сумма заявок, BYN", totalPrice]);
    summary.getCell("B6").numFmt = "# ##0.00";
    summary.getCell("B7").numFmt = "# ##0.00";

    summary.addRow([]);
    summary.addRow(["Группировка по статусу", "Количество", "Вес, кг", "Сумма, BYN", "Доля"]);
    styleTableHeader(summary.getRow(9));

    Object.entries(byStatus).forEach(([status, values]) => {
      const row = summary.addRow([
        shipmentStatusLabels[status as ShipmentStatus],
        values.count,
        values.weight,
        values.price,
        shipments.length ? values.count / shipments.length : 0
      ]);
      row.getCell(3).numFmt = "# ##0.00";
      row.getCell(4).numFmt = "# ##0.00";
      row.getCell(5).numFmt = "0.00%";
    });

    const totalRow = summary.addRow(["Итого", shipments.length, totalWeight, totalPrice, 1]);
    totalRow.font = { bold: true };
    totalRow.getCell(3).numFmt = "# ##0.00";
    totalRow.getCell(4).numFmt = "# ##0.00";
    totalRow.getCell(5).numFmt = "0.00%";
    styleDataRows(summary, 10, summary.rowCount);
    summary.autoFilter = "A9:E9";
    styleWorksheet(summary);

    const details = workbook.addWorksheet("Рейсы", {
      views: [{ state: "frozen", xSplit: 0, ySplit: 4 }]
    });

    details.columns = [
      { key: "tracking", width: 16 },
      { key: "status", width: 18 },
      { key: "order", width: 14 },
      { key: "client", width: 24 },
      { key: "cargo", width: 26 },
      { key: "weight", width: 14 },
      { key: "route", width: 24 },
      { key: "driver", width: 22 },
      { key: "vehicle", width: 18 },
      { key: "plannedStart", width: 20 },
      { key: "plannedFinish", width: 20 },
      { key: "price", width: 16 }
    ];

    addHeader(details, "Табличная часть: рейсы", "Данные загружены из текущей базы приложения", "L");
    details.addRow([]);
    details.addRow([
      "Трек-номер",
      "Статус",
      "Заявка",
      "Клиент",
      "Груз",
      "Вес, кг",
      "Маршрут",
      "Водитель",
      "Транспорт",
      "План начала",
      "План завершения",
      "Сумма, BYN"
    ]);
    styleTableHeader(details.getRow(4));

    if (!shipments.length) {
      addEmptyRow(details, 12, "Рейсы отсутствуют");
    }

    shipments.forEach((shipment) => {
      const row = details.addRow([
        shipment.trackingNumber,
        shipmentStatusLabels[shipment.status],
        shipment.order.code,
        shipment.order.client.name,
        shipment.order.cargo.name,
        numberValue(shipment.order.cargo.weightKg),
        shipment.route?.name ?? "Маршрут не назначен",
        shipment.driver.name,
        shipment.vehicle.plateNumber,
        shipment.plannedStart,
        shipment.plannedFinish,
        numberValue(shipment.order.price)
      ]);
      row.getCell(6).numFmt = "# ##0.00";
      row.getCell(10).numFmt = "dd.mm.yyyy hh:mm";
      row.getCell(11).numFmt = "dd.mm.yyyy hh:mm";
      row.getCell(12).numFmt = "# ##0.00";
      row.outlineLevel = shipment.status === "DELIVERED" || shipment.status === "CANCELLED" ? 1 : 0;
    });

    const detailsTotal = details.addRow(["Итого", "", "", "", "", totalWeight, "", "", "", "", "", totalPrice]);
    detailsTotal.font = { bold: true };
    detailsTotal.getCell(6).numFmt = "# ##0.00";
    detailsTotal.getCell(12).numFmt = "# ##0.00";
    styleDataRows(details, 5, details.rowCount);
    details.autoFilter = "A4:L4";
    styleWorksheet(details);
  });

  return {
    buffer,
    fileName: "svodka-reysov.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    title: "Сводка рейсов"
  };
}

export async function createFleetUtilizationWorkbook(): Promise<ReportResult> {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: [{ status: "asc" }, { plateNumber: "asc" }],
    include: {
      company: true,
      shipments: {
        include: {
          order: {
            include: {
              cargo: true
            }
          },
          driver: true
        }
      }
    }
  });

  const byStatus = vehicles.reduce<Record<VehicleStatus, { count: number; capacityKg: number; active: number }>>(
    (acc, vehicle) => {
      acc[vehicle.status].count += 1;
      acc[vehicle.status].capacityKg += numberValue(vehicle.capacityKg);
      acc[vehicle.status].active += vehicle.shipments.filter((shipment) => activeShipmentStatuses.includes(shipment.status)).length;
      return acc;
    },
    {
      AVAILABLE: { count: 0, capacityKg: 0, active: 0 },
      ASSIGNED: { count: 0, capacityKg: 0, active: 0 },
      MAINTENANCE: { count: 0, capacityKg: 0, active: 0 }
    }
  );
  const totalCapacity = vehicles.reduce((sum, vehicle) => sum + numberValue(vehicle.capacityKg), 0);
  const totalActiveShipments = vehicles.reduce(
    (sum, vehicle) => sum + vehicle.shipments.filter((shipment) => activeShipmentStatuses.includes(shipment.status)).length,
    0
  );

  const buffer = await buildWorkbook("Загрузка автопарка", (workbook) => {
    const summary = workbook.addWorksheet("Загрузка автопарка", {
      views: [{ state: "frozen", xSplit: 0, ySplit: 9 }]
    });

    summary.columns = [
      { key: "status", width: 22 },
      { key: "count", width: 16 },
      { key: "capacity", width: 24 },
      { key: "active", width: 24 },
      { key: "utilization", width: 18 }
    ];

    addHeader(summary, "Загрузка автопарка", `Сформировано: ${new Date().toLocaleString("ru-RU")}`, "E");
    summary.addRow([]);
    summary.addRow(["Итог по отчету", "", "", "", ""]);
    styleTitleRow(summary, 4, "E");
    summary.addRow(["Всего транспортных средств", vehicles.length]);
    summary.addRow(["Суммарная грузоподъемность, кг", totalCapacity]);
    summary.addRow(["Активных назначений на рейсы", totalActiveShipments]);
    summary.getCell("B6").numFmt = "# ##0.00";

    summary.addRow([]);
    summary.addRow(["Группировка по состоянию", "Количество", "Грузоподъемность, кг", "Активных рейсов", "Доля автопарка"]);
    styleTableHeader(summary.getRow(9));

    Object.entries(byStatus).forEach(([status, values]) => {
      const row = summary.addRow([
        vehicleStatusLabels[status as VehicleStatus],
        values.count,
        values.capacityKg,
        values.active,
        vehicles.length ? values.count / vehicles.length : 0
      ]);
      row.getCell(3).numFmt = "# ##0.00";
      row.getCell(5).numFmt = "0.00%";
    });

    const totalRow = summary.addRow(["Итого", vehicles.length, totalCapacity, totalActiveShipments, 1]);
    totalRow.font = { bold: true };
    totalRow.getCell(3).numFmt = "# ##0.00";
    totalRow.getCell(5).numFmt = "0.00%";
    styleDataRows(summary, 10, summary.rowCount);
    summary.autoFilter = "A9:E9";
    styleWorksheet(summary);

    const details = workbook.addWorksheet("Транспорт", {
      views: [{ state: "frozen", xSplit: 0, ySplit: 4 }]
    });

    details.columns = [
      { key: "plate", width: 18 },
      { key: "status", width: 20 },
      { key: "type", width: 24 },
      { key: "carrier", width: 26 },
      { key: "capacityKg", width: 20 },
      { key: "capacityM3", width: 16 },
      { key: "shipments", width: 18 },
      { key: "active", width: 18 },
      { key: "lastOrder", width: 30 }
    ];

    addHeader(details, "Табличная часть: автопарк", "Данные загружены из текущей базы приложения", "I");
    details.addRow([]);
    details.addRow([
      "Госномер",
      "Состояние",
      "Тип",
      "Перевозчик",
      "Грузоподъемность, кг",
      "Объем, м3",
      "Всего рейсов",
      "Активных рейсов",
      "Последняя заявка"
    ]);
    styleTableHeader(details.getRow(4));

    if (!vehicles.length) {
      addEmptyRow(details, 9, "Транспорт отсутствует");
    }

    vehicles.forEach((vehicle) => {
      const activeShipments = vehicle.shipments.filter((shipment) => activeShipmentStatuses.includes(shipment.status));
      const row = details.addRow([
        vehicle.plateNumber,
        vehicleStatusLabels[vehicle.status],
        vehicle.type,
        vehicle.company.name,
        numberValue(vehicle.capacityKg),
        numberValue(vehicle.capacityM3),
        vehicle.shipments.length,
        activeShipments.length,
        vehicle.shipments[0]?.order.title ?? "Нет назначений"
      ]);
      row.getCell(5).numFmt = "# ##0.00";
      row.getCell(6).numFmt = "# ##0.00";
      row.outlineLevel = vehicle.status === "MAINTENANCE" ? 1 : 0;
    });

    const detailsTotal = details.addRow(["Итого", "", "", "", totalCapacity, "", vehicles.reduce((sum, v) => sum + v.shipments.length, 0), totalActiveShipments, ""]);
    detailsTotal.font = { bold: true };
    detailsTotal.getCell(5).numFmt = "# ##0.00";
    styleDataRows(details, 5, details.rowCount);
    details.autoFilter = "A4:I4";
    styleWorksheet(details);
  });

  return {
    buffer,
    fileName: "zagruzka-avtoparka.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    title: "Загрузка автопарка"
  };
}

export async function createReport(type: ReportType) {
  if (type === "FLEET_UTILIZATION") {
    return createFleetUtilizationReport();
  }

  return createShipmentSummaryReport();
}

export async function createExcelReport(type: ReportType) {
  if (type === "FLEET_UTILIZATION") {
    return createFleetUtilizationWorkbook();
  }

  return createShipmentSummaryWorkbook();
}
