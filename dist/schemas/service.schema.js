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

// src/schemas/service.schema.ts
var service_schema_exports = {};
__export(service_schema_exports, {
  createServiceSchema: () => createServiceSchema,
  updateServiceSchema: () => updateServiceSchema
});
module.exports = __toCommonJS(service_schema_exports);
var import_zod = require("zod");
var createServiceSchema = import_zod.z.object({
  name: import_zod.z.string().min(2, "Nome do servi\xE7o deve ter no m\xEDnimo 2 caracteres").max(255, "Nome do servi\xE7o deve ter no m\xE1ximo 255 caracteres").trim(),
  value: import_zod.z.number().int().positive("Valor deve ser maior que zero").min(1, "Valor deve ser pelo menos 1 centavo"),
  stock_quantity: import_zod.z.number().int().min(0).default(0).optional(),
  minimum_stock: import_zod.z.number().int().min(0).optional()
});
var updateServiceSchema = import_zod.z.object({
  id: import_zod.z.string().uuid("ID do servi\xE7o inv\xE1lido"),
  name: import_zod.z.string().min(2, "Nome do servi\xE7o deve ter no m\xEDnimo 2 caracteres").max(255, "Nome do servi\xE7o deve ter no m\xE1ximo 255 caracteres").trim().optional(),
  value: import_zod.z.number().int().positive("Valor deve ser maior que zero").min(1, "Valor deve ser pelo menos 1 centavo").optional(),
  stock_quantity: import_zod.z.number().int().min(0).optional(),
  minimum_stock: import_zod.z.number().int().min(0).optional()
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createServiceSchema,
  updateServiceSchema
});
