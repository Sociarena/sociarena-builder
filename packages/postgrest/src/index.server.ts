import type { Database } from "./__generated__/db-types";
import { PostgrestClient } from "@supabase/postgrest-js";
import { Agent } from "node:http";

export type { Database } from "./__generated__/db-types";

export type Client = PostgrestClient<Database>;

// Agent HTTP sans keep-alive pour éviter les erreurs "socket hang up"
const httpAgent = new Agent({ keepAlive: false });

export const createClient = (url: string, apiKey: string): Client => {
  return new PostgrestClient<Database>(url, {
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
    },
    fetch: (input, init) => {
      return fetch(input, {
        ...init,
        // @ts-expect-error - Node.js fetch supporte agent
        agent: httpAgent,
      });
    },
  });
};
