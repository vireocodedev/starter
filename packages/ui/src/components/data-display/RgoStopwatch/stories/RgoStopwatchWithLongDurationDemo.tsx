import { RgoStopwatch } from "@/components/data-display/RgoStopwatch/RgoStopwatch";

export const RgoStopwatchWithLongDurationDemo = () => {
  return (
    <RgoStopwatch
      startDate={Date.now() - (2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000 + 30 * 60 * 1000)} // 2 days, 3 hours, 30 minutes ago
    />
  );
};

export const RgoStopwatchWithLongDurationDemoCode = `import { RgoStopwatch } from "@/components/data-display/RgoStopwatch/RgoStopwatch";

export const RgoStopwatchWithLongDurationDemo = () => {
  return (
    <RgoStopwatch 
      startDate={Date.now() - (2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000 + 30 * 60 * 1000)} // 2 days, 3 hours, 30 minutes ago
    />
  );
};`;
