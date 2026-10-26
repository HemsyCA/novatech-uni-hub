import { Bot, Users } from "lucide-react";
import { categoryName, type Robot } from "@/data/robots";
import { robotImages } from "@/data/robot-images";
import { robotCategoryNamesEn, robotLevelNamesEn, robotTeamNote, type Lang } from "@/lib/i18n";

// Por defecto sigue en español, como el resto de /robots; el Home pasa el idioma activo.
export function RobotCard({ robot, lang = "es" }: { robot: Robot; lang?: Lang }) {
  const Icon = robot.isTeam ? Users : Bot;
  const image = robotImages[robot.name];
  const levelLabel = (level: string) => (lang === "en" ? robotLevelNamesEn[level] ?? level : level);
  const categoryLabel = (id: Robot["categories"][number]) =>
    lang === "en" ? robotCategoryNamesEn[id] ?? categoryName(id) : categoryName(id);

  return (
    <div className="group h-full border-t border-white/15 pt-5 transition-colors duration-300 hover:border-nova">
      {image && (
        <div className="mb-5 overflow-hidden rounded-xl border border-white/10 bg-white/5">
          <img
            src={image}
            alt={robot.name}
            loading="lazy"
            className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <Icon className="h-7 w-7 text-white/60 transition-colors group-hover:text-white" strokeWidth={1.25} />
        <div className="flex flex-wrap justify-end gap-1.5">
          {robot.levels.map((level) => (
            <span
              key={level}
              className="rounded-full border border-white/25 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider text-white/70"
            >
              {levelLabel(level)}
            </span>
          ))}
        </div>
      </div>
      <h3 className="mt-5 font-sans text-xl font-medium text-white">{robot.name}</h3>
      {robot.isTeam && <p className="mt-1 text-sm font-light text-white/50">{robotTeamNote[lang]}</p>}
      <ul className="mt-4 space-y-1">
        {robot.categories.map((id) => (
          <li key={id} className="font-mono text-xs text-white/60">
            {categoryLabel(id)}
          </li>
        ))}
      </ul>
    </div>
  );
}
