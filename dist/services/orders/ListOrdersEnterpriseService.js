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

// src/services/orders/ListOrdersEnterpriseService.ts
var ListOrdersEnterpriseService_exports = {};
__export(ListOrdersEnterpriseService_exports, {
  ListOrdersEnterpriseService: () => ListOrdersEnterpriseService
});
module.exports = __toCommonJS(ListOrdersEnterpriseService_exports);

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

// src/services/orders/ListOrdersEnterpriseService.ts
function ListOrdersEnterpriseService(_0) {
  return __async(this, arguments, function* ({
    enterprise_id,
    year,
    month,
    day
  }) {
    if (!enterprise_id || !year || !month) {
      throw new AppError("Ano e m\xEAs s\xE3o obrigat\xF3rios.");
    }
    let from;
    let to;
    if (day) {
      from = new Date(year, month - 1, day, 0, 0, 0);
      to = new Date(year, month - 1, day, 23, 59, 59);
    } else {
      from = new Date(year, month - 1, 1, 0, 0, 0);
      to = new Date(year, month, 0, 23, 59, 59);
    }
    const result = yield prisma.order.findMany({
      where: {
        enterprise_id,
        created_at: {
          gte: from,
          lte: to
        }
      },
      include: {
        services_order: { include: { service: true } }
      },
      orderBy: { created_at: "asc" }
    });
    const canceled = result.filter((order) => order.status === "CANCELED").length;
    const inline = result.filter((order) => order.status === "INLINE").length;
    const completed = result.filter(
      (order) => order.status === "COMPLETED"
    ).length;
    const total = result.length;
    return {
      orders: result,
      canceled,
      inline,
      completed,
      total
    };
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ListOrdersEnterpriseService
});
