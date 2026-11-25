// OWNED BY YOU. Browser checks for the accuracy / streak / restart features and the failed-reload fix.
// Range route only (src/genre.ts selects "range").
import { test, expect } from "@playwright/test";
import { GAME_DATA, action, expectFields, startVerified } from "./helpers.mjs";

test("accuracy and streak start at zero and update after each shot", async ({ page }) => {
  await startVerified(page);
  await expectFields(page, { accuracy: "0%", streak: "0" });

  await action(page, "hit").click();
  await expectFields(page, { accuracy: "100%", streak: "1" });

  await action(page, "miss").click(); // a miss resets the streak
  await expectFields(page, { accuracy: "50%", streak: "0", status: "complete" });
});

test("two hits build a streak of two", async ({ page }) => {
  await startVerified(page);
  await action(page, "hit").click();
  await action(page, "hit").click();
  await expectFields(page, { accuracy: "100%", streak: "2", status: "complete" });
});

test("restart resets accuracy, streak and the game state", async ({ page }) => {
  await startVerified(page);
  await action(page, "hit").click();
  await action(page, "hit").click();
  await expectFields(page, { streak: "2", status: "complete" });

  await page.locator("#restart").click();
  await expect(page.locator("#status")).toHaveText("Game restarted.");
  await expectFields(page, { ammunition: "2", score: "0", shots: "0", status: "active", accuracy: "0%", streak: "0" });
  await expect(page.locator("#actions button").first()).toBeEnabled();
});

test("after a failed reload, the preserved game can still be played", async ({ page }) => {
  await startVerified(page);
  await page.route(GAME_DATA, (r) => r.fulfill({ status: 503, body: "unavailable" }));
  await page.locator("#reload").click();
  await expect(page.locator("#api")).toHaveText(/HTTP 503/);

  await action(page, "hit").click();
  await expect(page.locator("#result")).toHaveText('Accepted "hit".');
  await expectFields(page, { ammunition: "1", score: "1", streak: "1" });
});

test("status invites the player to start once data is verified", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#api")).toHaveText(/verified/i);
  await expect(page.locator("#status")).toHaveText("Press Start game to begin.");
});
