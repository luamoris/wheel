/* =========================================

   Sector

============================================ */

// ----- Вспомогатеьлные функции:
import { degToRad, angleDiff, getDiff, getCenter, interpolateAngle } from "./extra/funs";

// ----- Типы
import type { TCircle, TArc } from "../$extra/types";

// ----- Интерфейс
import type ISector from "./ISector";


export default class Sector implements ISector {

   private path: SVGPathElement;
   private circle: TCircle;
   private arc: TArc = { p1: 0, p2: 0 };

   constructor(path: SVGPathElement, circle: TCircle) {
      this.path = path;
      this.circle = circle;
   }

   /* ===== PUBLIC ===== */

   // Анимация элемента path.
   animate(action: number, arc: TArc, duration?: number) {

      duration = duration ?? 600;

      let start: TArc = { p1: 0, p2: 0 };
      let end: TArc = { p1: 0, p2: 0 };

      const shrinkLimit = 5;
      const total = getDiff(arc.p1, arc.p2);
      const center = getCenter(arc.p1, arc.p2);

      if (action === 0) {
         // Если элемент появиляется впервые (start = центр, end = конечные точки):
         start = { p1: center, p2: center };
         end = { ...arc };
         if (total == 360) {
            end.p2 = end.p2 - 0.02;
         }
      }
      else if (action === -1) {
         // Если элемен сужается:
         start = { ...this.arc };
         end = { ...arc };
         if (total < shrinkLimit) {
            end = {
               p1: (center - shrinkLimit / 2 + 360) % 360,
               p2: (center + shrinkLimit / 2) % 360,
            };
         }
      }
      else if (action === 1) {
         // Есл элемент расширяется:
         start = { ...this.arc };
         end = { ...arc };
      }

      // Анимация
      this.arc = { ...end };
      this.animatePath(this.path, start, end, duration);
   };

   /* ===== PRIVATE ===== */

   // Создать траэкторию пути для атрибута d элемента path.
   private createPath(arc: TArc) {
      const diff = getDiff(arc.p1, arc.p2);
      const largeArc = diff > 180 ? 1 : 0;
      const x1 = this.circle.cx + this.circle.r * Math.cos(degToRad(arc.p1));
      const y1 = this.circle.cy + this.circle.r * Math.sin(degToRad(arc.p1));
      const x2 = this.circle.cx + this.circle.r * Math.cos(degToRad(arc.p2));
      const y2 = this.circle.cy + this.circle.r * Math.sin(degToRad(arc.p2));
      return `M ${this.circle.cx} ${this.circle.cy} L ${x1} ${y1} A ${this.circle.r} ${this.circle.r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
   };

   // Анимация траэктории пути.
   private animatePath(path: SVGPathElement, start: TArc, end: TArc, duration: number) {
      const init: TArc = { ...start };
      const diff: TArc = {
         p1: angleDiff(start.p1, end.p1),
         p2: angleDiff(start.p2, end.p2),
      };

      let startTime: number | null = null;

      const animate = (timestamp: number) => {
         // Время и прогресс
         if (!startTime) startTime = timestamp;
         const elapsed = timestamp - startTime;
         const progress = Math.min(elapsed / duration, 1);
         // Вычисление новых значений углов.
         const current: TArc = {
            p1: interpolateAngle(init.p1, diff.p1, progress),
            p2: interpolateAngle(init.p2, diff.p2, progress),
         };
         // Создать и добавить новую траекторию элементу path.
         path.setAttribute('d', this.createPath(current));
         // Рекурсия процесса анимации.
         if (progress < 1) requestAnimationFrame(animate);
      };

      // Запуск анимации.
      requestAnimationFrame(animate);
   };

};