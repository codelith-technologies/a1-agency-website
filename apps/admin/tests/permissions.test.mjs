import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import ts from "typescript";

const filename = fileURLToPath(new URL("../src/lib/permissions.ts", import.meta.url));
const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const scope = { exports: {} };
vm.runInNewContext(compiled, scope, { filename });
const { canAccessAdminRoute: can, normalizeAdminPath } = scope.exports;

test("owner and administrator can access existing management screens", () => {
  for (const role of ["owner", "administrator"]) {
    for (const route of ["/dashboard", "/jobs", "/jobs/new", "/jobs/fictional-id", "/applicants", "/applicants/new", "/applicants/fictional-id", "/employer-requests", "/contact-messages", "/taxonomy/countries", "/taxonomy/categories", "/reviews", "/media", "/announcements", "/events", "/faqs", "/team"]) {
      assert.equal(can(role, route), true, `${role}: ${route}`);
    }
  }
});

test("recruiter can manage recruitment but not content or staff accounts", () => {
  for (const route of ["/jobs", "/jobs/new", "/jobs/fictional-id", "/applicants", "/applicants/new", "/applicants/fictional-id", "/employer-requests", "/contact-messages"]) assert.equal(can("recruiter", route), true);
  for (const route of ["/taxonomy/countries", "/taxonomy/categories", "/reviews", "/media", "/announcements", "/events", "/faqs", "/team", "/staff", "/audit-logs"]) assert.equal(can("recruiter", route), false);
});

test("content editor cannot enter private recruitment screens, including nested routes", () => {
  for (const route of ["/applicants", "/applicants/new", "/applicants/fictional-cv", "/jobs", "/jobs/new", "/jobs/fictional-id", "/employer-requests", "/contact-messages", "/staff", "/audit-logs"]) assert.equal(can("content_editor", route), false);
  for (const route of ["/faqs", "/faqs/new", "/events", "/events/fictional-id", "/announcements", "/announcements/new", "/media", "/media/fictional-id", "/taxonomy/countries", "/taxonomy/countries/new", "/taxonomy/categories", "/taxonomy/categories/fictional-id", "/reviews", "/reviews/fictional-id", "/team", "/team/fictional-id"]) assert.equal(can("content_editor", route), true);
});

test("unknown roles and routes fail closed; prefixes must match path boundaries", () => {
  assert.equal(can("forged-owner", "/dashboard"), false);
  assert.equal(can("owner", "/unknown"), false);
  assert.equal(can("recruiter", "/jobs-privileged"), false);
  assert.equal(can("content_editor", "/media-private"), false);
  assert.equal(can("recruiter", "/jobs/"), true);
});

test("owner can access nested job routes through deployed admin base paths", () => {
  for (const route of [
    "/admin/jobs/new",
    "/admin/jobs/fictional-id",
    "/a1-agency-website/admin/jobs/new",
    "/a1-agency-website/admin/jobs/fictional-id",
  ]) {
    assert.equal(can("owner", route), true, `owner: ${route}`);
  }
});

test("nested routes respect role boundaries after base-path normalization", () => {
  assert.equal(can("administrator", "/admin/jobs/new"), true);
  assert.equal(can("recruiter", "/a1-agency-website/admin/jobs/fictional-id"), true);
  assert.equal(can("content_editor", "/admin/jobs/new"), false);
  assert.equal(can("content_editor", "/a1-agency-website/admin/events/fictional-id"), true);
  assert.equal(can("recruiter", "/admin/taxonomy/countries/fictional-id"), false);
  assert.equal(can("owner", "/admin/staff/new"), true);
  assert.equal(can("administrator", "/admin/staff/new"), false);
});

test("local and deployed admin paths normalize to App Router paths", () => {
  assert.equal(normalizeAdminPath("/jobs/new"), "/jobs/new");
  assert.equal(normalizeAdminPath("/admin/jobs/new"), "/jobs/new");
  assert.equal(normalizeAdminPath("/a1-agency-website/admin/media/upload"), "/media/upload");
});

test("dashboard navigation files contain only App Router paths, not /admin prefixes", () => {
  const sourceFiles = [
    "../src/app/jobs/page.tsx",
    "../src/app/jobs/new/page.tsx",
    "../src/app/applicants/page.tsx",
    "../src/app/applicants/new/page.tsx",
    "../src/app/media/page.tsx",
  ].map((relative) => fs.readFileSync(fileURLToPath(new URL(relative, import.meta.url)), "utf8"));
  for (const source of sourceFiles) {
    assert.equal(source.includes('"/admin/') || source.includes('`/admin/'), false);
  }
});

test("owner-facing create routes exist in the App Router", () => {
  assert.equal(fs.existsSync(fileURLToPath(new URL("../src/app/jobs/new/page.tsx", import.meta.url))), true);
  assert.equal(fs.existsSync(fileURLToPath(new URL("../src/app/jobs/edit/page.tsx", import.meta.url))), true);
  assert.equal(fs.existsSync(fileURLToPath(new URL("../src/app/media/upload/page.tsx", import.meta.url))), true);
});
