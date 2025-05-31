import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProductWithDynamicRelations } from '@actions/products/types';
import { getCart } from '@actions/cart/get';
import { upsertCart } from '@actions/cart/create';

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
  addItem: (item: { product: ProductWithDynamicRelations; quantity?: number; price?: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCartId: (id: string) => void;
  setCartName: (name: string) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: undefined,
      cartName: undefined,
      isDrawerOpen: false,

      addItem: ({ product, quantity = 1, price }) => {
        const { items } = get();
        const existing = items.find(i => i.product.id === product.id);
        if (existing) {
          set({
            items: items.map(i =>
              i.product.id === product.id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                product,
                quantity,
                price: price ?? product.price,
              },
            ],
          });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter(i => i.product.id !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        set({
          items: get().items.map(i =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [], cartId: undefined }),

      setCartId: (id) => set({ cartId: id }),
      setCartName: (name) => set({ cartName: name }),

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
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
