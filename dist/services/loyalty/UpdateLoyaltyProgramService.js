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

// src/services/loyalty/UpdateLoyaltyProgramService.ts
var UpdateLoyaltyProgramService_exports = {};
__export(UpdateLoyaltyProgramService_exports, {
  UpdateLoyaltyProgramService: () => UpdateLoyaltyProgramService
});
module.exports = __toCommonJS(UpdateLoyaltyProgramService_exports);

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

// src/services/loyalty/UpdateLoyaltyProgramService.ts
function UpdateLoyaltyProgramService(_0) {
  return __async(this, arguments, function* ({
    enterprise_id,
    points_per_order,
    discount_per_point,
    active
  }) {
    if (!enterprise_id) {
      throw AppError.badRequest("Dados incompletos");
    }
    const existingProgram = yield prisma.loyaltyProgram.findUnique({
      where: { enterprise_id }
    });
    if (!existingProgram) {
      throw AppError.notFound("Programa de fidelidade n\xE3o encontrado");
    }
    if (points_per_order !== void 0 && points_per_order < 1) {
      throw AppError.badRequest("Pontos por pedido deve ser pelo menos 1");
    }
    if (discount_per_point !== void 0 && (discount_per_point <= 0 || discount_per_point > 1)) {
      throw AppError.badRequest("Desconto por ponto deve estar entre 0 e 1 (0% a 100%)");
    }
    const updateData = {};
    if (points_per_order !== void 0) updateData.points_per_order = points_per_order;
    if (discount_per_point !== void 0) updateData.discount_per_point = discount_per_point;
    if (active !== void 0) updateData.active = active;
    if (Object.keys(updateData).length === 0) {
      throw AppError.badRequest("Nenhum campo para atualizar");
    }
    const result = yield prisma.loyaltyProgram.update({
      where: { enterprise_id },
      data: updateData
    });
    if (!result) {
      throw AppError.internal("Erro ao atualizar programa de fidelidade");
    }
    return result;
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  UpdateLoyaltyProgramService
});
