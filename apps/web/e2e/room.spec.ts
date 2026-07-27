import { expect, test } from "@playwright/test";

test.describe("home + room lobby", () => {
  test("home page loads with brand", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("corgi chat")).toBeVisible();
    await expect(page.getByRole("heading", { name: /video hangouts/i })).toBeVisible();
  });
});
