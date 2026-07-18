import {
  type QueryEngineEntityDefinition,
  type QueryEngineEntityKey,
} from "@/models/queryengine.models";
import { signal } from "@preact/signals-react";

export const sigQueryEngineEntityDefinitions = signal<
  Partial<Record<QueryEngineEntityKey, QueryEngineEntityDefinition>>
>({});
