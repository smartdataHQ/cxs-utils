# Jitsu Load Test Script

We use the MIT licensed jitsu package to send semantic events to Context Suite.
The npm package is here: https://www.npmjs.com/package/@jitsu/js

This script performs a load test for a Jitsu tracking server by sending **50 events per second** for **10 minutes**.

## Prerequisites

- **Node.js** (v14 or higher)
- A running ContextSuite server on any host or using the inbox.contextsuite.com server.
- A valid write key from your ContextSuite account.

## Configuration

Modify the `client` setup in `jitsu-test.js` to match your Jitsu server settings:
```javascript
const analytics = jitsuAnalytics({
  host: "https://inbox.contextsuite.com", // inbox.contextsuite.com
  writeKey: "some:some",
  debug: false,
});
```

## Running the Load Test

To start the script, run:
```sh
node jitsu-test.js
```

### What Happens?
- The script sends **50 random events per second**.
- The test runs continuously for **10 minutes**.
- Each event contains randomized data (e.g., `userId`, `email`, `device`, `timestamp`).
- Logs display success or failure for each request.

## Customization

- Modify the event types in the `EVENTS` array inside `jitsu_load_test.js`.
- Adjust `REQUESTS_PER_SECOND` or `TOTAL_DURATION` to change the load test parameters.

## Troubleshooting

- **Jitsu is not receiving events?**
    - Ensure Jitsu is running and accessible at `tracking_host`.
    - Verify API keys (`key` and `x-write-key`).
    - Enable debugging by setting `debug: true` in `jitsuClient()`.
- **Performance issues?**
    - Reduce `REQUESTS_PER_SECOND` if needed.
    - Run on a higher-performance machine.

