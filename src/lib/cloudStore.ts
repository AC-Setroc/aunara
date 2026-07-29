import type { RepbookCloudSnapshot } from "./cloudSnapshot";

interface QueryResult<T> {
  data?: T | null;
  error: unknown;
}

export interface CloudStoreClient {
  from: (table: string) => {
    select?: (columns: string) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => Promise<QueryResult<{ payload: unknown }>>;
      };
    };
    upsert?: (
      value: { user_id: string; payload: RepbookCloudSnapshot },
      options: { onConflict: string },
    ) => Promise<QueryResult<unknown>>;
    insert?: (value: {
      id: string;
      user_id: string;
      consent_type: ConsentEvent["consentType"];
      action: ConsentEvent["action"];
      policy_version: string;
      locale: string;
      source: string;
    }) => Promise<QueryResult<unknown>>;
    delete?: () => {
      eq: (column: string, value: string) => Promise<QueryResult<unknown>>;
    };
  };
}

export interface ConsentEvent {
  id: string;
  userId: string;
  consentType: "legal" | "health_data";
  action: "granted" | "declined" | "revoked";
  policyVersion: string;
  locale: string;
  source: "account" | "privacy-center" | "migration-gate";
}

export interface CloudStore {
  load: (userId: string) => Promise<RepbookCloudSnapshot | null>;
  save: (userId: string, snapshot: RepbookCloudSnapshot) => Promise<void>;
  remove: (userId: string) => Promise<void>;
  recordConsent: (event: ConsentEvent) => Promise<void>;
}

function asError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (error && typeof error === "object" && "message" in error) {
    return new Error(String(error.message));
  }
  return new Error("Cloud database request failed.");
}

function isDuplicate(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  return "code" in error && String((error as { code?: unknown }).code) === "23505";
}

export function createCloudStore(client: CloudStoreClient): CloudStore {
  return {
    async load(userId) {
      const table = client.from("repbook_user_data");
      if (!table.select) throw new Error("Cloud database is not available.");
      const { data, error } = await table.select("payload")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw asError(error);
      return data?.payload as RepbookCloudSnapshot | null ?? null;
    },

    async save(userId, snapshot) {
      const table = client.from("repbook_user_data");
      if (!table.upsert) throw new Error("Cloud database is not available.");
      const { error } = await table.upsert({
        user_id: userId,
        payload: snapshot,
      }, {
        onConflict: "user_id",
      });
      if (error) throw asError(error);
    },

    async remove(userId) {
      const table = client.from("repbook_user_data");
      if (!table.delete) throw new Error("Cloud database is not available.");
      const { error } = await table.delete().eq("user_id", userId);
      if (error) throw asError(error);
    },

    async recordConsent(event) {
      const table = client.from("repbook_consent_events");
      if (!table.insert) throw new Error("Consent records are not available.");
      const { error } = await table.insert({
        id: event.id,
        user_id: event.userId,
        consent_type: event.consentType,
        action: event.action,
        policy_version: event.policyVersion,
        locale: event.locale,
        source: event.source,
      });
      if (error && !isDuplicate(error)) throw asError(error);
    },
  };
}
