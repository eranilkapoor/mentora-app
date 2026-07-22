type QueryArg = unknown;

type PaginatedData<Item> =
  | Item[]
  | {
      items: Item[];
      page?: number;
      limit?: number;
      total?: number;
      totalPages?: number;
      hasNextPage?: boolean;
      hasPrevPage?: boolean;
    };

export type PaginatedApiResponse<Item> = {
  data?: PaginatedData<Item> | null;
  [key: string]: unknown;
};

type MergeableItem = {
  _id?: string;
  id?: string;
  userId?: string;
};

const getPage = (arg: QueryArg): number => {
  if (!arg || typeof arg !== 'object') {
    return 1;
  }

  const page = Number((arg as { page?: unknown }).page);
  return Number.isFinite(page) && page > 0 ? page : 1;
};

const normalizeArg = (arg: QueryArg): Record<string, unknown> => {
  if (!arg || typeof arg !== 'object') {
    return {};
  }

  return Object.entries(arg as Record<string, unknown>)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
    .sort(([a], [b]) => a.localeCompare(b))
    .reduce<Record<string, unknown>>((normalized, [key, value]) => {
      if (key !== 'page') {
        normalized[key] = value;
      }
      return normalized;
    }, {});
};

const getItems = <Item>(response: PaginatedApiResponse<Item>): Item[] => {
  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data?.items ?? [];
};

const setItems = <Item>(
  response: PaginatedApiResponse<Item>,
  items: Item[]
): void => {
  if (Array.isArray(response.data)) {
    response.data = items;
    return;
  }

  if (response.data) {
    response.data.items = items;
  }
};

const getItemKey = (item: unknown): string | null => {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const record = item as MergeableItem;
  return record._id ?? record.id ?? record.userId ?? null;
};

export const serializePaginatedQueryArgs = ({
  endpointName,
  queryArgs,
}: {
  endpointName: string;
  queryArgs: QueryArg;
}): string => `${endpointName}:${JSON.stringify(normalizeArg(queryArgs))}`;

export const shouldRefetchPaginatedQuery = ({
  currentArg,
  previousArg,
}: {
  currentArg?: QueryArg;
  previousArg?: QueryArg;
}): boolean =>
  getPage(currentArg) !== getPage(previousArg) ||
  JSON.stringify(normalizeArg(currentArg)) !==
    JSON.stringify(normalizeArg(previousArg));

export const mergePaginatedApiResponse = <Item>(
  currentCache: PaginatedApiResponse<Item>,
  incoming: PaginatedApiResponse<Item>,
  { arg }: { arg: QueryArg }
): void => {
  const page = getPage(arg);

  if (page <= 1) {
    currentCache.data = incoming.data;
    currentCache.meta = incoming.meta;
    return;
  }

  if (!currentCache.data || !incoming.data) {
    currentCache.data = incoming.data;
    currentCache.meta = incoming.meta;
    return;
  }

  const merged = [...getItems(currentCache)];
  const seenKeys = new Set(merged.map(getItemKey).filter(Boolean));

  getItems(incoming).forEach((item) => {
    const key = getItemKey(item);

    if (key && seenKeys.has(key)) {
      return;
    }

    if (key) {
      seenKeys.add(key);
    }

    merged.push(item);
  });

  setItems(currentCache, merged);
  currentCache.meta = incoming.meta;

  if (
    currentCache.data &&
    incoming.data &&
    !Array.isArray(currentCache.data) &&
    !Array.isArray(incoming.data)
  ) {
    Object.assign(currentCache.data, {
      ...incoming.data,
      items: merged,
    });
  }
};
