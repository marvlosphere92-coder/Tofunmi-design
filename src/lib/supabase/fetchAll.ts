// Supabase/PostgREST caps an unbounded `.select()` at a server-configured
// row limit (this project's is 1000 — see Project Settings > API > Max
// Rows) and silently returns only that many rows, with no error and no
// warning. A query stays correct right up until real-world data crosses
// that line, then quietly starts dropping rows forever.
//
// Use this for any query whose row count grows with usage — orders, chat
// messages, anything used for totals, counts, or "show me everything" —
// instead of a bare `.select()`. It pages through with `.range()` until a
// page comes back short, so it always returns every row regardless of how
// large the table gets.
const PAGE_SIZE = 1000;

export async function fetchAllRows<T>(
  makeQuery: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>
): Promise<T[]> {
  const all: T[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await makeQuery(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;

    all.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return all;
}
