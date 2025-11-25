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

// src/services/loyalty/AddPointsToClientService.ts
var AddPointsToClientService_exports = {};
__export(AddPointsToClientService_exports, {
  AddPointsToClientService: () => AddPointsToClientService
});
module.exports = __toCommonJS(AddPointsToClientService_exports);

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

// src/services/loyalty/AddPointsToClientService.ts
function AddPointsToClientService(_0) {
  return __async(this, arguments, function* ({
    enterprise_id,
    client_id,
    points
  }) {
    if (!enterprise_id || !client_id || !points || points <= 0) {
      throw AppError.badRequest("Dados incompletos");
    }
    const client = yield prisma.client.findFirst({
      where: {
        id: client_id,
        enterprise_id
      }
    });
    if (!client) {
      throw AppError.notFound("Cliente n\xE3o encontrado");
    }
    let program = yield prisma.loyaltyProgram.findUnique({
      where: { enterprise_id }
    });
    if (!program) {
      program = yield prisma.loyaltyProgram.create({
        data: {
          enterprise_id,
          points_per_order: 1,
          discount_per_point: 0.01,
          active: true
        }
      });
    }
    if (!program.active) {
      throw AppError.badRequest("Programa de fidelidade est\xE1 inativo");
    }
    const existingPoints = yield prisma.clientLoyaltyPoints.findUnique({
      where: {
        client_id_program_id: {
          client_id,
          program_id: program.id
        }
      }
    });
    if (existingPoints) {
      const result = yield prisma.clientLoyaltyPoints.update({
        where: { id: existingPoints.id },
        data: {
          points: existingPoints.points + points
        }
      });
      return result;
    } else {
      const result = yield prisma.clientLoyaltyPoints.create({
        data: {
          client_id,
          program_id: program.id,
          points
        }
      });
      return result;
    }
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AddPointsToClientService
});
