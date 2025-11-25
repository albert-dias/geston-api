"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
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

// src/services/user/UpdateUserService.ts
var UpdateUserService_exports = {};
__export(UpdateUserService_exports, {
  UpdateUserService: () => UpdateUserService
});
module.exports = __toCommonJS(UpdateUserService_exports);

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

// src/services/user/UpdateUserService.ts
function UpdateUserService(_0) {
  return __async(this, arguments, function* ({
    user_id,
    name,
    email,
    document,
    phone
  }) {
    if (!user_id) {
      throw AppError.badRequest("ID do usu\xE1rio \xE9 obrigat\xF3rio");
    }
    const existingUser = yield prisma.user.findUnique({
      where: { id: user_id }
    });
    if (!existingUser) {
      throw AppError.notFound("Usu\xE1rio n\xE3o encontrado");
    }
    if (email && email !== existingUser.email) {
      const emailExists = yield prisma.user.findUnique({
        where: { email }
      });
      if (emailExists) {
        throw AppError.conflict("Este email j\xE1 est\xE1 em uso");
      }
    }
    const updateData = {};
    if (name !== void 0) updateData.name = name;
    if (email !== void 0) updateData.email = email;
    if (document !== void 0) updateData.document = document || null;
    if (phone !== void 0) updateData.phone = phone || null;
    if (Object.keys(updateData).length === 0) {
      throw AppError.badRequest("Nenhum campo para atualizar");
    }
    const updatedUser = yield prisma.user.update({
      where: { id: user_id },
      data: updateData
    });
    if (!updatedUser) {
      throw AppError.internal("Erro ao atualizar usu\xE1rio");
    }
    const _a = updatedUser, { password: _ } = _a, userWithoutPassword = __objRest(_a, ["password"]);
    return userWithoutPassword;
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  UpdateUserService
});
