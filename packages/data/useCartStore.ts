import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProductWithDynamicRelations } from '@actions/products/types';
import { getCart } from '@actions/cart/get';
import { upsertCart } from '@actions/cart/create';
import { calculateItemPrice } from '@actions/cart/calculate-item-price';

// Types
export type CartItem = {
  product: ProductWithDynamicRelations;
  quantity: number;
  price: number; // snapshot at add time
};

export type CartState = {
  items: CartItem[];
  cartId?: string;
  cartName?: string;
  isDrawerOpen: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  addItem: (item: { product: ProductWithDynamicRelations; quantity?: number; price?: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCartId: (id: string) => void;
  setCartName: (name: string) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: undefined,
      cartName: undefined,
      isDrawerOpen: false,
      isLoading: false,
      isHydrated: false,

      addItem: ({ product, quantity = 1, price }) => {
        const { items } = get();
        const existing = items.find(i => i.product.id === product.id);
        
        if (existing) {
          // For existing items, calculate new effective price with updated quantity
          const newQuantity = existing.quantity + quantity;
          const priceCalculation = calculateItemPrice(product, newQuantity);
          
          set({
            items: items.map(i =>
              i.product.id === product.id
                ? { 
                    ...i, 
                    quantity: newQuantity,
                    price: priceCalculation.pricePerUnit // Update price per unit based on new quantity
                  }
                : i
            ),
          });
        } else {
          // For new items, ALWAYS calculate effective price based on quantity (ignore passed price)
          const priceCalculation = calculateItemPrice(product, quantity);
          
          set({
            items: [
              ...items,
              {
                product,
                quantity,
                price: priceCalculation.pricePerUnit, // Always use calculated discounted price
              },
            ],
          });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter(i => i.product.id !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        const { items } = get();
        set({
          items: items.map(i => {
            if (i.product.id === productId) {
              // Recalculate price when quantity changes
              const priceCalculation = calculateItemPrice(i.product, quantity);
              return { 
                ...i, 
                quantity,
                price: priceCalculation.pricePerUnit
              };
            }
            return i;
          }),
        });
      },

      clearCart: () => set({ items: [], cartId: undefined }),

      setCartId: (id) => set({ cartId: id }),
      setCartName: (name) => set({ cartName: name }),

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
      
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      
      setHydrated: (hydrated: boolean) => set({ isHydrated: hydrated }),
    }),
    {
      name: 'cart-storage',
    }
  )
);

// Example server sync helpers (optional)
type ServerCart = {
  id: string;
  name?: string;
  items: { product: ProductWithDynamicRelations; quantity: number; price: number }[];
};

export async function loadCartFromServer(userId: string) {
  const data = await getCart({ userId });
  if (!data) return;
  useCartStore.setState({
    cartId: data.id,
    cartName: data.name,
    items: data.items.map((item) => ({
      product: item.product,
      quantity: item.quantity,
      price: item.price,
    })),
  });
}

export async function persistCartToServer() {
  const { cartId, cartName, items } = useCartStore.getState();
  await upsertCart({ cartId, name: cartName, items });
}
