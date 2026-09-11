import { HttpClient, withAuth } from "../http/http-client";
import type { RegisterPayload } from "../schemas/auth";

export class AuthClient {
  constructor(private readonly http: HttpClient) {}

  register(payload: RegisterPayload) {
    return this.http.post("/api/v1/register", payload);
  }

  login(accountNumber: string, pin: string) {
    return this.http.post("/api/v1/login", { account_number: accountNumber, pin });
  }

  logout(token: string) {
    return this.http.post("/api/v1/logout", undefined, { headers: withAuth(token) });
  }
}
