---
title: React Server Component Patterns
impact: HIGH
impactDescription: Optimal use of Server vs Client Components
tags: [server, rsc, patterns, next.js]
appliesTo: [next.js]
relatedAgent: server-performance-reviewer
---

# React Server Component Patterns

## Problem

Misusing Server and Client Components leads to larger bundles, slower hydration, and unnecessary client-server waterfalls.

## Detection Signals

- `'use client'` on components without interactivity
- Data fetching in Client Components instead of Server Components
- Large components marked as client when only small part needs interactivity
- Props drilling from Server to Client to Server

## ❌ Bad Pattern

```tsx
// ❌ Unnecessary 'use client' - no interactivity
'use client';

export function StaticHeader() {
  // No hooks, no event handlers, no browser APIs
  return (
    <header>
      <Logo />
      <Navigation />
    </header>
  );
}

// ❌ Data fetching in Client Component
'use client';

export function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(setUser);
  }, [userId]);

  return user ? <ProfileCard user={user} /> : <Loading />;
}

// ❌ Entire component client for small interactive part
'use client';

export function ProductPage({ product }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div>
      <h1>{product.name}</h1>           {/* Static */}
      <p>{product.description}</p>      {/* Static */}
      <img src={product.image} />       {/* Static */}
      <div>{product.specs}</div>        {/* Static */}
      <Reviews reviews={product.reviews} />  {/* Static */}

      {/* Only this needs client! */}
      <input
        type="number"
        value={quantity}
        onChange={e => setQuantity(e.target.value)}
      />
      <button>Add to Cart</button>
    </div>
  );
}
```

**Why this is problematic**:
- Client Components ship JavaScript to browser
- Data fetching in client creates waterfalls
- Hydration takes longer with more client code

## ✅ Good Pattern

```tsx
// ✅ Server Component (default) - no 'use client'
export function StaticHeader() {
  return (
    <header>
      <Logo />
      <Navigation />
    </header>
  );
}

// ✅ Server Component fetches data
export async function UserProfile({ userId }) {
  const user = await getUser(userId);  // Server-side fetch
  return <ProfileCard user={user} />;
}

// ✅ Small Client Component for interactivity
// ProductPage.tsx (Server Component)
export async function ProductPage({ params }) {
  const product = await getProduct(params.id);

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <img src={product.image} />
      <div>{product.specs}</div>
      <Reviews reviews={product.reviews} />

      {/* Only the interactive part is a Client Component */}
      <AddToCartButton productId={product.id} />
    </div>
  );
}

// AddToCartButton.tsx (Client Component)
'use client';

export function AddToCartButton({ productId }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <>
      <input
        type="number"
        value={quantity}
        onChange={e => setQuantity(Number(e.target.value))}
      />
      <button onClick={() => addToCart(productId, quantity)}>
        Add to Cart
      </button>
    </>
  );
}
```

**Why this is better**:
- Static content renders on server (zero JS)
- Only interactive parts ship JavaScript
- Data fetches happen on server (no waterfall)

## Server vs Client Component Decision

| Need | Component Type |
|------|----------------|
| Data fetching | ✅ Server |
| Static content | ✅ Server |
| Access to backend resources | ✅ Server |
| Sensitive data (API keys) | ✅ Server |
| onClick, onChange handlers | ❌ Client |
| useState, useEffect | ❌ Client |
| Browser APIs (localStorage) | ❌ Client |
| Third-party client libraries | ❌ Client |

## Performance Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| JS Bundle | 150KB | 50KB | -100KB (67%) |
| Hydration Time | 500ms | 200ms | -300ms |
| TTI | 1.5s | 0.8s | -700ms |

## Composition Patterns

### 1. Server Component with Client Island
```tsx
// Server Component
export function Dashboard() {
  const data = await getData();

  return (
    <div>
      <StaticChart data={data} />      {/* Server */}
      <InteractiveFilter />             {/* Client */}
    </div>
  );
}
```

### 2. Passing Server Data to Client
```tsx
// Server Component
export async function Page() {
  const initialData = await getData();

  return <InteractiveList initialData={initialData} />;
}

// Client Component
'use client';
export function InteractiveList({ initialData }) {
  const [items, setItems] = useState(initialData);
  // Client-side interactions
}
```

### 3. Render Props Pattern
```tsx
// Server Component
export async function DataContainer({ children }) {
  const data = await getData();
  return children(data);  // Pass data to client
}

// Usage
<DataContainer>
  {(data) => <ClientInteractive data={data} />}
</DataContainer>
```

### 4. Slot Pattern
```tsx
// Server Component with client slot
export function Layout({ sidebar, children }) {
  return (
    <div>
      <nav>{sidebar}</nav>  {/* Can be client */}
      <main>{children}</main>
    </div>
  );
}
```

## Exceptions

Do NOT apply this rule when:

1. **Third-party library requires client**: Some libs only work client-side
2. **Browser-only features**: localStorage, geolocation, etc.
3. **Real-time updates**: WebSocket connections
4. **Complex interactions**: Drag-drop, animations

## Related Rules

- [server-caching](./server-caching.md) - Caching strategies
- [server-streaming-ssr](./server-streaming-ssr.md) - Streaming patterns

## References

- [Next.js Docs: Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [React Docs: Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)

---

## Confidence Scoring for This Rule

| Score | Criteria |
|-------|----------|
| **95-100** | Large component with 'use client' but minimal interactivity |
| **90-94** | Data fetching in Client Component (could be server) |
| **85-89** | Static component marked as 'use client' |
| **80-84** | Component could split into server/client parts |
| **<80** | **DO NOT REPORT** - client usage is justified |
