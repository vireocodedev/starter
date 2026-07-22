export type WorkerRequest = {
  id: number;
  type: string;
  [key: string]: unknown;
};

export type WorkerRequestInput = Omit<WorkerRequest, "id">;

export type WorkerResponse =
  | {
      id: number;
      ok: false;
      error: string;
    }
  | {
      id: number;
      ok: true;
      result: unknown;
    };

export type WorkerResponseResult = Extract<WorkerResponse, { ok: true }>["result"];
