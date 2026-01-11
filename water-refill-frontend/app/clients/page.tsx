"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import Navbar from "@/components/Navbar";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { LoadingSpinner } from "@/components/loading";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Pencil, Trash2, Filter } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [clients, statusFilter]);

  const fetchClients = async () => {
    try {
      const response = await api.get("/api/clients");
      setClients(response.data || []);
    } catch (err) {
      console.error("Error fetching clients:", err);
      toast.error("Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...clients];

    // Status filter
    if (statusFilter === "active") {
      filtered = filtered.filter((client) => client.isActive);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((client) => !client.isActive);
    }

    setFilteredClients(filtered);
  };

  const handleOpenDialog = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
      });
    } else {
      setEditingClient(null);
      setFormData({ name: "", email: "", phone: "", address: "" });
    }
    setShowDialog(true);
    setError("");
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingClient(null);
    setFormData({ name: "", email: "", phone: "", address: "" });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (editingClient) {
        await api.put(`/api/clients/${editingClient.id}`, formData);
        toast.success("Client updated successfully");
      } else {
        await api.post("/api/clients", formData);
        toast.success("Client created successfully");
      }
      fetchClients();
      handleCloseDialog();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to save client";
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await api.delete(`/api/clients/${deleteId}`);
      toast.success("Client deleted successfully");
      fetchClients();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete client");
    } finally {
      setDeleteId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    // Filter out Walk-in Customer (ID: 1) as extra safety measure
    const validIds = selectedIds.filter((id) => id !== 1);

    if (validIds.length === 0) {
      toast.error("Cannot delete Walk-in Customer. This is a default system client.");
      setShowBulkDeleteDialog(false);
      return;
    }

    try {
      const response = await api.post("/api/clients/bulk-delete", {
        ids: validIds,
      });
      toast.success(response.data?.message || `${validIds.length} client(s) deleted successfully`);
      setSelectedIds([]);
      fetchClients();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete clients");
    } finally {
      setShowBulkDeleteDialog(false);
    }
  };

  const columns: ColumnDef<Client>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => {
            if (value) {
              // Select all rows except Walk-in Customer
              table.getRowModel().rows.forEach((row) => {
                const isWalkInCustomer = row.original.id === 1;
                row.toggleSelected(!isWalkInCustomer);
              });
              // Filter out Walk-in Customer (ID: 1) from selected IDs
              const allIds = table.getRowModel().rows
                .map((row) => row.original.id)
                .filter((id) => id !== 1);
              setSelectedIds(allIds);
            } else {
              table.toggleAllPageRowsSelected(false);
              setSelectedIds([]);
            }
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => {
        const isWalkInCustomer = row.original.id === 1;
        return (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value);
              if (value) {
                setSelectedIds([...selectedIds, row.original.id]);
              } else {
                setSelectedIds(selectedIds.filter((id) => id !== row.original.id));
              }
            }}
            disabled={isWalkInCustomer}
            aria-label="Select row"
            title={isWalkInCustomer ? "Walk-in Customer cannot be deleted" : undefined}
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const isWalkInCustomer = row.original.id === 1;
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{row.getValue("name")}</span>
            {isWalkInCustomer && (
              <Badge variant="secondary" className="text-xs">
                System Default
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="text-muted-foreground">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <div className="text-muted-foreground">{row.getValue("phone")}</div>
      ),
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => (
        <div className="text-muted-foreground max-w-xs truncate">
          {row.getValue("address")}
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const client = row.original;
        const isWalkInCustomer = client.id === 1;
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleOpenDialog(client)}
              title="Edit client"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteId(client.id)}
              disabled={isWalkInCustomer}
              title={isWalkInCustomer ? "Walk-in Customer cannot be deleted (system default)" : "Delete client"}
            >
              <Trash2 className={`h-4 w-4 ${isWalkInCustomer ? "text-muted-foreground" : "text-destructive"}`} />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Clients"
          description="Manage your client accounts"
          action={
            <div className="flex gap-2">
              {selectedIds.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={() => setShowBulkDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected ({selectedIds.length})
                </Button>
              )}
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </div>
          }
        />

        {/* Filters */}
        <Card className="glass-card mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="status-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active Only</SelectItem>
                      <SelectItem value="inactive">Inactive Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => setStatusFilter("all")}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <DataTable
            columns={columns}
            data={filteredClients}
            searchKey="name"
            searchPlaceholder="Search clients..."
          />
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="glass-card sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingClient ? "Edit Client" : "Add New Client"}
              </DialogTitle>
              <DialogDescription>
                {editingClient
                  ? "Update client information below."
                  : "Fill in the client details below."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  rows={3}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingClient ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={deleteId !== null}
          onOpenChange={(open) => !open && setDeleteId(null)}
          title="Delete Client"
          description="Are you sure you want to delete this client? This action cannot be undone."
          onConfirm={handleDelete}
          confirmText="Delete"
          variant="destructive"
        />

        {/* Bulk Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={showBulkDeleteDialog}
          onOpenChange={setShowBulkDeleteDialog}
          title="Delete Multiple Clients"
          description={`Are you sure you want to delete ${selectedIds.length} client(s)? This action cannot be undone.`}
          onConfirm={handleBulkDelete}
          confirmText="Delete All"
          variant="destructive"
        />
      </div>
    </div>
  );
}
