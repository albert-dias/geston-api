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

// src/services/employees/ListEmployeesService.ts
var ListEmployeesService_exports = {};
__export(ListEmployeesService_exports, {
  ListEmployeesService: () => ListEmployeesService
});
module.exports = __toCommonJS(ListEmployeesService_exports);

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

// src/lib/pagination.ts
function normalizePaginationParams(page, limit) {
  const DEFAULT_PAGE = 1;
  const DEFAULT_LIMIT = 20;
  const MAX_LIMIT = 100;
  const normalizedPage = page && page > 0 ? page : DEFAULT_PAGE;
  const normalizedLimit = limit && limit > 0 && limit <= MAX_LIMIT ? limit : DEFAULT_LIMIT;
  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip: (normalizedPage - 1) * normalizedLimit
  };
}
function createPaginationMeta(total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1
  };
}

// src/services/employees/ListEmployeesService.ts
function ListEmployeesService(_0) {
  return __async(this, arguments, function* ({
    enterprise_id,
    page,
    limit,
    status,
    role,
    search
  }) {
    if (!enterprise_id) {
      throw AppError.badRequest("Dados incompletos");
    }
    const { page: normalizedPage, limit: normalizedLimit, skip } = normalizePaginationParams(page, limit);
    const where = {
      enterprise_id
    };
    if (status) {
      where.status = status;
    }
    if (role) {
      where.role = role;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { document: { contains: search.replace(/\D/g, "") } },
        { phone: { contains: search.replace(/\D/g, "") } },
        { email: { contains: search, mode: "insensitive" } }
      ];
    }
    const [total, data] = yield Promise.all([
      prisma.employee.count({ where }),
      prisma.employee.findMany({
        where,
        skip,
        take: normalizedLimit,
        orderBy: { created_at: "desc" }
      })
    ]);
    const meta = createPaginationMeta(total, normalizedPage, normalizedLimit);
    return {
      data,
      meta
    };
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ListEmployeesService
});
