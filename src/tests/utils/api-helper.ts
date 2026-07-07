import type { APIRequestContext } from '@playwright/test';

export class ApiHelper {
  constructor(readonly request: APIRequestContext, readonly baseURL: string) {}

  private headers(token?: string): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async post(endpoint: string, body: unknown, token?: string) {
    return this.request.post(`${this.baseURL}${endpoint}`, {
      data: body,
      headers: this.headers(token),
    });
  }

  async get(endpoint: string, token?: string) {
    return this.request.get(`${this.baseURL}${endpoint}`, {
      headers: this.headers(token),
    });
  }

  async patch(endpoint: string, body: unknown, token?: string) {
    return this.request.patch(`${this.baseURL}${endpoint}`, {
      data: body,
      headers: this.headers(token),
    });
  }

  async delete(endpoint: string, token?: string) {
    return this.request.delete(`${this.baseURL}${endpoint}`, {
      headers: this.headers(token),
    });
  }
}
