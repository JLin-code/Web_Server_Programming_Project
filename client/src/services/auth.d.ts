export function authHeader(): {
  Authorization?: string;
  [key: string]: string | undefined;
};
export function isAuthenticated(): boolean;
