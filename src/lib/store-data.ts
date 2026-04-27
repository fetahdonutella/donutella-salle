export type ItemName = "Shawarma" | "Tacos" | "Box";

export type PriceMap = Record<ItemName, number>;
export type QuantityMap = Record<ItemName, number>;

export type SalesEntry = {
  id: string;
  createdAt: string;
  totalSold: number;
  totalRevenue: number;
  quantities: QuantityMap;
};

export type ExpenseEntry = {
  id: string;
  title: string;
  amount: number;
  createdAt: string;
};

export const PRICES: PriceMap = {
  Shawarma: 300,
  Tacos: 350,
  Box: 350,
};
export const ITEM_NAMES: ItemName[] = ["Shawarma", "Tacos", "Box"];

export const EMPTY_QUANTITIES: QuantityMap = {
  Shawarma: 0,
  Tacos: 0,
  Box: 0,
};

export const SALES_HISTORY_KEY = "store-sales-history";
export const PENDING_QUANTITIES_KEY = "store-quantities";
export const EXPENSES_KEY = "store-expenses";
export const STORE_DATA_UPDATED_EVENT = "store-data-updated";

export const parseJSON = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) {
    return fallback;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const formatDA = (amount: number) => `${amount} DA`;
export const formatDate = (value: string) => new Date(value).toLocaleString();

export const readStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") {
    return fallback;
  }
  return parseJSON<T>(localStorage.getItem(key), fallback);
};

export const writeStorage = <T,>(key: string, value: T) => {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(STORE_DATA_UPDATED_EVENT));
};
