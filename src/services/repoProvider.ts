import { IDataRepo } from './repo';
import { pgRepo } from './postgresRepo';

// PostgreSQL — основной источник данных.
// Google Sheets используем отдельно (read-only/export) через services/sheets.ts при необходимости.
export const repo: IDataRepo = pgRepo;
