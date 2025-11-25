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

// src/routes/clients.routes.ts
var clients_routes_exports = {};
__export(clients_routes_exports, {
  clientsRouter: () => clientsRouter
});
module.exports = __toCommonJS(clients_routes_exports);
var import_express = require("express");
var import_zod4 = require("zod");

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

// src/services/clients/CreateClientEnterpriseService.ts
function CreateClientEnterpriseService(_0) {
  return __async(this, arguments, function* ({
    enterprise_id,
    name,
    document,
    phone
  }) {
    if (!name || !enterprise_id || !phone) {
      throw AppError.badRequest("Dados incompletos", {
        required: ["name", "enterprise_id", "phone"],
        received: { name: !!name, enterprise_id: !!enterprise_id, phone: !!phone }
      });
    }
    const enterpriseExists = yield prisma.enterprise.findUnique({
      where: { id: enterprise_id }
    });
    if (!enterpriseExists) {
      throw AppError.notFound("Empresa n\xE3o encontrada");
    }
    const result = yield prisma.client.create({
      data: {
        name,
        document: document || null,
        phone,
        enterprise_id
      }
    });
    if (!result) {
      throw AppError.internal("Erro ao criar cliente");
    }
    cache.deletePattern(`clients:${enterprise_id}*`);
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

// src/services/clients/ListClientsEnterpriseService.ts
function ListClientsEnterpriseService(_0) {
  return __async(this, arguments, function* ({
    enterprise_id,
    page,
    limit,
    search,
    useCache = true
  }) {
    if (!enterprise_id) {
      throw new AppError("Dados incompletos");
    }
    const { page: normalizedPage, limit: normalizedLimit, skip } = normalizePaginationParams(page, limit);
    if (useCache && !search && normalizedPage === 1) {
      const cacheKey2 = CacheKeys.clients(enterprise_id, normalizedPage, normalizedLimit);
      const cached = cache.get(cacheKey2);
      if (cached) {
        return cached;
      }
    }
    const where = {
      enterprise_id
    };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { document: { contains: search.replace(/\D/g, "") } },
        { phone: { contains: search.replace(/\D/g, "") } }
      ];
    }
    const [total, data] = yield Promise.all([
      prisma.client.count({ where }),
      prisma.client.findMany({
        where,
        skip,
        take: normalizedLimit,
        orderBy: { created_at: "desc" }
      })
    ]);
    const meta = createPaginationMeta(total, normalizedPage, normalizedLimit);
    const result = {
      data,
      meta
    };
    if (useCache && !search && normalizedPage === 1) {
      const cacheKey2 = CacheKeys.clients(enterprise_id, normalizedPage, normalizedLimit);
      cache.set(cacheKey2, result, 2 * 60 * 1e3);
    }
    return result;
  });
}

// src/services/clients/UpdateClientEnterpriseService.ts
function UpdateClientEnterpriseService(_0) {
  return __async(this, arguments, function* ({
    enterprise_id,
    id,
    name,
    document,
    phone
  }) {
    if (!enterprise_id || !id) {
      throw AppError.badRequest("Dados incompletos", {
        required: ["enterprise_id", "id"],
        received: { enterprise_id: !!enterprise_id, id: !!id }
      });
    }
    const existingClient = yield prisma.client.findFirst({
      where: { id, enterprise_id }
    });
    if (!existingClient) {
      throw AppError.notFound("Cliente n\xE3o encontrado");
    }
    const updateData = {};
    if (name !== void 0) updateData.name = name;
    if (document !== void 0) updateData.document = document;
    if (phone !== void 0) updateData.phone = phone;
    if (Object.keys(updateData).length === 0) {
      throw AppError.badRequest("Nenhum campo para atualizar");
    }
    const result = yield prisma.client.update({
      where: { id },
      data: updateData
    });
    if (!result) {
      throw AppError.internal("Erro ao atualizar cliente");
    }
    cache.deletePattern(`clients:${enterprise_id}*`);
    cache.delete(CacheKeys.client(enterprise_id, id));
    return result;
  });
}

// src/services/clients/DeleteClientEnterpriseService.ts
function DeleteClientEnterpriseService(_0) {
  return __async(this, arguments, function* ({
    enterprise_id,
    id
  }) {
    if (!enterprise_id || !id) {
      throw AppError.badRequest("Dados incompletos", {
        required: ["enterprise_id", "id"],
        received: { enterprise_id: !!enterprise_id, id: !!id }
      });
    }
    const client = yield prisma.client.findFirst({
      where: {
        id,
        enterprise_id
      },
      include: {
        orders: {
          take: 1
        }
      }
    });
    if (!client) {
      throw AppError.notFound("Cliente n\xE3o encontrado");
    }
    if (client.orders.length > 0) {
      throw AppError.conflict(
        "N\xE3o \xE9 poss\xEDvel excluir cliente que possui pedidos associados. Recomenda-se desativar o cliente.",
        { orderCount: client.orders.length }
      );
    }
    yield prisma.client.delete({
      where: { id }
    });
    cache.deletePattern(`clients:${enterprise_id}*`);
    cache.delete(CacheKeys.client(enterprise_id, id));
  });
}

// src/services/clients/ShowClientEnterpriseService.ts
function ShowClientEnterpriseService(_0) {
  return __async(this, arguments, function* ({
    enterprise_id,
    id
  }) {
    if (!enterprise_id || !id) {
      throw new AppError("Dados incompletos");
    }
    const result = yield prisma.client.findFirst({
      where: { id, enterprise_id },
      include: {
        orders: {
          include: {
            services_order: true
          }
        }
      }
    });
    if (!result) {
      throw new AppError("Cliente n\xE3o encontrado");
    }
    return result;
  });
}

// src/controllers/ClientsController.ts
var ClientsController = class {
  create(req, res) {
    return __async(this, null, function* () {
      try {
        const { enterprise_id } = req.params;
        const { name, document, phone } = req.body;
        const result = yield CreateClientEnterpriseService({
          enterprise_id,
          name,
          document: document || void 0,
          phone
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
        const { page, limit, search } = req.query;
        const result = yield ListClientsEnterpriseService({
          enterprise_id,
          page: page ? Number(page) : void 0,
          limit: limit ? Number(limit) : void 0,
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
  show(req, res) {
    return __async(this, null, function* () {
      try {
        const { enterprise_id, id } = req.params;
        const result = yield ShowClientEnterpriseService({
          enterprise_id,
          id
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
        const { id, name, document, phone } = req.body;
        const result = yield UpdateClientEnterpriseService({
          enterprise_id,
          id,
          name,
          document: document || void 0,
          phone
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
  delete(req, res) {
    return __async(this, null, function* () {
      try {
        const { enterprise_id } = req.params;
        const { id } = req.body;
        yield DeleteClientEnterpriseService({
          enterprise_id,
          id
        });
        return res.status(204).send();
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

// src/schemas/client.schema.ts
var import_zod2 = require("zod");
function validateCPF(cpf) {
  const cleanCPF = cpf.replace(/\D/g, "");
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  let sum = 0;
  let remainder;
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  remainder = sum * 10 % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  remainder = sum * 10 % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;
  return true;
}
var createClientSchema = import_zod2.z.object({
  name: import_zod2.z.string().min(2, "Nome deve ter no m\xEDnimo 2 caracteres").max(255, "Nome deve ter no m\xE1ximo 255 caracteres").trim(),
  document: import_zod2.z.string().optional().refine(
    (val) => !val || validateCPF(val),
    "CPF inv\xE1lido ou d\xEDgito verificador incorreto"
  ).transform((val) => val ? val.replace(/\D/g, "") : void 0),
  phone: import_zod2.z.string().min(10, "Telefone deve ter no m\xEDnimo 10 d\xEDgitos").max(11, "Telefone deve ter no m\xE1ximo 11 d\xEDgitos").regex(/^\d{10,11}$/, "Telefone deve conter apenas n\xFAmeros").transform((val) => val.replace(/\D/g, ""))
});
var updateClientSchema = import_zod2.z.object({
  id: import_zod2.z.string().uuid("ID do cliente inv\xE1lido"),
  name: import_zod2.z.string().min(2, "Nome deve ter no m\xEDnimo 2 caracteres").max(255, "Nome deve ter no m\xE1ximo 255 caracteres").trim().optional(),
  document: import_zod2.z.string().optional().refine(
    (val) => !val || validateCPF(val),
    "CPF inv\xE1lido ou d\xEDgito verificador incorreto"
  ).transform((val) => val ? val.replace(/\D/g, "") : void 0),
  phone: import_zod2.z.string().min(10, "Telefone deve ter no m\xEDnimo 10 d\xEDgitos").max(11, "Telefone deve ter no m\xE1ximo 11 d\xEDgitos").regex(/^\d{10,11}$/, "Telefone deve conter apenas n\xFAmeros").transform((val) => val.replace(/\D/g, "")).optional()
});

// src/schemas/pagination.schema.ts
var import_zod3 = require("zod");
var paginationQuerySchema = import_zod3.z.object({
  page: import_zod3.z.string().optional().transform((val) => val ? parseInt(val, 10) : void 0).pipe(import_zod3.z.number().int().positive().optional()),
  limit: import_zod3.z.string().optional().transform((val) => val ? parseInt(val, 10) : void 0).pipe(import_zod3.z.number().int().positive().max(100).optional())
});

// src/routes/clients.routes.ts
var clientsRouter = (0, import_express.Router)();
var clientsController = new ClientsController();
var enterpriseIdParamSchema = import_zod4.z.object({
  enterprise_id: import_zod4.z.string().uuid("ID da empresa inv\xE1lido")
});
var listClientsQuerySchema = paginationQuerySchema.extend({
  search: import_zod4.z.string().optional()
});
clientsRouter.post(
  "/:enterprise_id",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateBody(createClientSchema),
  clientsController.create
);
clientsRouter.get(
  "/:enterprise_id",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateQuery(listClientsQuerySchema),
  clientsController.list
);
clientsRouter.get(
  "/:enterprise_id/:id",
  ensureAuthenticate,
  validateParams(
    enterpriseIdParamSchema.extend({
      id: import_zod4.z.string().uuid("ID do cliente inv\xE1lido")
    })
  ),
  clientsController.show
);
clientsRouter.put(
  "/:enterprise_id",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateBody(updateClientSchema),
  clientsController.update
);
clientsRouter.delete(
  "/:enterprise_id",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateBody(
    import_zod4.z.object({
      id: import_zod4.z.string().uuid("ID do cliente inv\xE1lido")
    })
  ),
  clientsController.delete
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  clientsRouter
});
