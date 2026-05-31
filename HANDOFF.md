# HRIS — Developer Handoff

**Date:** 2026-05-31
**Branch:** `main`
**Last commit:** `88eeb98` — Add leave approver system with approval info in view modal

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

### 1. Leave approver system
**Files:**
- `database/migrations/2026_05_31_085431_add_approver_id_to_employees_table.php`
- `app/Models/Employee.php`
- `app/Http/Controllers/EmployeeController.php`
- `resources/js/pages/hr/employees/create.tsx`
- `resources/js/pages/hr/employees/edit.tsx`
- `resources/js/pages/hr/employees/show.tsx`

Each employee can have a designated leave approver (another user) set via a `approver_id` FK on the `employees` table. The approver is selected via a dropdown in the employee create/edit forms (with a "No Approver" option to clear). The approver's name is shown in the Employment tab of the employee view page.

---

### 2. Approver scoping for leave applications
**File:** `app/Traits/AutoApplyPermissionCheck.php`

Employees who are designated approvers now see the leave requests of employees they approve, in addition to their own. Fixed by moving the employee role check before the `manage-own-*` permission check, so `applyEmployeeRoleFiltering()` always handles query scoping for the employee role. The `LeaveApplication` case uses:

```php
$q->where('employee_id', $user->id)
  ->orWhereHas('employee.employee', function ($subQ) use ($user) {
      $subQ->where('approver_id', $user->id);
  });
```

---

### 3. Approval info in leave application view modal
**Files:**
- `app/Http/Controllers/LeaveApplicationController.php`
- `resources/js/pages/hr/leave-applications/index.tsx`

The view modal now shows an "Approval Info" section (view mode only):
- **Approved/Rejected** → coloured box with who acted, timestamp, and manager comments
- **Pending** → yellow box with the designated approver's name (or "No approver assigned")

Eager loads `employee.employee.approver` in the index controller to supply the approver name.

---

### 4. Agents folder (git-ignored)
**Files:** `agents/assign_workers.php`, `agents/agents.md`

Standalone PHP scripts that bootstrap Laravel and operate on the DB directly.
Not committed. See `agents/agents.md` for usage.

---

## Pending / known issues

| # | Issue | Notes |
|---|-------|-------|
| 1 | Sidebar accordion doesn't close active item's parent on page navigation | Active item always stays open via `useEffect`; by design |
| 2 | HANDOFF.md hook fires only inside Claude Code sessions | Direct terminal commits won't auto-update it; update manually or add a git `post-commit` hook |

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
