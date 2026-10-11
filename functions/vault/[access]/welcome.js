import { serveWelcome } from '../../_ciphergate/core.js';
export function onRequestGet(ctx) { return serveWelcome(ctx); }
