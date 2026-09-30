/** A ticket's human-readable id, such as `CHK-104`, from its project key and number. */
export function ticketRef(projectKey: string, ticketNumber: number): string {
  return `${projectKey}-${ticketNumber}`;
}
