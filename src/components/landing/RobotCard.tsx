import { Bot, Users } from "lucide-react";
import { categoryName, type Robot } from "@/data/robots";

export function RobotCard({ robot }: { robot: Robot }) {
  const Icon = robot.isTeam ? Users : Bot;

  return (
    <div className="group h-full border-t border-white/15 pt-5 transition-colors duration-300 hover:border-nova">
      <div className="flex items-start justify-between gap-3">
        <Icon className="h-7 w-7 text-white/60 transition-colors group-hover:text-white" strokeWidth={1.25} />
        <div className="flex flex-wrap justify-end gap-1.5">
          {robot.levels.map((level) => (
            <span
              key={level}
              className="rounded-full border border-white/25 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider text-white/70"
            >
              {level}
            </span>
          ))}
        </div>
      </div>
      <h3 className="mt-5 font-sans text-xl font-medium text-white">{robot.name}</h3>
      {robot.isTeam && <p className="mt-1 text-sm font-light text-white/50">Equipo de Robot Soccer</p>}
      <ul className="mt-4 space-y-1">
        {robot.categories.map((id) => (
          <li key={id} className="font-mono text-xs text-white/60">
            {categoryName(id)}
          </li>
        ))}
      </ul>
    </div>
  );
}
