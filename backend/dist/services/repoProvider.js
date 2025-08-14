"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.repo = void 0;
const postgresRepo_1 = require("./postgresRepo");
// PostgreSQL — основной источник данных.
// Google Sheets используем отдельно (read-only/export) через services/sheets.ts при необходимости.
exports.repo = postgresRepo_1.pgRepo;
