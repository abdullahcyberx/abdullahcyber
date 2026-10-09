import { serveGame } from '../../_lucky/core.js';
export function onRequestGet(context) { return serveGame(context); }
