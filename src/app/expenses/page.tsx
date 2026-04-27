"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import StatCard from "@/components/ui/StatCard";
import {
  createEmptyQuantities,
  ClosedPeriodEntry,
  ExpenseEntry,
  formatDate,
  formatDA,
  SalesEntry,
} from "@/lib/store-data";
import {
  buildClosedPeriodEntry,
  buildExpenseEntry,
  getClosedPeriods,
  getExpenses,
  getItems,
  getSalesHistory,
  saveClosedPeriods,
  saveExpenses,
  savePendingQuantities,
  saveSalesHistory,
} from "@/lib/store-service";

const getInitialExpenses = (): ExpenseEntry[] => {
  return getExpenses();
};

const getSavedSales = (): SalesEntry[] => {
  return getSalesHistory();
};

export default function ExpensesPage() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [expenses, setExpenses] = useState<ExpenseEntry[]>(getInitialExpenses);
  const [salesHistory, setSalesHistory] = useState<SalesEntry[]>(getSavedSales);
  const [closedPeriods, setClosedPeriods] =
    useState<ClosedPeriodEntry[]>(getClosedPeriods);

  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    saveClosedPeriods(closedPeriods);
  }, [closedPeriods]);

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

    const newEntry = buildExpenseEntry(title, numericAmount);

    setExpenses((prev) => [newEntry, ...prev]);
    setTitle("");
    setAmount("");
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses((prev) => prev.filter((entry) => entry.id !== expenseId));
  };

  const handleClosePeriod = () => {
    if (salesHistory.length === 0 && expenses.length === 0) {
      return;
    }
    const shouldClose = window.confirm(
      "Close this period and start fresh? Current sales and expenses will move to period history.",
    );
    if (!shouldClose) {
      return;
    }

    const snapshot = buildClosedPeriodEntry(
      salesHistory,
      expenses,
      totalSales,
      totalExpenses,
    );

    setClosedPeriods((prev) => [snapshot, ...prev]);
    saveSalesHistory([]);
    saveExpenses([]);
    savePendingQuantities(createEmptyQuantities(getItems()));
    setSalesHistory([]);
    setExpenses([]);
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
          <h2 className="text-lg font-semibold">Period Actions</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Close current period and start fresh. Old numbers stay in history.
          </p>
          <button
            type="button"
            onClick={handleClosePeriod}
            disabled={salesHistory.length === 0 && expenses.length === 0}
            className="mt-3 w-full rounded-xl bg-amber-500 px-4 py-3 text-base font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Close Period & Start Fresh
          </button>
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

        <section className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold">Closed Periods History</h2>
          {closedPeriods.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">No closed periods yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {closedPeriods.map((period) => (
                <li key={period.id} className="rounded-lg bg-indigo-50 px-3 py-2 text-sm">
                  <p className="font-semibold text-indigo-900">
                    Closed: {formatDate(period.closedAt)}
                  </p>
                  <p className="text-zinc-700">
                    Sales: {formatDA(period.totalSales)} ({period.salesCount} entries)
                  </p>
                  <p className="text-zinc-700">
                    Expenses: {formatDA(period.totalExpenses)} ({period.expenseCount} entries)
                  </p>
                  <p
                    className={`font-semibold ${
                      period.netProfit < 0 ? "text-rose-700" : "text-emerald-700"
                    }`}
                  >
                    Profit: {formatDA(period.netProfit)}
                  </p>
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
