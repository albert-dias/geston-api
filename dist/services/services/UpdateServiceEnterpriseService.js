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

// src/services/services/UpdateServiceEnterpriseService.ts
var UpdateServiceEnterpriseService_exports = {};
__export(UpdateServiceEnterpriseService_exports, {
  UpdateServiceEnterpriseService: () => UpdateServiceEnterpriseService
});
module.exports = __toCommonJS(UpdateServiceEnterpriseService_exports);

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

// src/lib/cache.ts
var MemoryCache = class {
  constructor() {
    this.cache = /* @__PURE__ */ new Map();
  }
  set(key, data, ttl = 5 * 60 * 1e3) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  get(key) {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }
    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }
  delete(key) {
    this.cache.delete(key);
  }
  deletePattern(pattern) {
    const regex = new RegExp(`^${pattern.replace("*", ".*")}`);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
  clear() {
    this.cache.clear();
  }
  // Limpar itens expirados periodicamente (opcional)
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
};
var cache = new MemoryCache();
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    cache.cleanup();
  }, 10 * 60 * 1e3);
}
function cacheKey(prefix, ...parts) {
  return `${prefix}:${parts.join(":")}`;
}
var CacheKeys = {
  services: (enterpriseId) => cacheKey("services", enterpriseId),
  service: (enterpriseId, serviceId) => cacheKey("service", enterpriseId, serviceId),
  clients: (enterpriseId, page, limit, search) => cacheKey("clients", enterpriseId, page || 1, limit || 20, search || ""),
  client: (enterpriseId, clientId) => cacheKey("client", enterpriseId, clientId)
};

// src/services/services/UpdateServiceEnterpriseService.ts
function UpdateServiceEnterpriseService(_0) {
  return __async(this, arguments, function* ({
    enterprise_id,
    id,
    name,
    value,
    stock_quantity
  }) {
    if (!enterprise_id || !id) {
      throw new AppError("Dados incompletos");
    }
    const existingService = yield prisma.servicesEnterprise.findFirst({
      where: { id, enterprise_id }
    });
    if (!existingService) {
      throw new AppError("Servi\xE7o n\xE3o encontrado");
    }
    const updateData = {};
    if (name !== void 0) updateData.name = name;
    if (value !== void 0) updateData.value = value;
    if (stock_quantity !== void 0) updateData.stock_quantity = stock_quantity;
    if (Object.keys(updateData).length === 0) {
      throw new AppError("Nenhum campo para atualizar");
    }
    const result = yield prisma.servicesEnterprise.update({
      where: { id },
      data: updateData
    });
    if (!result) {
      throw new AppError("Erro ao atualizar servi\xE7o!");
    }
    cache.deletePattern(`services:${enterprise_id}*`);
    cache.delete(CacheKeys.service(enterprise_id, id));
    return result;
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  UpdateServiceEnterpriseService
});
