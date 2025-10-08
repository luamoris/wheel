/* =========================================

   Глобальные функции.

============================================ */

// Возвращает случаное число [min;max].
export const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Следит за коректностью числа
export const fixNumber = (num: number) => Math.round(num * 100) / 100;