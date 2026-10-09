import { serveGame } from '../../_headshot/core.js';
export function onRequestGet(ctx) { return serveGame(ctx); }
