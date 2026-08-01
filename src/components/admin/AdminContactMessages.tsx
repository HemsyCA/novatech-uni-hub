import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { listContactMessages } from "@/services/supabase/contact";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export function AdminContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    listContactMessages()
      .then(setMessages)
      .catch(() => toast({ title: "Error", description: "No se pudieron cargar los mensajes", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  if (loading) {
    return <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />;
  }

  if (messages.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No hay mensajes todavía</p>;
  }

  return (
    <div className="space-y-3">
      {messages.map((msg) => (
        <Card key={msg.id} className="glass-card border-border/30">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-accent" />
                <span className="font-semibold">{msg.name}</span>
                <span className="text-xs text-muted-foreground">{msg.email}</span>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date(msg.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{msg.message}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
