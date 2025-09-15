"use client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

type Invoice = {
  id: string;
  invoice_number: string;
  client: string;
  client_email: string;
  created_at: string;
};

export default function InvoiceList({
  invoices,
  loading,
  onView,
  onEdit,
  onDelete,
}: {
  invoices: Invoice[];
  loading: boolean;
  onView: (id: string) => void;
  onEdit: (inv: Invoice) => void;
  onDelete: (inv: Invoice) => void;
}) {
  return (
    <Card className="mt-8">
      <CardHeader><CardTitle className="text-center text-2xl">Daftar Invoice</CardTitle></CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center py-4">Memuat data...</p>
        ) : invoices.length === 0 ? (
          <div className="text-center py-6 text-gray-500">Belum ada invoice yang dibuat.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {invoices.map((inv) => (
              <li key={inv.id} className="flex justify-between items-center py-3 px-1 hover:bg-gray-50 transition">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">#{inv.invoice_number}</span>
                  <span className="font-medium">{inv.client}</span>
                  <span className="text-sm text-gray-500">{inv.client_email}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(inv.created_at).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <Button size="sm" className="w-full md:w-auto bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => onView(inv.id)}>Lihat</Button>
                  <Button size="sm" variant={"outline"} className="w-full md:w-auto" onClick={() => onEdit(inv)}>Edit</Button>
                  <Button size="sm" className="w-full md:w-auto bg-red-600 text-white hover:bg-red-700" onClick={() => onDelete(inv)}>Hapus</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
