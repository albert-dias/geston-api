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

// src/lib/cache.ts
var cache_exports = {};
__export(cache_exports, {
  CacheKeys: () => CacheKeys,
  cache: () => cache,
  cacheKey: () => cacheKey
});
module.exports = __toCommonJS(cache_exports);
var MemoryCache = class {
  constructor() {
    this.cache = /* @__PURE__ */ new Map();
  }
  set(key, data, ttl = 5 * 60 * 1e3) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  get(key) {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }
    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }
  delete(key) {
    this.cache.delete(key);
  }
  deletePattern(pattern) {
    const regex = new RegExp(`^${pattern.replace("*", ".*")}`);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
  clear() {
    this.cache.clear();
  }
  // Limpar itens expirados periodicamente (opcional)
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
};
var cache = new MemoryCache();
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    cache.cleanup();
  }, 10 * 60 * 1e3);
}
function cacheKey(prefix, ...parts) {
  return `${prefix}:${parts.join(":")}`;
}
var CacheKeys = {
  services: (enterpriseId) => cacheKey("services", enterpriseId),
  service: (enterpriseId, serviceId) => cacheKey("service", enterpriseId, serviceId),
  clients: (enterpriseId, page, limit, search) => cacheKey("clients", enterpriseId, page || 1, limit || 20, search || ""),
  client: (enterpriseId, clientId) => cacheKey("client", enterpriseId, clientId)
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CacheKeys,
  cache,
  cacheKey
});
