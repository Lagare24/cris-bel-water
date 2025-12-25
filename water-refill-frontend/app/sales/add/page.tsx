"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  isActive: boolean;
}

interface Client {
  id: number;
  name: string;
}

interface SaleItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export default function AddSalePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, clientsRes] = await Promise.all([
        api.get("/api/products"),
        api.get("/api/clients"),
      ]);
      setProducts(productsRes.data || []);
      setClients(clientsRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!selectedProductId || !quantity) {
      alert("Please select a product and enter quantity");
      return;
    }

    const product = products.find((p) => p.id === parseInt(selectedProductId));
    if (!product) return;

    const qty = parseInt(quantity);
    if (qty <= 0) {
      alert("Quantity must be greater than 0");
      return;
    }

    if (qty > product.quantity) {
      alert(`Only ${product.quantity} units available in stock`);
      return;
    }

    // Check if product already added
    const existingIndex = saleItems.findIndex(
      (item) => item.productId === product.id
    );

    if (existingIndex >= 0) {
      const updatedItems = [...saleItems];
      updatedItems[existingIndex].quantity += qty;
      setSaleItems(updatedItems);
    } else {
      setSaleItems([
        ...saleItems,
        {
          productId: product.id,
          productName: product.name,
          quantity: qty,
          unitPrice: product.price,
        },
      ]);
    }

    setSelectedProductId("");
    setQuantity("1");
  };

  const handleRemoveItem = (productId: number) => {
    setSaleItems(saleItems.filter((item) => item.productId !== productId));
  };

  const handleUpdateQuantity = (productId: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (product && newQty > product.quantity) {
      alert(`Only ${product.quantity} units available`);
      return;
    }

    setSaleItems(
      saleItems.map((item) =>
        item.productId === productId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const calculateTotal = () => {
    return saleItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (saleItems.length === 0) {
      setError("Please add at least one item to the sale");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        clientId: selectedClientId || undefined,
        items: saleItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      await api.post("/api/sales", payload);
      alert("Sale created successfully!");
      router.push("/sales");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to create sale. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container py-8 text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8">Create New Sale</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Client (Optional)</h2>
            <select
              value={selectedClientId || ""}
              onChange={(e) =>
                setSelectedClientId(e.target.value ? parseInt(e.target.value) : null)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Walk-in Customer</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {/* Add Products */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Add Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a product</option>
                  {products
                    .filter((p) => p.isActive && p.quantity > 0)
                    .map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - ${product.price.toFixed(2)} (Stock: {product.quantity})
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sale Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Sale Items</h2>
            {saleItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No items added yet. Add products above.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Product
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                        Quantity
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Unit Price
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Subtotal
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {saleItems.map((item) => (
                      <tr key={item.productId}>
                        <td className="px-4 py-3 text-sm">{item.productName}</td>
                        <td className="px-4 py-3 text-sm text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateQuantity(
                                item.productId,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold">
                          ${(item.quantity * item.unitPrice).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.productId)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-bold">
                      <td colSpan={3} className="px-4 py-3 text-right">
                        Total:
                      </td>
                      <td className="px-4 py-3 text-right text-lg text-blue-600">
                        ${calculateTotal().toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => router.push("/sales")}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || saleItems.length === 0}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Creating Sale..." : "Create Sale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
