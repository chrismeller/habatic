export interface Tracker {
  readonly id: string;
  readonly name: string;
  readonly userId: string;
  readonly type: string;
  readonly createdAt: string;
  readonly updatedAt?: string;
}
