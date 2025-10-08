/* =========================================

   IWheel

============================================ */

import type { TSectorAction } from "./extra/types";

export default interface IWheel {
   update: (actions: TSectorAction[]) => void;
};