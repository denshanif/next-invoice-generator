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
import BadgeComponent from "@/components/BadgeComponent";

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
    supabase.auth.getSession().then(({ data }) =>
      setUser(data.session?.user || null)
    );
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user || null)
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [user, fetchInvoices]);

  // Handlers
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };
  const handleViewInvoice = (id: string) => router.push(`/invoice/${id}`);
  const handleEditInvoice = (inv: Invoice) => {
    setEditingInvoice(inv);
    setShowEditModal(true);
  };
  const handleDeleteInvoice = (inv: Invoice) => setInvoiceToDelete(inv);
  const confirmDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", invoiceToDelete.id);
    if (!error) fetchInvoices();
    setInvoiceToDelete(null);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-between relative bg-gray-50 py-10">
      {!user ? (
        // ---------------- Landing Page Mode ----------------
        <div className="flex flex-col items-center justify-center flex-1 px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Simple Invoice Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mb-8">
            Create, download, and manage your invoices easily with our free and
            open-source web app.
          </p>

          <LoginSection onLogin={handleLogin} />

          {/* Extra features highlight */}
          <div className="grid md:grid-cols-4 gap-6 mt-16 max-w-4xl w-full">
            <div className="p-6 border rounded-2xl shadow-sm bg-white">
              <h3 className="font-semibold text-lg mb-2">⚡ Quick Setup</h3>
              <p className="text-gray-600 text-sm">
                Get started instantly with Google Login, no hassle required.
              </p>
            </div>
            <div className="p-6 border rounded-2xl shadow-sm bg-white">
              <h3 className="font-semibold text-lg mb-2">🖼️ Custom Logos</h3>
              <p className="text-gray-600 text-sm">
                Personalize your invoices by uploading your own business logo.
              </p>
            </div>
            <div className="p-6 border rounded-2xl shadow-sm bg-white">
              <h3 className="font-semibold text-lg mb-2">💾 Easy to Download</h3>
              <p className="text-gray-600 text-sm">
                Download your invoices as PDF with a single click.
              </p>
            </div>
            <div className="p-6 border rounded-2xl shadow-sm bg-white">
              <h3 className="font-semibold text-lg mb-2">☁️ Cloud Powered</h3>
              <p className="text-gray-600 text-sm">
                Your data is securely stored in Supabase with real-time sync.
              </p>
            </div>
          </div>
        </div>
      ) : (
        // ---------------- Dashboard Mode ----------------
        <div className="w-full max-w-5xl flex-1 px-6">
          {/* Top bar */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Your Invoices</h2>
            <Button
              variant="outline"
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleLogout}
            >
              Logout
            </Button>
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
            onClose={() => {
              setShowEditModal(false);
              setEditingInvoice(null);
            }}
            onSuccess={() => {
              setShowEditModal(false);
              setEditingInvoice(null);
              fetchInvoices();
            }}
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

      {/* Floating badge */}
      <BadgeComponent />
    </main>
  );
}
