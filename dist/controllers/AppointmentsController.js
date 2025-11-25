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

// src/controllers/AppointmentsController.ts
var AppointmentsController_exports = {};
__export(AppointmentsController_exports, {
  AppointmentsController: () => AppointmentsController
});
module.exports = __toCommonJS(AppointmentsController_exports);

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

// src/services/appointments/CreateAppointmentService.ts
function CreateAppointmentService(_0) {
  return __async(this, arguments, function* ({
    enterprise_id,
    car_license_plate,
    scheduled_date,
    document,
    client_id,
    service_ids,
    notes
  }) {
    if (!enterprise_id || !car_license_plate || !scheduled_date || !service_ids || service_ids.length === 0) {
      throw AppError.badRequest("Dados incompletos");
    }
    const enterprise = yield prisma.enterprise.findUnique({
      where: { id: enterprise_id }
    });
    if (!enterprise) {
      throw AppError.notFound("Empresa n\xE3o encontrada");
    }
    const now = /* @__PURE__ */ new Date();
    if (scheduled_date < now) {
      throw AppError.badRequest("Data de agendamento n\xE3o pode ser no passado");
    }
    const existingServices = yield prisma.servicesEnterprise.findMany({
      where: {
        id: { in: service_ids },
        enterprise_id
      }
    });
    if (existingServices.length !== service_ids.length) {
      const foundIds = existingServices.map((s) => s.id);
      const missingIds = service_ids.filter((id) => !foundIds.includes(id));
      throw AppError.notFound(
        `Servi\xE7os n\xE3o encontrados ou n\xE3o pertencem \xE0 empresa: ${missingIds.join(", ")}`
      );
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
    const conflictingAppointment = yield prisma.appointment.findFirst({
      where: {
        enterprise_id,
        car_license_plate: car_license_plate.toUpperCase().replace(/-/g, ""),
        scheduled_date: {
          gte: new Date(scheduled_date.getTime() - 30 * 60 * 1e3),
          // 30 minutos antes
          lte: new Date(scheduled_date.getTime() + 30 * 60 * 1e3)
          // 30 minutos depois
        },
        status: "SCHEDULED"
      }
    });
    if (conflictingAppointment) {
      throw AppError.conflict(
        "J\xE1 existe um agendamento para este ve\xEDculo neste hor\xE1rio"
      );
    }
    const result = yield prisma.appointment.create({
      data: {
        enterprise_id,
        client_id: finalClientId,
        car_license_plate: car_license_plate.toUpperCase().replace(/-/g, ""),
        scheduled_date,
        service_ids,
        notes: notes || null,
        status: "SCHEDULED"
      }
    });
    if (!result) {
      throw AppError.internal("Erro ao criar agendamento");
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

// src/services/appointments/ListAppointmentsService.ts
function ListAppointmentsService(_0) {
  return __async(this, arguments, function* ({
    enterprise_id,
    page,
    limit,
    start_date,
    end_date,
    status,
    car_license_plate
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
    if (car_license_plate) {
      where.car_license_plate = car_license_plate.toUpperCase().replace(/-/g, "");
    }
    if (start_date || end_date) {
      where.scheduled_date = {};
      if (start_date) {
        where.scheduled_date.gte = start_date;
      }
      if (end_date) {
        where.scheduled_date.lte = end_date;
      }
    }
    const [total, data] = yield Promise.all([
      prisma.appointment.count({ where }),
      prisma.appointment.findMany({
        where,
        skip,
        take: normalizedLimit,
        orderBy: { scheduled_date: "asc" },
        include: {
          client: true,
          enterprise: true
        }
      })
    ]);
    const meta = createPaginationMeta(total, normalizedPage, normalizedLimit);
    return {
      data,
      meta
    };
  });
}

// src/services/appointments/UpdateAppointmentService.ts
function UpdateAppointmentService(_0) {
  return __async(this, arguments, function* ({
    enterprise_id,
    id,
    scheduled_date,
    status,
    notes,
    service_ids
  }) {
    if (!enterprise_id || !id) {
      throw AppError.badRequest("Dados incompletos");
    }
    const existingAppointment = yield prisma.appointment.findFirst({
      where: { id, enterprise_id }
    });
    if (!existingAppointment) {
      throw AppError.notFound("Agendamento n\xE3o encontrado");
    }
    const updateData = {};
    if (scheduled_date !== void 0) {
      if (scheduled_date < /* @__PURE__ */ new Date() && status !== "COMPLETED") {
        throw AppError.badRequest("Data de agendamento n\xE3o pode ser no passado");
      }
      updateData.scheduled_date = scheduled_date;
    }
    if (status !== void 0) {
      updateData.status = status;
    }
    if (notes !== void 0) {
      updateData.notes = notes;
    }
    if (service_ids !== void 0) {
      if (service_ids.length > 0) {
        const existingServices = yield prisma.servicesEnterprise.findMany({
          where: {
            id: { in: service_ids },
            enterprise_id
          }
        });
        if (existingServices.length !== service_ids.length) {
          throw AppError.notFound("Um ou mais servi\xE7os n\xE3o encontrados");
        }
      }
      updateData.service_ids = service_ids;
    }
    if (Object.keys(updateData).length === 0) {
      throw AppError.badRequest("Nenhum campo para atualizar");
    }
    const result = yield prisma.appointment.update({
      where: { id },
      data: updateData
    });
    if (!result) {
      throw AppError.internal("Erro ao atualizar agendamento");
    }
    return result;
  });
}

// src/controllers/AppointmentsController.ts
var AppointmentsController = class {
  create(req, res) {
    return __async(this, null, function* () {
      try {
        const { enterprise_id } = req.params;
        const {
          car_license_plate,
          scheduled_date,
          document,
          client_id,
          service_ids,
          notes
        } = req.body;
        const result = yield CreateAppointmentService({
          enterprise_id,
          car_license_plate,
          scheduled_date: new Date(scheduled_date),
          document,
          client_id,
          service_ids,
          notes
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
        const { page, limit, start_date, end_date, status, car_license_plate } = req.query;
        const result = yield ListAppointmentsService({
          enterprise_id,
          page: Number(page),
          limit: Number(limit),
          start_date: start_date ? new Date(start_date) : void 0,
          end_date: end_date ? new Date(end_date) : void 0,
          status,
          car_license_plate
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
        const { id, scheduled_date, status, notes, service_ids } = req.body;
        const result = yield UpdateAppointmentService({
          enterprise_id,
          id,
          scheduled_date: scheduled_date ? new Date(scheduled_date) : void 0,
          status,
          notes,
          service_ids
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
  AppointmentsController
});
