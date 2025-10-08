/* =========================================

   ISector

============================================ */

// ----- Типы
import type { TArc } from "../$extra/types";

export default interface ISector {
   animate: (action: number, arc: TArc, duration?: number) => void;
};