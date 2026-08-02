import { RgoStopwatch } from "@/components/data-display/RgoStopwatch/RgoStopwatch";

export const RgoStopwatchWithShortDurationDemo = () => {
  return (
    <RgoStopwatch
      startDate={Date.now() - 125000} // 2 minutes, 5 seconds ago
    />
  );
};

export const RgoStopwatchWithShortDurationDemoCode = `import { RgoStopwatch } from "@/components/data-display/RgoStopwatch/RgoStopwatch";

export const RgoStopwatchWithShortDurationDemo = () => {
  return (
    <RgoStopwatch 
      startDate={Date.now() - 125000} // 2 minutes, 5 seconds ago
    />
  );
};`;
