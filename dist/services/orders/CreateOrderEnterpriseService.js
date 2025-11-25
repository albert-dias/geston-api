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

// src/services/orders/CreateOrderEnterpriseService.ts
var CreateOrderEnterpriseService_exports = {};
__export(CreateOrderEnterpriseService_exports, {
  CreateOrderEnterpriseService: () => CreateOrderEnterpriseService
});
module.exports = __toCommonJS(CreateOrderEnterpriseService_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CreateOrderEnterpriseService
});
