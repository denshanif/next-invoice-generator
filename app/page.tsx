"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

import LoginSection from "@/components/LoginSection";
import InvoiceList from "@/components/InvoiceList";
import EditInvoiceDialog from "@/components/EditInvoiceDialog";
import DeleteInvoiceDialog from "@/components/DeleteInvoiceDialog";
import InvoiceForm from "@/components/InvoiceForm";
import { Button } from "@/components/ui/button";

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

  // Fetch invoices
  const fetchInvoices = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setInvoices(data as Invoice[]);
    setLoading(false);
  }, [user]);

  // Check login session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => { fetchInvoices(); }, [user, fetchInvoices]);

  // Handlers
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
  };
  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); };
  const handleViewInvoice = (id: string) => router.push(`/invoice/${id}`);
  const handleEditInvoice = (inv: Invoice) => { setEditingInvoice(inv); setShowEditModal(true); };
  const handleDeleteInvoice = (inv: Invoice) => setInvoiceToDelete(inv);
  const confirmDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    const { error } = await supabase.from("invoices").delete().eq("id", invoiceToDelete.id);
    if (!error) fetchInvoices();
    setInvoiceToDelete(null);
  };

  return (
    <main className="min-h-screen flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">📑 Invoice Generator by Denshanif</h1>

      {!user ? (
        <LoginSection onLogin={handleLogin} />
      ) : (
        <div className="w-full max-w-4xl">
          {/* Logout */}
          <div className="flex justify-end mb-4">
            <Button variant="outline" className="bg-red-600 text-white hover:bg-red-700" onClick={handleLogout}>Logout</Button>
          </div>

          {/* Create new invoice */}
          <InvoiceForm onSuccess={fetchInvoices} />

          {/* Invoice list */}
          <InvoiceList
            invoices={invoices}
            loading={loading}
            onView={handleViewInvoice}
            onEdit={handleEditInvoice}
            onDelete={handleDeleteInvoice}
          />

          {/* Edit invoice dialog */}
          <EditInvoiceDialog
            invoice={editingInvoice}
            open={showEditModal}
            onClose={() => { setShowEditModal(false); setEditingInvoice(null); }}
            onSuccess={() => { setShowEditModal(false); setEditingInvoice(null); fetchInvoices(); }}
          />

          {/* Delete invoice dialog */}
          <DeleteInvoiceDialog
            invoice={invoiceToDelete}
            open={!!invoiceToDelete}
            onClose={() => setInvoiceToDelete(null)}
            onConfirm={confirmDeleteInvoice}
          />
        </div>
      )}
    </main>
  );
}
