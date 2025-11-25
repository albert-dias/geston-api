"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/services/appointments/CreateAppointmentService.ts
var CreateAppointmentService_exports = {};
__export(CreateAppointmentService_exports, {
  CreateAppointmentService: () => CreateAppointmentService
});
module.exports = __toCommonJS(CreateAppointmentService_exports);

// src/utils/AppError.ts
var AppError = class _AppError extends Error {
  constructor(message, statusCode = 400, code, details) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, _AppError.prototype);
  }
  // Métodos estáticos para erros comuns
  static badRequest(message, details) {
    return new _AppError(message, 400, "BAD_REQUEST", details);
  }
  static unauthorized(message = "N\xE3o autorizado") {
    return new _AppError(message, 401, "UNAUTHORIZED");
  }
  static forbidden(message = "Acesso negado") {
    return new _AppError(message, 403, "FORBIDDEN");
  }
  static notFound(message = "Recurso n\xE3o encontrado") {
    return new _AppError(message, 404, "NOT_FOUND");
  }
  static conflict(message, details) {
    return new _AppError(message, 409, "CONFLICT", details);
  }
  static validation(message, details) {
    return new _AppError(message, 422, "VALIDATION_ERROR", details);
  }
  static internal(message = "Erro interno do servidor") {
    return new _AppError(message, 500, "INTERNAL_ERROR");
  }
};

// src/lib/prisma.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient({
  log: ["query"]
});

// src/services/appointments/CreateAppointmentService.ts
function CreateAppointmentService(_0) {
  return __async(this, arguments, function* ({
    enterprise_id,
    car_license_plate,
    scheduled_date,
    document,
    client_id,
    service_ids,
    notes
  }) {
    if (!enterprise_id || !car_license_plate || !scheduled_date || !service_ids || service_ids.length === 0) {
      throw AppError.badRequest("Dados incompletos");
    }
    const enterprise = yield prisma.enterprise.findUnique({
      where: { id: enterprise_id }
    });
    if (!enterprise) {
      throw AppError.notFound("Empresa n\xE3o encontrada");
    }
    const now = /* @__PURE__ */ new Date();
    if (scheduled_date < now) {
      throw AppError.badRequest("Data de agendamento n\xE3o pode ser no passado");
    }
    const existingServices = yield prisma.servicesEnterprise.findMany({
      where: {
        id: { in: service_ids },
        enterprise_id
      }
    });
    if (existingServices.length !== service_ids.length) {
      const foundIds = existingServices.map((s) => s.id);
      const missingIds = service_ids.filter((id) => !foundIds.includes(id));
      throw AppError.notFound(
        `Servi\xE7os n\xE3o encontrados ou n\xE3o pertencem \xE0 empresa: ${missingIds.join(", ")}`
      );
    }
    let finalClientId = client_id != null ? client_id : null;
    if (document) {
      const existingClient = yield prisma.client.findFirst({
        where: {
          enterprise_id,
          document
        }
      });
      if (existingClient) {
        finalClientId = existingClient.id;
      }
    }
    const conflictingAppointment = yield prisma.appointment.findFirst({
      where: {
        enterprise_id,
        car_license_plate: car_license_plate.toUpperCase().replace(/-/g, ""),
        scheduled_date: {
          gte: new Date(scheduled_date.getTime() - 30 * 60 * 1e3),
          // 30 minutos antes
          lte: new Date(scheduled_date.getTime() + 30 * 60 * 1e3)
          // 30 minutos depois
        },
        status: "SCHEDULED"
      }
    });
    if (conflictingAppointment) {
      throw AppError.conflict(
        "J\xE1 existe um agendamento para este ve\xEDculo neste hor\xE1rio"
      );
    }
    const result = yield prisma.appointment.create({
      data: {
        enterprise_id,
        client_id: finalClientId,
        car_license_plate: car_license_plate.toUpperCase().replace(/-/g, ""),
        scheduled_date,
        service_ids,
        notes: notes || null,
        status: "SCHEDULED"
      }
    });
    if (!result) {
      throw AppError.internal("Erro ao criar agendamento");
    }
    return result;
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CreateAppointmentService
});
