/* =========================================

   FortuneWheel

============================================ */

import type { TArc } from "../$extra/types";
import type IWheel from "../Wheel/IWheel";
import Wheel from "../Wheel/Wheel";

import { fixNumber, randomInt } from "../$extra/funs";

import type { TSectorAction } from "../Wheel/extra/types";

type TPerson = {
   sid: number,
   tickets: number,
   length: number,
   arc: TArc,
};

type TFortuneData = {
   persons: number,
   tickets: number,
   coef: number,
};


interface IFortuneWheel { };


export default class FortuneWheel implements IFortuneWheel {

   private box: SVGElement;
   private wheel: IWheel;
   private data: TFortuneData;
   private persons: TPerson[] = [];

   private isStart = false;

   constructor(box: SVGElement) {
      this.box = box;
      this.wheel = new Wheel(this.box);
      this.data = { persons: 0, tickets: 0, coef: 0 };
   };

   /* ===== PUBLIC ===== */

   addTickets(sid: number, tickets: number) {
      // Найти или создать пользователя.
      let person = this.getPerson(sid);
      if (!this.isStart && !person) {
         // Если это первый пользователь:
         person = this.createPerson(sid);
         const point = randomInt(0, 359);
         person.arc = { p1: point, p2: point };
         this.isStart = true;
      } else if (this.isStart && !person) {
         // Новый (но не первый) пользователь.
         person = this.createPerson(sid);
         // console.log(this.persons.length);
         const point = this.persons[this.persons.length - 2].arc.p2;
         person.arc = { p1: point, p2: point };
      }
      // Обновить тикеты пользователя:
      person!.tickets += tickets;
      this.data.tickets += tickets;
      this.data.coef = fixNumber(360 / this.data.tickets);
      // Обновить углы и анимировать.
      const actions = this.updatePersons();
      console.log(actions.map(a => `===> sid: ${a.sid} | type: ${a.type} | p1: ${a.arc.p1} | p2: ${a.arc.p2}`).join('\n'));
      this.wheel.update(actions);
   }

   getPersonByNumber(num: number): TPerson | null {
      const norm = ((num % 360) + 360) % 360;
      for (const p of this.persons) {
         const start = ((p.arc.p1 % 360) + 360) % 360;
         const end = ((p.arc.p2 % 360) + 360) % 360;

         if (start < end) {
            // обычный диапазон, например 20 → 150
            if (norm >= start && norm <= end) return p;
         } else {
            // диапазон через 0°, например 350 → 30
            if (norm >= start || norm <= end) return p;
         }
      }
      return null;
   };

   toString(): string {
      const { persons, tickets, coef } = this.data;
      const data = `Total => Person: ${persons}. Tickets: ${tickets}. Coef: ${coef}.\n`;
      const person = this.persons.map(p => `ID: ${p.sid} | T: ${p.tickets} | L: ${p.length} | start: ${p.arc.p1} | end: ${p.arc.p2}`).join('\n');
      return data + person;
   }

   /* ===== PRIVATE ===== */

   //
   private getPerson(sid: number): TPerson | null {
      return this.persons.find(p => p.sid === sid) ?? null;
   };

   //
   private createPerson(sid: number): TPerson {
      const person: TPerson = {
         sid,
         tickets: 0,
         length: 0,
         arc: { p1: 0, p2: 0 },
      };
      // Добавляем пользователя в массив.
      this.persons.push(person);
      // Увеличиваем общее количество пользователей.
      this.data.persons += 1;
      return person;
   };

   //
   private updatePersons(): TSectorAction[] {
      const actions: TSectorAction[] = [];


      this.persons = this.persons.slice().reverse().map((p, i) => {
         const oldLen = p.length;
         p.length = fixNumber(this.data.coef * p.tickets);
         const halfLen = fixNumber(p.length / 2);
         const index = i === 0 ? this.persons.length - 2 : this.persons.length - i;

         // console.log(i, index);

         // Обновить углы:
         if (i == 0 && this.persons.length > 1) {
            const center = this.persons[index].arc.p2;
            p.arc = {
               p1: degNormal(center - halfLen),
               p2: degNormal(center + halfLen),
            };
         } else if (i > 0 && this.persons.length > 1) {
            const pFirst = this.persons[index].arc.p1;
            p.arc = {
               p1: degNormal(pFirst - p.length),
               p2: degNormal(pFirst),
            };
         }

         // p.arc = this.updateArc(p.arc, p.length);

         const action: TSectorAction = {
            sid: p.sid,
            type: (oldLen === 0 || oldLen === p.length) ? 0 : (p.length > oldLen ? 1 : -1),
            arc: p.arc,
         };
         actions.push(action);
         return p;
      }).reverse();
      return actions;
   };

   // 
   private updateArc(arc: TArc, len: number): TArc {
      return arc;
   };

};


const degNormal = (deg: number) => (deg >= 0 && deg <= 360) ? deg : (deg > 360 ? deg % 360 : 360 - (Math.abs(deg) % 360));
