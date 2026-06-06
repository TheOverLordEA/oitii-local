/**
 * Calculates a mock interview probability based on status and time since application.
 * In a real implementation, this could use an AI model to score likelihood.
 */
export function calculateInterviewProbability(status: string, daysSinceApplied: number): number {
  switch (status) {
    case "INTERVIEWING":
      return 100;
    case "OFFER":
      return 100;
    case "REJECTED":
      return 0;
    case "APPLIED":
      // Probability decreases over time after applying
      if (daysSinceApplied <= 3) return 65;
      if (daysSinceApplied <= 7) return 45;
      if (daysSinceApplied <= 14) return 25;
      return 10;
    case "PENDING":
      return 50;
    default:
      return 0;
  }
}
