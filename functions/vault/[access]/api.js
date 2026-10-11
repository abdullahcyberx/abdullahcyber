import { checkLogin } from '../../_ciphergate/core.js';
export function onRequestPost(ctx) { return checkLogin(ctx); }
