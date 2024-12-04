import { AdapterAccount } from "next-auth/adapters";

export interface AccountSchema extends AdapterAccount {
  access_token: string;
  refresh_token?: string;
  provider: string;
  providerAccountId: string;
  userId: string;
  scope: string;
  token_type: string;
  type: string;
  expires_at?: number;
  id_token?: string;
  // AdapterAccountに基づくその他のフィールド
}
