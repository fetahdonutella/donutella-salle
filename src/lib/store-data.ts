export type ItemName = string;
export type QuantityMap = Record<ItemName, number>;
export type StoreItem = {
  id: string;
  name: ItemName;
  price: number;
};

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

export type ClosedPeriodEntry = {
  id: string;
  closedAt: string;
  salesCount: number;
  expenseCount: number;
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
};

export const DEFAULT_ITEMS: StoreItem[] = [
  { id: "shawarma", name: "Shawarma", price: 300 },
  { id: "tacos", name: "Tacos", price: 350 },
  { id: "box", name: "Box", price: 350 },
];

export const SALES_HISTORY_KEY = "store-sales-history";
export const PENDING_QUANTITIES_KEY = "store-quantities";
export const EXPENSES_KEY = "store-expenses";
export const CLOSED_PERIODS_KEY = "store-closed-periods";
export const ITEMS_KEY = "store-items";

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
};

export const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const createEmptyQuantities = (items: StoreItem[] = DEFAULT_ITEMS): QuantityMap =>
  items.reduce<QuantityMap>((acc, item) => {
    acc[item.name] = 0;
    return acc;
  }, {});
