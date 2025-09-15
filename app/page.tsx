"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import InvoiceForm from "@/components/InvoiceForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type Invoice = {
  id: string;
  invoice_number: string;
  client: string;
  client_email: string;
  created_at: string;
  // Add other fields as needed
};

export default function HomePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const router = useRouter();

  // Ambil data invoice
  const fetchInvoices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setInvoices(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleViewInvoice = (invoiceId: string) => {
    router.push(`/invoice/${invoiceId}`);
  };

  // Buka dialog hapus
  const handleOpenDeleteDialog = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
  };

  // Konfirmasi hapus
  const handleConfirmDelete = async () => {
    if (!invoiceToDelete) return;
    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", invoiceToDelete.id);
    if (!error) fetchInvoices();
    setInvoiceToDelete(null);
  };

  return (
    <main className="flex flex-col items-center bg-gray-50 min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-8">
        📑 Invoice Generator by Denshanif
      </h1>

      {/* Form input invoice baru */}
      <div className="w-full max-w-4xl mb-10">
        <InvoiceForm onSuccess={fetchInvoices} />
      </div>

      {/* List invoice */}
      <div className="w-full max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              Daftar Invoice
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-4">Memuat data...</p>
            ) : invoices.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                Belum ada invoice yang dibuat.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {invoices.map((inv) => (
                  <li
                    key={inv.id}
                    className="flex justify-between items-center py-3 px-1 hover:bg-gray-50 transition"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">
                        #{inv.invoice_number}
                      </span>
                      <span className="font-medium">{inv.client}</span>
                      <span className="text-sm text-gray-500">
                        {inv.client_email}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(inv.created_at).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                      <Button
                        size="sm"
                        className="w-full md:w-auto bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => handleViewInvoice(inv.id)}
                      >
                        Lihat
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full md:w-auto"
                        onClick={() => {
                          setEditingInvoice(inv);
                          setShowEditModal(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="w-full md:w-auto"
                        onClick={() => handleOpenDeleteDialog(inv)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog edit invoice */}
      <Dialog
        open={showEditModal}
        onOpenChange={(open) => setShowEditModal(open)}
      >
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit Invoice #{editingInvoice?.invoice_number}
            </DialogTitle>
          </DialogHeader>
          {editingInvoice && (
            <InvoiceForm
              defaultValues={{
                ...editingInvoice,
                id: Number(editingInvoice.id),
              }}
              onSuccess={() => {
                setShowEditModal(false);
                setEditingInvoice(null);
                fetchInvoices();
              }}
            />
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setEditingInvoice(null);
              }}
            >
              Batal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog hapus konfirmasi */}
      <Dialog
        open={!!invoiceToDelete}
        onOpenChange={(open) => {
          if (!open) setInvoiceToDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Invoice</DialogTitle>
          </DialogHeader>
          <p className="mt-2">
            Apakah Anda yakin ingin menghapus invoice #
            {invoiceToDelete?.invoice_number}?
          </p>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setInvoiceToDelete(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
