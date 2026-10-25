import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Canvas, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { LEFT, RIGHT, kindColor, type Pin, type PinKind } from "@/lib/academia/esp32-pins";

// El ESP32 DevKit V1 de 30 pines en 3D, armado pieza por pieza con sus medidas reales (1 unidad = 1 mm).
// Vista con el USB hacia abajo, igual que la placa 2D. x: ancho, z: largo (el USB en +z), y: altura.

export type PartId = "modulo" | "usb" | "chip" | "regulador" | "en" | "boot" | "pines";
export type ChipId = "ch340" | "cp2102";
export interface PinRef {
  side: "left" | "right";
  index: number;
}

const BOARD = { width: 28, length: 51.5, thickness: 1.6 };
const TOP = BOARD.thickness / 2;
const PIN_X = 12.7; // las dos filas están a 25,4 mm
const PIN_Z0 = -15.24;
const PITCH = 2.54;
const pinZ = (index: number) => PIN_Z0 + index * PITCH;

const PCB_COLOR = "#16191d";
const HIGHLIGHT = new THREE.Color("#8954d4");

// ---------------------------------------------------------------- texturas dibujadas (serigrafía y rótulos)

function useCanvasTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void, deps: unknown[]) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx) draw(ctx);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

// La cara de arriba de la placa: color, nombres de los pines y el nombre de la placa.
function Silkscreen() {
  const scale = 20; // px por mm
  const texture = useCanvasTexture(
    BOARD.width * scale,
    BOARD.length * scale,
    (ctx) => {
      const mm = (v: number) => v * scale;
      const toX = (x: number) => mm(x + BOARD.width / 2);
      const toZ = (z: number) => mm(z + BOARD.length / 2);
      ctx.fillStyle = PCB_COLOR;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = "#e8e8e8";
      ctx.strokeStyle = "#e8e8e8";
      ctx.lineWidth = 2;
      ctx.textBaseline = "middle";
      ctx.font = `bold ${mm(1.25)}px Arial, sans-serif`;
      LEFT.forEach((pin, i) => {
        ctx.textAlign = "left";
        ctx.fillText(pin.label, toX(-PIN_X + 1.5), toZ(pinZ(i)));
      });
      RIGHT.forEach((pin, i) => {
        ctx.textAlign = "right";
        ctx.fillText(pin.label, toX(PIN_X - 1.5), toZ(pinZ(i)));
      });
      ctx.textAlign = "center";
      ctx.font = `bold ${mm(1.4)}px Arial, sans-serif`;
      ctx.fillText("ESP32 DEVKIT V1", toX(0), toZ(2.2));
      ctx.font = `${mm(1.1)}px Arial, sans-serif`;
      ctx.fillText("EN", toX(-7.5), toZ(17.6));
      ctx.fillText("BOOT", toX(7.5), toZ(17.6));
      // Un borde fino, como el contorno impreso de las placas.
      ctx.strokeRect(mm(0.6), mm(0.6), ctx.canvas.width - mm(1.2), ctx.canvas.height - mm(1.2));
    },
    [],
  );
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, TOP + 0.01, 0]}>
      <planeGeometry args={[BOARD.width, BOARD.length]} />
      <meshStandardMaterial map={texture} roughness={0.8} />
    </mesh>
  );
}

function Engraving({ text, width, depth, y, z = 0, x = 0, color = "#3a3a3a", size = 1.6 }: {
  text: string[];
  width: number;
  depth: number;
  y: number;
  x?: number;
  z?: number;
  color?: string;
  size?: number;
}) {
  const scale = 40;
  const texture = useCanvasTexture(
    width * scale,
    depth * scale,
    (ctx) => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      text.forEach((line, i) => {
        ctx.font = `${i === 0 ? "bold " : ""}${size * scale * (i === 0 ? 1 : 0.75)}px Arial, sans-serif`;
        ctx.fillText(line, ctx.canvas.width / 2, ctx.canvas.height / 2 + (i - (text.length - 1) / 2) * size * scale * 1.3);
      });
    },
    [text.join("|"), color],
  );
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, y, z]}>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  );
}

// ---------------------------------------------------------------- piezas

// Los materiales de una pieza elegida brillan un poco en morado.
const Glow = createContext(0);

interface PartProps {
  selectable: boolean;
  selected: boolean;
  onSelect: () => void;
  label: string;
  children: ReactNode;
  labelAt: [number, number, number];
}

// Una pieza que se puede tocar: se ilumina al pasar el mouse y al elegirla.
function Part({ selectable, selected, onSelect, label, children, labelAt }: PartProps) {
  const [hover, setHover] = useState(false);
  const glow = selectable && (selected || hover);
  return (
    <group
      onClick={(e: ThreeEvent<MouseEvent>) => {
        if (!selectable) return;
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        if (!selectable) return;
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = "";
      }}
    >
      <Glow.Provider value={glow ? (selected ? 0.55 : 0.25) : 0}>{children}</Glow.Provider>
      {selectable && selected && (
        <Html position={labelAt} center distanceFactor={60} zIndexRange={[20, 0]} pointerEvents="none">
          <span className="pointer-events-none whitespace-nowrap rounded-full bg-[#8954d4] px-2.5 py-1 text-xs font-semibold text-white shadow-lg">
            {label}
          </span>
        </Html>
      )}
    </group>
  );
}


function Box({
  size,
  position,
  color,
  metal = false,
  rough = 0.6,
}: {
  size: [number, number, number];
  position: [number, number, number];
  color: string;
  metal?: boolean;
  rough?: number;
}) {
  const glow = useContext(Glow);
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        metalness={metal ? 0.85 : 0.1}
        roughness={metal ? 0.3 : rough}
        emissive={HIGHLIGHT}
        emissiveIntensity={glow}
      />
    </mesh>
  );
}

// El módulo ESP-WROOM-32: su placa, la tapa metálica y la antena dibujada en zigzag.
function Module() {
  const moduleZ = -BOARD.length / 2 + 12.75;
  const y = TOP + 0.4;
  const antenna = useMemo(() => {
    const segments: { x: number; z: number; w: number; d: number }[] = [];
    const z0 = -BOARD.length / 2 + 1.2;
    for (let i = 0; i < 6; i++) {
      const x = -6 + i * 2.4;
      segments.push({ x, z: z0 + 2.2, w: 0.45, d: 4.4 });
      if (i < 5) segments.push({ x: x + 1.2, z: i % 2 === 0 ? z0 + 4.4 : z0, w: 2.4 + 0.45, d: 0.45 });
    }
    return segments;
  }, []);
  return (
    <>
      <Box size={[18, 0.8, 25.5]} position={[0, y, moduleZ]} color="#1f2a36" />
      <Box size={[16, 2.4, 17.6]} position={[0, y + 0.4 + 1.2, moduleZ + 3.4]} color="#b9bec4" metal />
      <Engraving text={["ESP-WROOM-32", "Wi-Fi + Bluetooth"]} width={14} depth={6} y={y + 0.4 + 2.41} z={moduleZ + 3.4} color="#4b5056" size={1.5} />
      {antenna.map((s, i) => (
        <Box key={i} size={[s.w, 0.05, s.d]} position={[s.x, y + 0.42, s.z]} color="#c9a64e" metal />
      ))}
    </>
  );
}

function UsbConnector() {
  return (
    <>
      <Box size={[7.6, 2.6, 5.6]} position={[0, TOP + 1.3, BOARD.length / 2 - 2.2]} color="#c7cbd1" metal />
      <Box size={[6.4, 1.6, 0.3]} position={[0, TOP + 1.3, BOARD.length / 2 + 0.56]} color="#2a2d31" />
    </>
  );
}

// El chip que traduce entre el USB y el ESP32: el CH340C (SOP-16) o el CP2102 (QFN-28).
function UsbChip({ chip }: { chip: ChipId }) {
  const z = 12;
  const x = 3;
  if (chip === "cp2102") {
    return (
      <>
        <Box size={[5, 0.9, 5]} position={[x, TOP + 0.45, z]} color="#1b1b1b" rough={0.5} />
        <Engraving text={["CP2102"]} width={4.6} depth={1.6} y={TOP + 0.91} x={x} z={z} color="#9a9a9a" size={1.1} />
      </>
    );
  }
  const legs = Array.from({ length: 8 }, (_, i) => -4.45 + i * 1.27);
  return (
    <>
      <Box size={[4, 1.5, 10]} position={[x, TOP + 0.75, z]} color="#1b1b1b" rough={0.5} />
      {legs.flatMap((dz) => [
        <Box key={`l${dz}`} size={[1.1, 0.25, 0.42]} position={[x - 2.4, TOP + 0.2, z + dz]} color="#b0b4b9" metal />,
        <Box key={`r${dz}`} size={[1.1, 0.25, 0.42]} position={[x + 2.4, TOP + 0.2, z + dz]} color="#b0b4b9" metal />,
      ])}
      <group rotation={[0, Math.PI / 2, 0]} position={[x, 0, z]}>
        <Engraving text={["CH340C"]} width={8} depth={3} y={TOP + 1.51} color="#9a9a9a" size={1.1} />
      </group>
    </>
  );
}

// El regulador AMS1117 (SOT-223): baja los 5 V del USB a 3,3 V.
function Regulator() {
  const x = -4.5;
  const z = 7;
  return (
    <>
      <Box size={[6.5, 1.6, 3.5]} position={[x, TOP + 0.8, z]} color="#1b1b1b" rough={0.5} />
      <Box size={[3, 0.2, 1.4]} position={[x, TOP + 0.1, z - 2.4]} color="#b0b4b9" metal />
      {[-2.3, 0, 2.3].map((dx) => (
        <Box key={dx} size={[0.7, 0.2, 1.4]} position={[x + dx, TOP + 0.1, z + 2.4]} color="#b0b4b9" metal />
      ))}
      <Engraving text={["AMS1117", "3.3"]} width={6} depth={3} y={TOP + 1.61} x={x} z={z} color="#9a9a9a" size={0.9} />
    </>
  );
}

function Button({ x }: { x: number }) {
  return (
    <>
      <Box size={[4.6, 1.4, 3.6]} position={[x, TOP + 0.7, 20.6]} color="#cfd2d6" metal />
      <Box size={[2, 0.9, 1.6]} position={[x, TOP + 1.85, 20.6]} color="#232323" />
    </>
  );
}

// Detalles sin explicación: los LEDs y algunos componentes pequeños, para que se vea como la placa real.
function Details() {
  return (
    <>
      <Box size={[1.6, 0.6, 0.8]} position={[-3, TOP + 0.3, 19.6]} color="#e23b3b" />
      <Box size={[1.6, 0.6, 0.8]} position={[3, TOP + 0.3, 19.6]} color="#3b6be2" />
      {[
        [-7, 4],
        [-7, 10.5],
        [7.5, 4.5],
        [-1.5, 15.8],
        [8.5, 9],
      ].map(([x, z], i) => (
        <Box key={i} size={[1.6, 0.6, 0.8]} position={[x, TOP + 0.3, z]} color={i % 2 ? "#c9a46b" : "#2b2b2b"} />
      ))}
    </>
  );
}

// ---------------------------------------------------------------- pines

function Pins({
  interactive,
  selected,
  filter,
  labels,
  onSelect,
  highlightAll,
}: {
  interactive: boolean;
  selected: PinRef | null;
  filter: PinKind | null;
  labels: boolean;
  onSelect: (pin: PinRef) => void;
  highlightAll: boolean;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const rows: { side: "left" | "right"; pins: Pin[]; x: number }[] = [
    { side: "left", pins: LEFT, x: -PIN_X },
    { side: "right", pins: RIGHT, x: PIN_X },
  ];
  // Los pines que más usaremos llevan su rótulo.
  const labeled = (pin: Pin) => pin.kinds.includes("nova") || pin.kinds.includes("power");
  const novaUse: Record<string, string> = {
    D18: "LED verde",
    D19: "LED amarillo",
    D23: "LED rojo",
    D21: "Botón",
    D34: "Potenciómetro",
    D25: "Servo",
  };

  return (
    <>
      {rows.map((row) => (
        <group key={row.side}>
          {/* La tira de plástico negro de los pines, por debajo de la placa */}
          <mesh position={[row.x, -TOP - 1.25, 0.03 + (PIN_Z0 + 7 * PITCH)]}>
            <boxGeometry args={[2.5, 2.5, 15 * PITCH]} />
            <meshStandardMaterial color="#141414" roughness={0.7} />
          </mesh>
          {row.pins.map((pin, index) => {
            const z = pinZ(index);
            const id = `${row.side}-${index}`;
            const isSelected = selected?.side === row.side && selected.index === index;
            const inFilter = filter ? pin.kinds.includes(filter) : highlightAll;
            const color = `rgb(${kindColor(pin).replace(/ /g, ",")})`;
            const lit = isSelected || hover === id || inFilter;
            return (
              <group key={id} position={[row.x, 0, z]}>
                {/* Pad dorado y la punta del pin soldado */}
                <mesh position={[0, TOP + 0.03, 0]}>
                  <cylinderGeometry args={[0.95, 0.95, 0.06, 20]} />
                  <meshStandardMaterial color="#c8a45a" metalness={0.9} roughness={0.3} />
                </mesh>
                <mesh position={[0, TOP + 0.45, 0]}>
                  <cylinderGeometry args={[0.38, 0.5, 0.8, 12]} />
                  <meshStandardMaterial color="#c9ccd1" metalness={0.9} roughness={0.25} />
                </mesh>
                {/* El pin que baja para conectarse al protoboard */}
                <mesh position={[0, -TOP - 2.5 - 3, 0]}>
                  <boxGeometry args={[0.64, 6, 0.64]} />
                  <meshStandardMaterial color="#d4b15e" metalness={0.9} roughness={0.3} />
                </mesh>
                {/* Aro de color cuando el pin está elegido o en el filtro */}
                {lit && (
                  <mesh position={[0, TOP + 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[1.05, isSelected ? 1.55 : 1.35, 28]} />
                    <meshBasicMaterial color={isSelected ? "#ffffff" : color} />
                  </mesh>
                )}
                {interactive && (
                  <mesh
                    position={[0, TOP + 0.8, 0]}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect({ side: row.side, index });
                    }}
                    onPointerOver={(e) => {
                      e.stopPropagation();
                      setHover(id);
                      document.body.style.cursor = "pointer";
                    }}
                    onPointerOut={() => {
                      setHover(null);
                      document.body.style.cursor = "";
                    }}
                  >
                    <boxGeometry args={[2.4, 2, 2.4]} />
                    <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                  </mesh>
                )}
                {interactive && labels && labeled(pin) && (
                  <Html
                    position={[row.side === "left" ? -3.4 : 3.4, TOP + 0.5, 0]}
                    center
                    distanceFactor={55}
                    zIndexRange={[10, 0]}
                    pointerEvents="none"
                  >
                    <span
                      className="pointer-events-none whitespace-nowrap rounded px-1 text-[10px] font-semibold leading-4 text-black shadow"
                      style={{ background: color }}
                    >
                      {pin.label}
                      {novaUse[pin.label] ? ` · ${novaUse[pin.label]}` : ""}
                    </span>
                  </Html>
                )}
              </group>
            );
          })}
        </group>
      ))}
    </>
  );
}

// ---------------------------------------------------------------- la escena

// Aleja la cámara en pantallas angostas (celular) para que la placa entera quepa.
function CameraFit() {
  const camera = useThree((state) => state.camera);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  useEffect(() => {
    const distance = 78 * Math.max(1, 1.05 / (width / height));
    camera.position.set(0, distance * 0.82, distance * 0.58);
    camera.lookAt(0, 0, 2);
  }, [camera, width, height]);
  return null;
}

export interface Esp32SceneProps {
  mode: "partes" | "pines";
  chip: ChipId;
  selectedPart?: PartId | null;
  onSelectPart?: (part: PartId) => void;
  selectedPin?: PinRef | null;
  onSelectPin?: (pin: PinRef) => void;
  filter?: PinKind | null;
  labels?: boolean;
  partNames: Record<PartId, string>;
  resetKey: number;
}

export default function Esp32Scene({
  mode,
  chip,
  selectedPart = null,
  onSelectPart = () => {},
  selectedPin = null,
  onSelectPin = () => {},
  filter = null,
  labels = true,
  partNames,
  resetKey,
}: Esp32SceneProps) {
  const parts = mode === "partes";
  const part = (id: PartId, labelAt: [number, number, number], children: ReactNode) => (
    <Part selectable={parts} selected={selectedPart === id} onSelect={() => onSelectPart(id)} label={partNames[id]} labelAt={labelAt}>
      {children}
    </Part>
  );

  return (
    <Canvas
      key={resetKey}
      camera={{ position: [0, 62, 46], fov: 38, near: 1, far: 500 }}
      dpr={[1, 2]}
      frameloop="demand"
      style={{ touchAction: "none" }}
      onPointerMissed={() => (document.body.style.cursor = "")}
    >
      <color attach="background" args={["#0b0b0c"]} />
      <CameraFit />
      <hemisphereLight args={["#ffffff", "#30343a", 1.1]} />
      <directionalLight position={[30, 60, 25]} intensity={1.6} />
      <directionalLight position={[-30, 20, -30]} intensity={0.5} />

      <group position={[0, 0, 0]}>
        {/* La placa */}
        <mesh>
          <boxGeometry args={[BOARD.width, BOARD.thickness, BOARD.length]} />
          <meshStandardMaterial color={PCB_COLOR} roughness={0.8} />
        </mesh>
        <Silkscreen />

        {part("modulo", [0, 8, -10], <Module />)}
        {part("usb", [0, 7, 24], <UsbConnector />)}
        {part("chip", [3, 6, 12], <UsbChip chip={chip} />)}
        {part("regulador", [-4.5, 6, 7], <Regulator />)}
        {part("en", [-7.5, 6, 20.6], <Button x={-7.5} />)}
        {part("boot", [7.5, 6, 20.6], <Button x={7.5} />)}
        <Details />

        {parts ? (
          <Part selectable selected={selectedPart === "pines"} onSelect={() => onSelectPart("pines")} label={partNames.pines} labelAt={[-PIN_X, 6, 0]}>
            <Pins interactive={false} selected={null} filter={null} labels={false} onSelect={() => {}} highlightAll={selectedPart === "pines"} />
            {/* Zona para tocar las dos filas de pines */}
            {[-PIN_X, PIN_X].map((x) => (
              <mesh key={x} position={[x, TOP + 0.8, PIN_Z0 + 7 * PITCH]}>
                <boxGeometry args={[2.6, 2, 15 * PITCH]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>
            ))}
          </Part>
        ) : (
          <Pins interactive selected={selectedPin} filter={filter} labels={labels} onSelect={onSelectPin} highlightAll={false} />
        )}
      </group>

      <OrbitControls makeDefault enablePan={false} enableDamping minDistance={35} maxDistance={130} target={[0, 0, 2]} />
    </Canvas>
  );
}
