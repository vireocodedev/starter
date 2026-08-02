import { RgoStopwatch } from "@/components/data-display/RgoStopwatch/RgoStopwatch";

export const RgoStopwatchWithVeryLongDurationDemo = () => {
  return (
    <RgoStopwatch
      startDate={Date.now() - (45 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000)} // 45 days, 5 hours ago (shows weeks)
    />
  );
};

export const RgoStopwatchWithVeryLongDurationDemoCode = `import { RgoStopwatch } from "@/components/data-display/RgoStopwatch/RgoStopwatch";

export const RgoStopwatchWithVeryLongDurationDemo = () => {
  return (
    <RgoStopwatch 
      startDate={Date.now() - (45 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000)} // 45 days, 5 hours ago (shows weeks)
    />
  );
};`;
