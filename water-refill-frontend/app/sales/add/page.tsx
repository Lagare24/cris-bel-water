"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { PageHeader } from "@/components/page-header";
import { LoadingSpinner } from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Minus, Trash2, ShoppingCart, User } from "lucide-react";
import { toast } from "sonner";
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
  const [selectedClientId, setSelectedClientId] = useState<number | null>(1); // Default to Walk-in Customer (ID 1)
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
      toast.error("Please select a product and enter quantity");
      return;
    }

    const product = products.find((p) => p.id === parseInt(selectedProductId));
    if (!product) return;

    const qty = parseInt(quantity);
    if (qty <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    if (qty > product.quantity) {
      toast.error(`Only ${product.quantity} units available in stock`);
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
      toast.success(`Updated ${product.name} quantity`);
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
      toast.success(`Added ${product.name} to cart`);
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
      toast.error(`Only ${product.quantity} units available`);
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
      toast.error("Please add at least one item to the sale");
      return;
    }

    // Validate stock availability before submitting
    for (const item of saleItems) {
      const product = products.find((p) => p.id === item.productId);
      if (product && item.quantity > product.quantity) {
        const errorMsg = `Insufficient stock for ${item.productName}. Only ${product.quantity} available.`;
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }
    }

    setSubmitting(true);

    try {
      const payload = {
        clientId: selectedClientId,
        items: saleItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      console.log("Sale payload:", JSON.stringify(payload, null, 2));
      await api.post("/api/sales", payload);
      toast.success("Sale created successfully!");
      router.push("/sales");
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to create sale. Please try again.";
      const detailedError = err.response?.data?.error
        ? `${err.response.data.message}: ${err.response.data.error}`
        : errorMsg;
      setError(detailedError);
      toast.error(detailedError);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Create New Sale"
          description="Add products to create a new sale transaction"
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Selection */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Client (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedClientId?.toString() || "1"}
                onValueChange={(value) => setSelectedClientId(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Add Products */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Add Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="product">Product</Label>
                  <Select
                    value={selectedProductId}
                    onValueChange={setSelectedProductId}
                  >
                    <SelectTrigger id="product">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products
                        .filter((p) => p.isActive && p.quantity > 0)
                        .map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name} - ${product.price.toFixed(2)} (Stock:{" "}
                            {product.quantity})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <div className="flex gap-2">
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleAddItem}
                      className="whitespace-nowrap"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sale Items */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Shopping Cart</CardTitle>
            </CardHeader>
            <CardContent>
              {saleItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No items added yet</p>
                  <p className="text-sm mt-2">Add products above to get started</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {saleItems.map((item) => (
                        <TableRow key={item.productId}>
                          <TableCell className="font-medium">
                            {item.productName}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.productId,
                                    item.quantity - 1
                                  )
                                }
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-12 text-center font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.productId,
                                    item.quantity + 1
                                  )
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            ${item.unitPrice.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ${(item.quantity * item.unitPrice).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(item.productId)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-semibold">
                          Total Amount:
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-2xl font-bold text-primary">
                            ${calculateTotal().toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/sales")}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || saleItems.length === 0}
              className="flex-1"
            >
              {submitting ? "Creating Sale..." : "Create Sale"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
