"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
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

// src/middlewares/errorHandler.ts
var errorHandler_exports = {};
__export(errorHandler_exports, {
  errorHandler: () => errorHandler
});
module.exports = __toCommonJS(errorHandler_exports);
var import_zod = require("zod");
var import_client = require("@prisma/client");

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

// src/middlewares/errorHandler.ts
function errorHandler(err, req, res, next) {
  var _a;
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query
    });
  } else {
    console.error("Error:", {
      message: err.message,
      code: err instanceof AppError ? err.code : void 0,
      url: req.url,
      method: req.method
    });
  }
  let errorResponse;
  if (err instanceof AppError) {
    errorResponse = __spreadValues(__spreadValues({
      status: "error",
      message: err.message,
      code: err.code
    }, err.details && { details: err.details }), process.env.NODE_ENV === "development" && { stack: err.stack });
    return res.status(err.statusCode).json(errorResponse);
  }
  if (err instanceof import_zod.ZodError) {
    const details = err.errors.reduce((acc, error) => {
      const path = error.path.join(".");
      acc[path] = error.message;
      return acc;
    }, {});
    errorResponse = __spreadValues({
      status: "error",
      message: "Dados inv\xE1lidos",
      code: "VALIDATION_ERROR",
      details
    }, process.env.NODE_ENV === "development" && { stack: err.stack });
    return res.status(422).json(errorResponse);
  }
  if (err instanceof import_client.Prisma.PrismaClientKnownRequestError) {
    let message = "Erro no banco de dados";
    let statusCode = 500;
    let code = "DATABASE_ERROR";
    switch (err.code) {
      case "P2002":
        const target = ((_a = err.meta) == null ? void 0 : _a.target) || [];
        message = `J\xE1 existe um registro com este ${target.join(", ")}`;
        statusCode = 409;
        code = "DUPLICATE_ENTRY";
        break;
      case "P2025":
        message = "Registro n\xE3o encontrado";
        statusCode = 404;
        code = "NOT_FOUND";
        break;
      case "P2003":
        message = "Refer\xEAncia inv\xE1lida";
        statusCode = 400;
        code = "INVALID_REFERENCE";
        break;
      default:
        message = `Erro no banco de dados: ${err.message}`;
    }
    errorResponse = __spreadValues({
      status: "error",
      message,
      code
    }, process.env.NODE_ENV === "development" && {
      details: {
        prismaCode: err.code,
        meta: err.meta
      },
      stack: err.stack
    });
    return res.status(statusCode).json(errorResponse);
  }
  if (err instanceof import_client.Prisma.PrismaClientValidationError) {
    errorResponse = __spreadValues({
      status: "error",
      message: "Dados inv\xE1lidos para o banco de dados",
      code: "VALIDATION_ERROR"
    }, process.env.NODE_ENV === "development" && {
      details: { originalError: err.message },
      stack: err.stack
    });
    return res.status(422).json(errorResponse);
  }
  errorResponse = __spreadValues({
    status: "error",
    message: process.env.NODE_ENV === "production" ? "Erro interno do servidor" : err.message || "Erro interno do servidor",
    code: "INTERNAL_ERROR"
  }, process.env.NODE_ENV === "development" && { stack: err.stack });
  res.status(500).json(errorResponse);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  errorHandler
});
