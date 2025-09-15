"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import InvoiceForm from "@/components/InvoiceForm";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

type Invoice = {
  id: string;
  invoice_number: string;
  client: string;
  client_email: string;
  created_at: string;
};

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const router = useRouter();

  // === Fetch invoices user ===
  const fetchInvoices = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching invoices:", error);
    else setInvoices(data as Invoice[]);
    setLoading(false);
  }, [user]);

  // === Check login session ===
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user || null)
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // Fetch invoices setiap user berubah
  useEffect(() => {
    fetchInvoices();
  }, [user, fetchInvoices]);

  // Login dengan Google
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  const handleViewInvoice = (invoiceId: string) => {
    router.push(`/invoice/${invoiceId}`);
  };

  const handleOpenDeleteDialog = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
  };

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
    <main className="min-h-screen flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">
        📑 Invoice Generator by Denshanif
      </h1>

      {!user ? (
        <div className="flex flex-col items-center gap-3">
          <p>Silakan login terlebih dahulu untuk membuat invoice</p>
          <Button
            onClick={handleLogin}
            variant="outline"
            className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 hover:border-gray-400"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 533.5 544.3"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M533.5 278.4c0-17.4-1.5-34.1-4.3-50.4H272v95.2h146.9c-6.3 34-25 62.8-53.3 82.1v68h86.2c50.4-46.4 81.7-115 81.7-194.9z"
                fill="#4285F4"
              />
              <path
                d="M272 544.3c72.6 0 133.6-24.1 178.2-65.2l-86.2-68c-24 16.1-54.5 25.6-92 25.6-70.9 0-131-47.8-152.5-112.2h-89.9v70.6C88 470.4 174.6 544.3 272 544.3z"
                fill="#34A853"
              />
              <path
                d="M119.5 323.1c-10.7-31.5-10.7-65.7 0-97.2v-70.6h-89.9C11.2 199.1 0 239.2 0 278.4s11.2 79.3 29.6 123.1l89.9-70.6z"
                fill="#FBBC05"
              />
              <path
                d="M272 107.6c38.3 0 72.7 13.2 99.9 39.2l74.8-74.8C405.6 24.1 344.6 0 272 0 174.6 0 88 73.9 49.6 178.4l89.9 70.6C141 155.4 201.1 107.6 272 107.6z"
                fill="#EA4335"
              />
            </svg>
            Login dengan Google
          </Button>
        </div>
      ) : (
        <div className="w-full max-w-4xl">
          {/* Logout button */}
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              onClick={async () => {
                await supabase.auth.signOut();
                setUser(null);
              }}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Logout
            </Button>
          </div>

          {/* Form untuk membuat invoice baru */}
          <InvoiceForm onSuccess={() => fetchInvoices()} />

          {/* List invoice */}
          <div className="w-full max-w-4xl mt-8">
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
                            {new Date(inv.created_at).toLocaleDateString(
                              "id-ID",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                          <Button
                            size="sm"
                            className="w-full md:w-auto bg-indigo-600 text-white hover:bg-indigo-700"
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
                      id: editingInvoice.id,
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
            onOpenChange={(open) => !open && setInvoiceToDelete(null)}
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
                <Button
                  variant="outline"
                  onClick={() => setInvoiceToDelete(null)}
                >
                  Batal
                </Button>
                <Button variant="destructive" onClick={handleConfirmDelete}>
                  Hapus
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </main>
  );
}
