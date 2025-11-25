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

// src/schemas/cash-movement.schema.ts
var cash_movement_schema_exports = {};
__export(cash_movement_schema_exports, {
  createCashMovementSchema: () => createCashMovementSchema
});
module.exports = __toCommonJS(cash_movement_schema_exports);
var import_zod = require("zod");
var createCashMovementSchema = import_zod.z.object({
  type: import_zod.z.enum(["ENTRY", "EXIT"]),
  amount: import_zod.z.number().int().positive("Valor deve ser maior que zero").min(1, "Valor deve ser pelo menos 1 centavo"),
  description: import_zod.z.string().min(3, "Descri\xE7\xE3o deve ter no m\xEDnimo 3 caracteres").max(255, "Descri\xE7\xE3o deve ter no m\xE1ximo 255 caracteres").trim(),
  order_id: import_zod.z.string().uuid("ID do pedido inv\xE1lido").optional(),
  employee_id: import_zod.z.string().uuid("ID do funcion\xE1rio inv\xE1lido").optional()
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createCashMovementSchema
});
