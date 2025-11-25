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

// src/schemas/loyalty.schema.ts
var loyalty_schema_exports = {};
__export(loyalty_schema_exports, {
  createLoyaltyProgramSchema: () => createLoyaltyProgramSchema,
  updateLoyaltyProgramSchema: () => updateLoyaltyProgramSchema
});
module.exports = __toCommonJS(loyalty_schema_exports);
var import_zod = require("zod");
var createLoyaltyProgramSchema = import_zod.z.object({
  points_per_order: import_zod.z.number().int().positive("Pontos por pedido devem ser maiores que zero").default(1),
  discount_per_point: import_zod.z.number().positive("Desconto por ponto deve ser maior que zero").default(0.01).describe("Desconto em percentual por ponto (ex: 0.01 = 0.01%)")
});
var updateLoyaltyProgramSchema = import_zod.z.object({
  points_per_order: import_zod.z.number().int().positive().optional(),
  discount_per_point: import_zod.z.number().positive().optional(),
  active: import_zod.z.boolean().optional()
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createLoyaltyProgramSchema,
  updateLoyaltyProgramSchema
});
