import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ShoppingCart, Plus, Minus, Trash2, Package, Search, Loader2 } from "lucide-react";

type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image_url: string;
};

type CartItem = Product & { quantity: number };

type Order = {
  id: string;
  total: number;
  status: string;
  transaction_code: string;
  created_at: string;
};

export default function Store() {
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) navigate("/auth");
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) navigate("/auth");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchOrders();
    }
  }, [user]);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").eq("is_active", true);
    if (data) setProducts(data as Product[]);
    setLoading(false);
  };

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setOrders(data as Order[]);
  };

  const categories = ["Todos", ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast({ title: "Stock insuficiente", variant: "destructive" });
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (newQty > item.stock) {
              toast({ title: "Stock insuficiente", variant: "destructive" });
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setSubmitting(true);
    
    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({ user_id: user.id, total: cartTotal })
      .select()
      .single();

    if (orderError) {
      toast({ title: "Error", description: orderError.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    // Create order items
    const orderItems = cart.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

    if (itemsError) {
      toast({ title: "Error", description: itemsError.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    toast({
      title: "¡Pedido realizado!",
      description: `Código de transacción: ${order.transaction_code}`,
    });

    setCart([]);
    setShowCart(false);
    fetchOrders();
    setSubmitting(false);
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    paid: "bg-green-500/20 text-green-400",
    delivered: "bg-blue-500/20 text-blue-400",
    cancelled: "bg-red-500/20 text-red-400",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    paid: "Pagado",
    delivered: "Entregado",
    cancelled: "Cancelado",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-6 w-6 text-violet-400" />
              <span className="font-display font-bold">Tienda Nova</span>
            </div>
          </div>
          <Button
            variant="outline"
            className="relative"
            onClick={() => setShowCart(!showCart)}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Carrito
            {cart.length > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-violet-500 text-white">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </Badge>
            )}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Products Section */}
          <div className="flex-1">
            {/* Search and filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar componentes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className={selectedCategory === cat ? "bg-gradient-primary" : ""}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            {/* Products grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="glass-card border-border/30 hover:border-violet-500/50 transition-all h-full">
                    <CardHeader className="pb-2">
                      <div className="text-4xl mb-2">{product.image_url}</div>
                      <CardTitle className="text-base">{product.name}</CardTitle>
                      <CardDescription className="text-xs line-clamp-2">
                        {product.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Stock: {product.stock}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-violet-400">
                          S/ {product.price.toFixed(2)}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => addToCart(product)}
                          disabled={product.stock === 0}
                          className="bg-gradient-to-r from-violet-500 to-purple-500"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Cart Sidebar */}
          <AnimatePresence>
            {showCart && (
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className="lg:w-96"
              >
                <Card className="glass-card border-border/30 sticky top-24">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5 text-violet-400" />
                      Carrito
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {cart.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Tu carrito está vacío
                      </p>
                    ) : (
                      <>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto mb-4">
                          {cart.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
                            >
                              <div className="flex-1">
                                <p className="text-sm font-medium">{item.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  S/ {item.price.toFixed(2)} c/u
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6"
                                  onClick={() => updateQuantity(item.id, -1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-6 text-center">{item.quantity}</span>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6"
                                  onClick={() => updateQuantity(item.id, 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-border/30 pt-4">
                          <div className="flex items-center justify-between mb-4">
                            <span className="font-semibold">Total:</span>
                            <span className="text-2xl font-bold text-violet-400">
                              S/ {cartTotal.toFixed(2)}
                            </span>
                          </div>
                          <Button
                            className="w-full bg-gradient-to-r from-violet-500 to-purple-500"
                            onClick={handleCheckout}
                            disabled={submitting}
                          >
                            {submitting ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Confirmar Pedido
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Orders history */}
                <Card className="glass-card border-border/30 mt-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Package className="h-4 w-4 text-emerald-400" />
                      Mis Pedidos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-[200px] overflow-y-auto">
                      {orders.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Sin pedidos aún
                        </p>
                      ) : (
                        orders.map((order) => (
                          <div
                            key={order.id}
                            className="p-2 bg-muted/30 rounded-lg text-sm"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <code className="text-xs font-mono text-emerald-400">
                                {order.transaction_code}
                              </code>
                              <Badge className={statusColors[order.status]}>
                                {statusLabels[order.status]}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-muted-foreground">
                              <span className="text-xs">
                                {new Date(order.created_at).toLocaleDateString()}
                              </span>
                              <span className="font-semibold text-foreground">
                                S/ {Number(order.total).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
