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

// src/services/cash-movements/GetCashSummaryService.ts
var GetCashSummaryService_exports = {};
__export(GetCashSummaryService_exports, {
  GetCashSummaryService: () => GetCashSummaryService
});
module.exports = __toCommonJS(GetCashSummaryService_exports);

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

// src/services/cash-movements/GetCashSummaryService.ts
function GetCashSummaryService(_0) {
  return __async(this, arguments, function* ({
    enterprise_id,
    start_date,
    end_date
  }) {
    if (!enterprise_id || !start_date || !end_date) {
      throw AppError.badRequest("Dados incompletos");
    }
    if (start_date > end_date) {
      throw AppError.badRequest("Data inicial n\xE3o pode ser maior que data final");
    }
    const movements = yield prisma.cashMovement.findMany({
      where: {
        enterprise_id,
        created_at: {
          gte: start_date,
          lte: end_date
        }
      },
      orderBy: { created_at: "desc" },
      include: {
        order: true,
        employee: true,
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    const entries = movements.filter((m) => m.type === "ENTRY").map((m) => ({
      id: m.id,
      amount: m.amount,
      description: m.description,
      created_at: m.created_at,
      type: m.type
    }));
    const exits = movements.filter((m) => m.type === "EXIT").map((m) => ({
      id: m.id,
      amount: m.amount,
      description: m.description,
      created_at: m.created_at,
      type: m.type
    }));
    const total_entries = entries.reduce((sum, m) => sum + m.amount, 0);
    const total_exits = exits.reduce((sum, m) => sum + m.amount, 0);
    const balance = total_entries - total_exits;
    return {
      total_entries,
      total_exits,
      balance,
      movements: {
        entries,
        exits
      }
    };
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GetCashSummaryService
});
