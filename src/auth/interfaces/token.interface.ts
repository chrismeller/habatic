export interface Token {
  readonly token: string;
  readonly type: string;
  readonly userId: string;
  readonly createdAt: string;
  readonly expiresAt: string;
  readonly revokedAt?: string;
}
