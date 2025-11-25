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

// src/routes/loyalty.routes.ts
var loyalty_routes_exports = {};
__export(loyalty_routes_exports, {
  loyaltyRouter: () => loyaltyRouter
});
module.exports = __toCommonJS(loyalty_routes_exports);
var import_express = require("express");
var import_zod3 = require("zod");

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

// src/lib/validators.ts
var import_zod = require("zod");
function validateBody(schema) {
  return (req, res, next) => __async(null, null, function* () {
    try {
      req.body = yield schema.parseAsync(req.body);
      return next();
    } catch (error) {
      if (error instanceof import_zod.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message
        }));
        throw new AppError(
          `Dados inv\xE1lidos: ${errors.map((e) => e.message).join(", ")}`,
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

// src/lib/prisma.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient({
  log: ["query"]
});

// src/services/loyalty/CreateLoyaltyProgramService.ts
function CreateLoyaltyProgramService(_0) {
  return __async(this, arguments, function* ({
    enterprise_id,
    points_per_order = 1,
    discount_per_point = 0.01
  }) {
    if (!enterprise_id) {
      throw AppError.badRequest("Dados incompletos");
    }
    const enterprise = yield prisma.enterprise.findUnique({
      where: { id: enterprise_id }
    });
    if (!enterprise) {
      throw AppError.notFound("Empresa n\xE3o encontrada");
    }
    const existingProgram = yield prisma.loyaltyProgram.findUnique({
      where: { enterprise_id }
    });
    if (existingProgram) {
      throw AppError.conflict("J\xE1 existe um programa de fidelidade para esta empresa");
    }
    if (points_per_order < 1) {
      throw AppError.badRequest("Pontos por pedido deve ser pelo menos 1");
    }
    if (discount_per_point <= 0 || discount_per_point > 1) {
      throw AppError.badRequest("Desconto por ponto deve estar entre 0 e 1 (0% a 100%)");
    }
    const result = yield prisma.loyaltyProgram.create({
      data: {
        enterprise_id,
        points_per_order,
        discount_per_point,
        active: true
      }
    });
    if (!result) {
      throw AppError.internal("Erro ao criar programa de fidelidade");
    }
    return result;
  });
}

// src/services/loyalty/GetLoyaltyProgramService.ts
function GetLoyaltyProgramService(_0) {
  return __async(this, arguments, function* ({
    enterprise_id
  }) {
    if (!enterprise_id) {
      throw AppError.badRequest("Dados incompletos");
    }
    const program = yield prisma.loyaltyProgram.findUnique({
      where: { enterprise_id }
    });
    return program;
  });
}

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

// src/controllers/LoyaltyController.ts
var LoyaltyController = class {
  create(req, res) {
    return __async(this, null, function* () {
      try {
        const { enterprise_id } = req.params;
        const { points_per_order, discount_per_point } = req.body;
        const result = yield CreateLoyaltyProgramService({
          enterprise_id,
          points_per_order,
          discount_per_point
        });
        return res.status(201).json(result);
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
  show(req, res) {
    return __async(this, null, function* () {
      try {
        const { enterprise_id } = req.params;
        const result = yield GetLoyaltyProgramService({
          enterprise_id
        });
        if (!result) {
          return res.status(404).json({
            status: "error",
            message: "Programa de fidelidade n\xE3o encontrado"
          });
        }
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
  update(req, res) {
    return __async(this, null, function* () {
      try {
        const { enterprise_id } = req.params;
        const { points_per_order, discount_per_point, active } = req.body;
        const result = yield UpdateLoyaltyProgramService({
          enterprise_id,
          points_per_order,
          discount_per_point,
          active
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

// src/schemas/loyalty.schema.ts
var import_zod2 = require("zod");
var createLoyaltyProgramSchema = import_zod2.z.object({
  points_per_order: import_zod2.z.number().int().positive("Pontos por pedido devem ser maiores que zero").default(1),
  discount_per_point: import_zod2.z.number().positive("Desconto por ponto deve ser maior que zero").default(0.01).describe("Desconto em percentual por ponto (ex: 0.01 = 0.01%)")
});
var updateLoyaltyProgramSchema = import_zod2.z.object({
  points_per_order: import_zod2.z.number().int().positive().optional(),
  discount_per_point: import_zod2.z.number().positive().optional(),
  active: import_zod2.z.boolean().optional()
});

// src/routes/loyalty.routes.ts
var loyaltyRouter = (0, import_express.Router)();
var loyaltyController = new LoyaltyController();
var enterpriseIdParamSchema = import_zod3.z.object({
  enterprise_id: import_zod3.z.string().uuid("ID da empresa inv\xE1lido")
});
loyaltyRouter.post(
  "/:enterprise_id",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateBody(createLoyaltyProgramSchema),
  loyaltyController.create
);
loyaltyRouter.get(
  "/:enterprise_id",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  loyaltyController.show
);
loyaltyRouter.put(
  "/:enterprise_id",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateBody(updateLoyaltyProgramSchema),
  loyaltyController.update
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  loyaltyRouter
});
