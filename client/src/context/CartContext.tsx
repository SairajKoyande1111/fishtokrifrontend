import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Product, Coupon } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useCustomer } from "@/context/CustomerContext";

export interface CartItem extends Omit<Product, 'id'> {
  id: number;
  quantity: number;
  instruction?: string;
  isCombo?: boolean;
  originalId?: string;
  comboImages?: string[];
  comboCategories?: string[];
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product | CartItem, quantity?: number, openCart?: boolean) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  updateInstruction: (productId: number, instruction: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  appliedCoupon: Coupon | null;
  setAppliedCoupon: (c: Coupon | null) => void;
  discountAmount: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const { toast } = useToast();
  const { customer, openLoginModal } = useCustomer();

  const addToCart = (product: Product | CartItem, quantity = 1, openCart = false) => {
    if (!customer) {
      openLoginModal();
      return;
    }

    const availableQty = (product as any).availableQty ?? null;

    let blocked = false;
    setItems((current) => {
      const existing = current.find((i) => i.id === product.id);
      const newQty = existing ? existing.quantity + quantity : quantity;
      if (availableQty !== null && newQty > availableQty) {
        blocked = true;
        return current;
      }
      if (existing) {
        return current.map((i) =>
          i.id === product.id ? { ...i, quantity: newQty } : i
        );
      }
      return [...current, { ...product, quantity }];
    });

    if (blocked) {
      toast({
        title: "Stock limit reached",
        description: `Only ${availableQty} unit${availableQty === 1 ? "" : "s"} available for ${product.name}.`,
        variant: "destructive",
        duration: 2500,
      });
      return;
    }
    toast({
      title: "Added to order",
      description: `${quantity}x ${product.name} added.`,
      duration: 2000,
    });
    if (openCart) setIsCartOpen(true);
  };

  const removeFromCart = (productId: number) => {
    setItems((current) => current.filter((i) => i.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setItems((current) => {
      const item = current.find((i) => i.id === productId);
      const availableQty = item?.availableQty ?? null;
      if (availableQty !== null && quantity > availableQty) {
        toast({
          title: "Stock limit reached",
          description: `Only ${availableQty} unit${availableQty === 1 ? "" : "s"} available.`,
          variant: "destructive",
          duration: 2500,
        });
        return current;
      }
      return current.map((i) => (i.id === productId ? { ...i, quantity } : i));
    });
  };

  const updateInstruction = (productId: number, instruction: string) => {
    setItems((current) =>
      current.map((i) => (i.id === productId ? { ...i, instruction } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce(
    (acc, item) => acc + (item.price || 0) * item.quantity,
    0
  );

  const discountAmount = appliedCoupon
    ? appliedCoupon.type === "flat"
      ? Math.min(appliedCoupon.discountValue, totalPrice)
      : Math.round((totalPrice * appliedCoupon.discountValue) / 100)
    : 0;

  // Auto-invalidate coupon if cart total drops below minimum
  useEffect(() => {
    if (appliedCoupon && appliedCoupon.minOrderAmount > totalPrice) {
      setAppliedCoupon(null);
    }
  }, [totalPrice, appliedCoupon]);

  // Clear coupon when cart is emptied
  useEffect(() => {
    if (items.length === 0) {
      setAppliedCoupon(null);
    }
  }, [items.length]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateInstruction,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
        appliedCoupon,
        setAppliedCoupon,
        discountAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
