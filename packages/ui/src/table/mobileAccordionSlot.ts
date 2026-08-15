import { createContext, useContext } from "react";

export type MobileAccordionSlot = "summary" | "detail";

export const MobileAccordionSlotContext = createContext<MobileAccordionSlot>("detail");

/** Identifies whether a table cell is rendering in a mobile accordion summary or details. */
export function useMobileAccordionSlot() {
  return useContext(MobileAccordionSlotContext);
}
