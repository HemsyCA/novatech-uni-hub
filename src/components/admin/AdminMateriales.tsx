import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { listMaterialesInventario, updateMaterialStock } from "@/services/supabase/inventario";
import type { PrintMaterial } from "@/types/domain";

type Draft = { stock_kg: string; min_stock_kg: string };

// Stock de filamento y resina. Se descuenta solo cuando una reserva de impresión pasa a "completada".
export function AdminMateriales() {
  const [materials, setMaterials] = useState<PrintMaterial[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const { toast } = useToast();

  const load = async () => {
    try {
      const list = await listMaterialesInventario();
      setMaterials(list);
      setDrafts(
        Object.fromEntries(list.map((m) => [m.id, { stock_kg: String(m.stock_kg), min_stock_kg: String(m.min_stock_kg) }])),
      );
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar los materiales", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async (material: PrintMaterial) => {
    const draft = drafts[material.id];
    const stock = Number(draft.stock_kg);
    const min = Number(draft.min_stock_kg);
    if (!Number.isFinite(stock) || !Number.isFinite(min) || stock < 0 || min < 0) {
      toast({ title: "Revisa los números", description: "El stock y el mínimo deben ser 0 o más.", variant: "destructive" });
      return;
    }
    setSavingId(material.id);
    try {
      await updateMaterialStock(material.id, { stock_kg: stock, min_stock_kg: min });
      setMaterials((prev) => prev.map((m) => (m.id === material.id ? { ...m, stock_kg: stock, min_stock_kg: min } : m)));
      toast({ title: `${material.name} actualizado` });
    } catch {
      toast({ title: "Error", description: "No se pudo guardar", variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Cuántos kilos hay de cada material. Cuando una reserva de impresión se marca como completada, se descuentan
        sus gramos estimados. Si el stock llega al mínimo, aparece como alerta en Indicadores.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {materials.map((material) => {
          const draft = drafts[material.id];
          const low = Number(material.stock_kg) <= Number(material.min_stock_kg);
          const changed =
            draft && (draft.stock_kg !== String(material.stock_kg) || draft.min_stock_kg !== String(material.min_stock_kg));
          return (
            <Card key={material.id} className="glass-card border-border/30">
              <CardContent className="space-y-3 pt-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{material.name}</p>
                  <div className="flex gap-1.5">
                    {!material.is_active && <Badge variant="outline">Inactivo</Badge>}
                    {low && <Badge className="bg-amber-500/20 text-amber-400">Stock bajo</Badge>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1 text-xs text-muted-foreground">
                    Stock (kg)
                    <Input
                      type="number"
                      step="0.001"
                      min="0"
                      value={draft?.stock_kg ?? ""}
                      onChange={(e) => setDrafts({ ...drafts, [material.id]: { ...draft, stock_kg: e.target.value } })}
                    />
                  </label>
                  <label className="space-y-1 text-xs text-muted-foreground">
                    Mínimo (kg)
                    <Input
                      type="number"
                      step="0.001"
                      min="0"
                      value={draft?.min_stock_kg ?? ""}
                      onChange={(e) => setDrafts({ ...drafts, [material.id]: { ...draft, min_stock_kg: e.target.value } })}
                    />
                  </label>
                </div>
                <Button size="sm" className="w-full" disabled={!changed || savingId === material.id} onClick={() => save(material)}>
                  {savingId === material.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
