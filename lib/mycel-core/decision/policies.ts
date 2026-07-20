export const MYCEL_POLICIES = {
  discoveryMessageMaximum: 4_000,
  conversationMessageMaximum: 12,
  conversationCharacterMaximum: 12_000,
  discoveryRequestsPerMinute: 12,
  generationRequestsPerMinute: 4,
  requestWindowMilliseconds: 60_000,
} as const;

export function isWithinRateLimit(requestCount: number, maximum: number): boolean {
  return Number.isInteger(requestCount) && requestCount >= 0 && requestCount < maximum;
}

export function canContinueDiscovery(projectStatus: string): boolean {
  return projectStatus !== "archived";
}
