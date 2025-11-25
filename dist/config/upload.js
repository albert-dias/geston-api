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

// src/config/upload.ts
var upload_exports = {};
__export(upload_exports, {
  default: () => upload_default
});
module.exports = __toCommonJS(upload_exports);
var import_client_s3 = require("@aws-sdk/client-s3");
var import_crypto = __toESM(require("crypto"));
var import_multer = __toESM(require("multer"));
var import_multer_s3 = __toESM(require("multer-s3"));
var import_path = __toESM(require("path"));

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

// src/config/upload.ts
var tmpFolder = import_path.default.resolve("..", "..", "tmp");
var s3 = new import_client_s3.S3Client({
  region: process.env.AWS_DEFAULT_REGION,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID
  }
});
var storgeTypes = {
  local: import_multer.default.diskStorage({
    destination: tmpFolder,
    filename(req, file, cb) {
      const fileHash = import_crypto.default.randomBytes(10).toString("hex");
      const fileName = `${fileHash}-${file.originalname}`;
      return cb(null, fileName);
    }
  }),
  s3: (0, import_multer_s3.default)({
    s3,
    bucket: "yazonfiles",
    contentType: import_multer_s3.default.AUTO_CONTENT_TYPE,
    acl: "public-read",
    key: (req, file, cb) => {
      const fileHash = import_crypto.default.randomBytes(10).toString("hex");
      const fileName = `${fileHash}-${file.originalname}`;
      return cb(null, fileName);
    }
  })
};
var upload_default = {
  directory: tmpFolder,
  storage: storgeTypes.s3,
  limits: {
    fileSize: 12 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/pjpeg",
      "image/png",
      "image/gif"
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError("Tipo de arquivo inv\xE1lido."), false);
    }
  }
};
