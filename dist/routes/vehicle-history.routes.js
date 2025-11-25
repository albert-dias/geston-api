"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
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

// src/routes/vehicle-history.routes.ts
var vehicle_history_routes_exports = {};
__export(vehicle_history_routes_exports, {
  vehicleHistoryRouter: () => vehicleHistoryRouter
});
module.exports = __toCommonJS(vehicle_history_routes_exports);
var import_express = require("express");

// src/middlewares/ensureAuthenticated.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));

// src/config/auth.ts
var auth_default = {
  jwt: { secret: "5ec1cb40c104642fe3301f5f9ae069c4", expiresIn: 60 * 60 * 24 },
  refreshToken: { duration: 1e3 * 60 * 60 * 24 * 30 }
};

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

// src/middlewares/ensureAuthenticated.ts
function ensureAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new AppError("Token ausente", 401);
  }
  const [, token] = authHeader.split(" ");
  try {
    const decoded = import_jsonwebtoken.default.verify(token, auth_default.jwt.secret);
    const { sub, name, user_type } = decoded;
    req.user = {
      id: sub,
      name,
      user_type
    };
    return next();
  } catch (err) {
    throw new AppError("token.invalid", 401);
  }
}

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

// src/services/vehicle-history/GetVehicleHistoryService.ts
function GetVehicleHistoryService(_0) {
  return __async(this, arguments, function* ({
    enterprise_id,
    car_license_plate,
    page,
    limit,
    start_date,
    end_date
  }) {
    if (!enterprise_id || !car_license_plate) {
      throw AppError.badRequest("Dados incompletos");
    }
    const { page: normalizedPage, limit: normalizedLimit, skip } = normalizePaginationParams(page, limit);
    const normalizedPlate = car_license_plate.toUpperCase().replace(/-/g, "");
    const where = {
      enterprise_id,
      car_license_plate: normalizedPlate
    };
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) {
        where.created_at.gte = start_date;
      }
      if (end_date) {
        where.created_at.lte = end_date;
      }
    }
    const [total, data] = yield Promise.all([
      prisma.vehicleHistory.count({ where }),
      prisma.vehicleHistory.findMany({
        where,
        skip,
        take: normalizedLimit,
        orderBy: { created_at: "desc" },
        include: {
          order: {
            include: {
              items_order: {
                include: {
                  service: true
                }
              }
            }
          },
          employee: true
        }
      })
    ]);
    const allHistory = yield prisma.vehicleHistory.findMany({
      where: {
        enterprise_id,
        car_license_plate: normalizedPlate
      }
    });
    const total_washes = allHistory.length;
    const total_value = allHistory.reduce((sum, h) => sum + h.total_value, 0);
    const average_value = total_washes > 0 ? total_value / total_washes : 0;
    const last_wash_date = allHistory.length > 0 ? allHistory.sort((a, b) => b.created_at.getTime() - a.created_at.getTime())[0].created_at : null;
    const serviceCount = {};
    allHistory.forEach((history) => {
      history.services.forEach((service) => {
        serviceCount[service] = (serviceCount[service] || 0) + 1;
      });
    });
    const most_used_services = Object.entries(serviceCount).map(([service, count]) => ({ service, count })).sort((a, b) => b.count - a.count).slice(0, 5);
    const meta = createPaginationMeta(total, normalizedPage, normalizedLimit);
    return {
      data,
      meta,
      stats: {
        total_washes,
        total_value,
        most_used_services,
        average_value: Math.round(average_value),
        last_wash_date
      }
    };
  });
}

// src/controllers/VehicleHistoryController.ts
var VehicleHistoryController = class {
  getHistory(req, res) {
    return __async(this, null, function* () {
      try {
        const { enterprise_id, car_license_plate } = req.params;
        const { page, limit, start_date, end_date } = req.query;
        const result = yield GetVehicleHistoryService({
          enterprise_id,
          car_license_plate,
          page: Number(page),
          limit: Number(limit),
          start_date: start_date ? new Date(start_date) : void 0,
          end_date: end_date ? new Date(end_date) : void 0
        });
        return res.status(200).json(result);
      } catch (err) {
        if (err instanceof AppError) {
          return res.status(err.statusCode).json({
            status: "error",
            message: err.message
          });
        }
        return res.status(400).json({ error: err.message });
      }
    });
  }
};

// src/lib/validators.ts
var import_zod = require("zod");
function validateQuery(schema) {
  return (req, res, next) => __async(null, null, function* () {
    try {
      req.query = yield schema.parseAsync(req.query);
      return next();
    } catch (error) {
      if (error instanceof import_zod.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message
        }));
        throw new AppError(
          `Par\xE2metros inv\xE1lidos: ${errors.map((e) => e.message).join(", ")}`,
          400
        );
      }
      throw error;
    }
  });
}
function validateParams(schema) {
  return (req, res, next) => __async(null, null, function* () {
    try {
      req.params = yield schema.parseAsync(req.params);
      return next();
    } catch (error) {
      if (error instanceof import_zod.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message
        }));
        throw new AppError(
          `Par\xE2metros inv\xE1lidos: ${errors.map((e) => e.message).join(", ")}`,
          400
        );
      }
      throw error;
    }
  });
}

// src/routes/vehicle-history.routes.ts
var import_zod3 = require("zod");

// src/schemas/pagination.schema.ts
var import_zod2 = require("zod");
var paginationQuerySchema = import_zod2.z.object({
  page: import_zod2.z.string().optional().transform((val) => val ? parseInt(val, 10) : void 0).pipe(import_zod2.z.number().int().positive().optional()),
  limit: import_zod2.z.string().optional().transform((val) => val ? parseInt(val, 10) : void 0).pipe(import_zod2.z.number().int().positive().max(100).optional())
});

// src/routes/vehicle-history.routes.ts
var vehicleHistoryRouter = (0, import_express.Router)();
var vehicleHistoryController = new VehicleHistoryController();
var getHistoryParamsSchema = import_zod3.z.object({
  enterprise_id: import_zod3.z.string().uuid("ID da empresa inv\xE1lido"),
  car_license_plate: import_zod3.z.string().min(7).max(8)
});
var getHistoryQuerySchema = paginationQuerySchema.extend({
  start_date: import_zod3.z.string().datetime().optional(),
  end_date: import_zod3.z.string().datetime().optional()
});
vehicleHistoryRouter.get(
  "/:enterprise_id/:car_license_plate",
  ensureAuthenticate,
  validateParams(getHistoryParamsSchema),
  validateQuery(getHistoryQuerySchema),
  vehicleHistoryController.getHistory
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  vehicleHistoryRouter
});
