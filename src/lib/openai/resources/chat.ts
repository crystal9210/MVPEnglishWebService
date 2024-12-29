import { APIClient } from "../core";
import { Completions } from "./completions";

/**
 * Chat Resource
 * - In Stainless, "chat" often has sub-resources like "completions"
 */
export class Chat {
  completions: Completions;

  constructor(client: APIClient) {
    this.completions = new Completions(client);
  }
}
