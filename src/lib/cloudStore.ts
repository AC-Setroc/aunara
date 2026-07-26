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
  };
}

export interface CloudStore {
  load: (userId: string) => Promise<RepbookCloudSnapshot | null>;
  save: (userId: string, snapshot: RepbookCloudSnapshot) => Promise<void>;
}

function asError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (error && typeof error === "object" && "message" in error) {
    return new Error(String(error.message));
  }
  return new Error("Cloud database request failed.");
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
  };
}
