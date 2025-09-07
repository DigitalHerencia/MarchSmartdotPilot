import { test, expect } from "@playwright/test"

test("create route → add waypoints → preview scrub updates", async ({ page }) => {
  await page.goto("/")

  // Navigate to Routes tab (mobile and desktop differ). Try both selectors.
  if (await page.getByRole('tab', { name: /Routes/i }).count()) {
    await page.getByRole('tab', { name: /Routes/i }).first().click()
  } else {
    await page.getByText('Routes', { exact: true }).first().click()
  }

  // Fill create form
  await page.getByLabel(/Route Name/i).fill("E2E Route")
  await page.getByLabel(/Description/i).fill("E2E description")
  await page.getByRole('button', { name: /Create New Route/i }).click()

  // Add two waypoints via inputs
  await page.getByLabel(/X Position/i).fill("10")
  await page.getByLabel(/Y Position/i).fill("20")
  await page.getByRole('button', { name: /Add Waypoint/i }).click()

  await page.getByLabel(/X Position/i).fill("60")
  await page.getByLabel(/Y Position/i).fill("26.67")
  await page.getByRole('button', { name: /Add Waypoint/i }).click()

  // Ensure waypoints list shows 2
  await expect(page.getByText(/2 waypoints|2 points|2 total/i)).toBeVisible()

  // Preview scrubber exists and label updates when sliding
  const scrubber = page.getByRole('slider', { name: /Route preview scrubber/i })
  await expect(scrubber).toBeVisible()

  // Move to step 2
  await scrubber.focus()
  await page.keyboard.press('ArrowRight')

  await expect(page.getByText(/Step\s+2\s*\/\s*2/)).toBeVisible()
})
