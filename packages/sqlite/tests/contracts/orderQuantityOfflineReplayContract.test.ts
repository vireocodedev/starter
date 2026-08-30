import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  ORDER_QUANTITY_REPLAY_CONTRACT,
  runOrderQuantityOfflineReplayExample,
} from "../../docs/examples/orderQuantityOfflineReplay.example";

const javaHandler = readFileSync(
  new URL(
    "../../../../jvm/vireo-starter-documentation-examples/src/main/java/com/vireocode/docs/offline/OfflineReplayConfigurationExample.java",
    import.meta.url,
  ),
  "utf8",
);

describe("order quantity offline replay documentation contract", () => {
  it("keeps the opt-in TypeScript command aligned with the JVM replay handler", async () => {
    expect(ORDER_QUANTITY_REPLAY_CONTRACT).toEqual({
      commandId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      method: "PATCH",
      url: "/api/orders/0f8fad5b-d9cb-469f-a165-70867728950e/quantity",
      body: { quantity: 3 },
    });
    expect(ORDER_QUANTITY_REPLAY_CONTRACT.commandId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u,
    );
    expect(ORDER_QUANTITY_REPLAY_CONTRACT.url).toMatch(
      /^\/api\/orders\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\/quantity$/u,
    );
    const result = await runOrderQuantityOfflineReplayExample();
    expect(result.command).toMatchObject(ORDER_QUANTITY_REPLAY_CONTRACT);
    expect(result.applied).toBe(1);
    expect(result.events).toEqual([
      "queued",
      "refresh",
      `cleanup:${ORDER_QUANTITY_REPLAY_CONTRACT.commandId}`,
      `delete:${ORDER_QUANTITY_REPLAY_CONTRACT.commandId}`,
      "replay-refresh",
    ]);
    expect(javaHandler).toContain("method == HttpMethod.PATCH");
    expect(javaHandler).toContain('UUID_V4_PATTERN = "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB]"');
    expect(javaHandler).toContain('+ "[0-9a-fA-F]{3}-[0-9a-fA-F]{12}"');
    expect(javaHandler).toContain('command.url().matches("/api/orders/" + UUID_V4_PATTERN + "/quantity")');
    expect(javaHandler).toContain("record ChangeQuantity(int quantity)");
    expect(javaHandler).toContain("orderCommands.changeQuantity(UUID.fromString(id), input.quantity())");
  });
});
