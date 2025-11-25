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

// src/routes/sessions.routes.ts
var sessions_routes_exports = {};
__export(sessions_routes_exports, {
  sessionsRouter: () => sessionsRouter
});
module.exports = __toCommonJS(sessions_routes_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  sessionsRouter
});
