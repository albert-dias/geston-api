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

// src/routes/employees.routes.ts
var employees_routes_exports = {};
__export(employees_routes_exports, {
  employeesRouter: () => employeesRouter
});
module.exports = __toCommonJS(employees_routes_exports);
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

// src/services/employees/CreateEmployeeService.ts
function CreateEmployeeService(_0) {
  return __async(this, arguments, function* ({
    enterprise_id,
    name,
    document,
    phone,
    email,
    role,
    commission_rate
  }) {
    if (!enterprise_id || !name || !document || !phone || !role) {
      throw AppError.badRequest("Dados incompletos");
    }
    const enterprise = yield prisma.enterprise.findUnique({
      where: { id: enterprise_id }
    });
    if (!enterprise) {
      throw AppError.notFound("Empresa n\xE3o encontrada");
    }
    const existingEmployee = yield prisma.employee.findFirst({
      where: {
        enterprise_id,
        document
      }
    });
    if (existingEmployee) {
      throw AppError.conflict("J\xE1 existe um funcion\xE1rio com este CPF nesta empresa");
    }
    if (commission_rate !== void 0) {
      if (commission_rate < 0 || commission_rate > 1) {
        throw AppError.badRequest("Taxa de comiss\xE3o deve estar entre 0 e 1 (0% a 100%)");
      }
    }
    const result = yield prisma.employee.create({
      data: {
        enterprise_id,
        name,
        document: document.replace(/\D/g, ""),
        phone: phone.replace(/\D/g, ""),
        email: email || null,
        role,
        commission_rate: commission_rate != null ? commission_rate : null,
        status: "ACTIVE"
      }
    });
    if (!result) {
      throw AppError.internal("Erro ao criar funcion\xE1rio");
    }
    return result;
  });
}

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

// src/services/employees/UpdateEmployeeService.ts
function UpdateEmployeeService(_0) {
  return __async(this, arguments, function* ({
    enterprise_id,
    id,
    name,
    document,
    phone,
    email,
    role,
    commission_rate,
    status
  }) {
    if (!enterprise_id || !id) {
      throw AppError.badRequest("Dados incompletos");
    }
    const existingEmployee = yield prisma.employee.findFirst({
      where: { id, enterprise_id }
    });
    if (!existingEmployee) {
      throw AppError.notFound("Funcion\xE1rio n\xE3o encontrado");
    }
    if (document && document !== existingEmployee.document) {
      const duplicateEmployee = yield prisma.employee.findFirst({
        where: {
          enterprise_id,
          document: document.replace(/\D/g, ""),
          NOT: { id }
        }
      });
      if (duplicateEmployee) {
        throw AppError.conflict("J\xE1 existe outro funcion\xE1rio com este CPF");
      }
    }
    const updateData = {};
    if (name !== void 0) updateData.name = name;
    if (document !== void 0) updateData.document = document.replace(/\D/g, "");
    if (phone !== void 0) updateData.phone = phone.replace(/\D/g, "");
    if (email !== void 0) updateData.email = email || null;
    if (role !== void 0) updateData.role = role;
    if (commission_rate !== void 0) {
      if (commission_rate < 0 || commission_rate > 1) {
        throw AppError.badRequest("Taxa de comiss\xE3o deve estar entre 0 e 1 (0% a 100%)");
      }
      updateData.commission_rate = commission_rate;
    }
    if (status !== void 0) updateData.status = status;
    if (Object.keys(updateData).length === 0) {
      throw AppError.badRequest("Nenhum campo para atualizar");
    }
    const result = yield prisma.employee.update({
      where: { id },
      data: updateData
    });
    if (!result) {
      throw AppError.internal("Erro ao atualizar funcion\xE1rio");
    }
    return result;
  });
}

// src/controllers/EmployeesController.ts
var EmployeesController = class {
  create(req, res) {
    return __async(this, null, function* () {
      try {
        const { enterprise_id } = req.params;
        const { name, document, phone, email, role, commission_rate } = req.body;
        const result = yield CreateEmployeeService({
          enterprise_id,
          name,
          document,
          phone,
          email,
          role,
          commission_rate
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
  list(req, res) {
    return __async(this, null, function* () {
      try {
        const { enterprise_id } = req.params;
        const { page, limit, status, role, search } = req.query;
        const result = yield ListEmployeesService({
          enterprise_id,
          page: Number(page),
          limit: Number(limit),
          status,
          role,
          search
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
  update(req, res) {
    return __async(this, null, function* () {
      try {
        const { enterprise_id } = req.params;
        const {
          id,
          name,
          document,
          phone,
          email,
          role,
          commission_rate,
          status
        } = req.body;
        const result = yield UpdateEmployeeService({
          enterprise_id,
          id,
          name,
          document,
          phone,
          email,
          role,
          commission_rate,
          status
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

// src/routes/employees.routes.ts
var import_zod4 = require("zod");

// src/schemas/employee.schema.ts
var import_zod2 = require("zod");
var createEmployeeSchema = import_zod2.z.object({
  name: import_zod2.z.string().min(2, "Nome deve ter no m\xEDnimo 2 caracteres").max(255, "Nome deve ter no m\xE1ximo 255 caracteres").trim(),
  document: import_zod2.z.string().regex(/^\d{11}$/, "CPF deve ter 11 d\xEDgitos").transform((val) => val.replace(/\D/g, "")),
  phone: import_zod2.z.string().min(10, "Telefone deve ter no m\xEDnimo 10 d\xEDgitos").max(11, "Telefone deve ter no m\xE1ximo 11 d\xEDgitos").regex(/^\d{10,11}$/, "Telefone deve conter apenas n\xFAmeros").transform((val) => val.replace(/\D/g, "")),
  email: import_zod2.z.string().email("Email inv\xE1lido").optional().or(import_zod2.z.literal("")),
  role: import_zod2.z.enum(["LAVADOR", "ATENDENTE", "GERENTE"]).default("LAVADOR"),
  commission_rate: import_zod2.z.number().min(0, "Taxa de comiss\xE3o deve ser maior ou igual a 0").max(1, "Taxa de comiss\xE3o deve ser menor ou igual a 1").optional()
});
var updateEmployeeSchema = import_zod2.z.object({
  id: import_zod2.z.string().uuid("ID do funcion\xE1rio inv\xE1lido"),
  name: import_zod2.z.string().min(2, "Nome deve ter no m\xEDnimo 2 caracteres").max(255, "Nome deve ter no m\xE1ximo 255 caracteres").trim().optional(),
  document: import_zod2.z.string().regex(/^\d{11}$/, "CPF deve ter 11 d\xEDgitos").transform((val) => val.replace(/\D/g, "")).optional(),
  phone: import_zod2.z.string().min(10, "Telefone deve ter no m\xEDnimo 10 d\xEDgitos").max(11, "Telefone deve ter no m\xE1ximo 11 d\xEDgitos").regex(/^\d{10,11}$/, "Telefone deve conter apenas n\xFAmeros").transform((val) => val.replace(/\D/g, "")).optional(),
  email: import_zod2.z.string().email("Email inv\xE1lido").optional().or(import_zod2.z.literal("")),
  role: import_zod2.z.enum(["LAVADOR", "ATENDENTE", "GERENTE"]).optional(),
  commission_rate: import_zod2.z.number().min(0).max(1).optional(),
  status: import_zod2.z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]).optional()
});

// src/schemas/pagination.schema.ts
var import_zod3 = require("zod");
var paginationQuerySchema = import_zod3.z.object({
  page: import_zod3.z.string().optional().transform((val) => val ? parseInt(val, 10) : void 0).pipe(import_zod3.z.number().int().positive().optional()),
  limit: import_zod3.z.string().optional().transform((val) => val ? parseInt(val, 10) : void 0).pipe(import_zod3.z.number().int().positive().max(100).optional())
});

// src/routes/employees.routes.ts
var employeesRouter = (0, import_express.Router)();
var employeesController = new EmployeesController();
var enterpriseIdParamSchema = import_zod4.z.object({
  enterprise_id: import_zod4.z.string().uuid("ID da empresa inv\xE1lido")
});
var listEmployeesQuerySchema = paginationQuerySchema.extend({
  status: import_zod4.z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]).optional(),
  role: import_zod4.z.enum(["LAVADOR", "ATENDENTE", "GERENTE"]).optional(),
  search: import_zod4.z.string().optional()
});
employeesRouter.post(
  "/:enterprise_id",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateBody(createEmployeeSchema),
  employeesController.create
);
employeesRouter.get(
  "/:enterprise_id",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateQuery(listEmployeesQuerySchema),
  employeesController.list
);
employeesRouter.put(
  "/:enterprise_id",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateBody(updateEmployeeSchema),
  employeesController.update
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  employeesRouter
});
