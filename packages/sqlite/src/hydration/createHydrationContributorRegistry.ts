export type HydrationContributor = {
  key: string;
  hydrate: (signal: AbortSignal) => Promise<{ rowCount: number }>;
};

export type HydrationContributorRegistry = {
  register: (contributors: HydrationContributor[]) => void;
  list: () => HydrationContributor[];
};

export function createHydrationContributorRegistry(): HydrationContributorRegistry {
  const contributorsByKey = new Map<string, HydrationContributor>();

  return {
    register(contributors) {
      for (const contributor of contributors) contributorsByKey.set(contributor.key, contributor);
    },
    list: () => [...contributorsByKey.values()].sort((left, right) => left.key.localeCompare(right.key)),
  };
}
