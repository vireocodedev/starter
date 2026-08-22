import { createHistoryDefinition, createHistoryNodes } from "@vireocodedev/starter-history";
import { z } from "zod";

const MemberSchema = z.object({ id: z.string(), name: z.string() });
const memberHistory = createHistoryDefinition(
  MemberSchema,
  { label: "Member", key: member => member.id },
  { id: false, name: { kind: "field", label: "Name" } },
);

const TeamSchema = z.object({ members: z.array(MemberSchema) });
const teamHistory = createHistoryDefinition(
  TeamSchema,
  { label: "Team", key: () => "team" },
  {
    members: {
      kind: "array",
      label: "Members",
      item: { kind: "object", definition: memberHistory },
    },
  },
);

const PayloadSchema = z.object({ payload: z.unknown() });
const payloadHistory = createHistoryDefinition(
  PayloadSchema,
  { label: "Payload", key: () => "payload" },
  { payload: { kind: "field", label: "Payload" } },
);

function captureFailure(run: () => unknown): string {
  try {
    run();
    return "No error was raised.";
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

export function runFailureSemanticsExample() {
  return {
    invalidDefinition: captureFailure(() =>
      createHistoryDefinition(
        MemberSchema,
        { label: " ", key: member => member.id },
        {
          id: false,
          name: { kind: "field", label: "Name" },
        },
      ),
    ),
    duplicateIdentity: captureFailure(() =>
      createHistoryNodes(
        teamHistory,
        { members: [] },
        {
          members: [
            { id: "a", name: "Ada" },
            { id: "a", name: "Ava" },
          ],
        },
      ),
    ),
    invalidSnapshot: captureFailure(() =>
      createHistoryNodes(teamHistory, { members: [] }, { members: [{ id: "a", name: 42 }] } as never),
    ),
    unsupportedValue: captureFailure(() =>
      createHistoryNodes(
        payloadHistory,
        { payload: new Map([["revision", 1]]) },
        { payload: new Map([["revision", 2]]) },
      ),
    ),
  };
}
