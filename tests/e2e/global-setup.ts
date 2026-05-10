import { chromium, FullConfig } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const authDir = path.join(__dirname, ".auth");

async function loginAndSaveState(
  baseURL: string,
  email: string,
  password: string,
  role: string
) {
  const browser = await chromium.launch();
  const context = await browser.createContext();
  const page = await context.newPage();

  try {
    // Navigate to login page
    await page.goto(`${baseURL}/login`);

    // Fill login form
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);

    // Click sign in button
    await page.click('button[type="submit"]');

    // Wait for navigation (redirect happens after login)
    await page.waitForURL((url) => {
      return (
        url.toString().includes("/receptionist") ||
        url.toString().includes("/doctor") ||
        url.toString().includes("/admin") ||
        url.toString().includes("/select-business")
      );
    });

    // Save storage state (includes localStorage, sessionStorage, cookies)
    const storageState = await context.storageState();

    // Ensure auth directory exists
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    // Save to file
    fs.writeFileSync(
      path.join(authDir, `${role}.json`),
      JSON.stringify(storageState, null, 2)
    );

    console.log(`✓ Saved auth state for ${role}`);
  } catch (error) {
    console.error(`✗ Failed to save auth state for ${role}:`, error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function globalSetup(config: FullConfig) {
  const baseURL = config.use.baseURL || "http://localhost:3000";

  console.log("🔐 Setting up authentication for all roles...\n");

  try {
    // Login for receptionist
    await loginAndSaveState(
      baseURL,
      "receptionist@clinic.local",
      "testpass123",
      "receptionist"
    );

    // Login for doctor
    await loginAndSaveState(
      baseURL,
      "doctor@clinic.local",
      "testpass123",
      "doctor"
    );

    // Login for admin
    await loginAndSaveState(baseURL, "admin@clinic.local", "testpass123", "admin");

    console.log("\n✓ All authentication states saved successfully!");
  } catch (error) {
    console.error("✗ Global setup failed:", error);
    process.exit(1);
  }
}

export default globalSetup;
