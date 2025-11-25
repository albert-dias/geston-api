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

// src/routes/orders.routes.ts
var orders_routes_exports = {};
__export(orders_routes_exports, {
  ordersRouter: () => ordersRouter
});
module.exports = __toCommonJS(orders_routes_exports);
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

// src/lib/prisma.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient({
  log: ["query"]
});

// src/services/vehicle-history/CreateVehicleHistoryService.ts
function CreateVehicleHistoryService(_0) {
  return __async(this, arguments, function* ({
    enterprise_id,
    order_id,
    car_license_plate,
    services,
    total_value,
    client_id,
    employee_id
  }) {
    if (!enterprise_id || !order_id || !car_license_plate || !services || services.length === 0) {
      throw AppError.badRequest("Dados incompletos");
    }
    const order = yield prisma.order.findFirst({
      where: {
        id: order_id,
        enterprise_id
      },
      include: {
        items_order: {
          include: {
            service: true
          }
        }
      }
    });
    if (!order) {
      throw AppError.notFound("Pedido n\xE3o encontrado");
    }
    const result = yield prisma.vehicleHistory.create({
      data: {
        enterprise_id,
        order_id,
        car_license_plate: car_license_plate.toUpperCase().replace(/-/g, ""),
        services,
        total_value,
        client_id: client_id || null,
        employee_id: employee_id || null
      }
    });
    if (!result) {
      throw AppError.internal("Erro ao criar hist\xF3rico do ve\xEDculo");
    }
    return result;
  });
}

// src/services/loyalty/AddPointsToClientService.ts
function AddPointsToClientService(_0) {
  return __async(this, arguments, function* ({
    enterprise_id,
    client_id,
    points
  }) {
    if (!enterprise_id || !client_id || !points || points <= 0) {
      throw AppError.badRequest("Dados incompletos");
    }
    const client = yield prisma.client.findFirst({
      where: {
        id: client_id,
        enterprise_id
      }
    });
    if (!client) {
      throw AppError.notFound("Cliente n\xE3o encontrado");
    }
    let program = yield prisma.loyaltyProgram.findUnique({
      where: { enterprise_id }
    });
    if (!program) {
      program = yield prisma.loyaltyProgram.create({
        data: {
          enterprise_id,
          points_per_order: 1,
          discount_per_point: 0.01,
          active: true
        }
      });
    }
    if (!program.active) {
      throw AppError.badRequest("Programa de fidelidade est\xE1 inativo");
    }
    const existingPoints = yield prisma.clientLoyaltyPoints.findUnique({
      where: {
        client_id_program_id: {
          client_id,
          program_id: program.id
        }
      }
    });
    if (existingPoints) {
      const result = yield prisma.clientLoyaltyPoints.update({
        where: { id: existingPoints.id },
        data: {
          points: existingPoints.points + points
        }
      });
      return result;
    } else {
      const result = yield prisma.clientLoyaltyPoints.create({
        data: {
          client_id,
          program_id: program.id,
          points
        }
      });
      return result;
    }
  });
}

// src/services/orders/CreateOrderEnterpriseService.ts
function CreateOrderEnterpriseService(_0) {
  return __async(this, arguments, function* ({
    enterprise_id,
    client_id,
    document,
    car_license_plate,
    payment_type,
    total_value,
    services
  }) {
    if (total_value === null || !enterprise_id || services.length === 0) {
      throw new AppError("Dados incompletos");
    }
    const enterprise = yield prisma.enterprise.findUnique({
      where: { id: enterprise_id }
    });
    if (!enterprise) {
      throw new AppError("Empresa n\xE3o encontrada");
    }
    const serviceIds = services.map((s) => s.id);
    const existingServices = yield prisma.servicesEnterprise.findMany({
      where: {
        id: { in: serviceIds },
        enterprise_id
      }
    });
    if (existingServices.length !== serviceIds.length) {
      const foundIds = existingServices.map((s) => s.id);
      const missingIds = serviceIds.filter((id) => !foundIds.includes(id));
      throw new AppError(
        `Servi\xE7os n\xE3o encontrados ou n\xE3o pertencem \xE0 empresa: ${missingIds.join(", ")}`
      );
    }
    for (const serviceInput of services) {
      const existingService = existingServices.find((s) => s.id === serviceInput.id);
      if (!existingService) continue;
      if (serviceInput.value <= 0) {
        throw new AppError(`Valor do servi\xE7o ${existingService.name} deve ser maior que zero`);
      }
    }
    let finalClientId = client_id != null ? client_id : null;
    if (document) {
      const existingClient = yield prisma.client.findFirst({
        where: {
          enterprise_id,
          document
        }
      });
      if (existingClient) {
        finalClientId = existingClient.id;
      }
    }
    const servicesOrder = services.map((service) => {
      var _a;
      return {
        service_id: service.id,
        value: service.value,
        quantity: (_a = service.quantity) != null ? _a : 1
      };
    });
    const expectedTotal = servicesOrder.reduce(
      (sum, item) => sum + item.value * item.quantity,
      0
    );
    if (Math.abs(total_value - expectedTotal) > 1) {
      throw new AppError(
        `Valor total (${total_value}) n\xE3o corresponde \xE0 soma dos servi\xE7os (${expectedTotal})`
      );
    }
    const result = yield prisma.order.create({
      data: {
        enterprise_id,
        client_id: finalClientId,
        car_license_plate: car_license_plate.toUpperCase().replace(/-/g, ""),
        payment_type: payment_type != null ? payment_type : null,
        total_value,
        items_order: {
          create: servicesOrder
        }
      },
      include: {
        items_order: {
          include: {
            service: true
          }
        }
      }
    });
    if (!result) {
      throw new AppError("Erro ao finalizar venda!");
    }
    try {
      const serviceNames = result.items_order.map((item) => item.service.name);
      yield CreateVehicleHistoryService({
        enterprise_id,
        order_id: result.id,
        car_license_plate,
        services: serviceNames,
        total_value,
        client_id: finalClientId || void 0
      });
    } catch (error) {
      console.error("Erro ao registrar hist\xF3rico do ve\xEDculo:", error);
    }
    if (finalClientId) {
      try {
        const program = yield prisma.loyaltyProgram.findUnique({
          where: { enterprise_id }
        });
        if (program && program.active) {
          yield AddPointsToClientService({
            enterprise_id,
            client_id: finalClientId,
            points: program.points_per_order
          });
        }
      } catch (error) {
        console.error("Erro ao adicionar pontos de fidelidade:", error);
      }
    }
    return result;
  });
}

// src/services/orders/GetOrdersSummaryByDateService.ts
function GetOrdersSummaryByDateService(_0) {
  return __async(this, arguments, function* ({
    enterprise_id,
    day,
    month,
    year
  }) {
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59);
    const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyOrders = yield prisma.order.findMany({
      where: {
        enterprise_id,
        created_at: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });
    const monthlyOrders = yield prisma.order.findMany({
      where: {
        enterprise_id,
        created_at: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });
    const createEmptyDaySummary = (day2) => ({
      day: day2,
      total_value: 0,
      payment_type_summary: {
        PIX: { total_orders: 0, total_value: 0 },
        MONEY: { total_orders: 0, total_value: 0 },
        CREDITCARD: { total_orders: 0, total_value: 0 }
      }
    });
    const day_summary = {
      total_value: 0,
      payment_type_summary: {
        PIX: { total_orders: 0, total_value: 0 },
        MONEY: { total_orders: 0, total_value: 0 },
        CREDITCARD: { total_orders: 0, total_value: 0 }
      }
    };
    for (const order of dailyOrders) {
      day_summary.total_value += order.total_value;
      if (order.payment_type) {
        const payment = day_summary.payment_type_summary[order.payment_type];
        payment.total_orders += 1;
        payment.total_value += order.total_value;
      }
    }
    const monthlyMap = {};
    for (let d = 1; d <= daysInMonth; d++) {
      monthlyMap[d] = createEmptyDaySummary(d);
    }
    for (const order of monthlyOrders) {
      const orderDay = new Date(order.created_at).getDate();
      const summary = monthlyMap[orderDay];
      summary.total_value += order.total_value;
      if (order.payment_type) {
        const payment = summary.payment_type_summary[order.payment_type];
        payment.total_orders += 1;
        payment.total_value += order.total_value;
      }
    }
    const monthly_summary = Object.values(monthlyMap).sort(
      (a, b) => a.day - b.day
    );
    return {
      day_summary,
      monthly_summary: monthly_summary || []
    };
  });
}

// src/services/orders/ListOrdersEnterpriseService.ts
function ListOrdersEnterpriseService(_0) {
  return __async(this, arguments, function* ({
    enterprise_id,
    year,
    month,
    day
  }) {
    if (!enterprise_id || !year || !month) {
      throw new AppError("Ano e m\xEAs s\xE3o obrigat\xF3rios.");
    }
    let from;
    let to;
    if (day) {
      from = new Date(year, month - 1, day, 0, 0, 0);
      to = new Date(year, month - 1, day, 23, 59, 59);
    } else {
      from = new Date(year, month - 1, 1, 0, 0, 0);
      to = new Date(year, month, 0, 23, 59, 59);
    }
    const result = yield prisma.order.findMany({
      where: {
        enterprise_id,
        created_at: {
          gte: from,
          lte: to
        }
      },
      include: {
        services_order: { include: { service: true } }
      },
      orderBy: { created_at: "asc" }
    });
    const canceled = result.filter((order) => order.status === "CANCELED").length;
    const inline = result.filter((order) => order.status === "INLINE").length;
    const completed = result.filter(
      (order) => order.status === "COMPLETED"
    ).length;
    const total = result.length;
    return {
      orders: result,
      canceled,
      inline,
      completed,
      total
    };
  });
}

// src/services/orders/UpdateOrderEnterpriseService.ts
function UpdateOrderEnterpriseService(_0) {
  return __async(this, arguments, function* ({
    enterprise_id,
    order_id,
    payment_type,
    status
  }) {
    if (!order_id || !enterprise_id || !status) {
      throw new AppError("Dados incompletos");
    }
    const result = yield prisma.order.update({
      where: { enterprise_id, id: order_id },
      data: {
        payment_type,
        status
      }
    });
    if (!result) {
      throw new AppError("Erro ao atualizar venda!");
    }
    return result;
  });
}

// src/controllers/OrdersController.ts
var OrdersController = class {
  create(req, res) {
    return __async(this, null, function* () {
      try {
        const { enterprise_id } = req.params;
        const {
          total_value,
          services,
          client_id,
          document,
          car_license_plate,
          payment_type
        } = req.body;
        const result = yield CreateOrderEnterpriseService({
          enterprise_id,
          total_value,
          document,
          services,
          client_id,
          car_license_plate,
          payment_type
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
        const { year, month, day } = req.query;
        const result = yield ListOrdersEnterpriseService({
          enterprise_id,
          year: Number(year),
          month: Number(month),
          day: Number(day)
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
  dash(req, res) {
    return __async(this, null, function* () {
      try {
        const { enterprise_id } = req.params;
        const { year, month, day } = req.query;
        const result = yield GetOrdersSummaryByDateService({
          enterprise_id,
          year: Number(year),
          month: Number(month),
          day: Number(day)
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
        const { order_id, payment_type, status } = req.body;
        const result = yield UpdateOrderEnterpriseService({
          enterprise_id,
          order_id,
          payment_type,
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

// src/schemas/order.schema.ts
var import_zod2 = require("zod");
var createOrderSchema = import_zod2.z.object({
  car_license_plate: import_zod2.z.string().min(7, "Placa deve ter no m\xEDnimo 7 caracteres").max(8, "Placa deve ter no m\xE1ximo 8 caracteres").regex(
    /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$|^[A-Z]{3}-?[0-9]{4}$/,
    "Formato de placa inv\xE1lido (use formato Mercosul ou antigo)"
  ).transform((val) => val.replace("-", "").toUpperCase()),
  document: import_zod2.z.string().optional().refine(
    (val) => !val || /^\d{11}$/.test(val.replace(/\D/g, "")),
    "CPF deve ter 11 d\xEDgitos"
  ).transform((val) => val ? val.replace(/\D/g, "") : void 0),
  client_id: import_zod2.z.string().uuid().optional(),
  payment_type: import_zod2.z.enum(["PIX", "CREDITCARD", "MONEY"]).optional(),
  total_value: import_zod2.z.number().int().positive("Valor total deve ser maior que zero").min(1, "Valor total deve ser pelo menos 1 centavo"),
  services: import_zod2.z.array(
    import_zod2.z.object({
      id: import_zod2.z.string().uuid("ID do servi\xE7o inv\xE1lido"),
      value: import_zod2.z.number().int().positive("Valor do servi\xE7o deve ser maior que zero"),
      quantity: import_zod2.z.number().int().positive().default(1)
    })
  ).min(1, "Pelo menos um servi\xE7o deve ser selecionado")
});
var updateOrderSchema = import_zod2.z.object({
  order_id: import_zod2.z.string().uuid("ID do pedido inv\xE1lido"),
  payment_type: import_zod2.z.enum(["PIX", "CREDITCARD", "MONEY"]).optional(),
  status: import_zod2.z.enum(["INLINE", "COMPLETED", "CANCELED"])
});

// src/routes/orders.routes.ts
var ordersRouter = (0, import_express.Router)();
var ordersController = new OrdersController();
var enterpriseIdParamSchema = import_zod3.z.object({
  enterprise_id: import_zod3.z.string().uuid("ID da empresa inv\xE1lido")
});
var listOrdersQuerySchema = import_zod3.z.object({
  year: import_zod3.z.string().transform((val) => parseInt(val, 10)).pipe(import_zod3.z.number().int().min(2e3).max(3e3)),
  month: import_zod3.z.string().transform((val) => parseInt(val, 10)).pipe(import_zod3.z.number().int().min(1).max(12)),
  day: import_zod3.z.string().optional().transform((val) => val ? parseInt(val, 10) : void 0).pipe(import_zod3.z.number().int().min(1).max(31).optional())
});
ordersRouter.post(
  "/:enterprise_id",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateBody(createOrderSchema),
  ordersController.create
);
ordersRouter.get(
  "/:enterprise_id",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateQuery(listOrdersQuerySchema),
  ordersController.list
);
ordersRouter.get(
  "/:enterprise_id/dash",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateQuery(listOrdersQuerySchema),
  ordersController.dash
);
ordersRouter.put(
  "/:enterprise_id",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateBody(updateOrderSchema),
  ordersController.update
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ordersRouter
});
