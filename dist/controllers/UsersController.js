"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
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

// src/controllers/UsersController.ts
var UsersController_exports = {};
__export(UsersController_exports, {
  UsersController: () => UsersController
});
module.exports = __toCommonJS(UsersController_exports);

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

// src/services/user/CreateEnterpriseService.ts
function CreateEnterpriseService(_0) {
  return __async(this, arguments, function* ({
    document,
    phone,
    name,
    email,
    password,
    user_type = "USER",
    company_name,
    fantasy_name,
    document_enterprise,
    zip_code,
    region,
    address,
    number,
    city,
    state,
    lat,
    long
  }) {
    if (!name || !email || !password || !fantasy_name || !zip_code || !address || !number || !region || !city || !state) {
      throw new AppError("Dados incompletos");
    }
    const enterprise = yield prisma.enterprise.create({
      data: {
        fantasy_name,
        company_name,
        zip_code,
        region,
        document: document_enterprise,
        address,
        number,
        city,
        state,
        lat,
        long,
        users: { create: { name, email, password, user_type, document, phone } }
      }
    });
    if (!enterprise) {
      throw new AppError("Erro ao realizar o cadastro!");
    }
    return enterprise;
  });
}

// src/services/user/CreateUserService.ts
var import_bcryptjs = __toESM(require("bcryptjs"));
function CreateUserService(_0) {
  return __async(this, arguments, function* ({
    document,
    phone,
    name,
    email,
    password,
    user_type = "USER"
  }) {
    if (!name || !email || !password) {
      throw new AppError("Dados incompletos");
    }
    const hashedPassword = yield import_bcryptjs.default.hash(password, 8);
    const user = yield prisma.user.create({
      data: { name, email, password: hashedPassword, user_type, document, phone }
    });
    if (!user) {
      throw new AppError("Erro ao criar usu\xE1rio!");
    }
    return user;
  });
}

// src/services/user/ListUserEnterprisesService.ts
function ListUserEnterprisesService(_0) {
  return __async(this, arguments, function* ({
    user_id
  }) {
    if (!user_id) {
      throw AppError.badRequest("Dados incompletos");
    }
    const user = yield prisma.user.findUnique({
      where: { id: user_id },
      include: {
        enterprise: true
      }
    });
    if (!user) {
      throw AppError.notFound("Usu\xE1rio n\xE3o encontrado");
    }
    return user.enterprise;
  });
}

// src/services/user/CreateBranchService.ts
function CreateBranchService(_0) {
  return __async(this, arguments, function* ({
    user_id,
    fantasy_name,
    company_name,
    document_enterprise,
    zip_code,
    region,
    address,
    number,
    complement,
    city,
    state,
    lat,
    long
  }) {
    if (!user_id || !fantasy_name || !zip_code || !address || !number || !region || !city || !state) {
      throw AppError.badRequest("Dados incompletos");
    }
    const user = yield prisma.user.findUnique({
      where: { id: user_id }
    });
    if (!user) {
      throw AppError.notFound("Usu\xE1rio n\xE3o encontrado");
    }
    const enterprise = yield prisma.enterprise.create({
      data: {
        fantasy_name,
        company_name: company_name || null,
        document: document_enterprise || null,
        zip_code,
        region,
        address,
        number,
        complement: complement || null,
        city,
        state,
        lat,
        long,
        users: {
          connect: { id: user_id }
        }
      }
    });
    if (!enterprise) {
      throw AppError.internal("Erro ao criar filial");
    }
    return enterprise;
  });
}

// src/services/user/UpdateEnterpriseStatusService.ts
function UpdateEnterpriseStatusService(_0) {
  return __async(this, arguments, function* ({
    user_id,
    enterprise_id,
    status
  }) {
    if (!user_id || !enterprise_id || !status) {
      throw AppError.badRequest("Dados incompletos");
    }
    const user = yield prisma.user.findUnique({
      where: { id: user_id },
      include: {
        enterprise: {
          where: { id: enterprise_id }
        }
      }
    });
    if (!user) {
      throw AppError.notFound("Usu\xE1rio n\xE3o encontrado");
    }
    if (user.enterprise.length === 0) {
      throw AppError.forbidden("Voc\xEA n\xE3o tem permiss\xE3o para esta empresa");
    }
    if (status === "INACTIVE") {
      const activeEnterprises = yield prisma.user.findUnique({
        where: { id: user_id },
        include: {
          enterprise: {
            where: {
              status: "ACTIVE",
              NOT: { id: enterprise_id }
            }
          }
        }
      });
      if (!activeEnterprises || activeEnterprises.enterprise.length === 0) {
        throw AppError.badRequest(
          "N\xE3o \xE9 poss\xEDvel desativar a \xFAltima empresa ativa. Selecione outra empresa como ativa antes de desativar esta."
        );
      }
    }
    const enterprise = yield prisma.enterprise.update({
      where: { id: enterprise_id },
      data: { status }
    });
    if (!enterprise) {
      throw AppError.internal("Erro ao atualizar status da empresa");
    }
    return enterprise;
  });
}

// src/services/user/UpdateUserEnterpriseService.ts
function UpdateUserEnterpriseService(_0) {
  return __async(this, arguments, function* ({
    user_id,
    enterprise_id
  }) {
    if (!user_id || !enterprise_id) {
      throw AppError.badRequest("Dados incompletos");
    }
    const user = yield prisma.user.findUnique({
      where: { id: user_id },
      include: {
        enterprise: {
          where: { id: enterprise_id }
        }
      }
    });
    if (!user) {
      throw AppError.notFound("Usu\xE1rio n\xE3o encontrado");
    }
    if (user.enterprise.length === 0) {
      throw AppError.forbidden("Voc\xEA n\xE3o tem permiss\xE3o para esta empresa");
    }
    const enterprise = yield prisma.enterprise.findUnique({
      where: { id: enterprise_id }
    });
    if (!enterprise) {
      throw AppError.notFound("Empresa n\xE3o encontrada");
    }
    if (enterprise.status !== "ACTIVE") {
      throw AppError.badRequest("N\xE3o \xE9 poss\xEDvel selecionar uma empresa inativa");
    }
    const updatedUser = yield prisma.user.update({
      where: { id: user_id },
      data: {
        enterprise_id,
        enterprise: {
          connect: { id: enterprise_id }
        }
      },
      include: {
        enterprise: {
          where: { id: enterprise_id },
          include: {
            services_enterprise: true
          }
        }
      }
    });
    if (!updatedUser) {
      throw AppError.internal("Erro ao atualizar empresa do usu\xE1rio");
    }
    return updatedUser;
  });
}

// src/services/user/UpdateUserService.ts
function UpdateUserService(_0) {
  return __async(this, arguments, function* ({
    user_id,
    name,
    email,
    document,
    phone
  }) {
    if (!user_id) {
      throw AppError.badRequest("ID do usu\xE1rio \xE9 obrigat\xF3rio");
    }
    const existingUser = yield prisma.user.findUnique({
      where: { id: user_id }
    });
    if (!existingUser) {
      throw AppError.notFound("Usu\xE1rio n\xE3o encontrado");
    }
    if (email && email !== existingUser.email) {
      const emailExists = yield prisma.user.findUnique({
        where: { email }
      });
      if (emailExists) {
        throw AppError.conflict("Este email j\xE1 est\xE1 em uso");
      }
    }
    const updateData = {};
    if (name !== void 0) updateData.name = name;
    if (email !== void 0) updateData.email = email;
    if (document !== void 0) updateData.document = document || null;
    if (phone !== void 0) updateData.phone = phone || null;
    if (Object.keys(updateData).length === 0) {
      throw AppError.badRequest("Nenhum campo para atualizar");
    }
    const updatedUser = yield prisma.user.update({
      where: { id: user_id },
      data: updateData
    });
    if (!updatedUser) {
      throw AppError.internal("Erro ao atualizar usu\xE1rio");
    }
    const _a = updatedUser, { password: _ } = _a, userWithoutPassword = __objRest(_a, ["password"]);
    return userWithoutPassword;
  });
}

// src/services/user/UpdateUserPasswordService.ts
var import_bcryptjs2 = __toESM(require("bcryptjs"));
function UpdateUserPasswordService(_0) {
  return __async(this, arguments, function* ({
    user_id,
    old_password,
    new_password
  }) {
    if (!user_id || !old_password || !new_password) {
      throw AppError.badRequest("Dados incompletos");
    }
    if (new_password.length < 6) {
      throw AppError.badRequest("A senha deve ter no m\xEDnimo 6 caracteres");
    }
    const user = yield prisma.user.findUnique({
      where: { id: user_id }
    });
    if (!user) {
      throw AppError.notFound("Usu\xE1rio n\xE3o encontrado");
    }
    const passwordMatched = yield import_bcryptjs2.default.compare(old_password, user.password);
    if (!passwordMatched) {
      throw AppError.unauthorized("Senha atual incorreta");
    }
    const hashedPassword = yield import_bcryptjs2.default.hash(new_password, 8);
    yield prisma.user.update({
      where: { id: user_id },
      data: { password: hashedPassword }
    });
  });
}

// src/services/user/CancelUserAccountService.ts
var import_bcryptjs3 = __toESM(require("bcryptjs"));
function CancelUserAccountService(_0) {
  return __async(this, arguments, function* ({
    user_id,
    password
  }) {
    if (!user_id || !password) {
      throw AppError.badRequest("Dados incompletos");
    }
    const user = yield prisma.user.findUnique({
      where: { id: user_id }
    });
    if (!user) {
      throw AppError.notFound("Usu\xE1rio n\xE3o encontrado");
    }
    const passwordMatched = yield import_bcryptjs3.default.compare(password, user.password);
    if (!passwordMatched) {
      throw AppError.unauthorized("Senha incorreta");
    }
    yield prisma.$transaction((tx) => __async(null, null, function* () {
      yield tx.tokens.deleteMany({
        where: { user_id }
      });
      yield tx.user.delete({
        where: { id: user_id }
      });
    }));
  });
}

// src/services/user/UpdateEnterpriseService.ts
function UpdateEnterpriseService(_0) {
  return __async(this, arguments, function* ({
    user_id,
    enterprise_id,
    fantasy_name,
    company_name,
    document_enterprise,
    zip_code,
    address,
    number,
    complement,
    region,
    city,
    state,
    lat,
    long
  }) {
    if (!user_id || !enterprise_id) {
      throw AppError.badRequest("Dados incompletos");
    }
    const user = yield prisma.user.findUnique({
      where: { id: user_id },
      include: {
        enterprise: {
          where: { id: enterprise_id }
        }
      }
    });
    if (!user) {
      throw AppError.notFound("Usu\xE1rio n\xE3o encontrado");
    }
    if (user.enterprise.length === 0) {
      throw AppError.forbidden("Voc\xEA n\xE3o tem permiss\xE3o para esta empresa");
    }
    const existingEnterprise = yield prisma.enterprise.findUnique({
      where: { id: enterprise_id }
    });
    if (!existingEnterprise) {
      throw AppError.notFound("Empresa n\xE3o encontrada");
    }
    if (document_enterprise && document_enterprise !== existingEnterprise.document) {
      const documentExists = yield prisma.enterprise.findUnique({
        where: { document: document_enterprise }
      });
      if (documentExists) {
        throw AppError.conflict("Este CNPJ j\xE1 est\xE1 em uso");
      }
    }
    const updateData = {};
    if (fantasy_name !== void 0) updateData.fantasy_name = fantasy_name;
    if (company_name !== void 0) updateData.company_name = company_name || null;
    if (document_enterprise !== void 0) updateData.document = document_enterprise || null;
    if (zip_code !== void 0) updateData.zip_code = zip_code;
    if (address !== void 0) updateData.address = address;
    if (number !== void 0) updateData.number = number;
    if (complement !== void 0) updateData.complement = complement || null;
    if (region !== void 0) updateData.region = region;
    if (city !== void 0) updateData.city = city;
    if (state !== void 0) updateData.state = state;
    if (lat !== void 0) updateData.lat = lat;
    if (long !== void 0) updateData.long = long;
    if (Object.keys(updateData).length === 0) {
      throw AppError.badRequest("Nenhum campo para atualizar");
    }
    const updatedEnterprise = yield prisma.enterprise.update({
      where: { id: enterprise_id },
      data: updateData
    });
    if (!updatedEnterprise) {
      throw AppError.internal("Erro ao atualizar empresa");
    }
    return updatedEnterprise;
  });
}

// src/controllers/UsersController.ts
var UsersController = class {
  create(req, res) {
    return __async(this, null, function* () {
      try {
        const {
          document,
          phone,
          name,
          email,
          password,
          company_name,
          fantasy_name,
          document_enterprise,
          status,
          address,
          number,
          city,
          state,
          lat,
          long,
          zip_code,
          region
        } = req.body;
        const result = yield CreateEnterpriseService({
          zip_code,
          region,
          document,
          phone,
          name,
          email,
          password,
          company_name,
          fantasy_name,
          document_enterprise,
          status,
          address,
          number,
          city,
          state,
          lat,
          long
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
  createUser(req, res) {
    return __async(this, null, function* () {
      try {
        const { document, phone, name, email, password } = req.body;
        const result = yield CreateUserService({
          document,
          phone,
          name,
          email,
          password
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
  // async updatePass(req: Request, res: Response): Promise<Response> {
  //   try {
  //     const { id, old_password, new_password } = req.body;
  //     const result = await UpdatePassUserService({
  //       id,
  //       old_password,
  //       new_password,
  //     });
  //     return res.status(200).json(result);
  //   } catch (err: any) {
  //     if (err instanceof AppError) {
  //       return res.status(err.statusCode).json({
  //         status: 'error',
  //         message: err.message,
  //       });
  //     }
  //     return res.status(400).json({ error: err.message });
  //   }
  // }
  // async list(req: Request, res: Response): Promise<Response> {
  //   try {
  //     const result = await ListUserService();
  //     return res.status(200).json(result);
  //   } catch (err: any) {
  //     if (err instanceof AppError) {
  //       return res.status(err.statusCode).json({
  //         status: 'error',
  //         message: err.message,
  //       });
  //     }
  //     return res.status(400).json({ error: err.message });
  //   }
  // }
  // async show(req: Request, res: Response): Promise<Response> {
  //   try {
  //     const { id } = req.params;
  //     const result = await ShowUserService({
  //       id,
  //     });
  //     return res.status(200).json(result);
  //   } catch (err: any) {
  //     if (err instanceof AppError) {
  //       return res.status(err.statusCode).json({
  //         status: 'error',
  //         message: err.message,
  //       });
  //     }
  //     return res.status(400).json({ error: err.message });
  //   }
  // }
  listEnterprises(req, res) {
    return __async(this, null, function* () {
      var _a;
      try {
        const user_id = (_a = req.user) == null ? void 0 : _a.id;
        if (!user_id) {
          return res.status(401).json({
            status: "error",
            message: "Usu\xE1rio n\xE3o autenticado"
          });
        }
        const result = yield ListUserEnterprisesService({
          user_id
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
  createBranch(req, res) {
    return __async(this, null, function* () {
      var _a;
      try {
        const user_id = (_a = req.user) == null ? void 0 : _a.id;
        if (!user_id) {
          return res.status(401).json({
            status: "error",
            message: "Usu\xE1rio n\xE3o autenticado"
          });
        }
        const {
          fantasy_name,
          company_name,
          document_enterprise,
          zip_code,
          region,
          address,
          number,
          complement,
          city,
          state,
          lat,
          long
        } = req.body;
        const result = yield CreateBranchService({
          user_id,
          fantasy_name,
          company_name,
          document_enterprise,
          zip_code,
          region,
          address,
          number,
          complement,
          city,
          state,
          lat: lat || 0,
          long: long || 0
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
  deactivateBranch(req, res) {
    return __async(this, null, function* () {
      var _a;
      try {
        const user_id = (_a = req.user) == null ? void 0 : _a.id;
        if (!user_id) {
          return res.status(401).json({
            status: "error",
            message: "Usu\xE1rio n\xE3o autenticado"
          });
        }
        const { enterprise_id } = req.params;
        if (!enterprise_id) {
          return res.status(400).json({
            status: "error",
            message: "ID da empresa n\xE3o fornecido"
          });
        }
        const result = yield UpdateEnterpriseStatusService({
          user_id,
          enterprise_id,
          status: "INACTIVE"
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
  selectBranch(req, res) {
    return __async(this, null, function* () {
      var _a;
      try {
        const user_id = (_a = req.user) == null ? void 0 : _a.id;
        if (!user_id) {
          return res.status(401).json({
            status: "error",
            message: "Usu\xE1rio n\xE3o autenticado"
          });
        }
        const { enterprise_id } = req.body;
        if (!enterprise_id) {
          return res.status(400).json({
            status: "error",
            message: "ID da empresa n\xE3o fornecido"
          });
        }
        const result = yield UpdateUserEnterpriseService({
          user_id,
          enterprise_id
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
  updateUser(req, res) {
    return __async(this, null, function* () {
      var _a;
      try {
        const user_id = (_a = req.user) == null ? void 0 : _a.id;
        if (!user_id) {
          return res.status(401).json({
            status: "error",
            message: "Usu\xE1rio n\xE3o autenticado"
          });
        }
        const { name, email, document, phone } = req.body;
        const result = yield UpdateUserService({
          user_id,
          name,
          email,
          document,
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
  updatePassword(req, res) {
    return __async(this, null, function* () {
      var _a;
      try {
        const user_id = (_a = req.user) == null ? void 0 : _a.id;
        if (!user_id) {
          return res.status(401).json({
            status: "error",
            message: "Usu\xE1rio n\xE3o autenticado"
          });
        }
        const { old_password, new_password } = req.body;
        yield UpdateUserPasswordService({
          user_id,
          old_password,
          new_password
        });
        return res.status(200).json({ message: "Senha atualizada com sucesso" });
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
  cancelAccount(req, res) {
    return __async(this, null, function* () {
      var _a;
      try {
        const user_id = (_a = req.user) == null ? void 0 : _a.id;
        if (!user_id) {
          return res.status(401).json({
            status: "error",
            message: "Usu\xE1rio n\xE3o autenticado"
          });
        }
        const { password } = req.body;
        yield CancelUserAccountService({
          user_id,
          password
        });
        return res.status(200).json({ message: "Conta cancelada com sucesso" });
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
  updateEnterprise(req, res) {
    return __async(this, null, function* () {
      var _a;
      try {
        const user_id = (_a = req.user) == null ? void 0 : _a.id;
        if (!user_id) {
          return res.status(401).json({
            status: "error",
            message: "Usu\xE1rio n\xE3o autenticado"
          });
        }
        const { enterprise_id } = req.params;
        if (!enterprise_id) {
          return res.status(400).json({
            status: "error",
            message: "ID da empresa n\xE3o fornecido"
          });
        }
        const {
          fantasy_name,
          company_name,
          document_enterprise,
          zip_code,
          address,
          number,
          complement,
          region,
          city,
          state,
          lat,
          long
        } = req.body;
        const result = yield UpdateEnterpriseService({
          user_id,
          enterprise_id,
          fantasy_name,
          company_name,
          document_enterprise,
          zip_code,
          address,
          number,
          complement,
          region,
          city,
          state,
          lat,
          long
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
  UsersController
});
