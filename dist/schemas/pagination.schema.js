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

// src/schemas/pagination.schema.ts
var pagination_schema_exports = {};
__export(pagination_schema_exports, {
  paginationQuerySchema: () => paginationQuerySchema
});
module.exports = __toCommonJS(pagination_schema_exports);
var import_zod = require("zod");
var paginationQuerySchema = import_zod.z.object({
  page: import_zod.z.string().optional().transform((val) => val ? parseInt(val, 10) : void 0).pipe(import_zod.z.number().int().positive().optional()),
  limit: import_zod.z.string().optional().transform((val) => val ? parseInt(val, 10) : void 0).pipe(import_zod.z.number().int().positive().max(100).optional())
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  paginationQuerySchema
});
