'use server'
import { db } from '@db';
import { carts, cartItems } from '@db/schema';
import { eq } from 'drizzle-orm';
import type { ProductWithDynamicRelations } from '@actions/products/types';

export type UpsertCartInput = {
  userId?: string;
  cartId?: string;
  name?: string;
  items: { product: ProductWithDynamicRelations; quantity: number; price: number }[];
};
export type UpsertCartResult = {
  id: string;
  name?: string;
  items: { product: ProductWithDynamicRelations; quantity: number; price: number }[];
};

export async function upsertCart({ userId, cartId, name, items }: UpsertCartInput): Promise<UpsertCartResult> {
  let cart;
  if (cartId) {
    cart = await db.query.carts.findFirst({ where: eq(carts.id, cartId) });
  }
  if (!cart && userId) {
    cart = await db.query.carts.findFirst({ where: eq(carts.userId, userId) });
  }
  if (!cart) {
    [cart] = await db.insert(carts).values({ userId, name }).returning();
  } else {
    await db.update(carts).set({ name }).where(eq(carts.id, cart.id));
  }
  // Remove old items
  await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
  // Insert new items
  if (items.length) {
    await db.insert(cartItems).values(
      items.map(item => ({
        cartId: cart.id,
        productId: item.product.id,
        quantity: item.quantity,
        // price is snapshot, but not stored in schema; can extend schema if needed
      }))
    );
  }
  return {
    id: cart.id,
    name: cart.name as string,
    items,
  };
}
