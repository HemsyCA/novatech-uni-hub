import type { Lang } from "@/lib/i18n";

// Textos de las pestañas del menú: Nosotros, Robots, Competencias y Únete.
// Servicios, panel y Academia no se traducen a propósito.
const es = {
  about: {
    label: "Nosotros",
    titlePrefix: "Somos Nova",
    titleAccent: "Tech",
    subtitle:
      "Grupo de investigación, desarrollo e innovación en robótica de la Universidad Nacional de Ingeniería (UNI). Diseñamos, construimos y programamos hardware de alto rendimiento.",
    pillars: [
      { title: "Diseño mecánico", description: "Modelamos chasis y piezas en Onshape y las fabricamos con impresión 3D." },
      {
        title: "Electrónica",
        description: "Diseñamos nuestras propias PCBs en EasyEDA, con el ESP32 como cerebro de los robots.",
      },
      {
        title: "Programación",
        description: "Escribimos el firmware y el control que hace que cada robot perciba, decida y actúe.",
      },
    ],
    seasonSummary: "{played} torneos y {first} primeros puestos",
    milestones: [
      { date: "2025", title: "Temporada 2025", description: "" },
      { date: "Jun 2025", title: "Nova Legacy I", description: "Organizamos nuestro propio torneo en la UNI." },
      {
        date: "Oct 2025",
        title: "RoboChallenge Rumanía",
        description: "Primera competencia internacional, en la Universidad Politécnica de Bucarest.",
      },
      { date: "2026", title: "Temporada 2026", description: "" },
    ],
    historyLabel: "Trayectoria",
    historyTitle: "Nuestra historia",
    orgLabel: "Organización",
    orgTitle: "Nuestras áreas",
    orgSubtitle: "Nova funciona como una organización: cada área sostiene una parte del equipo.",
  },
  team: {
    label: "Equipo",
    title: "Las personas detrás de Nova",
    subtitle: "Estudiantes de distintas carreras de la UNI que comparten la pasión por construir robots.",
    stats: ["Miembros activos", "Carreras de ingeniería", "Áreas de trabajo"],
    directiva: "Directiva",
    founders: "Fundadores",
    honorary: "Miembros honorables",
    ctaTitle: "¿Quieres ser parte del equipo?",
    ctaText: "No necesitas experiencia previa en robótica. Buscamos gente que intente, se equivoque e investigue.",
    ctaButton: "Conoce cómo unirte",
  },
  robots: {
    label: "Prototipos",
    titlePrefix: "Nuestros ",
    titleAccent: "robots",
    subtitle:
      "Cada robot se diseña, fabrica y programa dentro del equipo. Estos son los que compitieron con Nova en la temporada 2026.",
    allCategories: "Todas las categorías",
    allLevels: "Todos los niveles",
    result: "resultado",
    results: "resultados",
    empty: "No hay robots con esa combinación de categoría y nivel.",
    categoriesLabel: "Categorías",
    categoriesTitle: "Dónde competimos",
    categoriesSubtitle: "Los niveles Amateur, Senior y Máster ordenan la dificultad dentro de cada categoría.",
    pcbLabel: "Hardware propio",
    pcbTitle: "PCBs universales",
    pcbSubtitle: "Placas diseñadas por Nova en EasyEDA y reutilizadas entre varias categorías.",
  },
  competitions: {
    label: "Competencias",
    titlePrefix: "Palmarés y ",
    titleAccent: "calendario",
    subtitle: "Competimos en torneos universitarios de todo el Perú y llevamos a Nova hasta Rumanía.",
    statFirst: "Primeros puestos",
    statSecond: "Segundos puestos",
    statThird: "Terceros puestos",
    statPlayed: "Torneos disputados",
    upcomingLabel: "Calendario",
    upcomingTitle: "Próximos torneos",
    upcomingEmpty: "Pronto anunciaremos los torneos de la siguiente temporada.",
    recordLabel: "Palmarés",
    recordTitle: "Resultados por temporada",
    recordSubtitle: "Para cada torneo se muestra el mejor puesto que obtuvo el equipo.",
    yearSummary: "{played} torneos · {first} primeros · {second} segundos · {third} terceros",
    organizedByNova: "Organizado por Nova",
    international: "Internacional",
    legacyLabel: "Torneo propio",
    legacyTitle: "Nova Legacy",
    legacySubtitle:
      "El torneo de robótica que organiza Nova Tech en la Universidad Nacional de Ingeniería para reunir a equipos de todo el país.",
    placements: ["1° puesto", "2° puesto", "3° puesto"],
    participation: "Participación",
  },
  join: {
    label: "Únete · Convocatoria",
    titlePrefix: "Forma parte de ",
    titleAccent: "Nova",
    subtitle:
      "En Nova se aprende investigando. No necesitas saber de robótica antes de empezar: buscamos gente que intente, se equivoque, investigue y busque soluciones, con el apoyo del encargado de la convocatoria.",
    goToForm: "Ir a la inscripción",
    cycle: [
      {
        title: "Lee",
        description:
          "Todo lo que sabe el equipo se publica en esta web: las lecciones de Academia Nova, nuestros robots y su documentación. Es tu punto de partida.",
      },
      {
        title: "Investiga",
        description:
          "Cuando algo no está explicado, búscalo: hojas de datos, documentación oficial, foros. Usar inteligencia artificial para que te expliquen está permitido; copiar sin entender, no. Si sigues trabado, pregúntale al encargado de la convocatoria.",
      },
      {
        title: "Prueba",
        description:
          "Lleva lo que aprendiste a los simuladores y, más adelante, al hardware real. Equivocarte es parte del proceso.",
      },
      {
        title: "Documenta",
        description:
          "Cuando logras algo, llenas una ficha corta de bitácora: qué querías, qué hiciste, qué pasó y qué aprendiste. Así compartimos lo que sabemos.",
      },
    ],
    quote:
      "Por eso Academia Nova no tiene clases dictadas: es una guía escrita para que investigues a tu ritmo. Pero no estás solo: un encargado de la convocatoria resuelve tus dudas y, según su disponibilidad, organiza reuniones de refuerzo o algún compartir con el equipo.",
    routeLabel: "Ruta",
    routeTitle: "Cómo avanzas en Nova",
    routeSubtitle: "Cada nivel se gana demostrando lo que aprendiste en el anterior.",
    levels: [
      {
        step: "Parte 1",
        title: "Bienvenida",
        description:
          "Lees las lecciones de Academia Nova a tu ritmo, practicas en simuladores online y terminas con una tarea final. Nadie te dicta clases.",
        detail: "16 a 20 horas · 3 semanas",
      },
      {
        step: "Parte 2",
        title: "Soldadura y práctica",
        description:
          "Aprendes soldadura THT y SMD con texto y videos. Luego vienes a una práctica presencial: recibes un kit de placa y la sueldas con guía del equipo.",
        detail: "Al aprobar la tarea final de la Parte 1",
      },
      {
        step: "Final",
        title: "Miembro de Nova",
        description:
          "Accedes al material interno, al foro y a la bitácora del equipo, y te integras a una categoría de competencia o a un proyecto de investigación.",
        detail: "La directiva decide tu ingreso",
      },
    ],
    learnLabel: "Academia Nova · Parte 1",
    learnTitle: "Qué vas a investigar",
    learnSubtitle:
      "Todos los robots del equipo, del minisumo al OTTO, están hechos de las mismas piezas básicas. Al final las unes en tu propio Panel de control Nova con un ESP32.",
    reqLabel: "Requisitos",
    reqTitle: "Lo que necesitas",
    requirements: [
      "Una computadora con internet (Windows, Mac o Linux).",
      "Un mouse con rueda, casi obligatorio para el diseño 3D.",
      "Cuentas gratuitas en Wokwi, EasyEDA y Onshape.",
      "Un cuaderno para cálculos, dibujos y tu bitácora.",
    ],
    reqNote: "No necesitas comprar componentes: el kit de práctica te lo da el equipo en la Parte 2.",
    howLabel: "Convocatoria",
    howTitle: "Cómo funciona",
    steps: [
      { title: "Te inscribes", description: "Llenas el formulario de abajo con el Gmail con el que iniciarás sesión." },
      {
        title: "Te asignamos a un grupo",
        description: "La directiva revisa tu inscripción y te avisa la fecha en que empieza tu grupo.",
      },
      {
        title: "Investigas durante 3 semanas",
        description: "Desde esa fecha entras a Academia Nova con tu cuenta y avanzas a tu ritmo.",
      },
      {
        title: "Entregas la tarea final",
        description:
          "El Panel de control Nova, con un video y tu bitácora. Si la directiva la aprueba, sigues con la Parte 2.",
      },
    ],
    formLabel: "Inscripción",
    formTitle: "¿Listo para empezar?",
    formSubtitle: "Déjanos tus datos y la directiva te asignará a un grupo de la convocatoria.",
    doubts: "¿Tienes dudas?",
    writeUs: "Escríbenos",
  },
  form: {
    name: "Nombre completo",
    email: "Gmail",
    emailPlaceholder: "tu.nombre@gmail.com",
    emailHint: "Usa el mismo correo con el que iniciarás sesión: tu acceso quedará ligado a él.",
    whatsapp: "WhatsApp",
    career: "Carrera",
    careerPlaceholder: "Ingeniería Mecatrónica",
    cycle: "Ciclo",
    cyclePlaceholder: "Elige",
    cycleOption: "{n}.º ciclo",
    submit: "Enviar inscripción",
    sending: "Enviando...",
    errName: "Escribe tu nombre completo",
    errEmail: "Escribe un correo válido",
    errWhatsapp: "Escribe un número válido, por ejemplo 987654321",
    errCareer: "Escribe tu carrera",
    errCycle: "Elige tu ciclo",
    errDomain: "Ese dominio de correo no existe, revisa que esté bien escrito",
    errDuplicate: "Ya tienes una inscripción pendiente con este correo",
    toastTitle: "No se pudo enviar",
    toastDescription: "Inténtalo de nuevo en unos minutos",
    successTitle: "¡Inscripción recibida!",
    successBefore:
      "La directiva revisará tu solicitud. Cuando te asignen a un grupo, podrás entrar a Academia Nova iniciando sesión con ",
    successAfter: ".",
  },
} as const;

type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly Widen<U>[]
    : { readonly [K in keyof T]: Widen<T[K]> };

export type PageText = Widen<typeof es>;

const en: PageText = {
  about: {
    label: "About",
    titlePrefix: "We are Nova",
    titleAccent: "Tech",
    subtitle:
      "Research, development and innovation group in robotics at the National University of Engineering (UNI). We design, build and program high-performance hardware.",
    pillars: [
      { title: "Mechanical design", description: "We model chassis and parts in Onshape and manufacture them with 3D printing." },
      {
        title: "Electronics",
        description: "We design our own PCBs in EasyEDA, with the ESP32 as the brain of our robots.",
      },
      {
        title: "Programming",
        description: "We write the firmware and control software that lets each robot perceive, decide and act.",
      },
    ],
    seasonSummary: "{played} tournaments and {first} first places",
    milestones: [
      { date: "2025", title: "2025 season", description: "" },
      { date: "Jun 2025", title: "Nova Legacy I", description: "We organized our own tournament at UNI." },
      {
        date: "Oct 2025",
        title: "RoboChallenge Romania",
        description: "First international competition, at the Polytechnic University of Bucharest.",
      },
      { date: "2026", title: "2026 season", description: "" },
    ],
    historyLabel: "Timeline",
    historyTitle: "Our story",
    orgLabel: "Organization",
    orgTitle: "Our areas",
    orgSubtitle: "Nova works like an organization: each area supports a part of the team.",
  },
  team: {
    label: "Team",
    title: "The people behind Nova",
    subtitle: "Students from different degree programs at UNI who share a passion for building robots.",
    stats: ["Active members", "Engineering programs", "Work areas"],
    directiva: "Executive board",
    founders: "Founders",
    honorary: "Honorary members",
    ctaTitle: "Want to be part of the team?",
    ctaText: "You don't need prior robotics experience. We look for people who try, make mistakes and investigate.",
    ctaButton: "Learn how to join",
  },
  robots: {
    label: "Prototypes",
    titlePrefix: "Our ",
    titleAccent: "robots",
    subtitle:
      "Every robot is designed, built and programmed within the team. These are the ones that competed with Nova in the 2026 season.",
    allCategories: "All categories",
    allLevels: "All levels",
    result: "result",
    results: "results",
    empty: "No robots match that combination of category and level.",
    categoriesLabel: "Categories",
    categoriesTitle: "Where we compete",
    categoriesSubtitle: "The Amateur, Senior and Master levels sort the difficulty within each category.",
    pcbLabel: "In-house hardware",
    pcbTitle: "Universal PCBs",
    pcbSubtitle: "Boards designed by Nova in EasyEDA and reused across several categories.",
  },
  competitions: {
    label: "Competitions",
    titlePrefix: "Honors and ",
    titleAccent: "calendar",
    subtitle: "We compete in university tournaments across Peru and have taken Nova as far as Romania.",
    statFirst: "First places",
    statSecond: "Second places",
    statThird: "Third places",
    statPlayed: "Tournaments played",
    upcomingLabel: "Calendar",
    upcomingTitle: "Upcoming tournaments",
    upcomingEmpty: "We'll announce next season's tournaments soon.",
    recordLabel: "Honors",
    recordTitle: "Results by season",
    recordSubtitle: "For each tournament, the best placement the team earned is shown.",
    yearSummary: "{played} tournaments · {first} firsts · {second} seconds · {third} thirds",
    organizedByNova: "Organized by Nova",
    international: "International",
    legacyLabel: "Our own tournament",
    legacyTitle: "Nova Legacy",
    legacySubtitle:
      "The robotics tournament NovaTech organizes at the National University of Engineering to bring together teams from all over the country.",
    placements: ["1st place", "2nd place", "3rd place"],
    participation: "Participation",
  },
  join: {
    label: "Join us · Open call",
    titlePrefix: "Be part of ",
    titleAccent: "Nova",
    subtitle:
      "At Nova you learn by investigating. You don't need to know robotics before you start: we look for people who try, make mistakes, investigate and find solutions, with the support of the call coordinator.",
    goToForm: "Go to the sign-up form",
    cycle: [
      {
        title: "Read",
        description:
          "Everything the team knows is published on this site: the Academia Nova lessons, our robots and their documentation. It's your starting point.",
      },
      {
        title: "Investigate",
        description:
          "When something isn't explained, look it up: datasheets, official documentation, forums. Using artificial intelligence to explain things is allowed; copying without understanding is not. If you're still stuck, ask the call coordinator.",
      },
      {
        title: "Test",
        description:
          "Take what you learned to the simulators and, later, to real hardware. Making mistakes is part of the process.",
      },
      {
        title: "Document",
        description:
          "When you achieve something, you fill out a short logbook entry: what you wanted, what you did, what happened and what you learned. That's how we share what we know.",
      },
    ],
    quote:
      "That's why Academia Nova has no lectures: it's a written guide for you to investigate at your own pace. But you're not alone: a call coordinator answers your questions and, depending on availability, organizes review sessions or a get-together with the team.",
    routeLabel: "Path",
    routeTitle: "How you advance in Nova",
    routeSubtitle: "Each level is earned by showing what you learned in the previous one.",
    levels: [
      {
        step: "Part 1",
        title: "Welcome",
        description:
          "You read the Academia Nova lessons at your own pace, practice in online simulators and finish with a final assignment. Nobody lectures you.",
        detail: "16 to 20 hours · 3 weeks",
      },
      {
        step: "Part 2",
        title: "Soldering and practice",
        description:
          "You learn THT and SMD soldering with text and videos. Then you come to an in-person practice session: you get a board kit and solder it with the team's guidance.",
        detail: "After passing the Part 1 final assignment",
      },
      {
        step: "Final",
        title: "Nova member",
        description:
          "You get access to the internal material, the forum and the team logbook, and join a competition category or a research project.",
        detail: "The board decides your admission",
      },
    ],
    learnLabel: "Academia Nova · Part 1",
    learnTitle: "What you'll investigate",
    learnSubtitle:
      "All of the team's robots, from the minisumo to the OTTO, are made from the same basic parts. In the end you combine them in your own Nova control panel with an ESP32.",
    reqLabel: "Requirements",
    reqTitle: "What you need",
    requirements: [
      "A computer with internet access (Windows, Mac or Linux).",
      "A mouse with a scroll wheel, almost mandatory for 3D design.",
      "Free accounts on Wokwi, EasyEDA and Onshape.",
      "A notebook for calculations, drawings and your logbook.",
    ],
    reqNote: "You don't need to buy components: the team gives you the practice kit in Part 2.",
    howLabel: "Open call",
    howTitle: "How it works",
    steps: [
      { title: "You sign up", description: "You fill out the form below with the Gmail you'll use to log in." },
      {
        title: "We assign you to a group",
        description: "The board reviews your application and tells you the date your group starts.",
      },
      {
        title: "You investigate for 3 weeks",
        description: "From that date you enter Academia Nova with your account and progress at your own pace.",
      },
      {
        title: "You submit the final assignment",
        description:
          "The Nova control panel, with a video and your logbook. If the board approves it, you move on to Part 2.",
      },
    ],
    formLabel: "Sign-up",
    formTitle: "Ready to start?",
    formSubtitle: "Leave us your details and the board will assign you to a group in the call.",
    doubts: "Questions?",
    writeUs: "Write to us",
  },
  form: {
    name: "Full name",
    email: "Gmail",
    emailPlaceholder: "your.name@gmail.com",
    emailHint: "Use the same email you'll log in with: your access will be tied to it.",
    whatsapp: "WhatsApp",
    career: "Degree program",
    careerPlaceholder: "Mechatronics Engineering",
    cycle: "Semester",
    cyclePlaceholder: "Choose",
    cycleOption: "Semester {n}",
    submit: "Submit application",
    sending: "Sending...",
    errName: "Enter your full name",
    errEmail: "Enter a valid email",
    errWhatsapp: "Enter a valid number, for example 987654321",
    errCareer: "Enter your degree program",
    errCycle: "Choose your semester",
    errDomain: "That email domain doesn't exist, check that it's spelled correctly",
    errDuplicate: "You already have a pending application with this email",
    toastTitle: "Couldn't send",
    toastDescription: "Please try again in a few minutes",
    successTitle: "Application received!",
    successBefore:
      "The board will review your request. Once you're assigned to a group, you can enter Academia Nova by signing in with ",
    successAfter: ".",
  },
};

export const pageText: Record<Lang, PageText> = { es, en };

// Datos que viven en src/data o src/lib/academia: solo se traducen aquí para mostrarlos.
export const areasEn: readonly { name: string; description: string }[] = [
  { name: "General Management", description: "Coordinates the areas and sets the team's annual plan." },
  { name: "Academic Area", description: "Organizes internal training, workshops and Academia Nova." },
  { name: "Research Area", description: "Drives robotics projects together with UNI's Vice-Rectorate for Research." },
  { name: "Human Resources", description: "Runs the recruitment calls and supports every team member." },
  { name: "Finance and Logistics", description: "Manages imports, materials inventory and tools." },
  { name: "Marketing", description: "Handles Nova's identity, social media and event outreach." },
  { name: "External Relations", description: "Builds ties with other universities, teams and organizations." },
];

export const robotCategoryDescriptionsEn: Record<string, string> = {
  "minisumo-autonomo":
    "10 × 10 cm, 500 g robots that detect their opponent and push it out of the dohyo with no human control.",
  "minisumo-bt": "The same format as the minisumo, but driven remotely over Bluetooth.",
  microsumo: "The smallest version of robot sumo: autonomous matches inside a 5 cm cube.",
  seguidor: "They follow a line-marked track in the shortest time possible, using sensors and PID control.",
  soccer: "Teams of robots that play soccer matches on a reduced field.",
  walking: "Race of OTTO-style biped robots that walk with servo motors instead of wheels.",
  bug: "Race of small insect-like robots that move without wheels.",
  combate: "Combat between robots of up to one pound inside a closed arena.",
};

export const pcbsEn: Record<string, { name: string; usedIn: string }> = {
  "PCB Universal Senior-Máster V2": {
    name: "Universal PCB Senior-Master V2",
    usedIn: "Minisumo, Microsumo and Robot Soccer",
  },
  "PCB Universal Senior-Máster V1": { name: "Universal PCB Senior-Master V1", usedIn: "Minisumo and Robot Soccer" },
  "PCB Universal Senior + Regleta de Sensores": {
    name: "Universal PCB Senior + Sensor Array",
    usedIn: "Speed Line Follower",
  },
  "PCB Universal Articulados": {
    name: "Universal PCB Articulated",
    usedIn: "Servo-driven robots (OTTO, humanoids)",
  },
};

export const moduleInfoEn: Record<string, { name: string; tool: string; duration: string; summary: string }> = {
  electronica: {
    name: "Electronics",
    tool: "EasyEDA Pro",
    duration: "5 to 6 hours",
    summary: "Basic electricity, the ESP32 and your first schematics and PCBs.",
  },
  mecanica: {
    name: "Mechanics",
    tool: "Onshape",
    duration: "5 hours",
    summary: "Design of 3D parts ready to print.",
  },
  programacion: {
    name: "Programming",
    tool: "Wokwi and Arduino IDE (optional)",
    duration: "7 hours",
    summary: "Program the ESP32: LEDs, buttons, sensors, servos and commands.",
  },
};

export const fillTemplate = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
