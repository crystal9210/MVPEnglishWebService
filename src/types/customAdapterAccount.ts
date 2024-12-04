import {  } from "@auth/firebase-adapter"

export interface CustomAdapterAccount extends AdapterAccount {
    access_token: string;
    refresh_token: string;
    scope: string;
    token_type: string;
    type: string;
    expires_at?: number;
    id_token?: string;
}
