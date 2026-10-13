import { Bot, Users } from "lucide-react";
import { categoryName, type Robot } from "@/data/robots";

export function RobotCard({ robot }: { robot: Robot }) {
  const Icon = robot.isTeam ? Users : Bot;

  return (
    <div className="group h-full rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors duration-300 hover:border-white/40">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl border border-white/15 flex items-center justify-center text-white/80 group-hover:text-white">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex flex-wrap justify-end gap-1">
          {robot.levels.map((level) => (
            <span key={level} className="px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-full bg-white text-black">
              {level}
            </span>
          ))}
        </div>
      </div>
      <h3 className="font-display text-lg font-bold text-white mb-1">{robot.name}</h3>
      {robot.isTeam && <p className="text-xs text-white/50 mb-2">Equipo de Robot Soccer</p>}
      <ul className="flex flex-wrap gap-1.5 mt-3">
        {robot.categories.map((id) => (
          <li key={id} className="px-2 py-0.5 text-[11px] rounded-md border border-white/15 text-white/70">
            {categoryName(id)}
          </li>
        ))}
      </ul>
    </div>
  );
}
