import { HttpClient } from "../http/http-client";

export class SystemClient {
  constructor(private readonly http: HttpClient) {}

  health() {
    return this.http.get("/up");
  }

  root() {
    return this.http.get("/");
  }
}
