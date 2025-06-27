# Cache Control Panel

## Overview
A comprehensive cache management interface in the admin settings that allows manual control over all system caches.

## Location
`/admin/settings/cache`

## Features

### 1. **Settings Cache Management**
- **Clear Settings Cache**: Invalidates server-side settings cache
- **Reset Settings Store**: Resets client-side Zustand store and refetches data
- **Revalidate Settings Pages**: Forces Next.js to re-render pages using settings

### 2. **Menu Cache Management**
- **Clear Menu Cache**: Invalidates server-side menu cache
- **Revalidate Menu Pages**: Forces Next.js to re-render pages using menus

### 3. **Global Operations**
- **Global Refresh**: Dispatches refresh events to all client components
- **Clear All Caches**: Comprehensive cache clearing operation

### 4. **Monitoring**
- Shows last execution time for each operation
- Visual indicators for operation status
- Loading states during operations

## Usage

### When to Use Cache Control

1. **After bulk data imports** - Clear relevant caches
2. **When changes aren't reflecting** - Use "Clear All Caches"
3. **During development/debugging** - Individual cache operations
4. **After database migrations** - Full cache reset

### Recommended Workflow

1. **First try**: "Clear All Caches" button
2. **If issues persist**: Individual cache operations
3. **For specific problems**: Target specific cache types

## Technical Implementation

### Server Actions
- `invalidateSettingsCache()` - Settings cache invalidation
- `invalidateAllMenuCaches()` - Menu cache invalidation
- `revalidateSettingsPages()` - Next.js page revalidation
- `revalidateMenuPages()` - Next.js page revalidation

### Client Features
- Global refresh event system
- Real-time status updates
- Error handling and feedback
- Persian RTL interface

### Cache Layers Covered
1. **Server-side cache** (actions cache)
2. **Next.js cache** (page/route cache)
3. **Client-side stores** (Zustand stores)
4. **Component state** (React state)

## Benefits

- ✅ **Manual control** over cache invalidation
- ✅ **Debugging tool** for cache-related issues
- ✅ **Developer experience** improvement
- ✅ **Production safety** with controlled operations
- ✅ **Comprehensive coverage** of all cache layers

## Files

- `apps/admin/app/(panel)/settings/cache/page.tsx` - Route page
- `apps/admin/app/(panel)/settings/forms/CacheControlForm.tsx` - Main component
- `packages/actions/menu/invalidate.ts` - Menu cache server actions
- `packages/actions/settings/invalidate.ts` - Settings cache server actions
- `packages/actions/revalidate.ts` - Next.js revalidation actions
