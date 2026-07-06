# Team Management — End-to-End Implementation Plan

Deferred design for completing team member addition. The **basics** are already
built (see "Current state"); this doc specifies the remaining work to make the
flow end-to-end: simplified roles, token-based accept-and-link, and shared
workspace access so an invited member can actually edit the owner's content.

Do not start this until the "basics first" work is settled and the database is
reachable (migrations can't be applied while Railway is paused).

---

## Current state (already shipped)

- `TeamMember` model: `email`, `role` (ADMIN/EDITOR/VIEWER), `status`
  (PENDING/ACTIVE), `owner` relation, unique `(ownerId, email)`.
- Endpoints: `GET /api/team`, `POST /api/team/invite`, `PATCH /api/team/:id`
  (role), `DELETE /api/team/:id` — auth-guarded, zod-validated, rate-limited.
- Invite creates a PENDING record and sends a best-effort email via Resend
  (`lib/email.ts`) with a link to `/sign-up`.
- Frontend: `useTeam` hook + Settings → Team tab (list, invite modal, role
  dropdown, remove).

**Gaps this plan closes:** VIEWER role is pointless here; invites don't link the
invited person's account to the workspace (status never leaves PENDING); and an
accepted member has no access to the owner's posts/accounts/analytics.

---

## Decisions

1. **Roles → ADMIN, EDITOR only** (drop VIEWER; default EDITOR). You invite
   people to help create/edit, so view-only has no use here. ADMIN can manage
   the team and accounts; EDITOR can manage posts.
2. **Shared workspace via an owner-resolver**, not a schema-wide `workspaceId`.
   A member's data requests resolve to the inviter's `User` id. This avoids
   re-scoping the whole schema and keeps the change contained to controllers.
3. **Invite acceptance links a real Clerk account** to the `TeamMember` row via a
   one-time token; the accepting user's email must match the invited email.

---

## Schema changes

```prisma
enum TeamRole {
  ADMIN
  EDITOR
}

model TeamMember {
  id        String           @id @default(cuid())
  email     String
  role      TeamRole         @default(EDITOR)
  status    TeamMemberStatus @default(PENDING)
  token     String           @unique          // one-time invite token
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt

  ownerId String
  owner   User   @relation("OwnedTeam", fields: [ownerId], references: [id], onDelete: Cascade)

  // Linked once the invite is accepted.
  userId  String?
  member  User?   @relation("TeamMembership", fields: [userId], references: [id], onDelete: SetNull)

  @@unique([ownerId, email])
}
```

On `User`, add the two named back-relations:

```prisma
  teamMembers TeamMember[] @relation("OwnedTeam")
  memberships TeamMember[] @relation("TeamMembership")
```

Migration notes:
- The existing `add_team_members` migration is **unapplied** (DB was paused), so
  it can be rewritten to this final shape rather than layering a second
  migration — as long as it truly never ran anywhere. If it did run, add a new
  migration instead (drop VIEWER via `ALTER TYPE`, add `token`/`userId` columns,
  FKs, and the `token` unique index).
- Dropping a Postgres enum value requires recreating the type; if the enum was
  already applied, the new migration must create a new type and swap the column.

---

## Backend

### Invite (update existing `inviteMember`)
- Generate `token = crypto.randomBytes(24).toString('hex')` and store it.
- Email link points to `${FRONTEND_URL}/invite/accept?token=${token}` (not
  `/sign-up`).

### Invite lookup (new)
`GET /api/team/invite/:token` — **unauthenticated** (the token is the secret).
Returns `{ inviterName, role, email, valid }` so the accept page can render
before/after sign-in. Return `valid: false` (not an error) for
missing/expired/already-accepted tokens.

### Accept (new)
`POST /api/team/accept` — **authenticated**. Body `{ token }`.
1. Find the PENDING `TeamMember` by `token`; 404/invalid if none.
2. Load the accepting user (by Clerk id); ensure their primary email matches the
   invite email (case-insensitive) — else `403`.
3. Update: `status = ACTIVE`, `userId = <accepting user id>`.
4. Return the linked member.

Guardrails: reject if already ACTIVE; a user may hold at most one ACTIVE
membership (enforce in logic — reject accept if they already have one, or
replace).

### Shared workspace access (owner-resolver)
Add `lib/workspace.ts`:

```ts
// The User whose workspace this Clerk user acts within: an ACTIVE member acts in
// their inviter's workspace; everyone else acts in their own.
export async function getWorkspaceOwner(clerkId?: string | null) {
  if (!clerkId) throw new AppError(401, 'User not authenticated');
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) throw new AppError(404, 'User not found');
  const membership = await prisma.teamMember.findFirst({
    where: { userId: user.id, status: 'ACTIVE' },
    orderBy: { createdAt: 'asc' },
  });
  if (membership) {
    const owner = await prisma.user.findUnique({ where: { id: membership.ownerId } });
    if (owner) return owner;
  }
  return user;
}
```

Re-scope these controllers to `getWorkspaceOwner(...).id` instead of the raw
Clerk user (data belongs to the workspace owner, so members see/edit the same
rows and their creates attribute to the owner):
- `postController` (all handlers; createPost attributes `userId = owner.id`)
- `socialAccountsController` (list / connect / delete)
- `analyticsController` (overview / trends / post analytics / record)
- `scheduleController` (schedule / cancel / scheduled list)
- `dashboardController` (overview)
- `teamController` reads (so members can see the team)

Keep **personal** (not workspace-scoped):
- `userController` (`/users/me`, update, stats) — profile is per-user.

### RBAC enforcement (optional, later)
Once access is shared, gate writes by role: EDITOR can manage posts; ADMIN can
also manage accounts and the team. Implement as a small middleware that loads the
caller's membership role and checks it. Owners implicitly have ADMIN.

---

## Frontend

- New route `app/(auth)/invite/accept/page.tsx` (or under the dashboard):
  reads `?token=`, calls `GET /api/team/invite/:token` to show inviter + role.
  If signed out, prompt sign-in/up (Clerk), preserving the token; if signed in,
  show an **Accept invitation** button calling `POST /api/team/accept`, then
  redirect to the dashboard with a success toast.
- Update the invite email link target to the accept route.
- Settings → Team: drop VIEWER from role selectors; show linked member's name
  once ACTIVE (from the joined `member`), and keep the PENDING/ACTIVE badge.
- API client: add `getInvite(token)`, `acceptInvite(token)`.

---

## Edge cases & tests (verify once DB is reachable)

- Accept with a mismatched email → 403; with a used/expired token → invalid.
- Removing a member unlinks access immediately (delete row, or set status).
- Owner deletion cascades team members (`onDelete: Cascade`).
- A member's own `/users/me` stays personal; workspace endpoints show the
  owner's data.
- Re-invite after removal reissues a token.
- One ACTIVE membership per user is enforced.
- Rate limiting still applies to invite/accept.
