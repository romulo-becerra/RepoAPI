import { HttpClient, withAuth } from "../http/http-client";

export class AccountsClient {
  constructor(private readonly http: HttpClient) {}

  list(token: string) {
    return this.http.get("/api/v1/accounts", { headers: withAuth(token) });
  }

  balance(token: string, accountId: number) {
    return this.http.get(`/api/v1/accounts/${accountId}/balance`, { headers: withAuth(token) });
  }
}
