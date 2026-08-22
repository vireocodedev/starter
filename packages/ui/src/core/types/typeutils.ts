import type { Dispatch, SetStateAction } from "react";

/** A React state setter accepted by controlled application contracts. */
export type ReactStateSetter<T> = Dispatch<SetStateAction<T>>;
