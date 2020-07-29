export interface TrackerValue {
  readonly id: string;
  readonly trackerId: string;
  readonly trackerUserId: string;
  readonly valueDate: string;
  readonly value: string;
  readonly createdAt: string;
  readonly updatedAt?: string;
}
