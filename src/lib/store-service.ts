import {
  ClosedPeriodEntry,
  CLOSED_PERIODS_KEY,
  DEFAULT_ITEMS,
  createEmptyQuantities,
  createId,
  ExpenseEntry,
  EXPENSES_KEY,
  ITEMS_KEY,
  PENDING_QUANTITIES_KEY,
  QuantityMap,
  SALES_HISTORY_KEY,
  SalesEntry,
  StoreItem,
  readStorage,
  writeStorage,
} from "@/lib/store-data";

export const getItems = () => readStorage<StoreItem[]>(ITEMS_KEY, DEFAULT_ITEMS);

export const getPendingQuantities = () =>
  readStorage<QuantityMap>(PENDING_QUANTITIES_KEY, createEmptyQuantities(getItems()));

export const getSalesHistory = () =>
  readStorage<SalesEntry[]>(SALES_HISTORY_KEY, []);

export const getExpenses = () => readStorage<ExpenseEntry[]>(EXPENSES_KEY, []);

export const getClosedPeriods = () =>
  readStorage<ClosedPeriodEntry[]>(CLOSED_PERIODS_KEY, []);

export const savePendingQuantities = (quantities: QuantityMap) =>
  writeStorage(PENDING_QUANTITIES_KEY, quantities);

export const saveItems = (items: StoreItem[]) => writeStorage(ITEMS_KEY, items);

export const saveSalesHistory = (history: SalesEntry[]) =>
  writeStorage(SALES_HISTORY_KEY, history);

export const saveExpenses = (expenses: ExpenseEntry[]) =>
  writeStorage(EXPENSES_KEY, expenses);

export const saveClosedPeriods = (periods: ClosedPeriodEntry[]) =>
  writeStorage(CLOSED_PERIODS_KEY, periods);

export const computeSalesTotals = (quantities: QuantityMap, items: StoreItem[]) => {
  const totalRevenue = items.reduce(
    (sum, item) => sum + (quantities[item.name] ?? 0) * item.price,
    0,
  );
  const totalSold = items.reduce((sum, item) => sum + (quantities[item.name] ?? 0), 0);
  return { totalRevenue, totalSold };
};

export const applyQuantityDelta = (
  quantities: QuantityMap,
  item: string,
  delta: number,
) => {
  const current = quantities[item] ?? 0;
  const nextValue = Math.max(0, current + delta);
  if (nextValue === current) {
    return quantities;
  }
  return { ...quantities, [item]: nextValue };
};

export const buildSalesEntry = (
  quantities: QuantityMap,
  totalSold: number,
  totalRevenue: number,
): SalesEntry => ({
  id: createId(),
  createdAt: new Date().toISOString(),
  totalSold,
  totalRevenue,
  quantities: { ...quantities },
});

export const buildExpenseEntry = (title: string, amount: number): ExpenseEntry => ({
  id: createId(),
  title: title.trim(),
  amount,
  createdAt: new Date().toISOString(),
});

export const computeDailyHistory = (history: SalesEntry[], items: StoreItem[]) => {
  const grouped = new Map<
    string,
    { dateLabel: string; totalRevenue: number; quantities: QuantityMap }
  >();

  history.forEach((entry) => {
    const date = new Date(entry.createdAt);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        dateLabel: date.toLocaleDateString(),
        totalRevenue: 0,
        quantities: createEmptyQuantities(items),
      });
    }

    const day = grouped.get(key);
    if (!day) return;

    day.totalRevenue += entry.totalRevenue;
    Object.keys(entry.quantities).forEach((item) => {
      day.quantities[item] = (day.quantities[item] ?? 0) + (entry.quantities[item] ?? 0);
    });
  });

  return Array.from(grouped.values());
};

export const buildClosedPeriodEntry = (
  salesHistory: SalesEntry[],
  expenses: ExpenseEntry[],
  totalSales: number,
  totalExpenses: number,
): ClosedPeriodEntry => ({
  id: createId(),
  closedAt: new Date().toISOString(),
  salesCount: salesHistory.length,
  expenseCount: expenses.length,
  totalSales,
  totalExpenses,
  netProfit: totalSales - totalExpenses,
});

