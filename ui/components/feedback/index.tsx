export function getFeedbackRequestStatus(
  accepted: boolean,
  acceptanceDate: string,
  responseDate: string
): string {
  if (!accepted && !acceptanceDate) {
    return "pending";
  }

  if (!accepted && acceptanceDate) {
    return "declined";
  }

  if (accepted && !responseDate) {
    return "accepted";
  }

  return "responded";
}
