import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, CircuitBoard, Cpu, ExternalLink, FileText, Lock } from "lucide-react";
import novatechLogo from "@/assets/novatech-logo.png";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemberAccess } from "@/hooks/use-member-access";
import { listMemberMaterial } from "@/services/supabase/miembros";
import { robotCategories, robots } from "@/data/robots";
import type { MemberMaterial, MemberMaterialType } from "@/types/domain";

const typeInfo: Record<MemberMaterialType, { label: string; icon: typeof FileText }> = {
  descripcion: { label: "Descripción", icon: FileText },
  componente: { label: "Componente", icon: Cpu },
  pcb: { label: "PCB", icon: CircuitBoard },
  documento: { label: "Documento", icon: BookOpen },
};

const sections = [
  { id: "general", name: "General", description: "Componentes, PCBs y documentos que se usan en varios robots." },
  ...robotCategories,
];

// El material lo carga el staff, pero igual se descartan enlaces que no sean web.
const isSafeUrl = (url: string | null): url is string => !!url && /^https?:\/\//i.test(url);

export default function Miembros() {
  const { loading, isMember } = useMemberAccess();
  const [material, setMaterial] = useState<MemberMaterial[]>([]);
  const [materialLoading, setMaterialLoading] = useState(true);

  useEffect(() => {
    if (!isMember) return;
    listMemberMaterial()
      .then(setMaterial)
      .catch(() => setMaterial([]))
      .finally(() => setMaterialLoading(false));
  }, [isMember]);

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={novatechLogo} alt="NovaTech" className="h-10 w-10" />
            <span className="font-display font-bold text-gradient-primary hidden sm:block">NOVATECH</span>
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} />
            Volver al panel
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">
            Zona de <span className="text-gradient-primary">miembros</span>
          </h1>
          <p className="text-muted-foreground">Material interno de robots, componentes y PCBs del equipo.</p>
        </motion.div>

        {loading ? (
          <div className="animate-pulse text-primary">Cargando...</div>
        ) : !isMember ? (
          <Card className="glass-card border-border/30">
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <Lock className="h-6 w-6 text-muted-foreground shrink-0 mt-1" />
              <div className="space-y-1">
                <CardTitle className="text-lg">Zona exclusiva para miembros de Nova</CardTitle>
                <CardDescription>
                  Los convocados pasan a ser miembros cuando la directiva aprueba su entregable final.{" "}
                  <Link to="/unete" className="text-primary hover:underline">
                    Conoce cómo unirte
                  </Link>
                  .
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        ) : materialLoading ? (
          <div className="animate-pulse text-primary">Cargando material...</div>
        ) : (
          <div className="space-y-6">
            {sections.map((section) => {
              const items = material.filter((m) => m.categoria === section.id);
              const sectionRobots = robots.filter((r) => r.categories.some((c) => c === section.id));

              return (
                <Card key={section.id} className="glass-card border-border/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{section.name}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                    {sectionRobots.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {sectionRobots.map((r) => (
                          <Badge key={r.name} variant="outline">
                            {r.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {items.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Pronto: material de esta categoría.</p>
                    ) : (
                      items.map((item) => {
                        const { label, icon: Icon } = typeInfo[item.tipo] ?? typeInfo.documento;
                        return (
                          <div key={item.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                            <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-medium">{item.titulo}</p>
                                <Badge variant="secondary">{label}</Badge>
                                {item.robot && <Badge variant="outline">{item.robot}</Badge>}
                              </div>
                              {item.descripcion && (
                                <p className="text-sm text-muted-foreground whitespace-pre-line">{item.descripcion}</p>
                              )}
                            </div>
                            {isSafeUrl(item.url) && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-primary hover:underline shrink-0"
                              >
                                Abrir
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
