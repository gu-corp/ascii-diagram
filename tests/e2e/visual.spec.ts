import { test, expect } from '@playwright/test';
import { asciiToHtmlSimple, generateSimpleCSS } from '../../packages/core/src/simple';
import * as fs from 'fs';
import * as path from 'path';

const DIAGRAM_COMPLEX = `
┌─────────────────────────────────────────────────────────────────────────┐
│              電子決済取引業者（G.U.Exchange）の役割                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   一般ユーザー                                                           │
│       │                                                                  │
│       │ 口座開設、チャージ、換金、送金                                   │
│       ▼                                                                  │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │  G.U.Exchange（電子決済取引業者）                                │   │
│   │                                                                  │   │
│   │  【ライセンス】                                                  │   │
│   │   ・電子決済取引業                                               │   │
│   │   ・暗号資産交換業                                               │   │
│   │                                                                  │   │
│   │  【業務】                                                        │   │
│   │   ・ユーザー口座管理（KYC/AML）                                  │   │
│   │   ・ステーブルコインの売買（チャージ/換金）                      │   │
│   │   ・信託会社への発行・償還申請                                   │   │
│   │   ・ユーザー間送金の仲介                                         │   │
│   └────────────────────────────────────────────────────────────────┘   │
│       │                                                                  │
│       │ 発行申請、償還申請                                               │
│       ▼                                                                  │
│   信託会社（受託者）                                                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
`.trim();

const DIAGRAM_SIMPLE = `
┌───────┐
│ Hello │
└───────┘
`.trim();

function generateHtmlPage(diagram: string, title: string): string {
  const html = asciiToHtmlSimple(diagram);
  const css = generateSimpleCSS();

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 2rem;
      background: #fff;
    }
${css}
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
}

test.describe('ASCII Diagram Visual Tests', () => {

  test('simple box renders correctly', async ({ page }) => {
    const html = generateHtmlPage(DIAGRAM_SIMPLE, 'Simple Box');
    await page.setContent(html);

    // Screenshot for visual verification
    await page.screenshot({
      path: 'tests/e2e/screenshots/simple-box.png',
      fullPage: true
    });

    // Basic checks
    const diagram = page.locator('.ascii-diagram');
    await expect(diagram).toBeVisible();

    // Check text is present
    await expect(diagram).toContainText('Hello');
  });

  test('complex Japanese diagram renders correctly', async ({ page }) => {
    const html = generateHtmlPage(DIAGRAM_COMPLEX, 'Complex Diagram');
    await page.setContent(html);

    // Screenshot for visual verification
    await page.screenshot({
      path: 'tests/e2e/screenshots/complex-japanese.png',
      fullPage: true
    });

    // Basic checks
    const diagram = page.locator('.ascii-diagram');
    await expect(diagram).toBeVisible();

    // Check Japanese text is present
    await expect(diagram).toContainText('電子決済取引業者');

    // Check arrows are rendered
    const arrows = page.locator('.ascii-a');
    expect(await arrows.count()).toBeGreaterThan(0);
  });

  test('vertical lines connect properly', async ({ page }) => {
    const verticalDiagram = `
│
│
│
│
│
`.trim();

    const html = generateHtmlPage(verticalDiagram, 'Vertical Lines');
    await page.setContent(html);

    await page.screenshot({
      path: 'tests/e2e/screenshots/vertical-lines.png',
      fullPage: true
    });

    // Check diagram is visible
    const diagram = page.locator('.ascii-diagram');
    await expect(diagram).toBeVisible();
  });

  test('nested boxes render correctly', async ({ page }) => {
    const nestedDiagram = `
┌─────────────┐
│ ┌─────────┐ │
│ │  Inner  │ │
│ └─────────┘ │
└─────────────┘
`.trim();

    const html = generateHtmlPage(nestedDiagram, 'Nested Boxes');
    await page.setContent(html);

    await page.screenshot({
      path: 'tests/e2e/screenshots/nested-boxes.png',
      fullPage: true
    });

    // Check diagram is visible and has content
    const diagram = page.locator('.ascii-diagram');
    await expect(diagram).toBeVisible();
    await expect(diagram).toContainText('Inner');
  });

  test('arrows render with correct color', async ({ page }) => {
    const arrowDiagram = `
→ ← ↑ ↓ ▼ ▲
`.trim();

    const html = generateHtmlPage(arrowDiagram, 'Arrows');
    await page.setContent(html);

    await page.screenshot({
      path: 'tests/e2e/screenshots/arrows.png',
      fullPage: true
    });

    // Check arrow elements have correct class
    const arrows = page.locator('.ascii-a');
    expect(await arrows.count()).toBeGreaterThan(0);

    // Check arrow color (green)
    const firstArrow = arrows.first();
    const color = await firstArrow.evaluate(el =>
      window.getComputedStyle(el).color
    );
    // rgb(16, 185, 129) is #10b981
    expect(color).toBe('rgb(16, 185, 129)');
  });
});
