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

// src/controllers/CashMovementsController.ts
var CashMovementsController_exports = {};
__export(CashMovementsController_exports, {
  CashMovementsController: () => CashMovementsController
});
module.exports = __toCommonJS(CashMovementsController_exports);

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

// src/services/cash-movements/CreateCashMovementService.ts
function CreateCashMovementService(_0) {
  return __async(this, arguments, function* ({
    enterprise_id,
    type,
    amount,
    description,
    order_id,
    employee_id,
    created_by
  }) {
    if (!enterprise_id || !type || !amount || !description || !created_by) {
      throw AppError.badRequest("Dados incompletos");
    }
    if (amount <= 0) {
      throw AppError.badRequest("Valor deve ser maior que zero");
    }
    const enterprise = yield prisma.enterprise.findUnique({
      where: { id: enterprise_id }
    });
    if (!enterprise) {
      throw AppError.notFound("Empresa n\xE3o encontrada");
    }
    const user = yield prisma.user.findUnique({
      where: { id: created_by }
    });
    if (!user) {
      throw AppError.notFound("Usu\xE1rio n\xE3o encontrado");
    }
    if (order_id) {
      const order = yield prisma.order.findFirst({
        where: {
          id: order_id,
          enterprise_id
        }
      });
      if (!order) {
        throw AppError.notFound("Pedido n\xE3o encontrado");
      }
    }
    if (employee_id) {
      const employee = yield prisma.employee.findFirst({
        where: {
          id: employee_id,
          enterprise_id
        }
      });
      if (!employee) {
        throw AppError.notFound("Funcion\xE1rio n\xE3o encontrado");
      }
    }
    const result = yield prisma.cashMovement.create({
      data: {
        enterprise_id,
        type,
        amount,
        description,
        order_id: order_id || null,
        employee_id: employee_id || null,
        created_by
      }
    });
    if (!result) {
      throw AppError.internal("Erro ao criar movimenta\xE7\xE3o de caixa");
    }
    return result;
  });
}

// src/services/cash-movements/GetCashSummaryService.ts
function GetCashSummaryService(_0) {
  return __async(this, arguments, function* ({
    enterprise_id,
    start_date,
    end_date
  }) {
    if (!enterprise_id || !start_date || !end_date) {
      throw AppError.badRequest("Dados incompletos");
    }
    if (start_date > end_date) {
      throw AppError.badRequest("Data inicial n\xE3o pode ser maior que data final");
    }
    const movements = yield prisma.cashMovement.findMany({
      where: {
        enterprise_id,
        created_at: {
          gte: start_date,
          lte: end_date
        }
      },
      orderBy: { created_at: "desc" },
      include: {
        order: true,
        employee: true,
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    const entries = movements.filter((m) => m.type === "ENTRY").map((m) => ({
      id: m.id,
      amount: m.amount,
      description: m.description,
      created_at: m.created_at,
      type: m.type
    }));
    const exits = movements.filter((m) => m.type === "EXIT").map((m) => ({
      id: m.id,
      amount: m.amount,
      description: m.description,
      created_at: m.created_at,
      type: m.type
    }));
    const total_entries = entries.reduce((sum, m) => sum + m.amount, 0);
    const total_exits = exits.reduce((sum, m) => sum + m.amount, 0);
    const balance = total_entries - total_exits;
    return {
      total_entries,
      total_exits,
      balance,
      movements: {
        entries,
        exits
      }
    };
  });
}

// src/controllers/CashMovementsController.ts
var CashMovementsController = class {
  create(req, res) {
    return __async(this, null, function* () {
      var _a;
      try {
        const { enterprise_id } = req.params;
        const { type, amount, description, order_id, employee_id } = req.body;
        const user_id = (_a = req.user) == null ? void 0 : _a.id;
        if (!user_id) {
          throw AppError.unauthorized("Usu\xE1rio n\xE3o autenticado");
        }
        const result = yield CreateCashMovementService({
          enterprise_id,
          type,
          amount,
          description,
          order_id,
          employee_id,
          created_by: user_id
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
  getSummary(req, res) {
    return __async(this, null, function* () {
      try {
        const { enterprise_id } = req.params;
        const { start_date, end_date } = req.query;
        if (!start_date || !end_date) {
          throw AppError.badRequest("Data inicial e final s\xE3o obrigat\xF3rias");
        }
        const result = yield GetCashSummaryService({
          enterprise_id,
          start_date: new Date(start_date),
          end_date: new Date(end_date)
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
  CashMovementsController
});
