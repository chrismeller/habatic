export interface User {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly createdAt: string;
  readonly verificationToken: string;
  readonly verificationTokenCreatedAt: string;
  readonly emailVerified: boolean;
  readonly emailVerifiedAt: string | null;
}
