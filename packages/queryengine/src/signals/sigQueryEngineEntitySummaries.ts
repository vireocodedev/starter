import { type QueryEngineEntitySummary } from "@/models/queryengine.models";
import { signal } from "@preact/signals-react";

export const sigQueryEngineEntitySummaries = signal<QueryEngineEntitySummary[]>([]);
