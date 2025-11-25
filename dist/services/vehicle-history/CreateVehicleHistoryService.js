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

// src/services/vehicle-history/CreateVehicleHistoryService.ts
var CreateVehicleHistoryService_exports = {};
__export(CreateVehicleHistoryService_exports, {
  CreateVehicleHistoryService: () => CreateVehicleHistoryService
});
module.exports = __toCommonJS(CreateVehicleHistoryService_exports);

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

// src/services/vehicle-history/CreateVehicleHistoryService.ts
function CreateVehicleHistoryService(_0) {
  return __async(this, arguments, function* ({
    enterprise_id,
    order_id,
    car_license_plate,
    services,
    total_value,
    client_id,
    employee_id
  }) {
    if (!enterprise_id || !order_id || !car_license_plate || !services || services.length === 0) {
      throw AppError.badRequest("Dados incompletos");
    }
    const order = yield prisma.order.findFirst({
      where: {
        id: order_id,
        enterprise_id
      },
      include: {
        items_order: {
          include: {
            service: true
          }
        }
      }
    });
    if (!order) {
      throw AppError.notFound("Pedido n\xE3o encontrado");
    }
    const result = yield prisma.vehicleHistory.create({
      data: {
        enterprise_id,
        order_id,
        car_license_plate: car_license_plate.toUpperCase().replace(/-/g, ""),
        services,
        total_value,
        client_id: client_id || null,
        employee_id: employee_id || null
      }
    });
    if (!result) {
      throw AppError.internal("Erro ao criar hist\xF3rico do ve\xEDculo");
    }
    return result;
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CreateVehicleHistoryService
});
