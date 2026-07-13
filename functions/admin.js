import { protectAdmin } from './_lib/access-gate.js';

export const onRequest = protectAdmin;
