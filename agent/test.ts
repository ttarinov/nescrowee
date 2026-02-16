import { investigate } from "./investigator";

const TEST_SCENARIOS = {
  "freelancer-win": {
    context: `Contract Title: E-commerce Website Redesign
Contract Description: Complete redesign of the landing page with responsive layout, SEO optimization, and performance improvements.

Disputed Milestone: Landing Page Redesign
Milestone Description: Redesign the main landing page with modern UI, responsive layout for mobile/tablet/desktop, and Core Web Vitals score above 90.
Milestone Amount: 5000000000000000000000000

Dispute raised by: Party A (Client)
Reason: The design doesn't match what I expected. Colors are wrong.

--- Chat History (anonymized) ---
[Party A]: Hi, I need a landing page redesign. Modern look, responsive, fast.
[Party B]: Sure! I'll follow the design brief you shared. What colors do you prefer?
[Party A]: Use whatever looks professional, I trust your judgment.
[Party B]: Great, I'll go with a blue/white palette. Starting work now.
[Party B]: Here's the first draft — [URL]. Mobile-optimized, Lighthouse score is 94.
[Party A]: Hmm, I was thinking more of a green color scheme.
[Party B]: You said to use my judgment. The blue palette is consistent with your brand. Happy to adjust colors but the design is complete and meets all specs.
[Party A]: No, I want a completely different design. I'm disputing this.`,
  },

  "client-win": {
    context: `Contract Title: Mobile App Backend API
Contract Description: Build REST API for mobile app with user auth, product catalog, and order management.

Disputed Milestone: REST API Implementation
Milestone Description: Implement all API endpoints: /auth (login, register, refresh), /products (CRUD), /orders (create, list, detail). Include JWT auth, input validation, error handling, and API documentation.
Milestone Amount: 10000000000000000000000000

Dispute raised by: Party A (Client)
Reason: No working code was delivered. The repository only has a README file with no actual implementation.

--- Chat History (anonymized) ---
[Party A]: Ready to start? Here are the API specs.
[Party B]: Yes, I'll have it done in 2 weeks.
[Party A]: How's progress? It's been 3 weeks.
[Party B]: Almost done, just finishing up testing.
[Party A]: It's been 5 weeks now. Can you share a demo?
[Party B]: Here's the repo. I'll push the final code tonight.
[Party A]: The repo only has a README and a package.json. Where's the code?
[Party B]: I have it locally, I'll push soon.
[Party A]: It's been another week. I'm raising a dispute.`,
  },

  "continue-work": {
    context: `Contract Title: Blog Content Management System
Contract Description: WordPress plugin for custom blog post types with categories, tags, and featured images.

Disputed Milestone: Custom Post Type Plugin
Milestone Description: WordPress plugin that registers a custom post type "Portfolio" with custom fields: project_url, client_name, technologies_used. Include admin UI and frontend template.
Milestone Amount: 3000000000000000000000000

Dispute raised by: Party A (Client)
Reason: Plugin works partially but the frontend template is missing and custom fields don't save properly.

--- Chat History (anonymized) ---
[Party A]: Need a WordPress plugin for portfolio posts.
[Party B]: Got it. I'll build the custom post type with all the fields.
[Party B]: Done! Plugin is ready. Custom post type registers correctly, admin UI shows all fields.
[Party A]: The admin UI looks good but when I save a post, the custom fields are empty when I reload.
[Party B]: Let me check... I think it's a save_post hook issue.
[Party A]: Also, where's the frontend template? The milestone description says "include frontend template."
[Party B]: I focused on the admin side first. I can add the template.
[Party A]: The milestone is supposed to be complete. I'm disputing.`,
  },

  "split": {
    context: `Contract Title: Data Analytics Dashboard
Contract Description: React dashboard with charts, filters, and CSV export for sales data.

Disputed Milestone: Dashboard Implementation
Milestone Description: Build React dashboard with: 1) Sales chart (line + bar), 2) Date range filter, 3) Product category filter, 4) CSV export of filtered data, 5) Responsive design.
Milestone Amount: 8000000000000000000000000

Dispute raised by: Party A (Client)
Reason: Only 3 of 5 requirements completed. Charts and date filter work, but category filter, CSV export, and responsive design are missing.

--- Chat History (anonymized) ---
[Party A]: Dashboard needs all 5 features listed in the milestone.
[Party B]: Working on it. Charts are the hardest part.
[Party B]: Charts and date filter are done! Looking great.
[Party A]: Nice work on the charts! When will the rest be ready?
[Party B]: I've been working on this for 3 weeks already. The charts took longer than expected. I think what I've delivered is worth the full payment.
[Party A]: But 2 of 5 features out of 5 are missing plus responsive design. That's not complete.
[Party B]: I spent 80% of my time on charts which are the core feature. I'm not doing more without additional pay.
[Party A]: The scope was clear from the start. I'm disputing.`,
  },
};

async function runTest(scenarioName: string) {
  const scenario = TEST_SCENARIOS[scenarioName as keyof typeof TEST_SCENARIOS];
  if (!scenario) {
    console.error(`Unknown scenario: ${scenarioName}`);
    console.log(`Available: ${Object.keys(TEST_SCENARIOS).join(", ")}`);
    process.exit(1);
  }

  const modelId = process.env.TEST_MODEL || "deepseek-ai/DeepSeek-V3.1";
  const contractId = "test-contract";

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Scenario: ${scenarioName}`);
  console.log(`Model: ${modelId}`);
  console.log(`${"=".repeat(60)}\n`);

  const startTime = Date.now();

  try {
    const result = await investigate(modelId, contractId, scenario.context);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`\n${"=".repeat(60)}`);
    console.log(`RESULT (${elapsed}s):`);
    console.log(`  Resolution: ${result.resolution}`);
    console.log(`  Confidence: ${result.confidence}%`);
    console.log(`  Evidence reviewed: ${result.evidence_reviewed.join(", ") || "none"}`);
    console.log(`  Chat ID: ${result.chatId}`);
    console.log(`  Explanation: ${result.explanation}`);
    if (result.context_for_freelancer) {
      console.log(`  Instructions for freelancer: ${result.context_for_freelancer}`);
    }
    console.log(`${"=".repeat(60)}\n`);
  } catch (err) {
    console.error(`\nFAILED after ${((Date.now() - startTime) / 1000).toFixed(1)}s:`, err);
    process.exit(1);
  }
}

// Disable Social DB posting during tests
const origPostStep = (await import("./social-db")).postStep;
const socialDb = await import("./social-db");
(socialDb as any).postStep = async (...args: any[]) => {
  const step = args[1] as any;
  console.log(`  [Step] ${step.action}: ${step.thought}`);
};

const scenario = process.argv[2] || "freelancer-win";

if (scenario === "all") {
  for (const name of Object.keys(TEST_SCENARIOS)) {
    await runTest(name);
  }
} else {
  await runTest(scenario);
}
