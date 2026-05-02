/**
 * OpenTelemetry trace + log export to permanent local NDJSON files.
 *
 * - If OTEL_STORAGE_ROOT is set: that directory is used directly (e.g. …/.telemetry/opentelemetry).
 * - Otherwise: <telemetryRepoRoot>/opentelemetry/ (default submodule layout).
 */
import fs from "node:fs";
import path from "node:path";
import { ExportResultCode } from "@opentelemetry/core";
import { trace } from "@opentelemetry/api";
import { logs, SeverityNumber } from "@opentelemetry/api-logs";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { NodeTracerProvider, SimpleSpanProcessor } from "@opentelemetry/sdk-trace-node";
import {
  LoggerProvider,
  SimpleLogRecordProcessor,
} from "@opentelemetry/sdk-logs";

function spanToJson(span) {
  const sc = span.spanContext();
  return {
    name: span.name,
    traceId: sc.traceId,
    spanId: sc.spanId,
    parentSpanId: span.parentSpanContext?.spanId,
    startTime: span.startTime,
    endTime: span.endTime,
    duration: span.duration,
    status: span.status,
    attributes: span.attributes,
    events: span.events,
    links: span.links,
  };
}

function createFileSpanExporter(filePath) {
  return {
    export(spans, resultCallback) {
      try {
        const lines = spans.map((s) => JSON.stringify(spanToJson(s))).join("\n") + "\n";
        fs.appendFileSync(filePath, lines, "utf8");
        resultCallback({ code: ExportResultCode.SUCCESS });
      } catch (err) {
        console.error("[otel] span export failed:", err);
        resultCallback({ code: ExportResultCode.FAILURE });
      }
    },
    shutdown() {
      return Promise.resolve();
    },
    forceFlush() {
      return Promise.resolve();
    },
  };
}

function logRecordToJson(rec) {
  return {
    severityNumber: rec.severityNumber,
    severityText: rec.severityText,
    body: rec.body,
    attributes: rec.attributes,
    hrTime: rec.hrTime,
    spanId: rec.spanContext?.spanId,
  };
}

function createFileLogExporter(filePath) {
  return {
    export(records, resultCallback) {
      try {
        const lines = records.map((r) => JSON.stringify(logRecordToJson(r))).join("\n") + "\n";
        fs.appendFileSync(filePath, lines, "utf8");
        resultCallback({ code: ExportResultCode.SUCCESS });
      } catch (err) {
        console.error("[otel] log export failed:", err);
        resultCallback({ code: ExportResultCode.FAILURE });
      }
    },
    shutdown() {
      return Promise.resolve();
    },
    forceFlush() {
      return Promise.resolve();
    },
  };
}

/** @type {import('@opentelemetry/sdk-trace-node').NodeTracerProvider | null} */
let tracerProvider = null;
/** @type {import('@opentelemetry/sdk-logs').LoggerProvider | null} */
let loggerProvider = null;

function expandUserPath(p) {
  if (!p) return p;
  if (p.startsWith("~/")) {
    return path.join(process.env.HOME || "", p.slice(2));
  }
  return path.resolve(p);
}

/**
 * @param {string} telemetryRepoRoot Absolute path to ~/profile/.telemetry (submodule)
 */
export function initProfileOtel(telemetryRepoRoot) {
  const repoBase = expandUserPath(telemetryRepoRoot);
  const explicit = process.env.OTEL_STORAGE_ROOT
    ? expandUserPath(process.env.OTEL_STORAGE_ROOT)
    : null;
  const otelDir = explicit || path.join(repoBase, "opentelemetry");
  fs.mkdirSync(otelDir, { recursive: true });
  const gitkeep = path.join(otelDir, ".gitkeep");
  if (!fs.existsSync(gitkeep)) {
    fs.writeFileSync(gitkeep, "", "utf8");
  }

  const spansPath = path.join(otelDir, "spans.jsonl");
  const logsPath = path.join(otelDir, "logs.jsonl");

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || "profile-git-telemetry",
    "telemetry.storage.root": otelDir,
  });

  tracerProvider = new NodeTracerProvider({
    resource,
    spanProcessors: [new SimpleSpanProcessor(createFileSpanExporter(spansPath))],
  });
  tracerProvider.register();

  loggerProvider = new LoggerProvider({
    resource,
    processors: [new SimpleLogRecordProcessor(createFileLogExporter(logsPath))],
  });
  logs.setGlobalLoggerProvider(loggerProvider);

  console.error(
    `[otel] storage: ${otelDir} (OTEL_STORAGE_ROOT=${process.env.OTEL_STORAGE_ROOT || "(default: <repo>/opentelemetry)"})`,
  );

  return {
    tracer: trace.getTracer("profile-git-telemetry", "1.0.0"),
    emitIngestLog(attrs) {
      const logger = logs.getLogger("profile-git-telemetry", "1.0.0");
      logger.emit({
        severityNumber: SeverityNumber.INFO,
        severityText: "INFO",
        body: "ingest",
        attributes: attrs,
      });
    },
  };
}

export async function shutdownProfileOtel() {
  await tracerProvider?.shutdown();
  await loggerProvider?.shutdown();
  tracerProvider = null;
  loggerProvider = null;
}
