"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { QuantityMap, StoreItem } from "@/lib/store-data";
import {
  getItems,
  getPendingQuantities,
  saveItems,
  savePendingQuantities,
} from "@/lib/store-service";

export default function ItemsPage() {
  const [items, setItems] = useState<StoreItem[]>(getItems);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");

  useEffect(() => {
    saveItems(items);
  }, [items]);

  const updatePendingWithItems = (nextItems: StoreItem[]) => {
    const previous = getPendingQuantities();
    const next: QuantityMap = {};
    nextItems.forEach((item) => {
      next[item.name] = previous[item.name] ?? 0;
    });
    savePendingQuantities(next);
  };

  const handleAddItem = () => {
    const name = newItemName.trim();
    const price = Number(newItemPrice);
    if (!name || Number.isNaN(price) || price <= 0) {
      return;
    }
    if (items.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
      return;
    }

    const nextItems = [...items, { id: `item-${Date.now()}`, name, price }];
    setItems(nextItems);
    updatePendingWithItems(nextItems);
    setNewItemName("");
    setNewItemPrice("");
  };

  const handleUpdateItemPrice = (itemId: string, price: number) => {
    if (Number.isNaN(price) || price <= 0) {
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, price } : item)),
    );
  };

  const handleDeleteItem = (itemId: string) => {
    const target = items.find((item) => item.id === itemId);
    if (!target || items.length <= 1) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${target.name}" from active items? Old history stays unchanged.`,
    );
    if (!confirmed) {
      return;
    }

    const nextItems = items.filter((item) => item.id !== itemId);
    setItems(nextItems);
    updatePendingWithItems(nextItems);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white px-4 py-5 pb-24 text-zinc-900">
      <main className="mx-auto w-full max-w-3xl space-y-4">
        <section className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm sm:p-6">
          <h1 className="text-xl font-bold sm:text-2xl">Items Manager</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Add, edit prices, or delete active items for sales.
          </p>

          <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
            <p className="text-sm font-semibold text-indigo-900">Add New Item</p>
            <div className="mt-2 grid grid-cols-[1fr_110px] gap-2">
              <input
                type="text"
                placeholder="Item name"
                value={newItemName}
                onChange={(event) => setNewItemName(event.target.value)}
                className="rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm"
              />
              <input
                type="number"
                min={1}
                inputMode="numeric"
                placeholder="Price"
                value={newItemPrice}
                onChange={(event) => setNewItemPrice(event.target.value)}
                className="rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              className="mt-2 w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"
            >
              Add Item
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold">Active Items</h2>
          <div className="mt-3 space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_90px_76px] items-center gap-2 rounded-lg bg-indigo-50 p-2"
              >
                <p className="truncate text-sm font-medium text-zinc-800">{item.name}</p>
                <input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  defaultValue={item.price}
                  onBlur={(event) =>
                    handleUpdateItemPrice(item.id, Number(event.target.value))
                  }
                  className="rounded-md border border-indigo-200 px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  className="rounded-md bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700 disabled:opacity-50"
                  disabled={items.length <= 1}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
