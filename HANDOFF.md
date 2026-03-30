# HRIS — Developer Handoff

**Date:** 2026-03-30
**Branch:** `main`
**Last commit:** `bfa58fd` — Sidebar accordion + auto-expand on click

---

## What this project is

A full-featured HR Information System built on **Laravel 12 + React 19 + Inertia.js**.
Hosted locally via XAMPP. Frontend assets served by Vite on port `5173`.

---

## How to run locally

```bash
# Terminal 1 — Vite dev server (required for React/CSS hot reload)
cd /Applications/XAMPP/xamppfiles/htdocs/hris
npm run dev

# Terminal 2 — Queue worker (for notifications, jobs)
php artisan queue:listen --tries=1
```

XAMPP handles PHP/MySQL. Do **not** use `php artisan serve` — it conflicts with XAMPP.
Access the app at: `http://localhost/hris/public`

---

## Recent changes (this session)

### 1. Sidebar collapsed by default
**File:** `resources/js/components/app-shell.tsx:14`

Changed the localStorage default so new users start with the sidebar folded.

```diff
- localStorage.getItem('sidebar') !== 'false' : true
+ localStorage.getItem('sidebar') === 'true' : false
```

Users who have previously opened the sidebar retain their state via `localStorage['sidebar']`.

---

### 2. Logout confirmation dialog
**Files:**
- `resources/js/components/user-menu-content.tsx`
- `resources/js/components/profile-menu.tsx`

Both logout entry points now show a Dialog before proceeding:
> "Are you sure you want to logout?"

Uses the existing `Dialog` UI component (`resources/js/components/ui/dialog.tsx`).
Cancel dismisses; **Log out** (destructive) calls `router.post(route('logout'))`.

---

### 3. Sidebar accordion — one item open at a time
**File:** `resources/js/components/nav-main.tsx`

`toggleExpand` now accepts `siblingKeys: string[]`. When a parent item is opened, all siblings at the same level are closed first. Works at both the top level and nested sub-menus.

Top-level sibling keys are computed once before the render:
```ts
const topLevelSiblingKeys = items.filter(i => i.children).map(i => i.title);
```

Nested sibling keys are computed inside `renderSubMenu` per level:
```ts
const siblingKeys = children.filter(c => c.children).map(c => `${level}-${c.title}`);
```

---

### 4. Sidebar auto-expands when collapsed and an item is clicked
**File:** `resources/js/components/nav-main.tsx`

When the sidebar is in icon/collapsed state, clicking any parent nav item now calls `expandSidebar()` which calls `setOpen(true)` (desktop) or `setOpenMobile(true)` (mobile) before toggling the submenu open.

---

### 5. Agents folder (git-ignored)
**Files:** `agents/assign_workers.php`, `agents/agents.md`

Standalone PHP scripts that bootstrap Laravel and operate on the DB directly.
Not committed. See `agents/agents.md` for usage.

---

## Pending / known issues

| # | Issue | Notes |
|---|-------|-------|
| 1 | `package-lock.json` has uncommitted changes | Regenerated during `npm install`; safe to commit separately |
| 2 | `nav-main.tsx` has uncommitted changes | Auto-expand sidebar feature — commit when ready |
| 3 | Sidebar accordion doesn't close active item's parent on page navigation | Active item always stays open via `useEffect`; by design |

---

## Key files to know

| File | Purpose |
|------|---------|
| `resources/js/components/app-shell.tsx` | Sidebar open/collapsed default + `SidebarProvider` wrapper |
| `resources/js/components/nav-main.tsx` | Sidebar nav tree — accordion logic, auto-expand, active state |
| `resources/js/components/app-sidebar.tsx` | Nav item definitions (permissions-filtered) |
| `resources/js/components/user-menu-content.tsx` | Sidebar bottom user menu + logout dialog |
| `resources/js/components/profile-menu.tsx` | Header profile dropdown + logout dialog |
| `resources/js/components/ui/sidebar.tsx` | Base sidebar primitives (`useSidebar`, `SidebarProvider`) |
| `resources/js/contexts/SidebarContext.tsx` | Sidebar variant/style/collapsible settings |
| `app/Models/Employee.php` | Core employee model |
| `routes/web.php` | All HTTP routes |
| `config/role-permissions.php` | Permission slug definitions |

---

## Architecture notes

- **Permissions** are passed via Inertia shared props (`auth.permissions[]`) and checked client-side with `hasPermission()` in `utils/authorization.ts`.
- **Sidebar state** has two layers: open/closed in `localStorage['sidebar']` (app-shell), and cookie-based state in `ui/sidebar.tsx` for the Radix primitive.
- **Nav expanded items** are persisted in `localStorage['nav_expanded_items']` and re-computed on every URL change to keep the active item's parent expanded.
- All models except `Employee` and `User` extend `BaseModel` which adds soft-deletes and `created_by`.
