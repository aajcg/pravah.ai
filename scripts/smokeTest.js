import "dotenv/config";
import { extractHandoff } from "../src/extractHandoff.js";

const messages = [
  "Payment API failing for EU users",
  "Rahul is working on retry logic",
  "Deadline is tonight",
  "Still blocked due to timeout issue",
  "We decided not to rollback yet",
];

async function runSmokeTest() {
  try {
    const handoff = await extractHandoff(messages, {
      logger: (message, error) => {
        console.error("[extractHandoff]", message);
        if (error) {
          console.error("[extractHandoff:error]", error?.message ?? error);
        }
      },
    });

    console.log("Smoke test output:");
    console.log(JSON.stringify(handoff, null, 2));
  } catch (error) {
    console.error("Smoke test failed:", error);
    process.exitCode = 1;
  }
}

runSmokeTest();
