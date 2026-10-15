import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Minus, Package, Plus, Search, ShoppingCart } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { listProducts } from "@/services/supabase/products";
import { listOrders, createOrderWithItems } from "@/services/supabase/orders";
import { getCurrentSession, subscribeToAuth } from "@/services/supabase/auth";
import { supabase } from "@/integrations/supabase/client";
import { StatusTracker } from "@/components/StatusTracker";
import { orderSteps } from "@/lib/tracker-steps";
import { EmptyState, PageHeader, PageTabs, StatusPill, type StatusTone } from "@/components/account/ui";
import { inputClass, primaryButton, secondaryButton } from "@/lib/account/styles";
import { formatDate } from "@/lib/academy-dates";
import type { Product, Order } from "@/types/domain";

type CartItem = Product & { quantity: number };

const CART_KEY = "nova-carrito";

const ORDER_STATUS: Record<string, { label: string; tone: StatusTone }> = {
  pending: { label: "Pendiente", tone: "neutral" },
  paid: { label: "Confirmado", tone: "progress" },
  preparing: { label: "Preparando", tone: "progress" },
  delivered: { label: "Listo para recoger", tone: "attention" },
  cancelled: { label: "Cancelado", tone: "off" },
};
const ACTIVE = ["pending", "paid", "preparing", "delivered"];

// El carrito se guarda en este navegador: si inicias sesión a mitad de la compra, no se pierde.
const loadCart = (): CartItem[] => {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

export default function Store() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>(loadCart);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // ?vista=pedidos (o el enlace antiguo ?pedidos=1) abre tus pedidos.
  const view = user && (searchParams.get("vista") === "pedidos" || searchParams.get("pedidos") === "1") ? "pedidos" : "catalogo";

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      // Sin almacenamiento el carrito funciona igual mientras la página esté abierta.
    }
  }, [cart]);

  useEffect(() => {
    const { data: { subscription } } = subscribeToAuth(async (_event, session) => {
      setUser(session?.user ? { id: session.user.id } : null);
    });
    getCurrentSession().then(({ data: { session } }) => {
      setUser(session?.user ? { id: session.user.id } : null);
    });
    listProducts()
      .then(setProducts)
      .catch(() => toast({ title: "Error", description: "No se pudieron cargar los productos", variant: "destructive" }))
      .finally(() => setLoading(false));
    return () => subscription.unsubscribe();
  }, [toast]);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = () =>
      listOrders(user.id)
        .then(setOrders)
        .catch(() => toast({ title: "Error", description: "No se pudieron cargar tus pedidos", variant: "destructive" }));
    fetchOrders();
    const channel = supabase
      .channel(`orders-${user.id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` }, fetchOrders)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  const categories = ["Todos", ...new Set(products.map((p) => p.category))];
  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) && (selectedCategory === "Todos" || p.category === selectedCategory),
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const activeOrders = orders.filter((o) => ACTIVE.includes(o.status)).length;

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast({ title: "Stock insuficiente", variant: "destructive" });
          return prev;
        }
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast({ title: "Agregado al carrito", description: product.name });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;
          const quantity = item.quantity + delta;
          if (quantity > item.stock) {
            toast({ title: "Stock insuficiente", variant: "destructive" });
            return item;
          }
          return { ...item, quantity };
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!user) {
      // Después de iniciar sesión vuelve aquí, con el carrito intacto.
      navigate(`/auth?next=${encodeURIComponent(location.pathname)}`);
      return;
    }
    setSubmitting(true);
    try {
      const order = await createOrderWithItems(user.id, cart, cartTotal);
      toast({ title: "¡Pedido realizado!", description: `Código: ${order.transaction_code || order.id}` });
      setCart([]);
      setCartOpen(false);
      setOrders(await listOrders(user.id));
      navigate("/store?vista=pedidos", { replace: true });
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "No se pudo crear el pedido", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const cartSheet = (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetTrigger asChild>
        <button type="button" className={`${secondaryButton} relative`} aria-label={`Carrito: ${cartCount} productos`}>
          <ShoppingCart className="h-4 w-4" />
          <span className="hidden sm:inline">Carrito</span>
          {cartCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-nova px-1 text-[11px] font-bold text-white">
              {cartCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="nova-shell flex w-[90%] flex-col border-white/15 bg-black font-mono text-white sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-white">Tu carrito</SheetTitle>
        </SheetHeader>
        {cart.length === 0 ? (
          <EmptyState>Tu carrito está vacío.</EmptyState>
        ) : (
          <>
            <div className="-mx-6 flex-1 space-y-2 overflow-y-auto px-6 py-2">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-white/50">S/ {item.price.toFixed(2)} c/u</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" aria-label="Quitar uno" onClick={() => updateQuantity(item.id, -1)} className="rounded-lg p-1.5 hover:bg-white/10">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button type="button" aria-label="Agregar uno" onClick={() => updateQuantity(item.id, 1)} className="rounded-lg p-1.5 hover:bg-white/10">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-white/60">Total</span>
                <span className="text-2xl font-bold">S/ {cartTotal.toFixed(2)}</span>
              </div>
              <button type="button" onClick={handleCheckout} disabled={submitting} className={`${primaryButton} w-full`}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {user ? "Confirmar pedido" : "Inicia sesión para confirmar"}
              </button>
              {!user && <p className="text-center text-xs text-white/40">Tu carrito se guarda mientras inicias sesión.</p>}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );

  return (
    <main className="container mx-auto max-w-6xl space-y-6 px-4 pb-16 pt-28">
      <PageHeader title="Tienda Nova" description="Componentes electrónicos para tus proyectos." actions={cartSheet} />

      {user && (
        <PageTabs
          active={view}
          tabs={[
            { id: "catalogo", label: "Catálogo", to: "/store" },
            { id: "pedidos", label: "Mis pedidos", to: "/store?vista=pedidos", count: activeOrders },
          ]}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-white/60" />
        </div>
      ) : view === "pedidos" ? (
        orders.length === 0 ? (
          <EmptyState
            action={
              <button type="button" onClick={() => navigate("/store", { replace: true })} className={secondaryButton}>
                Ver el catálogo
              </button>
            }
          >
            Todavía no tienes pedidos.
          </EmptyState>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const status = ORDER_STATUS[order.status] ?? { label: order.status, tone: "neutral" as StatusTone };
              return (
                <article key={order.id} className="space-y-4 rounded-2xl border border-white/10 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-sm font-semibold">
                        <Package className="h-4 w-4 text-white/60" /> Pedido · S/ {Number(order.total).toFixed(2)}
                      </p>
                      <p className="mt-0.5 text-xs text-white/50">
                        {formatDate(order.created_at.slice(0, 10))} · código {order.transaction_code ?? order.id.slice(0, 8)}
                      </p>
                    </div>
                    <StatusPill tone={status.tone}>{status.label}</StatusPill>
                  </div>
                  <StatusTracker steps={orderSteps} currentKey={order.status} />
                </article>
              );
            })}
          </div>
        )
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                placeholder="Buscar componentes…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${inputClass} pl-10`}
                aria-label="Buscar componentes"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  aria-pressed={selectedCategory === cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    selectedCategory === cat ? "border-white bg-white text-black" : "border-white/15 text-white/70 hover:border-white/40"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <EmptyState>No encontramos componentes con esa búsqueda.</EmptyState>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <article key={product.id} className="flex flex-col rounded-2xl border border-white/10 p-5 transition-colors hover:border-white/30">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-3xl" aria-hidden>
                      {product.image_url}
                    </span>
                    <span className="rounded-full border border-white/15 px-2 py-0.5 text-[11px] text-white/60">{product.category}</span>
                  </div>
                  <h2 className="mt-3 font-semibold">{product.name}</h2>
                  <p className="mt-1 line-clamp-2 flex-1 text-sm text-white/50">{product.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold">S/ {product.price.toFixed(2)}</p>
                      <p className="text-[11px] text-white/40">{product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className={secondaryButton}
                      aria-label={`Agregar ${product.name} al carrito`}
                    >
                      <Plus className="h-4 w-4" /> Agregar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
