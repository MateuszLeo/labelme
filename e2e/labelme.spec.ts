import { expect, Page, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000/");
});

async function selectDrawTool(page: Page) {
  await page.getByRole("button").nth(2).click();
}

async function drawShape(page: Page) {
  await page.mouse.move(300, 300);
  await page.mouse.down();
  await page.mouse.move(400, 400);
  await page.mouse.up();
}

test("renders image with already defined labels", async ({ page }) => {
  const screenshot = await page.screenshot();
  expect(screenshot).toMatchSnapshot();
});

test("allows to draw mapping", async ({ page }) => {
  await selectDrawTool(page);

  await page.mouse.move(400, 400);
  await page.mouse.down();
  await page.mouse.move(500, 500);
  await page.mouse.up();

  const screenshot = await page.screenshot();
  expect(screenshot).toMatchSnapshot();
});

test("allows to change position of the mapping", async ({ page }) => {
  await selectDrawTool(page);
  await drawShape(page);

  const beforeMove = await page.screenshot();
  expect(beforeMove).toMatchSnapshot("initial-position.png");

  await page.mouse.move(350, 350);
  await page.mouse.down();
  await page.mouse.move(450, 450);

  const afterMove = await page.screenshot();
  expect(afterMove).toMatchSnapshot("final-position.png");
});

test("allows deletion of the mapping", async ({ page }) => {
  await selectDrawTool(page);
  await drawShape(page);

  const beforeMove = await page.screenshot();
  expect(beforeMove).toMatchSnapshot("before-deletion.png");

  await page.getByRole("button").nth(0).click();
  await page.mouse.click(350, 350);

  const afterMove = await page.screenshot();
  expect(afterMove).toMatchSnapshot("after-deletion.png");
});

test("allows resize of the mapping", async ({ page }) => {
  await selectDrawTool(page);
  await drawShape(page);

  const beforeMove = await page.screenshot();
  expect(beforeMove).toMatchSnapshot("before-resize.png");

  await page.mouse.move(400, 400);
  await page.mouse.down();
  await page.mouse.move(450, 450);
  await page.mouse.up();

  const afterMove = await page.screenshot();
  expect(afterMove).toMatchSnapshot("after-resize.png");
});
