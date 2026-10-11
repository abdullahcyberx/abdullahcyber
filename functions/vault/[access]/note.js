import { serveNote } from '../../_ciphergate/core.js';
export function onRequestGet(ctx) { return serveNote(ctx); }
