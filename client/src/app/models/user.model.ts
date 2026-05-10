export type TokenFromJWT = {
  authJwtToken: string;
  user: User;
}

export type User = {
  roles: Array<string>;
  username: string;
}