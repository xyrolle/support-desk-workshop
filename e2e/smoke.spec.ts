import { expect, test } from "@playwright/test";

test("browse my tickets, a project and a ticket", async ({ page }) => {
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

  await test.step("a ticket opens with its conversation and properties", async () => {
    await page.getByRole("table").getByRole("link").first().click();

    await expect(page).toHaveURL(/\/projects\/checkout\/tickets\/CHK-\d+$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("opened the ticket")).toBeVisible();
    await expect(page.getByRole("combobox", { name: /^Status:/ })).toBeVisible();
  });

  await test.step("a project the user cannot see looks like a missing one", async () => {
    await page.goto("/projects/billing");

    await expect(page.getByRole("heading", { name: "Project not found" })).toBeVisible();
  });

  await test.step("a filter can be saved and opened as a view", async () => {
    await page.goto("/projects/checkout?status=blocked");

    await expect(page.getByText("12 tickets")).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Status" })).toContainText(
      "Waiting on customer",
    );

    await page.getByRole("button", { name: "Save view" }).click();
    await page.getByRole("textbox", { name: "View name" }).fill("Blocked");
    await page.getByRole("button", { name: "Save" }).click();

    const view = page
      .getByRole("navigation", { name: "Projects" })
      .getByRole("link", { name: "Blocked" });
    await expect(view).toHaveAttribute("aria-current", "page");
    await view.click();

    await expect(page).toHaveURL("/projects/checkout?status=blocked");
    await expect(page.getByText("12 tickets")).toBeVisible();
  });

  await test.step("search opens a matching ticket", async () => {
    await page.goto("/projects/checkout");
    await page.getByRole("button", { name: /Search/ }).click();
    await page.getByRole("textbox", { name: "Search tickets" }).fill("apple pay");

    const match = page.getByRole("option", { name: /CHK-197/ });
    await expect(match).toBeVisible();
    await match.click();

    await expect(page).toHaveURL("/projects/checkout/tickets/CHK-197");
    await expect(
      page.getByRole("heading", { level: 1, name: "Apple Pay domain verification keeps failing" }),
    ).toBeVisible();
  });
});
