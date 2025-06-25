import { useState } from "react";
import { jitsu } from "../lib/jitsu";

// Example event builder for demonstration purposes
const buildEvent = () => ({
  commerce: {
    currency: "USD",
    products: [
      {
        entry_type: "Example",
        product_id: "1234",
        sku: "SKU-1234",
        product: "Example Product",
        category: "Examples",
        unit_price: 99.99,
        units: 2,
      },
    ],
  },
  metrics: {
    review_count: 42,
  },
  properties: {
    tags: ["Sample", "Demo", "Test"],
  },
  classification: [{ type: "Category", value: "Examples" }],
  timestamp: new Date().toISOString(),
});

export default function Home() {
  const [log, setLog] = useState("");

  const sendEvent = async () => {
    try {
      await jitsu.track("Hotel Viewed", buildEvent());
      setLog(" Event sent");
    } catch (err) {
      setLog(" Failed to send: " + String(err));
    }
  };

  return (
    <main style={{ padding: 32 }}>
      <h1>Jitsu Demo</h1>
      <button onClick={sendEvent}>Send "Event Viewed"</button>
      <pre>{log}</pre>
    </main>
  );
}
