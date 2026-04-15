import { Router } from "express";
import type { ReportType } from "@prisma/client";
import { prisma } from "../prisma.js";
import { authenticate } from "../middleware/auth.js";
import { createExcelReport, createReport } from "../services/reportService.js";
import { httpError } from "../utils/http.js";

const router = Router();

router.use(authenticate);

const reportTypes: Record<string, ReportType> = {
  shipments: "SHIPMENT_SUMMARY",
  fleet: "FLEET_UTILIZATION"
};

function resolveReportType(raw: string) {
  const type = reportTypes[raw];

  if (!type) {
    throw httpError("Unknown report type", 404);
  }

  return type;
}

router.get("/:type.pdf", async (req, res) => {
  const type = resolveReportType(req.params.type);
  const report = await createReport(type);

  await prisma.reportRequest.create({
    data: {
      type,
      delivery: "DOWNLOAD",
      fileName: report.fileName,
      createdById: req.user!.id
    }
  });

  res.setHeader("Content-Type", report.mimeType);
  res.setHeader("Content-Disposition", `attachment; filename="${report.fileName}"`);
  res.send(report.buffer);
});

router.get("/:type.xlsx", async (req, res) => {
  const type = resolveReportType(req.params.type);
  const report = await createExcelReport(type);

  await prisma.reportRequest.create({
    data: {
      type,
      delivery: "DOWNLOAD",
      fileName: report.fileName,
      createdById: req.user!.id
    }
  });

  res.setHeader("Content-Type", report.mimeType);
  res.setHeader("Content-Disposition", `attachment; filename="${report.fileName}"`);
  res.send(report.buffer);
});

export { router as reportsRouter };
