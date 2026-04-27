"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import StatCard from "@/components/ui/StatCard";
import {
  ExpenseEntry,
  EXPENSES_KEY,
  formatDate,
  formatDA,
  SALES_HISTORY_KEY,
  SalesEntry,
  STORE_DATA_UPDATED_EVENT,
  readStorage,
  writeStorage,
} from "@/lib/store-data";

const getInitialExpenses = (): ExpenseEntry[] => {
  return readStorage<ExpenseEntry[]>(EXPENSES_KEY, []);
};

const getSavedSales = (): SalesEntry[] => {
  return readStorage<SalesEntry[]>(SALES_HISTORY_KEY, []);
};

export default function ExpensesPage() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [expenses, setExpenses] = useState<ExpenseEntry[]>(getInitialExpenses);
  const [salesHistory, setSalesHistory] = useState<SalesEntry[]>(getSavedSales);

  useEffect(() => {
    writeStorage(EXPENSES_KEY, expenses);
  }, [expenses]);

  useEffect(() => {
    const syncSales = () => {
      setSalesHistory(getSavedSales());
    };

    window.addEventListener("storage", syncSales);
    window.addEventListener(STORE_DATA_UPDATED_EVENT, syncSales);
    syncSales();
    return () => {
      window.removeEventListener("storage", syncSales);
      window.removeEventListener(STORE_DATA_UPDATED_EVENT, syncSales);
    };
  }, []);

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [expenses],
  );

  const totalSales = useMemo(
    () => salesHistory.reduce((sum, sale) => sum + sale.totalRevenue, 0),
    [salesHistory],
  );

  const netProfit = totalSales - totalExpenses;

  const handleAddExpense = (event: FormEvent) => {
    event.preventDefault();
    const numericAmount = Number(amount);

    if (!title.trim() || Number.isNaN(numericAmount) || numericAmount <= 0) {
      return;
    }

    const newEntry: ExpenseEntry = {
      id: `${Date.now()}`,
      title: title.trim(),
      amount: numericAmount,
      createdAt: new Date().toISOString(),
    };

    setExpenses((prev) => [newEntry, ...prev]);
    setTitle("");
    setAmount("");
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses((prev) => prev.filter((entry) => entry.id !== expenseId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white px-4 py-5 pb-24 text-zinc-900">
      <main className="mx-auto w-full max-w-3xl space-y-4">
        <section className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm sm:p-6">
          <h1 className="text-xl font-bold sm:text-2xl">Expenses & Accounting</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Add expenses and see your real profit.
          </p>

          <form onSubmit={handleAddExpense} className="mt-4 space-y-3">
            <input
              type="text"
              placeholder="Expense name (gas, chicken, bread...)"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-xl border border-indigo-200 bg-white px-4 py-3 text-base"
            />
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Amount in DA"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full rounded-xl border border-indigo-200 bg-white px-4 py-3 text-base"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-base font-medium text-white transition hover:bg-indigo-700"
            >
              Add Expense
            </button>
          </form>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Total sales" value={formatDA(totalSales)} />
          <StatCard label="Total expenses" value={formatDA(totalExpenses)} tone="warn" />
          <StatCard
            label="Net profit"
            value={formatDA(netProfit)}
            tone={netProfit < 0 ? "warn" : "good"}
          />
        </section>

        <section className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold">Expenses List</h2>
          {expenses.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">No expenses yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {expenses.map((expense) => (
                <li
                  key={expense.id}
                  className="flex items-center justify-between gap-3 rounded-lg bg-indigo-50 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{expense.title}</p>
                    <p className="text-xs text-zinc-500">{formatDate(expense.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-rose-700">
                      {formatDA(expense.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="rounded-lg bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-200"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
