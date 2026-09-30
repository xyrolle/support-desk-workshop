import { expect, test } from "@playwright/test";

test("browse projects and tickets", async ({ page }) => {
  const pagination = page.getByRole("navigation", { name: "Pagination" });

  await test.step("the home page opens the first project", async () => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1, name: "Checkout" })).toBeVisible();
    await expect(page.getByRole("table").getByRole("row")).toHaveCount(26);
    await expect(pagination).toContainText("Showing 1–25 of 105");
  });

  await test.step("the sidebar lists only the user's projects", async () => {
    const projects = page.getByRole("navigation", { name: "Projects" }).getByRole("link");

    await expect(projects).toHaveCount(3);
    await expect(projects).toContainText(["Checkout", "Internal Tools", "Mobile App"]);
  });

  await test.step("Next shows the second page and keeps it in the URL", async () => {
    await page.getByRole("button", { name: "Next" }).click();

    await expect(page).toHaveURL("/projects/checkout?page=2");
    await expect(pagination).toContainText("Showing 26–50 of 105");
  });

  await test.step("switching project shows its tickets", async () => {
    await page.getByRole("link", { name: "Mobile App" }).click();

    await expect(page.getByRole("heading", { level: 1, name: "Mobile App" })).toBeVisible();
    await expect(pagination).toContainText("of 95");
  });

  await test.step("a project the user cannot access looks like a missing one", async () => {
    await page.goto("/projects/billing");

    await expect(page.getByRole("heading", { name: "Project not found" })).toBeVisible();
  });
});
