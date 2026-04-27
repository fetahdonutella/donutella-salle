"use client";

import { useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import StatCard from "@/components/ui/StatCard";
import {
  EMPTY_QUANTITIES,
  formatDate,
  formatDA,
  ITEM_NAMES,
  ItemName,
  PENDING_QUANTITIES_KEY,
  PRICES,
  QuantityMap,
  SALES_HISTORY_KEY,
  SalesEntry,
  readStorage,
  writeStorage,
} from "@/lib/store-data";

const getInitialQuantities = (): QuantityMap => {
  return readStorage<QuantityMap>(PENDING_QUANTITIES_KEY, EMPTY_QUANTITIES);
};

const getInitialHistory = (): SalesEntry[] => {
  return readStorage<SalesEntry[]>(SALES_HISTORY_KEY, []);
};

export default function Home() {
  const [quantities, setQuantities] = useState<QuantityMap>(getInitialQuantities);
  const [history, setHistory] = useState<SalesEntry[]>(getInitialHistory);

  useEffect(() => {
    writeStorage(PENDING_QUANTITIES_KEY, quantities);
  }, [quantities]);

  useEffect(() => {
    writeStorage(SALES_HISTORY_KEY, history);
  }, [history]);

  const totalRevenue = useMemo(() => {
    return ITEM_NAMES.reduce((sum, item) => {
      return sum + quantities[item] * PRICES[item];
    }, 0);
  }, [quantities]);

  const totalSold = useMemo(() => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  }, [quantities]);

  const handleQuantityChange = (item: ItemName, value: number) => {
    setQuantities((prev) => ({
      ...prev,
      [item]: Math.max(0, value),
    }));
  };

  const handleSaveDay = () => {
    if (totalSold === 0) {
      return;
    }

    const entry: SalesEntry = {
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      totalSold,
      totalRevenue,
      quantities,
    };

    setHistory((prev) => [entry, ...prev]);
    setQuantities(EMPTY_QUANTITIES);
  };

  const handleDeleteSale = (saleId: string) => {
    setHistory((prev) => prev.filter((entry) => entry.id !== saleId));
  };

  const dailyHistory = useMemo(() => {
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
          quantities: { ...EMPTY_QUANTITIES },
        });
      }

      const day = grouped.get(key);
      if (!day) return;

      day.totalRevenue += entry.totalRevenue;
      ITEM_NAMES.forEach((item) => {
        day.quantities[item] += entry.quantities[item];
      });
    });

    return Array.from(grouped.values());
  }, [history]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white px-4 py-5 pb-24 text-zinc-900">
      <main className="mx-auto grid w-full max-w-4xl gap-4 md:grid-cols-[2fr_1fr]">
        <section className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm sm:p-6">
          <h1 className="text-xl font-bold sm:text-2xl">Sales</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Add sold items quickly and save today&apos;s sales.
          </p>

          <div className="mt-4 space-y-3 sm:mt-6 sm:space-y-4">
            {ITEM_NAMES.map((item) => (
              <div
                key={item}
                className="flex items-center justify-between gap-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 sm:p-4"
              >
                <div>
                  <p className="font-semibold">{item}</p>
                  <p className="text-sm text-zinc-500">{formatDA(PRICES[item])}</p>
                </div>

                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={quantities[item]}
                  onChange={(event) =>
                    handleQuantityChange(item, Number(event.target.value))
                  }
                  className="w-24 rounded-lg border border-indigo-200 bg-white px-3 py-3 text-right text-base"
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSaveDay}
            className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-3 text-base font-medium text-white transition hover:bg-indigo-700 sm:mt-6"
          >
            Save Day
          </button>
        </section>

        <aside className="space-y-4">
          <StatCard label="Total items sold" value={`${totalSold}`} />
          <StatCard label="Total revenue" value={formatDA(totalRevenue)} />

          <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold">Recent Sales</h2>
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
                      <p className="text-xs text-zinc-500">
                        {ITEM_NAMES.map(
                          (item) => `${item}: ${entry.quantities[item]}`,
                        ).join(" | ")}
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
                      {ITEM_NAMES.map(
                        (item) => `${item}: ${day.quantities[item]}`,
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
