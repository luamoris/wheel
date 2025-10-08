/* =========================================

   Types

============================================ */

import type ISector from "../../Sector/ISector";
import type { TArc } from "../../$extra/types";

export type TSector = {
   sid: number,
   path: SVGPathElement,
   it: ISector,
   isVisible: boolean,
};

export type TSectorAction = {
   sid: number,
   type: 1 | 0 | -1,
   arc: TArc
};