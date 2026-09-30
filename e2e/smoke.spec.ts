import { expect, test } from "@playwright/test";

test("browse my tickets and a project", async ({ page }) => {
  const pagination = page.getByRole("navigation", { name: "Pagination" });

  await test.step("the home page is My tickets", async () => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1, name: "My tickets" })).toBeVisible();
    await expect(page.getByText("15 tickets")).toBeVisible();
  });

  await test.step("the sidebar lists only the user's projects, with their role", async () => {
    const projects = page.getByRole("navigation", { name: "Projects" });

    await expect(projects.getByRole("link", { name: /Checkout/ })).toContainText("Admin");
    await expect(projects.getByRole("link", { name: /Mobile App/ })).toContainText("Agent");
    await expect(projects.getByRole("link", { name: /Billing/ })).toHaveCount(0);
  });

  await test.step("a project lists its tickets, 25 to a page, with the page in the URL", async () => {
    const projects = page.getByRole("navigation", { name: "Projects" });
    await projects.getByRole("link", { name: /Checkout/ }).click();

    await expect(page.getByRole("heading", { level: 1, name: "Checkout" })).toBeVisible();
    await expect(pagination).toContainText("Showing 1–25 of 105");

    await page.getByRole("button", { name: "Next" }).click();

    await expect(page).toHaveURL("/projects/checkout?page=2");
    await expect(pagination).toContainText("Showing 26–50 of 105");
  });

  await test.step("a project the user cannot see looks like a missing one", async () => {
    await page.goto("/projects/billing");

    await expect(page.getByRole("heading", { name: "Project not found" })).toBeVisible();
  });
});
