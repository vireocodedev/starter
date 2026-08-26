/**
 * Shared semantic timing values for asynchronous loading presentation.
 *
 * Boundaries own reveal timing and content transitions. Skeleton leaves consume
 * only the visual animation duration.
 */
export const VIREO_LOADING_TOKENS = {
  revealDelay: 150,
  contentTransitionDuration: 120,
  skeletonAnimationDuration: 1_400,
} as const;

export type VireoLoadingTokens = typeof VIREO_LOADING_TOKENS;
