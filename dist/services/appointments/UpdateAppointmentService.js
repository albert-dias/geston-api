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

// src/services/appointments/UpdateAppointmentService.ts
var UpdateAppointmentService_exports = {};
__export(UpdateAppointmentService_exports, {
  UpdateAppointmentService: () => UpdateAppointmentService
});
module.exports = __toCommonJS(UpdateAppointmentService_exports);

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

// src/services/appointments/UpdateAppointmentService.ts
function UpdateAppointmentService(_0) {
  return __async(this, arguments, function* ({
    enterprise_id,
    id,
    scheduled_date,
    status,
    notes,
    service_ids
  }) {
    if (!enterprise_id || !id) {
      throw AppError.badRequest("Dados incompletos");
    }
    const existingAppointment = yield prisma.appointment.findFirst({
      where: { id, enterprise_id }
    });
    if (!existingAppointment) {
      throw AppError.notFound("Agendamento n\xE3o encontrado");
    }
    const updateData = {};
    if (scheduled_date !== void 0) {
      if (scheduled_date < /* @__PURE__ */ new Date() && status !== "COMPLETED") {
        throw AppError.badRequest("Data de agendamento n\xE3o pode ser no passado");
      }
      updateData.scheduled_date = scheduled_date;
    }
    if (status !== void 0) {
      updateData.status = status;
    }
    if (notes !== void 0) {
      updateData.notes = notes;
    }
    if (service_ids !== void 0) {
      if (service_ids.length > 0) {
        const existingServices = yield prisma.servicesEnterprise.findMany({
          where: {
            id: { in: service_ids },
            enterprise_id
          }
        });
        if (existingServices.length !== service_ids.length) {
          throw AppError.notFound("Um ou mais servi\xE7os n\xE3o encontrados");
        }
      }
      updateData.service_ids = service_ids;
    }
    if (Object.keys(updateData).length === 0) {
      throw AppError.badRequest("Nenhum campo para atualizar");
    }
    const result = yield prisma.appointment.update({
      where: { id },
      data: updateData
    });
    if (!result) {
      throw AppError.internal("Erro ao atualizar agendamento");
    }
    return result;
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  UpdateAppointmentService
});
