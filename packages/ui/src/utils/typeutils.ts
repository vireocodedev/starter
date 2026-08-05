import React from "react";

export type RgoMuiColor = "error" | "primary" | "secondary" | "info" | "success" | "warning";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TODO = any;

export type Class<T> = new (...args: TODO[]) => T;

export type ReactStateSetter<T> = React.Dispatch<React.SetStateAction<T>>;

export type OmitNever<T> = { [K in keyof T as T[K] extends never ? never : K]: T[K] };

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type FixedForwardRef = <T, P = {}>(
  render: (props: P, ref: React.Ref<T>) => React.ReactNode,
) => (props: P & React.RefAttributes<T>) => React.ReactNode;

export type ExtractObjectToTypedUnion<T> = {
  [K in keyof T]: { type: K; data: T[K] };
}[keyof T];

export const fixedForwardRef = React.forwardRef as FixedForwardRef;
