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

// src/schemas/client.schema.ts
var client_schema_exports = {};
__export(client_schema_exports, {
  createClientSchema: () => createClientSchema,
  updateClientSchema: () => updateClientSchema
});
module.exports = __toCommonJS(client_schema_exports);
var import_zod = require("zod");
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
var createClientSchema = import_zod.z.object({
  name: import_zod.z.string().min(2, "Nome deve ter no m\xEDnimo 2 caracteres").max(255, "Nome deve ter no m\xE1ximo 255 caracteres").trim(),
  document: import_zod.z.string().optional().refine(
    (val) => !val || validateCPF(val),
    "CPF inv\xE1lido ou d\xEDgito verificador incorreto"
  ).transform((val) => val ? val.replace(/\D/g, "") : void 0),
  phone: import_zod.z.string().min(10, "Telefone deve ter no m\xEDnimo 10 d\xEDgitos").max(11, "Telefone deve ter no m\xE1ximo 11 d\xEDgitos").regex(/^\d{10,11}$/, "Telefone deve conter apenas n\xFAmeros").transform((val) => val.replace(/\D/g, ""))
});
var updateClientSchema = import_zod.z.object({
  id: import_zod.z.string().uuid("ID do cliente inv\xE1lido"),
  name: import_zod.z.string().min(2, "Nome deve ter no m\xEDnimo 2 caracteres").max(255, "Nome deve ter no m\xE1ximo 255 caracteres").trim().optional(),
  document: import_zod.z.string().optional().refine(
    (val) => !val || validateCPF(val),
    "CPF inv\xE1lido ou d\xEDgito verificador incorreto"
  ).transform((val) => val ? val.replace(/\D/g, "") : void 0),
  phone: import_zod.z.string().min(10, "Telefone deve ter no m\xEDnimo 10 d\xEDgitos").max(11, "Telefone deve ter no m\xE1ximo 11 d\xEDgitos").regex(/^\d{10,11}$/, "Telefone deve conter apenas n\xFAmeros").transform((val) => val.replace(/\D/g, "")).optional()
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createClientSchema,
  updateClientSchema
});
