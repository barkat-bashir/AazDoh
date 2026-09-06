import axios, { AxiosInstance, AxiosError } from "axios";
import { getConfig } from "./config.js";

export class AazDohClient {
  private http: AxiosInstance;
  private apiKey: string;

  constructor() {
    const config = getConfig();
    this.apiKey = config.apiKey;

    this.http = axios.create({
      baseURL: config.apiUrl,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-API-Key": config.apiKey,
        Authorization: `Bearer ${config.apiKey}`,
      },
    });
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  public async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    try {
      const res = await this.http.get<{ success: boolean; message: string; data: T }>(url, { params });
      return res.data.data !== undefined ? res.data.data : (res.data as unknown as T);
    } catch (err) {
      throw this.handleError(err);
    }
  }

  public async post<T>(url: string, body?: unknown, params?: Record<string, unknown>): Promise<T> {
    try {
      const res = await this.http.post<{ success: boolean; message: string; data: T }>(url, body, { params });
      return res.data.data !== undefined ? res.data.data : (res.data as unknown as T);
    } catch (err) {
      throw this.handleError(err);
    }
  }

  public async patch<T>(url: string, body?: unknown): Promise<T> {
    try {
      const res = await this.http.patch<{ success: boolean; message: string; data: T }>(url, body);
      return res.data.data !== undefined ? res.data.data : (res.data as unknown as T);
    } catch (err) {
      throw this.handleError(err);
    }
  }

  public async delete<T>(url: string): Promise<T> {
    try {
      const res = await this.http.delete<{ success: boolean; message: string; data: T }>(url);
      return res.data.data !== undefined ? res.data.data : (res.data as unknown as T);
    } catch (err) {
      throw this.handleError(err);
    }
  }

  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const axiosErr = error as AxiosError<{ message?: string; error?: string }>;
      const status = axiosErr.response?.status;
      const serverMessage =
        axiosErr.response?.data?.message ||
        axiosErr.response?.data?.error ||
        axiosErr.message;

      if (status === 401 || status === 403) {
        return new Error(
          `[AazDoh Auth Error ${status}]: Authentication failed. Check that your AAZDOH_API_KEY is valid and not revoked. Server says: ${serverMessage}`
        );
      }
      if (status === 404) {
        return new Error(`[AazDoh Not Found 404]: ${serverMessage}`);
      }
      if (status === 400) {
        return new Error(`[AazDoh Validation Error 400]: ${serverMessage}`);
      }
      if (axiosErr.code === "ECONNREFUSED") {
        return new Error(
          `[AazDoh Connection Refused]: Could not connect to AazDoh backend at ${this.http.defaults.baseURL}. Ensure the server is running.`
        );
      }
      return new Error(`[AazDoh API Error ${status || "UNKNOWN"}]: ${serverMessage}`);
    }
    return error instanceof Error ? error : new Error(String(error));
  }
}

export const client = new AazDohClient();
