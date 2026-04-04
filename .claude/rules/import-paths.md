# Import Path Convention

Use `@/` alias (maps to `src/`) for imports. Choose the shorter path between absolute (`@/`) and relative (`../`):

- If relative path has 2+ levels of `../`, use `@/` absolute
- If relative path is same directory (`./`) or 1 level up (`../`), use relative
- Imports within the same domain folder (e.g., `header/atoms/` → `header/molecules/`) use relative
- Cross-domain imports (e.g., `header/` → `shared/`, `search/` → `stores/`) use `@/`

Examples:
- `../../shared/atoms/Button` → `@/app/components/shared/atoms/Button`
- `../../../stores/useUIStore` → `@/app/stores/useUIStore`
- `../../../lib/currency` → `@/app/lib/currency`
- `./ChevronIcon` → stays `./ChevronIcon` (same dir)
- `../molecules/SearchForm` → stays `../molecules/SearchForm` (same domain)
