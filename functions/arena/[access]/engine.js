import { serveClient } from '../../_headshot/core.js';
export function onRequestGet(ctx) { return serveClient(ctx); }
