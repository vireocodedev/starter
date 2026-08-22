import { createPersistentSignal } from "@vireocodedev/starter-infrastructure";

type Preferences = { density: "comfortable" | "compact" };

export function runPersistentStateExample() {
  const values = new Map<keyof Preferences, Preferences[keyof Preferences]>([["density", "comfortable"]]);
  const density = createPersistentSignal<Preferences, "density">(
    {
      get: key => values.get(key) as Preferences[typeof key],
      set: (key, value) => void values.set(key, value),
    },
    "density",
  );

  density.setLocal("compact");
  return { signal: density.signal.value, stored: values.get("density") };
}
