'use server'
import { db } from '@db';
import { carts, cartItems, products } from '@db/schema';
import { eq, and } from 'drizzle-orm';
import type { ProductWithDynamicRelations } from '@actions/products/types';

export type GetCartInput = { userId?: string; cartId?: string };
export type GetCartResult = {
  id: string;
  name?: string;
  items: { product: ProductWithDynamicRelations; quantity: number; price: number }[];
} | null;

export async function getCart({ userId, cartId }: GetCartInput): Promise<GetCartResult> {
  let cart;
  if (cartId) {
    cart = await db.query.carts.findFirst({ where: eq(carts.id, cartId) });
  } else if (userId) {
    cart = await db.query.carts.findFirst({ where: and(eq(carts.userId, userId), eq(carts.status, 'active')) });
  }
  if (!cart) return null;
  const items = await db.query.cartItems.findMany({
    where: eq(cartItems.cartId, cart.id),
    with: { product: true },
  });
  return {
    id: cart.id,
    name: cart.name ?? undefined,
    items: items.map(item => ({
      product: item.product as ProductWithDynamicRelations,
      quantity: item.quantity,
      price: item.product.price,
    })),
  };
}
