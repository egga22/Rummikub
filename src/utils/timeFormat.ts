/**
 * Formats time remaining based on a format string with variables
 * Supported variables:
 * - {minutes} - Minutes remaining (padded to 2 digits)
 * - {seconds} - Seconds remaining within the current minute (padded to 2 digits)
 * - {totalSeconds} - Total seconds remaining
 * - {percent} - Percentage of time remaining (0-100)
 * - {m} - Minutes without padding
 * - {s} - Seconds within the current minute without padding
 */
export function formatTimeLeft(
  timeLeftSeconds: number,
  totalTimeSeconds: number,
  formatString: string
): string {
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const percent = totalTimeSeconds > 0 
    ? Math.round((timeLeftSeconds / totalTimeSeconds) * 100)
    : 0;

  return formatString
    .replaceAll('{minutes}', minutes.toString().padStart(2, '0'))
    .replaceAll('{seconds}', seconds.toString().padStart(2, '0'))
    .replaceAll('{totalSeconds}', timeLeftSeconds.toString())
    .replaceAll('{percent}', percent.toString())
    .replaceAll('{m}', minutes.toString())
    .replaceAll('{s}', seconds.toString());
}
