export class DateTimeConverter {
  // For Unix timestamp in seconds (10 digits)
  static convertUnixSecondsToDate(timestamp: bigint): Date {
    const date = new Date(Number(timestamp) * 1000);
    return date;
  }
}
