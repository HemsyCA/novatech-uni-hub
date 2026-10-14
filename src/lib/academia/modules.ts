export type ModuleId = "electronica" | "mecanica" | "programacion";

export type CourseModuleId = ModuleId | "soldadura";

export interface ModuleInfo<Id extends CourseModuleId = ModuleId> {
  id: Id;
  name: string;
  tool: string;
  duration: string;
  needs: string;
  summary: string;
}

export const moduleInfo: ModuleInfo[] = [
  {
    id: "electronica",
    name: "Electrónica",
    tool: "EasyEDA Pro",
    duration: "5 a 6 horas",
    needs: "Calculadora, cuaderno y una cuenta en EasyEDA",
    summary: "Electricidad básica, el ESP32 y tus primeros esquemáticos y PCBs.",
  },
  {
    id: "mecanica",
    name: "Mecánica",
    tool: "Onshape",
    duration: "5 horas",
    needs: "Una cuenta en Onshape y un mouse con rueda",
    summary: "Diseño de piezas en 3D listas para imprimir.",
  },
  {
    id: "programacion",
    name: "Programación",
    tool: "Wokwi y Arduino IDE (opcional)",
    duration: "7 horas",
    needs: "Una cuenta en Wokwi",
    summary: "Programar el ESP32: LEDs, botones, sensores, servos y comandos.",
  },
];

export const part2Info: ModuleInfo<"soldadura"> = {
  id: "soldadura",
  name: "Soldadura",
  tool: "Teoría y videos",
  duration: "3 a 4 horas",
  needs: "Nada: el kit y las herramientas te los da el equipo en la práctica",
  summary: "Soldadura THT y SMD para prepararte antes de la práctica presencial.",
};

export const moduleName = (id: string) => [...moduleInfo, part2Info].find((m) => m.id === id)?.name ?? id;
