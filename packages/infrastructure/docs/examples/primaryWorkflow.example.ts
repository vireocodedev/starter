import { createModeAwareApi } from "@vireocodedev/starter-infrastructure";

type CustomerApi = {
  customers: {
    findName: (id: number) => Promise<string>;
  };
};

export async function runPrimaryWorkflowExample() {
  let online = false;
  const modes: string[] = [];
  const api = createModeAwareApi<CustomerApi, CustomerApi>({
    onlineApi: { customers: { findName: async id => `Remote customer ${id}` } },
    offlineApi: { customers: { findName: async id => `Cached customer ${id}` } },
    readOnline: () => online,
    onInvokeSuccess: event => modes.push(`${event.methodLabel}:${event.mode}`),
  });

  const cached = await api.customers.findName(42);
  online = true;
  const remote = await api.customers.findName(42);

  return { cached, remote, modes };
}
