"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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

// src/routes/index.ts
var routes_exports = {};
__export(routes_exports, {
  default: () => routes_default
});
module.exports = __toCommonJS(routes_exports);
var import_express11 = require("express");

// src/services/AuthenticateUserService.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));

// src/config/auth.ts
var auth_default = {
  jwt: { secret: "5ec1cb40c104642fe3301f5f9ae069c4", expiresIn: 60 * 60 * 24 },
  refreshToken: { duration: 1e3 * 60 * 60 * 24 * 30 }
};

// src/services/RefreshTokenUserService.ts
var import_node_crypto = __toESM(require("crypto"));

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

// src/services/RefreshTokenUserService.ts
function RefreshTokenUserService(_0) {
  return __async(this, arguments, function* ({
    user_id
  }) {
    if (!user_id) {
      throw new AppError("Id do usu\xE1rio ausente!");
    }
    yield prisma.tokens.deleteMany({
      where: { user_id, valid: true }
    });
    const refreshToken = `${user_id}${import_node_crypto.default.randomBytes(64).toString("hex")}`;
    const expires = new Date(Date.now() + auth_default.refreshToken.duration);
    yield prisma.tokens.create({
      data: {
        expires,
        token: refreshToken,
        user_id,
        valid: true
      }
    });
    return { refreshToken, expires };
  });
}

// src/services/AuthenticateUserService.ts
var import_bcryptjs = __toESM(require("bcryptjs"));
function AuthenticatedUserService(_0) {
  return __async(this, arguments, function* ({
    email,
    password
  }) {
    if (!email || !password) {
      throw new AppError("Dados incompletos");
    }
    const user = yield prisma.user.findFirst({
      where: { email },
      include: {
        enterprise: {
          include: {
            services_enterprise: true
          }
        }
      }
    });
    if (!user) {
      throw new AppError("Combina\xE7\xE3o email/senha incorretos");
    }
    const passwordMatched = yield import_bcryptjs.default.compare(password, user.password);
    if (!passwordMatched) {
      throw new AppError("Combina\xE7\xE3o email/senha incorretos");
    }
    let userWithEnterprise = user;
    if ((!user.enterprise || user.enterprise.length === 0) && user.enterprise_id) {
      const enterprise = yield prisma.enterprise.findUnique({
        where: { id: user.enterprise_id },
        include: {
          services_enterprise: true
        }
      });
      if (enterprise) {
        yield prisma.user.update({
          where: { id: user.id },
          data: {
            enterprise: {
              connect: { id: enterprise.id }
            }
          }
        });
        userWithEnterprise = __spreadProps(__spreadValues({}, user), {
          enterprise: [enterprise]
        });
      }
    }
    const { secret, expiresIn } = auth_default.jwt;
    const { refreshToken, expires: expiresRefreshToken } = yield RefreshTokenUserService({ user_id: userWithEnterprise.id });
    const token = import_jsonwebtoken.default.sign(
      { name: userWithEnterprise.name, email: userWithEnterprise.email, user_type: userWithEnterprise.user_type },
      secret,
      { subject: `${userWithEnterprise.id}`, expiresIn }
    );
    const _a = userWithEnterprise, { password: _ } = _a, userWithoutPassword = __objRest(_a, ["password"]);
    return { user: userWithoutPassword, token, refreshToken, expiresRefreshToken };
  });
}

// src/services/LogoutAllDevicesUserService.ts
function LogoutAllDevicesUserService(_0) {
  return __async(this, arguments, function* ({
    tokenValue
  }) {
    if (!tokenValue) {
      throw new AppError("Token ausente!");
    }
    const validToken = yield prisma.tokens.findUnique({
      where: { token: tokenValue }
    });
    if (!validToken) {
      throw new AppError("Token n\xE3o existe!");
    }
    yield prisma.tokens.updateMany({
      where: { user_id: validToken.user_id },
      data: { valid: false }
    });
    return;
  });
}

// src/services/ValidRefreshTokenUserService.ts
var import_node_crypto2 = __toESM(require("crypto"));
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));
function ValidRefreshTokenUserService(_0) {
  return __async(this, arguments, function* ({
    tokenValue
  }) {
    if (!tokenValue) {
      throw new AppError("Token ausente!");
    }
    const validToken = yield prisma.tokens.findUnique({
      where: { token: tokenValue }
    });
    if (!validToken) {
      throw new AppError("Token n\xE3o existe!");
    }
    if (validToken.valid && validToken.expires >= /* @__PURE__ */ new Date()) {
      yield prisma.tokens.update({
        where: { token: tokenValue },
        data: { valid: false }
      });
    }
    const refreshToken = `${validToken.user_id}${import_node_crypto2.default.randomBytes(64).toString("hex")}`;
    const expires = new Date(Date.now() + auth_default.refreshToken.duration);
    yield prisma.tokens.create({
      data: {
        expires,
        token: refreshToken,
        user_id: validToken.user_id,
        valid: true
      }
    });
    const user = yield prisma.user.findUnique({
      where: { id: validToken.user_id },
      include: {
        enterprise: {
          include: {
            services_enterprise: true
          }
        }
      }
    });
    if (!user) {
      throw new AppError("Usu\xE1rio inexistente!");
    }
    let userWithEnterprise = user;
    if ((!user.enterprise || user.enterprise.length === 0) && user.enterprise_id) {
      const enterprise = yield prisma.enterprise.findUnique({
        where: { id: user.enterprise_id },
        include: {
          services_enterprise: true
        }
      });
      if (enterprise) {
        yield prisma.user.update({
          where: { id: user.id },
          data: {
            enterprise: {
              connect: { id: enterprise.id }
            }
          }
        });
        userWithEnterprise = __spreadProps(__spreadValues({}, user), {
          enterprise: [enterprise]
        });
      }
    }
    const { secret, expiresIn } = auth_default.jwt;
    const token = import_jsonwebtoken2.default.sign(
      {
        name: userWithEnterprise.name,
        email: userWithEnterprise.email,
        user_type: userWithEnterprise.user_type
      },
      secret,
      {
        subject: `${userWithEnterprise.id}`,
        expiresIn
      }
    );
    return { refreshToken, expiresRefreshToken: expires, token, user: userWithEnterprise };
  });
}

// src/controllers/SessionsController.ts
var SessionsController = class {
  login(req, res) {
    return __async(this, null, function* () {
      try {
        const { email, password } = req.body;
        const { user, token, refreshToken, expiresRefreshToken } = yield AuthenticatedUserService({
          email,
          password
        });
        res.cookie("refreshToken", `${refreshToken}`, {
          expires: expiresRefreshToken,
          httpOnly: true
        });
        return res.status(200).json({ user, token, refresh_token: refreshToken });
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
  refresh_token(req, res) {
    return __async(this, null, function* () {
      try {
        const { refreshToken: tokenValue } = req.cookies;
        const { user, token, refreshToken, expiresRefreshToken } = yield ValidRefreshTokenUserService({
          tokenValue
        });
        res.cookie("refreshToken", `${refreshToken}`, {
          expires: expiresRefreshToken,
          httpOnly: true
        });
        return res.status(200).json({ user, token, refreshToken });
      } catch (err) {
        console.log("ERROR", err);
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
  logout_all(req, res) {
    return __async(this, null, function* () {
      try {
        const { refreshToken: tokenValue } = req.cookies;
        yield LogoutAllDevicesUserService({
          tokenValue
        });
        res.clearCookie("refreshToken");
        return res.status(200).json({ message: "logout all devices success" });
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

// src/routes/sessions.routes.ts
var import_express = require("express");
var sessionsController = new SessionsController();
var sessionsRouter = (0, import_express.Router)();
sessionsRouter.post("/", sessionsController.login);
sessionsRouter.post("/refreshtoken", sessionsController.refresh_token);
sessionsRouter.post("/logout-all", sessionsController.logout_all);

// src/routes/users.routes.ts
var import_express2 = require("express");

// src/middlewares/ensureAuthenticated.ts
var import_jsonwebtoken3 = __toESM(require("jsonwebtoken"));
function ensureAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new AppError("Token ausente", 401);
  }
  const [, token] = authHeader.split(" ");
  try {
    const decoded = import_jsonwebtoken3.default.verify(token, auth_default.jwt.secret);
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
var import_bcryptjs2 = __toESM(require("bcryptjs"));
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
    const hashedPassword = yield import_bcryptjs2.default.hash(password, 8);
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
var import_bcryptjs3 = __toESM(require("bcryptjs"));
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
    const passwordMatched = yield import_bcryptjs3.default.compare(old_password, user.password);
    if (!passwordMatched) {
      throw AppError.unauthorized("Senha atual incorreta");
    }
    const hashedPassword = yield import_bcryptjs3.default.hash(new_password, 8);
    yield prisma.user.update({
      where: { id: user_id },
      data: { password: hashedPassword }
    });
  });
}

// src/services/user/CancelUserAccountService.ts
var import_bcryptjs4 = __toESM(require("bcryptjs"));
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
    const passwordMatched = yield import_bcryptjs4.default.compare(password, user.password);
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

// src/routes/users.routes.ts
var usersRouter = (0, import_express2.Router)();
var usersController = new UsersController();
usersRouter.post("/create-account", usersController.create);
usersRouter.get(
  "/enterprises",
  ensureAuthenticate,
  usersController.listEnterprises
);
usersRouter.post(
  "/create-branch",
  ensureAuthenticate,
  usersController.createBranch
);
usersRouter.patch(
  "/enterprises/:enterprise_id/deactivate",
  ensureAuthenticate,
  usersController.deactivateBranch
);
usersRouter.patch(
  "/select-enterprise",
  ensureAuthenticate,
  usersController.selectBranch
);
usersRouter.put(
  "/profile",
  ensureAuthenticate,
  usersController.updateUser
);
usersRouter.patch(
  "/password",
  ensureAuthenticate,
  usersController.updatePassword
);
usersRouter.delete(
  "/account",
  ensureAuthenticate,
  usersController.cancelAccount
);
usersRouter.put(
  "/enterprises/:enterprise_id",
  ensureAuthenticate,
  usersController.updateEnterprise
);

// src/routes/services.routes.ts
var import_express3 = require("express");
var import_zod4 = require("zod");

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

// src/services/services/CreateServiceEnterpriseService.ts
function CreateServiceEnterpriseService(_0) {
  return __async(this, arguments, function* ({
    enterprise_id,
    name,
    value,
    stock_quantity = 0
  }) {
    if (!name || !enterprise_id || value == null) {
      throw new AppError("Dados incompletos");
    }
    const enterpriseExists = yield prisma.enterprise.findUnique({
      where: { id: enterprise_id }
    });
    if (!enterpriseExists) {
      throw new AppError("Empresa n\xE3o encontrada");
    }
    const result = yield prisma.servicesEnterprise.create({
      data: {
        enterprise: {
          connect: {
            id: enterprise_id
          }
        },
        name,
        value,
        stock_quantity: stock_quantity != null ? stock_quantity : 0
      }
    });
    if (!result) {
      throw new AppError("Erro ao criar servi\xE7o!");
    }
    cache.deletePattern(`services:${enterprise_id}*`);
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

// src/services/services/ListServicesEnterpriseService.ts
function ListServicesEnterpriseService(_0) {
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
      const cacheKey2 = CacheKeys.services(enterprise_id);
      const cached = cache.get(cacheKey2);
      if (cached) {
        return cached;
      }
    }
    const where = {
      enterprise_id
    };
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }
    const [total, data] = yield Promise.all([
      prisma.servicesEnterprise.count({ where }),
      prisma.servicesEnterprise.findMany({
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
      const cacheKey2 = CacheKeys.services(enterprise_id);
      cache.set(cacheKey2, result, 5 * 60 * 1e3);
    }
    return result;
  });
}

// src/services/services/UpdateServiceEnterpriseService.ts
function UpdateServiceEnterpriseService(_0) {
  return __async(this, arguments, function* ({
    enterprise_id,
    id,
    name,
    value,
    stock_quantity
  }) {
    if (!enterprise_id || !id) {
      throw new AppError("Dados incompletos");
    }
    const existingService = yield prisma.servicesEnterprise.findFirst({
      where: { id, enterprise_id }
    });
    if (!existingService) {
      throw new AppError("Servi\xE7o n\xE3o encontrado");
    }
    const updateData = {};
    if (name !== void 0) updateData.name = name;
    if (value !== void 0) updateData.value = value;
    if (stock_quantity !== void 0) updateData.stock_quantity = stock_quantity;
    if (Object.keys(updateData).length === 0) {
      throw new AppError("Nenhum campo para atualizar");
    }
    const result = yield prisma.servicesEnterprise.update({
      where: { id },
      data: updateData
    });
    if (!result) {
      throw new AppError("Erro ao atualizar servi\xE7o!");
    }
    cache.deletePattern(`services:${enterprise_id}*`);
    cache.delete(CacheKeys.service(enterprise_id, id));
    return result;
  });
}

// src/controllers/ServicesController.ts
var ServicesController = class {
  create(req, res) {
    return __async(this, null, function* () {
      try {
        const { enterprise_id } = req.params;
        const { name, value, stock_quantity } = req.body;
        const result = yield CreateServiceEnterpriseService({
          enterprise_id,
          name,
          value,
          stock_quantity
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
        const result = yield ListServicesEnterpriseService({
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
  update(req, res) {
    return __async(this, null, function* () {
      try {
        const { enterprise_id } = req.params;
        const { id, name, value, stock_quantity } = req.body;
        const result = yield UpdateServiceEnterpriseService({
          enterprise_id,
          id,
          name,
          value,
          stock_quantity
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

// src/schemas/service.schema.ts
var import_zod2 = require("zod");
var createServiceSchema = import_zod2.z.object({
  name: import_zod2.z.string().min(2, "Nome do servi\xE7o deve ter no m\xEDnimo 2 caracteres").max(255, "Nome do servi\xE7o deve ter no m\xE1ximo 255 caracteres").trim(),
  value: import_zod2.z.number().int().positive("Valor deve ser maior que zero").min(1, "Valor deve ser pelo menos 1 centavo"),
  stock_quantity: import_zod2.z.number().int().min(0).default(0).optional(),
  minimum_stock: import_zod2.z.number().int().min(0).optional()
});
var updateServiceSchema = import_zod2.z.object({
  id: import_zod2.z.string().uuid("ID do servi\xE7o inv\xE1lido"),
  name: import_zod2.z.string().min(2, "Nome do servi\xE7o deve ter no m\xEDnimo 2 caracteres").max(255, "Nome do servi\xE7o deve ter no m\xE1ximo 255 caracteres").trim().optional(),
  value: import_zod2.z.number().int().positive("Valor deve ser maior que zero").min(1, "Valor deve ser pelo menos 1 centavo").optional(),
  stock_quantity: import_zod2.z.number().int().min(0).optional(),
  minimum_stock: import_zod2.z.number().int().min(0).optional()
});

// src/schemas/pagination.schema.ts
var import_zod3 = require("zod");
var paginationQuerySchema = import_zod3.z.object({
  page: import_zod3.z.string().optional().transform((val) => val ? parseInt(val, 10) : void 0).pipe(import_zod3.z.number().int().positive().optional()),
  limit: import_zod3.z.string().optional().transform((val) => val ? parseInt(val, 10) : void 0).pipe(import_zod3.z.number().int().positive().max(100).optional())
});

// src/routes/services.routes.ts
var serviceRouter = (0, import_express3.Router)();
var serviceController = new ServicesController();
var enterpriseIdParamSchema = import_zod4.z.object({
  enterprise_id: import_zod4.z.string().uuid("ID da empresa inv\xE1lido")
});
var listServicesQuerySchema = paginationQuerySchema.extend({
  search: import_zod4.z.string().optional()
});
serviceRouter.post(
  "/:enterprise_id",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateBody(createServiceSchema),
  serviceController.create
);
serviceRouter.get(
  "/:enterprise_id",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateQuery(listServicesQuerySchema),
  serviceController.list
);
serviceRouter.put(
  "/:enterprise_id",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema),
  validateBody(updateServiceSchema),
  serviceController.update
);

// src/routes/clients.routes.ts
var import_express4 = require("express");
var import_zod6 = require("zod");

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

// src/schemas/client.schema.ts
var import_zod5 = require("zod");
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
var createClientSchema = import_zod5.z.object({
  name: import_zod5.z.string().min(2, "Nome deve ter no m\xEDnimo 2 caracteres").max(255, "Nome deve ter no m\xE1ximo 255 caracteres").trim(),
  document: import_zod5.z.string().optional().refine(
    (val) => !val || validateCPF(val),
    "CPF inv\xE1lido ou d\xEDgito verificador incorreto"
  ).transform((val) => val ? val.replace(/\D/g, "") : void 0),
  phone: import_zod5.z.string().min(10, "Telefone deve ter no m\xEDnimo 10 d\xEDgitos").max(11, "Telefone deve ter no m\xE1ximo 11 d\xEDgitos").regex(/^\d{10,11}$/, "Telefone deve conter apenas n\xFAmeros").transform((val) => val.replace(/\D/g, ""))
});
var updateClientSchema = import_zod5.z.object({
  id: import_zod5.z.string().uuid("ID do cliente inv\xE1lido"),
  name: import_zod5.z.string().min(2, "Nome deve ter no m\xEDnimo 2 caracteres").max(255, "Nome deve ter no m\xE1ximo 255 caracteres").trim().optional(),
  document: import_zod5.z.string().optional().refine(
    (val) => !val || validateCPF(val),
    "CPF inv\xE1lido ou d\xEDgito verificador incorreto"
  ).transform((val) => val ? val.replace(/\D/g, "") : void 0),
  phone: import_zod5.z.string().min(10, "Telefone deve ter no m\xEDnimo 10 d\xEDgitos").max(11, "Telefone deve ter no m\xE1ximo 11 d\xEDgitos").regex(/^\d{10,11}$/, "Telefone deve conter apenas n\xFAmeros").transform((val) => val.replace(/\D/g, "")).optional()
});

// src/routes/clients.routes.ts
var clientsRouter = (0, import_express4.Router)();
var clientsController = new ClientsController();
var enterpriseIdParamSchema2 = import_zod6.z.object({
  enterprise_id: import_zod6.z.string().uuid("ID da empresa inv\xE1lido")
});
var listClientsQuerySchema = paginationQuerySchema.extend({
  search: import_zod6.z.string().optional()
});
clientsRouter.post(
  "/:enterprise_id",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema2),
  validateBody(createClientSchema),
  clientsController.create
);
clientsRouter.get(
  "/:enterprise_id",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema2),
  validateQuery(listClientsQuerySchema),
  clientsController.list
);
clientsRouter.get(
  "/:enterprise_id/:id",
  ensureAuthenticate,
  validateParams(
    enterpriseIdParamSchema2.extend({
      id: import_zod6.z.string().uuid("ID do cliente inv\xE1lido")
    })
  ),
  clientsController.show
);
clientsRouter.put(
  "/:enterprise_id",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema2),
  validateBody(updateClientSchema),
  clientsController.update
);
clientsRouter.delete(
  "/:enterprise_id",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema2),
  validateBody(
    import_zod6.z.object({
      id: import_zod6.z.string().uuid("ID do cliente inv\xE1lido")
    })
  ),
  clientsController.delete
);

// src/routes/orders.routes.ts
var import_express5 = require("express");
var import_zod8 = require("zod");

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

// src/schemas/order.schema.ts
var import_zod7 = require("zod");
var createOrderSchema = import_zod7.z.object({
  car_license_plate: import_zod7.z.string().min(7, "Placa deve ter no m\xEDnimo 7 caracteres").max(8, "Placa deve ter no m\xE1ximo 8 caracteres").regex(
    /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$|^[A-Z]{3}-?[0-9]{4}$/,
    "Formato de placa inv\xE1lido (use formato Mercosul ou antigo)"
  ).transform((val) => val.replace("-", "").toUpperCase()),
  document: import_zod7.z.string().optional().refine(
    (val) => !val || /^\d{11}$/.test(val.replace(/\D/g, "")),
    "CPF deve ter 11 d\xEDgitos"
  ).transform((val) => val ? val.replace(/\D/g, "") : void 0),
  client_id: import_zod7.z.string().uuid().optional(),
  payment_type: import_zod7.z.enum(["PIX", "CREDITCARD", "MONEY"]).optional(),
  total_value: import_zod7.z.number().int().positive("Valor total deve ser maior que zero").min(1, "Valor total deve ser pelo menos 1 centavo"),
  services: import_zod7.z.array(
    import_zod7.z.object({
      id: import_zod7.z.string().uuid("ID do servi\xE7o inv\xE1lido"),
      value: import_zod7.z.number().int().positive("Valor do servi\xE7o deve ser maior que zero"),
      quantity: import_zod7.z.number().int().positive().default(1)
    })
  ).min(1, "Pelo menos um servi\xE7o deve ser selecionado")
});
var updateOrderSchema = import_zod7.z.object({
  order_id: import_zod7.z.string().uuid("ID do pedido inv\xE1lido"),
  payment_type: import_zod7.z.enum(["PIX", "CREDITCARD", "MONEY"]).optional(),
  status: import_zod7.z.enum(["INLINE", "COMPLETED", "CANCELED"])
});

// src/routes/orders.routes.ts
var ordersRouter = (0, import_express5.Router)();
var ordersController = new OrdersController();
var enterpriseIdParamSchema3 = import_zod8.z.object({
  enterprise_id: import_zod8.z.string().uuid("ID da empresa inv\xE1lido")
});
var listOrdersQuerySchema = import_zod8.z.object({
  year: import_zod8.z.string().transform((val) => parseInt(val, 10)).pipe(import_zod8.z.number().int().min(2e3).max(3e3)),
  month: import_zod8.z.string().transform((val) => parseInt(val, 10)).pipe(import_zod8.z.number().int().min(1).max(12)),
  day: import_zod8.z.string().optional().transform((val) => val ? parseInt(val, 10) : void 0).pipe(import_zod8.z.number().int().min(1).max(31).optional())
});
ordersRouter.post(
  "/:enterprise_id",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema3),
  validateBody(createOrderSchema),
  ordersController.create
);
ordersRouter.get(
  "/:enterprise_id",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema3),
  validateQuery(listOrdersQuerySchema),
  ordersController.list
);
ordersRouter.get(
  "/:enterprise_id/dash",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema3),
  validateQuery(listOrdersQuerySchema),
  ordersController.dash
);
ordersRouter.put(
  "/:enterprise_id",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema3),
  validateBody(updateOrderSchema),
  ordersController.update
);

// src/routes/appointments.routes.ts
var import_express6 = require("express");

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

// src/routes/appointments.routes.ts
var import_zod10 = require("zod");

// src/schemas/appointment.schema.ts
var import_zod9 = require("zod");
var createAppointmentSchema = import_zod9.z.object({
  car_license_plate: import_zod9.z.string().min(7, "Placa deve ter no m\xEDnimo 7 caracteres").max(8, "Placa deve ter no m\xE1ximo 8 caracteres").regex(
    /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$|^[A-Z]{3}-?[0-9]{4}$/,
    "Formato de placa inv\xE1lido (use formato Mercosul ou antigo)"
  ).transform((val) => val.replace("-", "").toUpperCase()),
  scheduled_date: import_zod9.z.string().datetime("Data inv\xE1lida").transform((val) => new Date(val)),
  document: import_zod9.z.string().optional().refine(
    (val) => !val || /^\d{11}$/.test(val.replace(/\D/g, "")),
    "CPF deve ter 11 d\xEDgitos"
  ).transform((val) => val ? val.replace(/\D/g, "") : void 0),
  client_id: import_zod9.z.string().uuid().optional(),
  service_ids: import_zod9.z.array(import_zod9.z.string().uuid("ID do servi\xE7o inv\xE1lido")).min(1, "Pelo menos um servi\xE7o deve ser selecionado"),
  notes: import_zod9.z.string().optional()
});
var updateAppointmentSchema = import_zod9.z.object({
  id: import_zod9.z.string().uuid("ID do agendamento inv\xE1lido"),
  scheduled_date: import_zod9.z.string().datetime("Data inv\xE1lida").transform((val) => new Date(val)).optional(),
  status: import_zod9.z.enum(["SCHEDULED", "CANCELED", "COMPLETED"]).optional(),
  notes: import_zod9.z.string().optional(),
  service_ids: import_zod9.z.array(import_zod9.z.string().uuid()).optional()
});

// src/routes/appointments.routes.ts
var appointmentsRouter = (0, import_express6.Router)();
var appointmentsController = new AppointmentsController();
var enterpriseIdParamSchema4 = import_zod10.z.object({
  enterprise_id: import_zod10.z.string().uuid("ID da empresa inv\xE1lido")
});
var listAppointmentsQuerySchema = paginationQuerySchema.extend({
  start_date: import_zod10.z.string().datetime().optional(),
  end_date: import_zod10.z.string().datetime().optional(),
  status: import_zod10.z.enum(["SCHEDULED", "CANCELED", "COMPLETED"]).optional(),
  car_license_plate: import_zod10.z.string().optional()
});
appointmentsRouter.post(
  "/:enterprise_id",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema4),
  validateBody(createAppointmentSchema),
  appointmentsController.create
);
appointmentsRouter.get(
  "/:enterprise_id",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema4),
  validateQuery(listAppointmentsQuerySchema),
  appointmentsController.list
);
appointmentsRouter.put(
  "/:enterprise_id",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema4),
  validateBody(updateAppointmentSchema),
  appointmentsController.update
);

// src/routes/employees.routes.ts
var import_express7 = require("express");

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

// src/routes/employees.routes.ts
var import_zod12 = require("zod");

// src/schemas/employee.schema.ts
var import_zod11 = require("zod");
var createEmployeeSchema = import_zod11.z.object({
  name: import_zod11.z.string().min(2, "Nome deve ter no m\xEDnimo 2 caracteres").max(255, "Nome deve ter no m\xE1ximo 255 caracteres").trim(),
  document: import_zod11.z.string().regex(/^\d{11}$/, "CPF deve ter 11 d\xEDgitos").transform((val) => val.replace(/\D/g, "")),
  phone: import_zod11.z.string().min(10, "Telefone deve ter no m\xEDnimo 10 d\xEDgitos").max(11, "Telefone deve ter no m\xE1ximo 11 d\xEDgitos").regex(/^\d{10,11}$/, "Telefone deve conter apenas n\xFAmeros").transform((val) => val.replace(/\D/g, "")),
  email: import_zod11.z.string().email("Email inv\xE1lido").optional().or(import_zod11.z.literal("")),
  role: import_zod11.z.enum(["LAVADOR", "ATENDENTE", "GERENTE"]).default("LAVADOR"),
  commission_rate: import_zod11.z.number().min(0, "Taxa de comiss\xE3o deve ser maior ou igual a 0").max(1, "Taxa de comiss\xE3o deve ser menor ou igual a 1").optional()
});
var updateEmployeeSchema = import_zod11.z.object({
  id: import_zod11.z.string().uuid("ID do funcion\xE1rio inv\xE1lido"),
  name: import_zod11.z.string().min(2, "Nome deve ter no m\xEDnimo 2 caracteres").max(255, "Nome deve ter no m\xE1ximo 255 caracteres").trim().optional(),
  document: import_zod11.z.string().regex(/^\d{11}$/, "CPF deve ter 11 d\xEDgitos").transform((val) => val.replace(/\D/g, "")).optional(),
  phone: import_zod11.z.string().min(10, "Telefone deve ter no m\xEDnimo 10 d\xEDgitos").max(11, "Telefone deve ter no m\xE1ximo 11 d\xEDgitos").regex(/^\d{10,11}$/, "Telefone deve conter apenas n\xFAmeros").transform((val) => val.replace(/\D/g, "")).optional(),
  email: import_zod11.z.string().email("Email inv\xE1lido").optional().or(import_zod11.z.literal("")),
  role: import_zod11.z.enum(["LAVADOR", "ATENDENTE", "GERENTE"]).optional(),
  commission_rate: import_zod11.z.number().min(0).max(1).optional(),
  status: import_zod11.z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]).optional()
});

// src/routes/employees.routes.ts
var employeesRouter = (0, import_express7.Router)();
var employeesController = new EmployeesController();
var enterpriseIdParamSchema5 = import_zod12.z.object({
  enterprise_id: import_zod12.z.string().uuid("ID da empresa inv\xE1lido")
});
var listEmployeesQuerySchema = paginationQuerySchema.extend({
  status: import_zod12.z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]).optional(),
  role: import_zod12.z.enum(["LAVADOR", "ATENDENTE", "GERENTE"]).optional(),
  search: import_zod12.z.string().optional()
});
employeesRouter.post(
  "/:enterprise_id",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema5),
  validateBody(createEmployeeSchema),
  employeesController.create
);
employeesRouter.get(
  "/:enterprise_id",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema5),
  validateQuery(listEmployeesQuerySchema),
  employeesController.list
);
employeesRouter.put(
  "/:enterprise_id",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema5),
  validateBody(updateEmployeeSchema),
  employeesController.update
);

// src/routes/vehicle-history.routes.ts
var import_express8 = require("express");

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

// src/routes/vehicle-history.routes.ts
var import_zod13 = require("zod");
var vehicleHistoryRouter = (0, import_express8.Router)();
var vehicleHistoryController = new VehicleHistoryController();
var getHistoryParamsSchema = import_zod13.z.object({
  enterprise_id: import_zod13.z.string().uuid("ID da empresa inv\xE1lido"),
  car_license_plate: import_zod13.z.string().min(7).max(8)
});
var getHistoryQuerySchema = paginationQuerySchema.extend({
  start_date: import_zod13.z.string().datetime().optional(),
  end_date: import_zod13.z.string().datetime().optional()
});
vehicleHistoryRouter.get(
  "/:enterprise_id/:car_license_plate",
  ensureAuthenticate,
  validateParams(getHistoryParamsSchema),
  validateQuery(getHistoryQuerySchema),
  vehicleHistoryController.getHistory
);

// src/routes/cash-movements.routes.ts
var import_express9 = require("express");

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

// src/routes/cash-movements.routes.ts
var import_zod15 = require("zod");

// src/schemas/cash-movement.schema.ts
var import_zod14 = require("zod");
var createCashMovementSchema = import_zod14.z.object({
  type: import_zod14.z.enum(["ENTRY", "EXIT"]),
  amount: import_zod14.z.number().int().positive("Valor deve ser maior que zero").min(1, "Valor deve ser pelo menos 1 centavo"),
  description: import_zod14.z.string().min(3, "Descri\xE7\xE3o deve ter no m\xEDnimo 3 caracteres").max(255, "Descri\xE7\xE3o deve ter no m\xE1ximo 255 caracteres").trim(),
  order_id: import_zod14.z.string().uuid("ID do pedido inv\xE1lido").optional(),
  employee_id: import_zod14.z.string().uuid("ID do funcion\xE1rio inv\xE1lido").optional()
});

// src/routes/cash-movements.routes.ts
var cashMovementsRouter = (0, import_express9.Router)();
var cashMovementsController = new CashMovementsController();
var enterpriseIdParamSchema6 = import_zod15.z.object({
  enterprise_id: import_zod15.z.string().uuid("ID da empresa inv\xE1lido")
});
var getSummaryQuerySchema = import_zod15.z.object({
  start_date: import_zod15.z.string().datetime("Data inicial inv\xE1lida"),
  end_date: import_zod15.z.string().datetime("Data final inv\xE1lida")
});
cashMovementsRouter.post(
  "/:enterprise_id",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema6),
  validateBody(createCashMovementSchema),
  cashMovementsController.create
);
cashMovementsRouter.get(
  "/:enterprise_id/summary",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema6),
  validateQuery(getSummaryQuerySchema),
  cashMovementsController.getSummary
);

// src/routes/loyalty.routes.ts
var import_express10 = require("express");
var import_zod17 = require("zod");

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
var import_zod16 = require("zod");
var createLoyaltyProgramSchema = import_zod16.z.object({
  points_per_order: import_zod16.z.number().int().positive("Pontos por pedido devem ser maiores que zero").default(1),
  discount_per_point: import_zod16.z.number().positive("Desconto por ponto deve ser maior que zero").default(0.01).describe("Desconto em percentual por ponto (ex: 0.01 = 0.01%)")
});
var updateLoyaltyProgramSchema = import_zod16.z.object({
  points_per_order: import_zod16.z.number().int().positive().optional(),
  discount_per_point: import_zod16.z.number().positive().optional(),
  active: import_zod16.z.boolean().optional()
});

// src/routes/loyalty.routes.ts
var loyaltyRouter = (0, import_express10.Router)();
var loyaltyController = new LoyaltyController();
var enterpriseIdParamSchema7 = import_zod17.z.object({
  enterprise_id: import_zod17.z.string().uuid("ID da empresa inv\xE1lido")
});
loyaltyRouter.post(
  "/:enterprise_id",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema7),
  validateBody(createLoyaltyProgramSchema),
  loyaltyController.create
);
loyaltyRouter.get(
  "/:enterprise_id",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema7),
  loyaltyController.show
);
loyaltyRouter.put(
  "/:enterprise_id",
  ensureAuthenticate,
  validateParams(enterpriseIdParamSchema7),
  validateBody(updateLoyaltyProgramSchema),
  loyaltyController.update
);

// src/routes/index.ts
var routes = (0, import_express11.Router)();
routes.get("/", (req, res) => {
  res.json({ message: "Bem vindo a api do Gest-ON!" });
});
routes.use("/sessions", sessionsRouter);
routes.use("/user", usersRouter);
routes.use("/services", serviceRouter);
routes.use("/clients", clientsRouter);
routes.use("/orders", ordersRouter);
routes.use("/appointments", appointmentsRouter);
routes.use("/employees", employeesRouter);
routes.use("/vehicle-history", vehicleHistoryRouter);
routes.use("/cash-movements", cashMovementsRouter);
routes.use("/loyalty", loyaltyRouter);
var routes_default = routes;
