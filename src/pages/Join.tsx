import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowDown,
  BookOpen,
  CircuitBoard,
  Code2,
  Cog,
  FlaskConical,
  Laptop,
  Mouse,
  NotebookPen,
  Search,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { PageLayout } from "@/components/landing/PageLayout";
import { Label, PageHero, Section } from "@/components/landing/PageSection";
import { fadeIn } from "@/lib/page-motion";
import { ApplicationForm } from "@/components/landing/ApplicationForm";
import { moduleInfo, type ModuleId } from "@/lib/academia/modules";
import { useLanguage } from "@/contexts/LanguageContext";
import { moduleInfoEn, pageText } from "@/lib/i18n-pages";

const cycleIcons: LucideIcon[] = [BookOpen, Search, FlaskConical, NotebookPen];

const moduleIcons: Record<ModuleId, LucideIcon> = {
  electronica: CircuitBoard,
  mecanica: Cog,
  programacion: Code2,
};

const requirementIcons: LucideIcon[] = [Laptop, Mouse, UserPlus, NotebookPen];

const Join = () => {
  const { lang } = useLanguage();
  const p = pageText[lang].join;

  return (
    <PageLayout>
      <PageHero
        label={p.label}
        title={
          <>
            {p.titlePrefix}
            <span className="text-nova">{p.titleAccent}</span>
          </>
        }
        subtitle={p.subtitle}
        action={
          <a
            href="#inscripcion"
            className="mt-10 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors"
          >
            {p.goToForm}
            <ArrowDown className="h-3.5 w-3.5" />
          </a>
        }
      >
        <ol className="mt-20 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {p.cycle.map((item, index) => {
            const Icon = cycleIcons[index];
            return (
              <motion.li
                key={item.title}
                {...fadeIn}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="border-t border-white/15 pt-6"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-3xl font-light text-nova">0{index + 1}</span>
                  <Icon className="h-8 w-8 text-white/70" strokeWidth={1.25} />
                </div>
                <h3 className="mt-5 font-sans text-lg font-medium text-white">{item.title}</h3>
                <p className="mt-2 text-[15px] font-light leading-relaxed text-white/60">{item.description}</p>
              </motion.li>
            );
          })}
        </ol>

        <motion.p
          {...fadeIn}
          className="mt-20 max-w-3xl border-l border-nova/60 pl-6 text-lg font-light leading-relaxed text-white/80"
        >
          {p.quote}
        </motion.p>
      </PageHero>

      <Section index="01" label={p.routeLabel} title={p.routeTitle} subtitle={p.routeSubtitle}>
        <ol className="relative border-l border-white/15">
          {p.levels.map((level, index) => (
            <motion.li
              key={level.step}
              {...fadeIn}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="relative pl-10 pb-14 last:pb-0"
            >
              <span
                className={`absolute -left-[8px] top-0.5 h-4 w-4 rounded-full ${
                  index === 0 ? "bg-nova" : "border-2 border-white/40 bg-black"
                }`}
              />
              <Label>{level.step}</Label>
              <h3 className="mt-3 font-sans text-2xl font-medium text-white">{level.title}</h3>
              <p className="mt-3 max-w-xl text-base font-light leading-relaxed text-white/60">{level.description}</p>
              <p className="mt-5 font-mono text-sm text-white/60">{level.detail}</p>
            </motion.li>
          ))}
        </ol>
      </Section>

      <Section index="02" label={p.learnLabel} title={p.learnTitle} subtitle={p.learnSubtitle}>
        <ul className="divide-y divide-white/10 border-y border-white/10">
          {moduleInfo.map((moduleData) => {
            const module = lang === "en" ? { ...moduleData, ...moduleInfoEn[moduleData.id] } : moduleData;
            const Icon = moduleIcons[module.id];
            return (
              <motion.li key={module.id} {...fadeIn} className="grid gap-4 py-8 sm:grid-cols-[auto_1fr_auto] sm:items-start">
                <Icon className="h-5 w-5 text-white/60" strokeWidth={1.5} />
                <div>
                  <h3 className="font-sans text-lg font-medium text-white">{module.name}</h3>
                  <p className="mt-1 text-[15px] font-light leading-relaxed text-white/60">{module.summary}</p>
                </div>
                <p className="font-mono text-xs text-white/50 sm:text-right">
                  {module.tool}
                  <br className="hidden sm:block" />
                  <span className="sm:hidden"> · </span>
                  {module.duration}
                </p>
              </motion.li>
            );
          })}
        </ul>
      </Section>

      <Section index="03" label={p.reqLabel} title={p.reqTitle}>
        <ul className="divide-y divide-white/10 border-y border-white/10">
          {p.requirements.map((text, index) => {
            const Icon = requirementIcons[index];
            return (
              <li key={text} className="flex items-start gap-4 py-5 text-[15px] font-light text-white/80">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-white/50" strokeWidth={1.5} />
                {text}
              </li>
            );
          })}
        </ul>
        <p className="mt-6 text-[15px] text-white">{p.reqNote}</p>
      </Section>

      <Section index="04" label={p.howLabel} title={p.howTitle}>
        <ol className="divide-y divide-white/10 border-y border-white/10">
          {p.steps.map((step, index) => (
            <motion.li key={step.title} {...fadeIn} className="flex gap-6 py-6">
              <span className="font-mono text-sm text-nova pt-0.5">0{index + 1}</span>
              <div>
                <h3 className="font-sans text-lg font-medium text-white">{step.title}</h3>
                <p className="mt-1 text-[15px] font-light leading-relaxed text-white/60">{step.description}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </Section>

      <Section
        id="inscripcion"
        index="05"
        label={p.formLabel}
        title={p.formTitle}
        subtitle={p.formSubtitle}
        aside={
          <p className="mt-8 text-sm font-light text-white/50">
            {p.doubts}{" "}
            <Link to="/#contacto" className="text-white underline-offset-4 hover:underline">
              {p.writeUs}
            </Link>
          </p>
        }
      >
        <ApplicationForm />
      </Section>
    </PageLayout>
  );
};

export default Join;
