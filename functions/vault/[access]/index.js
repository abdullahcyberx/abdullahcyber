import { serveLogin } from '../../_ciphergate/core.js';
export function onRequestGet(ctx) { return serveLogin(ctx); }
