import { RgoStopwatch } from "@/components/data-display/RgoStopwatch/RgoStopwatch";

export const RgoStopwatchWithMediumDurationDemo = () => {
  return (
    <RgoStopwatch
      startDate={Date.now() - 7323000} // 2 hours, 2 minutes, 3 seconds ago
    />
  );
};

export const RgoStopwatchWithMediumDurationDemoCode = `import { RgoStopwatch } from "@/components/data-display/RgoStopwatch/RgoStopwatch";

export const RgoStopwatchWithMediumDurationDemo = () => {
  return (
    <RgoStopwatch 
      startDate={Date.now() - 7323000} // 2 hours, 2 minutes, 3 seconds ago
    />
  );
};`;
