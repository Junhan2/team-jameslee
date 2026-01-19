---
title: Optimistic UI Updates
impact: MEDIUM-HIGH
impactDescription: Instant feedback for user actions
tags: [client, optimistic, ux, mutations]
appliesTo: [react, next.js]
relatedAgent: client-data-reviewer
---

# Optimistic UI Updates

## Problem

Waiting for server confirmation before updating the UI makes applications feel sluggish. Users expect instant feedback for their actions.

## Detection Signals

- Mutation functions that wait for server response before updating UI
- Loading spinners on buttons after user clicks
- Noticeable delay between click and visual change
- `async/await` in event handlers blocking UI updates

## ❌ Bad Pattern

```tsx
function LikeButton({ postId, initialLiked }) {
  const [liked, setLiked] = useState(initialLiked);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    setIsLoading(true);
    try {
      await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
      setLiked(true);  // UI updates only after 200-500ms wait!
    } catch (error) {
      console.error('Failed to like');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button onClick={handleLike} disabled={isLoading}>
      {isLoading ? 'Loading...' : liked ? '❤️' : '🤍'}
    </button>
  );
}
// User clicks → 300ms wait → heart changes. Feels slow!
```

**Why this is problematic**:
- 200-500ms delay between click and visual feedback
- Users may click multiple times thinking it didn't work
- Feels unresponsive compared to native apps

## ✅ Good Pattern

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

function LikeButton({ postId, initialLiked }) {
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: () => fetch(`/api/posts/${postId}/like`, { method: 'POST' }),

    // Optimistic update - runs BEFORE request
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(['post', postId]);

      // Snapshot the previous value
      const previousPost = queryClient.getQueryData(['post', postId]);

      // Optimistically update
      queryClient.setQueryData(['post', postId], (old) => ({
        ...old,
        liked: true,
        likeCount: old.likeCount + 1,
      }));

      // Return context for rollback
      return { previousPost };
    },

    // Rollback on error
    onError: (err, variables, context) => {
      queryClient.setQueryData(['post', postId], context.previousPost);
      toast.error('Failed to like. Please try again.');
    },

    // Refetch after mutation settles
    onSettled: () => {
      queryClient.invalidateQueries(['post', postId]);
    },
  });

  return (
    <button onClick={() => likeMutation.mutate()}>
      {likeMutation.variables ? '❤️' : '🤍'}  {/* Instant feedback */}
    </button>
  );
}
// User clicks → heart changes instantly → server catches up
```

```tsx
// Simpler pattern for useOptimistic (React 19+)
import { useOptimistic } from 'react';

function LikeButton({ postId, liked, likePost }) {
  const [optimisticLiked, setOptimisticLiked] = useOptimistic(
    liked,
    (current, newLiked) => newLiked
  );

  const handleLike = async () => {
    setOptimisticLiked(true);  // Instant!
    await likePost(postId);    // Server catches up
  };

  return (
    <button onClick={handleLike}>
      {optimisticLiked ? '❤️' : '🤍'}
    </button>
  );
}
```

**Why this is better**:
- Instant visual feedback (0ms)
- Automatic rollback on error
- Matches native app experience
- Users feel confident their action worked

## Performance Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Perceived Latency | 300ms | 0ms | -300ms |
| User Confidence | Low | High | Significant |
| Double-clicks | Common | Rare | Reduced errors |

## When to Use Optimistic Updates

| Action Type | Optimistic? | Reason |
|-------------|-------------|--------|
| Like/Unlike | ✅ Yes | High success rate, reversible |
| Add to cart | ✅ Yes | Usually succeeds |
| Delete item | 🔶 Maybe | Consider confirmation first |
| Payment | ❌ No | Critical, show loading |
| Form submit | 🔶 Maybe | Depends on validation needs |

## Optimistic Update Patterns

### 1. Simple State Toggle
```tsx
const [optimisticState, setOptimisticState] = useOptimistic(initialState);

async function handleAction() {
  setOptimisticState(newState);  // Instant
  await serverAction();           // Background
}
```

### 2. List Item Addition
```tsx
queryClient.setQueryData(['todos'], (old) => [
  ...old,
  { id: 'temp-id', text: newTodo, pending: true }
]);

// After mutation succeeds, replace temp-id with real id
```

### 3. List Item Removal
```tsx
queryClient.setQueryData(['todos'], (old) =>
  old.filter(todo => todo.id !== deletedId)
);

// On error, restore the item
```

### 4. Counter Update
```tsx
queryClient.setQueryData(['post', id], (old) => ({
  ...old,
  likeCount: old.likeCount + 1
}));
```

## Error Handling

```tsx
onError: (error, variables, context) => {
  // 1. Rollback optimistic update
  queryClient.setQueryData(['post', id], context.previousPost);

  // 2. Show user-friendly error
  toast.error('Action failed. Please try again.');

  // 3. Log for debugging
  console.error('Mutation failed:', error);
},
```

## Exceptions

Do NOT apply this rule when:

1. **Critical transactions**: Payments, irreversible actions
2. **Complex validation**: Server validation required first
3. **High failure rate**: Action often fails
4. **Network-sensitive**: Action must confirm delivery

## Related Rules

- [client-swr-pattern](./client-swr-pattern.md) - Data fetching patterns
- [client-prefetching](./client-prefetching.md) - Prefetching strategies

## References

- [React Docs: useOptimistic](https://react.dev/reference/react/useOptimistic)
- [React Query: Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)

---

## Confidence Scoring for This Rule

| Score | Criteria |
|-------|----------|
| **95-100** | Like/favorite button waiting for server response |
| **90-94** | Common user action with loading spinner |
| **85-89** | Toggle/switch with noticeable delay |
| **80-84** | List add/remove waiting for confirmation |
| **<80** | **DO NOT REPORT** - critical action needs confirmation |
