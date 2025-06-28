import { jitsuAnalytics, AnalyticsInterface } from "@jitsu/js";

export const jitsu: AnalyticsInterface = jitsuAnalytics({
  host: "https://your-jitsu-host.example.com",
  writeKey: "public-write-key-1234",
  debug: false,                                 // turn off debug to avoid CORS issues
});
