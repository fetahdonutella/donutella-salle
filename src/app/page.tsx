"use client";

import { useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import StatCard from "@/components/ui/StatCard";
import {
  createEmptyQuantities,
  formatDate,
  formatDA,
  QuantityMap,
  SalesEntry,
} from "@/lib/store-data";
import {
  applyQuantityDelta,
  buildSalesEntry,
  computeDailyHistory,
  computeSalesTotals,
  getItems,
  getPendingQuantities,
  getSalesHistory,
  savePendingQuantities,
  saveSalesHistory,
} from "@/lib/store-service";

const getInitialQuantities = (): QuantityMap => {
  return getPendingQuantities();
};

const getInitialHistory = (): SalesEntry[] => {
  return getSalesHistory();
};

export default function Home() {
  const [items] = useState(getItems);
  const [quantities, setQuantities] = useState<QuantityMap>(getInitialQuantities);
  const [history, setHistory] = useState<SalesEntry[]>(getInitialHistory);
  const [lastAction, setLastAction] = useState<{ item: string; delta: number } | null>(
    null,
  );

  useEffect(() => {
    savePendingQuantities(quantities);
  }, [quantities]);

  useEffect(() => {
    saveSalesHistory(history);
  }, [history]);

  const totals = useMemo(() => computeSalesTotals(quantities, items), [quantities, items]);
  const { totalRevenue, totalSold } = totals;

  const handleQuantityChange = (item: string, delta: number) => {
    setQuantities((prev) => {
      const next = applyQuantityDelta(prev, item, delta);
      if (next === prev) {
        return prev;
      }
      return next;
    });
    setLastAction({ item, delta });
  };

  const handleClearCounter = () => {
    setQuantities(createEmptyQuantities(items));
    setLastAction(null);
  };

  const handleUndoLastAction = () => {
    if (!lastAction) {
      return;
    }
    handleQuantityChange(lastAction.item, -lastAction.delta);
    setLastAction(null);
  };

  const handleSaveDay = () => {
    if (totalSold === 0) {
      return;
    }

    const entry = buildSalesEntry(quantities, totalSold, totalRevenue);

    setHistory((prev) => [entry, ...prev]);
    setQuantities(createEmptyQuantities(items));
    setLastAction(null);
  };

  const handleDeleteSale = (saleId: string) => {
    setHistory((prev) => prev.filter((entry) => entry.id !== saleId));
  };

  const dailyHistory = useMemo(() => computeDailyHistory(history, items), [history, items]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white px-4 py-5 pb-24 text-zinc-900">
      <main className="mx-auto grid w-full max-w-4xl gap-4 md:grid-cols-[2fr_1fr]">
        <section className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm sm:p-6">
          <h1 className="text-xl font-bold sm:text-2xl">Sales</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Tap an item card to add +1 quickly. Tap many times for one order.
          </p>

          <div className="mt-4 space-y-3 sm:mt-6 sm:space-y-4">
            {items.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => handleQuantityChange(item.name, 1)}
                className="flex w-full items-center justify-between gap-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 text-left transition hover:bg-indigo-100 sm:p-4"
              >
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-zinc-500">{formatDA(item.price)}</p>
                  <p className="text-xs font-medium text-indigo-600">Tap card: +1</p>
                </div>

                <div
                  onClick={(event) => event.stopPropagation()}
                  className="flex items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(item.name, -1)}
                    className="h-10 w-10 rounded-lg bg-white text-xl font-bold text-indigo-700 shadow-sm"
                    aria-label={`Decrease ${item.name}`}
                  >
                    -
                  </button>
                  <span className="min-w-10 text-center text-lg font-bold text-indigo-900">
                    {quantities[item.name] ?? 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(item.name, 1)}
                    className="h-10 w-10 rounded-lg bg-indigo-600 text-xl font-bold text-white shadow-sm"
                    aria-label={`Increase ${item.name}`}
                  >
                    +
                  </button>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleUndoLastAction}
              className="rounded-xl border border-indigo-200 bg-white px-4 py-3 text-sm font-semibold text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!lastAction}
            >
              Undo Last Tap
            </button>
            <button
              type="button"
              onClick={handleClearCounter}
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
            >
              Clear Counter
            </button>
          </div>

          <button
            type="button"
            onClick={handleSaveDay}
            className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-3 text-base font-medium text-white transition hover:bg-indigo-700 sm:mt-6"
          >
            Save Order
          </button>
        </section>

        <aside className="space-y-4">
          <StatCard label="Total items sold" value={`${totalSold}`} />
          <StatCard label="Total revenue" value={formatDA(totalRevenue)} />

          <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold">Orders History</h2>
            {history.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">No saved days yet.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm text-zinc-700">
                {history.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-indigo-50 px-3 py-2"
                  >
                    <div>
                      <p>
                        {formatDate(entry.createdAt)} - {entry.totalSold} items -{" "}
                        {formatDA(entry.totalRevenue)}
                      </p>
                      <p className="mt-1 text-sm font-medium text-indigo-900">
                        {Object.entries(entry.quantities)
                          .map(([name, qty]) => `${name}: ${qty}`)
                          .join(" | ")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteSale(entry.id)}
                      className="shrink-0 rounded-lg bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-200"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold">Daily Item History</h2>
            {dailyHistory.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">No daily history yet.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm text-zinc-700">
                {dailyHistory.map((day) => (
                  <li
                    key={day.dateLabel}
                    className="rounded-lg bg-indigo-50 px-3 py-2"
                  >
                    <p className="font-semibold text-indigo-900">{day.dateLabel}</p>
                    <p className="text-xs text-zinc-600">
                      {Object.entries(day.quantities).map(
                        ([item, qty]) => `${item}: ${qty}`,
                      ).join(" | ")}
                    </p>
                    <p className="text-xs text-indigo-700">
                      Total: {formatDA(day.totalRevenue)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </main>
      <BottomNav />
    </div>
  );
}
