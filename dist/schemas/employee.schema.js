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

// src/schemas/employee.schema.ts
var employee_schema_exports = {};
__export(employee_schema_exports, {
  createEmployeeSchema: () => createEmployeeSchema,
  updateEmployeeSchema: () => updateEmployeeSchema
});
module.exports = __toCommonJS(employee_schema_exports);
var import_zod = require("zod");
var createEmployeeSchema = import_zod.z.object({
  name: import_zod.z.string().min(2, "Nome deve ter no m\xEDnimo 2 caracteres").max(255, "Nome deve ter no m\xE1ximo 255 caracteres").trim(),
  document: import_zod.z.string().regex(/^\d{11}$/, "CPF deve ter 11 d\xEDgitos").transform((val) => val.replace(/\D/g, "")),
  phone: import_zod.z.string().min(10, "Telefone deve ter no m\xEDnimo 10 d\xEDgitos").max(11, "Telefone deve ter no m\xE1ximo 11 d\xEDgitos").regex(/^\d{10,11}$/, "Telefone deve conter apenas n\xFAmeros").transform((val) => val.replace(/\D/g, "")),
  email: import_zod.z.string().email("Email inv\xE1lido").optional().or(import_zod.z.literal("")),
  role: import_zod.z.enum(["LAVADOR", "ATENDENTE", "GERENTE"]).default("LAVADOR"),
  commission_rate: import_zod.z.number().min(0, "Taxa de comiss\xE3o deve ser maior ou igual a 0").max(1, "Taxa de comiss\xE3o deve ser menor ou igual a 1").optional()
});
var updateEmployeeSchema = import_zod.z.object({
  id: import_zod.z.string().uuid("ID do funcion\xE1rio inv\xE1lido"),
  name: import_zod.z.string().min(2, "Nome deve ter no m\xEDnimo 2 caracteres").max(255, "Nome deve ter no m\xE1ximo 255 caracteres").trim().optional(),
  document: import_zod.z.string().regex(/^\d{11}$/, "CPF deve ter 11 d\xEDgitos").transform((val) => val.replace(/\D/g, "")).optional(),
  phone: import_zod.z.string().min(10, "Telefone deve ter no m\xEDnimo 10 d\xEDgitos").max(11, "Telefone deve ter no m\xE1ximo 11 d\xEDgitos").regex(/^\d{10,11}$/, "Telefone deve conter apenas n\xFAmeros").transform((val) => val.replace(/\D/g, "")).optional(),
  email: import_zod.z.string().email("Email inv\xE1lido").optional().or(import_zod.z.literal("")),
  role: import_zod.z.enum(["LAVADOR", "ATENDENTE", "GERENTE"]).optional(),
  commission_rate: import_zod.z.number().min(0).max(1).optional(),
  status: import_zod.z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]).optional()
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createEmployeeSchema,
  updateEmployeeSchema
});
