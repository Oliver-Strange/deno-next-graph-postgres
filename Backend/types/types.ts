export enum Provider {
  facebook = "Facebook",
  google = "Google",
}

export enum RoleOptions {
  client = "CLIENT",
  itemEditor = "ITEMEDITOR",
  admin = "ADMIN",
  superAdmin = "SUPERADMIN",
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  token_version: number;
  reset_password_token?: string;
  reset_password_token_expiry?: number;
  facebook_id?: string;
  google_id?: string;
  roles: RoleOptions[];
  created_at: string;
}
