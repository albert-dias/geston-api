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

// src/controllers/EmployeesController.ts
var EmployeesController_exports = {};
__export(EmployeesController_exports, {
  EmployeesController: () => EmployeesController
});
module.exports = __toCommonJS(EmployeesController_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EmployeesController
});
