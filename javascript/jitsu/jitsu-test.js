const {jitsuAnalytics} = require('@jitsu/js');

const analytics = jitsuAnalytics({
    host: "https://inbox.contextsuite.com",
    writeKey: "some:some",
    debug: false,
});

const EVENTS = [
    {
        type: "user_registered",
        properties: () => ({
            user_id: `user_${Math.floor(Math.random() * 10000)}`,
            email: `test${Math.floor(Math.random() * 10000)}@example.com`,
            plan: "Pro Annual",
            accountType: "Facebook",
            ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
            location: {country: "USA", city: "New York"},
            device: {type: "Mobile", os: "iOS", browser: "Safari"},
            referrer: "https://example.com",
            timestamp: new Date().toISOString(),
        }),
    },
    {
        type: "page_viewed",
        properties: () => ({
            user_id: `user_${Math.floor(Math.random() * 10000)}`,
            page: "/home",
            device: "Desktop",
            browser: "Chrome",
            timestamp: new Date().toISOString(),
        }),
    },
    {
        type: "purchase_completed",
        properties: () => ({
            user_id: `user_${Math.floor(Math.random() * 10000)}`,
            amount: Math.floor(Math.random() * 500) + 50,
            currency: "USD",
            paymentMethod: "Credit Card",
            timestamp: new Date().toISOString(),
        }),
    },
];

async function sendEvent() {
    const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    const eventPayload = {
        type: event.type,
        ...event.properties(),
    };

    try {
        await analytics.track(eventPayload.type, eventPayload);
        console.log(`Event sent: ${JSON.stringify(eventPayload, null, 2)}`);
    } catch (error) {
        console.error(`Error sending event:`, error);
    }
}

async function loadTest() {
    const TOTAL_DURATION = 10 * 60 * 1000;
    const REQUESTS_PER_SECOND = 50;
    const START_TIME = Date.now();

    while (Date.now() - START_TIME < TOTAL_DURATION) {
        const batch = Array.from({length: REQUESTS_PER_SECOND}, sendEvent);
        await Promise.all(batch);
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log("Load test completed");
}

loadTest();
