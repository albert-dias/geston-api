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

// src/schemas/order.schema.ts
var order_schema_exports = {};
__export(order_schema_exports, {
  createOrderSchema: () => createOrderSchema,
  updateOrderSchema: () => updateOrderSchema
});
module.exports = __toCommonJS(order_schema_exports);
var import_zod = require("zod");
var createOrderSchema = import_zod.z.object({
  car_license_plate: import_zod.z.string().min(7, "Placa deve ter no m\xEDnimo 7 caracteres").max(8, "Placa deve ter no m\xE1ximo 8 caracteres").regex(
    /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$|^[A-Z]{3}-?[0-9]{4}$/,
    "Formato de placa inv\xE1lido (use formato Mercosul ou antigo)"
  ).transform((val) => val.replace("-", "").toUpperCase()),
  document: import_zod.z.string().optional().refine(
    (val) => !val || /^\d{11}$/.test(val.replace(/\D/g, "")),
    "CPF deve ter 11 d\xEDgitos"
  ).transform((val) => val ? val.replace(/\D/g, "") : void 0),
  client_id: import_zod.z.string().uuid().optional(),
  payment_type: import_zod.z.enum(["PIX", "CREDITCARD", "MONEY"]).optional(),
  total_value: import_zod.z.number().int().positive("Valor total deve ser maior que zero").min(1, "Valor total deve ser pelo menos 1 centavo"),
  services: import_zod.z.array(
    import_zod.z.object({
      id: import_zod.z.string().uuid("ID do servi\xE7o inv\xE1lido"),
      value: import_zod.z.number().int().positive("Valor do servi\xE7o deve ser maior que zero"),
      quantity: import_zod.z.number().int().positive().default(1)
    })
  ).min(1, "Pelo menos um servi\xE7o deve ser selecionado")
});
var updateOrderSchema = import_zod.z.object({
  order_id: import_zod.z.string().uuid("ID do pedido inv\xE1lido"),
  payment_type: import_zod.z.enum(["PIX", "CREDITCARD", "MONEY"]).optional(),
  status: import_zod.z.enum(["INLINE", "COMPLETED", "CANCELED"])
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createOrderSchema,
  updateOrderSchema
});
