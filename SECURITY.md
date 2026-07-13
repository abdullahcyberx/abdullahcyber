# Security Strategy

The portfolio utilizes multiple security layers to protect the integrity of the content and the site visitors.

1. **Local Static Rendering**: There is no live server, database, or API parsing user inputs. The JSON content is rendered into pure HTML/CSS/JS locally via the `npm run render` script, effectively neutralizing database injection vectors.
2. **Strict Sanitization**: All content ingested from JSON is escaped before insertion into the HTML output. Characters like `<`, `>`, `&`, `"`, and `'` are safely converted to entities.
3. **Payload Escaping**: Shehzada's AI knowledge payload is safely serialized to prevent closing `<script>` injection attacks.
4. **Build-time Validation**: `npm run security` and `npm run validate` ensure no inline event handlers, `javascript:` URLs, or path traversal vectors (`../`) make their way into the build from the JSON.
5. **No Public Admin Area**: The `local-tools` editor is strictly excluded from the `dist` build, preventing attackers from accessing a CMS frontend.
6. **Secret Scanning**: The `npm run scan:secrets` script ensures sensitive tokens are never committed.
