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

// src/services/orders/GetOrdersSummaryByDateService.ts
var GetOrdersSummaryByDateService_exports = {};
__export(GetOrdersSummaryByDateService_exports, {
  GetOrdersSummaryByDateService: () => GetOrdersSummaryByDateService
});
module.exports = __toCommonJS(GetOrdersSummaryByDateService_exports);

// src/lib/prisma.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient({
  log: ["query"]
});

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GetOrdersSummaryByDateService
});
