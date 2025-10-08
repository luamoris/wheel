/* =========================================

   MAIN

============================================ */

import "./styles/index.css";
import FortuneWheel from "./modules/FortuneWheel/FortuneWheel";
import type { TSectorAction } from "./modules/Wheel/extra/types";



const main = () => {
   const svg = document.querySelector("#wheel") as SVGElement;
   const personList = document.querySelector('#personList') as HTMLUListElement;
   const btnPlus = document.querySelector('#btnPlus') as HTMLDivElement;
   let fw = new FortuneWheel(svg);

   const ms = 5000;
   let isStart = false;
   let timerStatus = false;
   let persons: Person[] = [];

   const clearApp = () => {
      while (personList.firstChild) {
         personList.removeChild(personList.firstChild);
         fw = new FortuneWheel(svg);
         persons = [];
      }
   };

   btnPlus.addEventListener("click", () => {
      //
      if (isStart == false) {
         clearApp();
         isStart = true;
         timerStatus = false;
         btnPlus.innerText = "ДОБАВИТЬ УЧАСТНИКА";
         return;
      }
      // Игра
      const id = persons.length + 1;
      const color = id % 5 == 0 ? 5 : id % 5;
      const onAdd = (value: number, id: number): void => {
         console.log(`🎟️ id: ${id} | current: ${value}`);
         fw.addTickets(id, value);
         console.log(fw.toString(), "\n");
      };
      const person: Person = createPersonElement({ color, id, onAdd });
      persons.push(person);
      personList.appendChild(person.element);

      // Таймер
      if (timerStatus) return;
      timerStatus = true;

      timer(30, () => {
         //
         isStart = false;

         persons.forEach(p => {
            p.stop();
         });

         const point = randomAngle(0, 360);
         const personWin = fw.getPersonByNumber(point);
         if (personWin) {
            rotateWheel(point, ms);
            console.log(`>>> Победитель: ${personWin.sid} (число ${point})`);
         } else {
            console.log("Что-то пошело не так.");
         }


         btnPlus.style.pointerEvents = "none";
         btnPlus.classList.add("disabled");

         const i = setInterval(() => {
            btnPlus.style.pointerEvents = "auto";
            btnPlus.classList.remove("disabled");
            clearInterval(i);
         }, ms);

         const t = setTimeout(() => {
            btnPlus.innerText = "ИГРАТЬ СНОВА";
            clearTimeout(t)
         }, ms)

      });
   });
};

main();

// ===========================

type Person = {
   element: HTMLLIElement;
   setColor: (newColor: number) => void;
   stop: () => void;
};

type AddPersonOptions = {
   color: number;
   id: number;
   onAdd: (value: number, id: number) => void;
};

export function createPersonElement({ color, id, onAdd }: AddPersonOptions): Person {
   // Создаем элемент <li>
   const li = document.createElement("li");
   li.classList.add("person");

   // Создаем внутренние элементы
   const colorDiv = document.createElement("div");
   colorDiv.classList.add("color");
   colorDiv.dataset.color = String(color);

   const label = document.createElement("label");
   label.htmlFor = `user-${id}`;
   label.textContent = `User ${String(id).padStart(2, "0")}`;

   const tikets = document.createElement("div");
   tikets.classList.add("tikets");

   const tiketsTitle = document.createElement("span");
   tiketsTitle.classList.add("tikets-title");
   tiketsTitle.textContent = "🎟️";

   const tiketsCount = document.createElement("span");
   tiketsCount.classList.add("tikets-count");
   tiketsCount.textContent = "0";

   tikets.append(tiketsTitle, tiketsCount);

   const input = document.createElement("input");
   input.type = "number";
   input.name = `user-${id}`;
   input.id = `user-${id}`;
   input.min = "0";
   input.max = "10";
   input.value = "0";

   const addButton = document.createElement("div");
   addButton.classList.add("button-add");
   addButton.textContent = "+";

   // Собираем структуру
   li.append(colorDiv, label, tikets, input, addButton);

   // Обработчик нажатия кнопки
   addButton.addEventListener("click", () => {
      const value = parseInt(input.value) || 0;
      if (value > 0) {
         const current = parseInt(tiketsCount.textContent || "0");
         const newCount = current + value;
         tiketsCount.textContent = String(newCount);
         input.value = "0";
         onAdd(value, id); // вызываем коллбэк

         addButton.style.pointerEvents = "none";
         addButton.classList.add("disabled");

         setTimeout(() => {
            addButton.style.pointerEvents = "";
            addButton.classList.remove("disabled");
         }, 600);
      }
   });

   // Возвращаем сам элемент и функцию для смены цвета
   function setColor(newColor: number) {
      colorDiv.dataset.color = String(newColor);
   }

   function stop() {
      addButton.style.pointerEvents = "none";
      addButton.classList.add("disabled");
   }

   return { element: li, setColor, stop } as Person;
}

const timer = (seconds: number, callback: () => void) => {
   const timeEl = document.getElementById('time');
   if (!timeEl) return;

   // const storedEnd = localStorage.getItem('timerEnd');
   // let endTime = storedEnd ? parseInt(storedEnd) : Date.now() + seconds * 1000;
   let endTime = Date.now() + seconds * 1000;

   // if (!storedEnd) {
   //    localStorage.setItem('timerEnd', endTime.toString());
   // }

   const update = () => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
      const secs = String(remaining % 60).padStart(2, '0');
      timeEl.textContent = `${mins}:${secs}`;

      if (remaining <= 0) {
         localStorage.removeItem('timerEnd');
         if (callback) callback();
      } else {
         requestAnimationFrame(update);
      }
   }

   update();

   return 1;
}

const randomAngle = (min: number, max: number) => parseFloat((Math.random() * (max - min) + min).toFixed(2));

function rotateWheel(
   targetDeg: number,
   duration: number = 4000,
   cx: number = 250,
   cy: number = 250
): void {
   const wheel = document.getElementById('sectors') as SVGElement | null;
   if (!wheel) return;

   // Получаем текущий угол из атрибута transform
   const transformAttr = wheel.getAttribute('transform') || '';
   const match = transformAttr.match(/rotate\(([-\d.]+)\s*([-\d.]+)\s*([-\d.]+)\)/);
   let currentDeg = 0;

   if (match) {
      currentDeg = parseFloat(match[1]);
   }

   // Полный угол с несколькими оборотами для эффекта кручения
   const rotations = 5;
   const endDeg = rotations * 360 + targetDeg;

   const startTime = performance.now();

   // Функция ease-in-out
   function easeInOutQuad(t: number): number {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
   }

   function animate(time: number): void {
      const elapsed = time - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeInOutQuad(t);
      const current = currentDeg + (endDeg - currentDeg) * eased;

      wheel!.setAttribute('transform', `rotate(${current.toFixed(2)} ${cx} ${cy})`);

      if (t < 1) {
         requestAnimationFrame(animate);
      } else {
         // Финальная фиксация точного угла
         wheel!.setAttribute('transform', `rotate(${targetDeg.toFixed(2)} ${cx} ${cy})`);
      }
   }

   requestAnimationFrame(animate);
}




// ===========================










// import Wheel from "./modules/Wheel/Wheel";
// import Sector from "./modules/Sector/Sector";


// const svg = document.querySelector("#wheel") as SVGElement;

// const path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
// path.classList.add('sector');
// svg?.appendChild(path);

// const s = new Sector(path, { cx: 250, cy: 250, r: 210 });
// s.animate(0, { p1: -180, p2: 180 });
// setTimeout(() => s.animate(-1, { p1: 49.9, p2: 51.1 }), 2000);
// setTimeout(() => s.animate(-1, { p1: 0, p2: 100 }), 4000);


// const actions_1: TSectorAction[] = [
//    { sid: 1, type: 0, arc: { p1: 0, p2: 360 } },
// ];

// const actions_2: TSectorAction[] = [
//    { sid: 1, type: -1, arc: { p1: 90, p2: 270 } }, // 180
//    { sid: 2, type: 0, arc: { p1: 270, p2: 90 } }, // 0
// ];

// const actions_3: TSectorAction[] = [
//    { sid: 1, type: -1, arc: { p1: 180, p2: 270 } }, // 225
//    { sid: 2, type: -1, arc: { p1: 270, p2: 360 } }, // 315
//    { sid: 3, type: 0, arc: { p1: 0, p2: 180 } }, // 90
// ];

// const actions_4: TSectorAction[] = [
//    { sid: 1, type: -1, arc: { p1: 180, p2: 270 } }, // 225
//    { sid: 2, type: -1, arc: { p1: 270, p2: 360 } }, // 315
//    { sid: 3, type: 0, arc: { p1: 0, p2: 180 } }, // 90
// ];

// const wheel = new Wheel(svg);
// wheel.update(actions_1);
// setTimeout(() => wheel.update(actions_2), 2000);
// setTimeout(() => wheel.update(actions_3), 4000);
// setTimeout(() => wheel.update(actions_4), 6000);
// wheel.addSector(2);
// wheel.addSector(3);
// wheel.addSector(4);


// const fw = new FortuneWheel(svg);

// fw.addTickets(100, 1);
// console.log(fw.toString(), "\n");

// fw.addTickets(100, 1);
// console.log(fw.toString(), "\n");

// fw.addTickets(200, 1);
// console.log(fw.toString(), "\n");

// fw.addTickets(300, 1);
// console.log(fw.toString(), "\n");

// setTimeout(() => {
//    fw.addTickets(100, 1);
//    console.log(fw.toString(), "\n");
// }, 2000);

// setTimeout(() => {
//    fw.addTickets(100, 1);
//    console.log(fw.toString(), "\n");
// }, 4000);

// setTimeout(() => {
//    fw.addTickets(200, 1);
//    console.log(fw.toString(), "\n");
// }, 6000);

// setTimeout(() => {
//    fw.addTickets(300, 1);
//    console.log(fw.toString(), "\n");
// }, 8000);

// setTimeout(() => {
//    fw.addTickets(200, 1);
//    console.log(fw.toString(), "\n");
// }, 10000);

// setTimeout(() => {
//    fw.addTickets(100, 4);
//    console.log(fw.toString(), "\n");
// }, 12000);

// setTimeout(() => {
//    fw.addTickets(400, 10);
//    console.log(fw.toString(), "\n");
// }, 14000);