/* =========================================

   Wheel

============================================ */

// ----- Типы
import type { TCircle } from "../$extra/types";
import type { TSector, TSectorAction } from "./extra/types";

// ----- Интерфейсы
// import type ISector from "../Sector/ISector";
import type IWheel from "./IWheel";

// ----- Внутрение модули
import Sector from "../Sector/Sector";


export default class Wheel implements IWheel {

   private box: SVGElement;
   private boxSet: SVGGElement;
   // private size: TSize;
   private circle: TCircle;
   private sectors: TSector[] = [];

   constructor(box: SVGElement) {
      this.box = box;
      this.boxSet = this.box.querySelector('#sectors') as SVGGElement;
      // this.size = {
      //    width: 500,
      //    height: 500,
      // };
      this.circle = {
         cx: 250,
         cy: 250,
         r: 230,
      }
   };

   /* ===== PUBLIC ===== */

   //
   update(actions: TSectorAction[]): void {
      actions.forEach(action => {
         let sector = this.sectors.find(s => s.sid === action.sid);
         if (!sector) {
            sector = this.addSector(action.sid);
         }
         // Анимация
         if (sector.isVisible && action.type === 0 && this.sectors.length === 1) { return; }
         sector.it.animate(action.type, action.arc);
         sector.isVisible = true;
      });
   };

   /* ===== PRIVATE ===== */

   //
   private addSector(sid: number): TSector {
      // Создать path и добавить на страницу.
      const path = this.createPathElement(sid);
      this.boxSet.append(path);
      // Создать сектор и добавить его в массив.
      const sector = {
         sid: sid,
         path: path,
         it: new Sector(path, this.circle),
         isVisible: false,
      };
      this.sectors.push(sector);
      return sector;
   };

   //
   private createPathElement(sid: number): SVGPathElement {
      const path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
      path.dataset.sid = sid.toString();
      // цвет: ПЕРЕПИСАТЬ
      const color = sid % 5 == 0 ? 5 : sid % 5;
      // цвет: ПЕРЕПИСАТЬ
      path.classList.add('sector', `c${color}`);
      return path;
   };

};
