/* =========================================

   Вспомогательные функции.

============================================ */

import { fixNumber } from "../../$extra/funs";

// Перевести градусы в радианы.
export const degToRad = (deg: number) => {
   return (deg - 90) * Math.PI / 180;
};

// Вычисление кратчайшего направления между двумя точками на круге.
export const angleDiff = (p1: number, p2: number) => fixNumber(((p2 - p1 + 540) % 360) - 180);

// Разница между двумя углами.
export const getDiff = (p1: number, p2: number) => (p2 - p1) % 360 == 0 ? 360 : fixNumber((p2 - p1 + 360) % 360);

// Получить точку центр.
export const getCenter = (p1: number, p2: number) => fixNumber((p1 + getDiff(p1, p2) / 2) % 360);

//
export const interpolateAngle = (init: number, diff: number, time: number) => fixNumber((init + diff * time + 360) % 360);