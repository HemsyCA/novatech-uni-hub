import { useCallback, useEffect, useState } from "react";
import { Award, Loader2, Plus, Save, Trash2, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { AdminInscripciones } from "@/components/admin/AdminInscripciones";
import { addNovaMembers, listNovaMemberEmails } from "@/services/supabase/miembros";
import {
  addAcademyMembers,
  createAcademyGroup,
  deleteAcademyGroup,
  findRegisteredEmails,
  listAcademyGroups,
  parseEmailList,
  removeAcademyMember,
  setAcademyMemberEndOverride,
  updateAcademyGroup,
} from "@/services/supabase/academia";
import {
  ACADEMY_DURATION_DAYS,
  academyStatus,
  defaultEndDate,
  formatDate,
  limaToday,
  statusLabel,
  type AcademyStatus,
} from "@/lib/academy-dates";
import type { AcademyGroup, AcademyMember } from "@/types/domain";

const statusVariant: Record<AcademyStatus, "default" | "secondary" | "outline"> = {
  activo: "default",
  proximo: "secondary",
  finalizado: "outline",
};

const errorMessage = (error: unknown, fallback: string) =>
  (error as { message?: string } | null)?.message || fallback;

export function AdminAcademia() {
  const [groups, setGroups] = useState<AcademyGroup[]>([]);
  const [registered, setRegistered] = useState<Set<string>>(new Set());
  const [novaMembers, setNovaMembers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchGroups = useCallback(async () => {
    try {
      const data = await listAcademyGroups();
      setGroups(data);
      const emails = [...new Set(data.flatMap((g) => g.academia_miembros.map((m) => m.email)))];
      const [registeredEmails, memberEmails] = await Promise.all([findRegisteredEmails(emails), listNovaMemberEmails()]);
      setRegistered(registeredEmails);
      setNovaMembers(memberEmails);
    } catch (error) {
      toast({ title: "Error", description: errorMessage(error, "No se pudieron cargar los grupos"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  if (loading) {
    return <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />;
  }

  return (
    <div className="space-y-6">
      <AdminInscripciones groups={groups} onReviewed={fetchGroups} />
      <NewGroupForm onCreated={fetchGroups} />

      {groups.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">Todavía no hay grupos de convocados</p>
      ) : (
        <Accordion type="multiple" className="space-y-2">
          {groups.map((group) => (
            <GroupItem
              key={group.id}
              group={group}
              registered={registered}
              novaMembers={novaMembers}
              onChange={fetchGroups}
            />
          ))}
        </Accordion>
      )}
    </div>
  );
}

function NewGroupForm({ onCreated }: { onCreated: () => Promise<void> }) {
  const today = limaToday();
  const [nombre, setNombre] = useState("");
  const [startsAt, setStartsAt] = useState(today);
  const [endsAt, setEndsAt] = useState(defaultEndDate(today));
  const [emailsText, setEmailsText] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleStartChange = (value: string) => {
    setStartsAt(value);
    if (value) setEndsAt(defaultEndDate(value));
  };

  const handleCreate = async () => {
    if (!nombre.trim() || !startsAt || !endsAt) return;
    if (endsAt < startsAt) {
      toast({ title: "Fechas inválidas", description: "La fecha de fin no puede ser anterior al inicio", variant: "destructive" });
      return;
    }
    const { valid, invalid } = parseEmailList(emailsText);
    if (invalid.length > 0) {
      toast({ title: "Correos inválidos", description: invalid.join(", "), variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      await createAcademyGroup({ nombre: nombre.trim(), starts_at: startsAt, ends_at: endsAt }, valid);
      toast({ title: "Grupo creado", description: `${valid.length} convocado(s) agregado(s)` });
      setNombre("");
      setEmailsText("");
      await onCreated();
    } catch (error) {
      toast({ title: "Error", description: errorMessage(error, "No se pudo crear el grupo"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="glass-card border-border/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Nuevo grupo</CardTitle>
        <p className="text-sm text-muted-foreground">
          Cada grupo tiene sus propias fechas. Para una persona sola, crea un grupo con su nombre.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="group-name">Nombre</Label>
          <Input
            id="group-name"
            placeholder="Ej: Convocatoria 2026-II · Grupo A"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="group-start">Inicio</Label>
            <Input id="group-start" type="date" value={startsAt} onChange={(e) => handleStartChange(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="group-end">Último día con acceso</Label>
            <Input id="group-end" type="date" value={endsAt} min={startsAt} onChange={(e) => setEndsAt(e.target.value)} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Al elegir el inicio, el fin se calcula a {ACADEMY_DURATION_DAYS / 7} semanas. Puedes cambiarlo.
        </p>
        <div className="space-y-2">
          <Label htmlFor="group-emails">Correos de los convocados (opcional)</Label>
          <Textarea
            id="group-emails"
            placeholder={"uno por línea o separados por coma\nana@gmail.com, luis@gmail.com"}
            value={emailsText}
            onChange={(e) => setEmailsText(e.target.value)}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            No necesitan estar registrados todavía: tendrán acceso cuando entren con ese mismo correo.
          </p>
        </div>
        <Button onClick={handleCreate} disabled={saving || !nombre.trim() || !startsAt || !endsAt}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          Crear grupo
        </Button>
      </CardContent>
    </Card>
  );
}

interface GroupItemProps {
  group: AcademyGroup;
  registered: Set<string>;
  novaMembers: Set<string>;
  onChange: () => Promise<void>;
}

function GroupItem({ group, registered, novaMembers, onChange }: GroupItemProps) {
  const [nombre, setNombre] = useState(group.nombre);
  const [startsAt, setStartsAt] = useState(group.starts_at);
  const [endsAt, setEndsAt] = useState(group.ends_at);
  const [emailsText, setEmailsText] = useState("");
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const status = academyStatus(group.starts_at, group.ends_at);
  const dirty = nombre !== group.nombre || startsAt !== group.starts_at || endsAt !== group.ends_at;

  const run = async (action: () => Promise<void>, success: string, fallback: string) => {
    setBusy(true);
    try {
      await action();
      toast({ title: success });
      await onChange();
    } catch (error) {
      toast({ title: "Error", description: errorMessage(error, fallback), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const handleSave = () => {
    if (!nombre.trim() || !startsAt || !endsAt) return;
    if (endsAt < startsAt) {
      toast({ title: "Fechas inválidas", description: "La fecha de fin no puede ser anterior al inicio", variant: "destructive" });
      return;
    }
    run(
      () => updateAcademyGroup(group.id, { nombre: nombre.trim(), starts_at: startsAt, ends_at: endsAt }),
      "Grupo actualizado",
      "No se pudo actualizar el grupo",
    );
  };

  const handleAddMembers = () => {
    const { valid, invalid } = parseEmailList(emailsText);
    if (invalid.length > 0) {
      toast({ title: "Correos inválidos", description: invalid.join(", "), variant: "destructive" });
      return;
    }
    if (valid.length === 0) return;
    run(
      async () => {
        await addAcademyMembers(group.id, valid);
        setEmailsText("");
      },
      "Convocados agregados",
      "No se pudieron agregar los correos",
    );
  };

  return (
    <AccordionItem value={group.id} className="glass-card border border-border/30 rounded-lg px-4">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-left pr-2">
          <span className="font-medium">{group.nombre}</span>
          <span className="text-xs text-muted-foreground">
            {formatDate(group.starts_at)} – {formatDate(group.ends_at)} · {group.academia_miembros.length} convocado(s)
          </span>
          <Badge variant={statusVariant[status]} className="sm:ml-auto w-fit">
            {statusLabel[status]}
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-6">
        <div className="space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor={`name-${group.id}`}>Nombre</Label>
              <Input id={`name-${group.id}`} value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`start-${group.id}`}>Inicio</Label>
              <Input id={`start-${group.id}`} type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`end-${group.id}`}>Último día con acceso</Label>
              <Input
                id={`end-${group.id}`}
                type="date"
                value={endsAt}
                min={startsAt}
                onChange={(e) => setEndsAt(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={handleSave} disabled={busy || !dirty}>
              <Save className="h-4 w-4 mr-2" />
              Guardar cambios
            </Button>
            <DeleteGroupButton
              group={group}
              disabled={busy}
              onConfirm={() => run(() => deleteAcademyGroup(group.id), "Grupo eliminado", "No se pudo eliminar el grupo")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`emails-${group.id}`}>Agregar convocados</Label>
          <div className="flex flex-col sm:flex-row gap-2">
            <Textarea
              id={`emails-${group.id}`}
              placeholder="correo@gmail.com, otro@gmail.com"
              value={emailsText}
              onChange={(e) => setEmailsText(e.target.value)}
              rows={2}
              className="flex-1"
            />
            <Button size="sm" onClick={handleAddMembers} disabled={busy || !emailsText.trim()} className="sm:self-start">
              <UserPlus className="h-4 w-4 mr-2" />
              Agregar
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {group.academia_miembros.length === 0 ? (
            <p className="text-sm text-muted-foreground">Este grupo no tiene convocados todavía.</p>
          ) : (
            [...group.academia_miembros]
              .sort((a, b) => a.email.localeCompare(b.email))
              .map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  groupStartsAt={group.starts_at}
                  isRegistered={registered.has(member.email)}
                  isNovaMember={novaMembers.has(member.email)}
                  disabled={busy}
                  onPromote={() =>
                    run(() => addNovaMembers([member.email]), `${member.email} ahora es miembro de Nova`, "No se pudo hacer miembro")
                  }
                  onSaveOverride={(value) =>
                    run(
                      () => setAcademyMemberEndOverride(member.id, value),
                      value ? "Fecha individual guardada" : "Se quitó la fecha individual",
                      "No se pudo guardar la fecha",
                    )
                  }
                  onRemove={() => run(() => removeAcademyMember(member.id), "Convocado quitado", "No se pudo quitar")}
                />
              ))
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

interface MemberRowProps {
  member: AcademyMember;
  groupStartsAt: string;
  isRegistered: boolean;
  isNovaMember: boolean;
  disabled: boolean;
  onSaveOverride: (value: string | null) => void;
  onPromote: () => void;
  onRemove: () => void;
}

function MemberRow({
  member,
  groupStartsAt,
  isRegistered,
  isNovaMember,
  disabled,
  onSaveOverride,
  onPromote,
  onRemove,
}: MemberRowProps) {
  const [override, setOverride] = useState(member.ends_at_override ?? "");
  const changed = override !== (member.ends_at_override ?? "");

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-2 p-3 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className="text-sm truncate">{member.email}</span>
        <Badge variant={isRegistered ? "secondary" : "outline"} className="shrink-0">
          {isRegistered ? "Registrado" : "Sin cuenta aún"}
        </Badge>
        {isNovaMember && <Badge className="shrink-0">Miembro</Badge>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {!isNovaMember && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-8" disabled={disabled} title="Aprobar como miembro de Nova">
                <Award className="h-4 w-4 mr-1" />
                Hacer miembro
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Hacer miembro de Nova a {member.email}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tendrá acceso permanente al material interno de robots. Hazlo después de revisar su entregable.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onPromote}>Hacer miembro</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <Label htmlFor={`override-${member.id}`} className="text-xs text-muted-foreground whitespace-nowrap">
          Fin individual
        </Label>
        <Input
          id={`override-${member.id}`}
          type="date"
          value={override}
          min={groupStartsAt}
          onChange={(e) => setOverride(e.target.value)}
          className="h-8 w-40"
          title="Déjalo vacío para usar la fecha del grupo"
        />
        {changed && (
          <Button size="icon" variant="ghost" className="h-8 w-8" disabled={disabled} onClick={() => onSaveOverride(override || null)} title="Guardar fecha individual">
            <Save className="h-4 w-4" />
          </Button>
        )}
        {member.ends_at_override && !changed && (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            disabled={disabled}
            onClick={() => {
              setOverride("");
              onSaveOverride(null);
            }}
            title="Usar la fecha del grupo"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <Button size="icon" variant="ghost" className="h-8 w-8" disabled={disabled} onClick={onRemove} title="Quitar del grupo">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

function DeleteGroupButton({ group, disabled, onConfirm }: { group: AcademyGroup; disabled: boolean; onConfirm: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={disabled}>
          <Trash2 className="h-4 w-4 mr-2 text-destructive" />
          Eliminar grupo
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar "{group.nombre}"?</AlertDialogTitle>
          <AlertDialogDescription>
            Sus {group.academia_miembros.length} convocado(s) perderán el acceso a Academia Nova de inmediato. Sus cuentas no se borran.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Eliminar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
