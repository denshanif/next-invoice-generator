"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function InvoiceDetailPage() {
  const { id } = useParams() as { id: string };
  const [invoice, setInvoice] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchInvoice = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", id)
        .single();
      if (error) setErrorMsg(error.message);
      else setInvoice(data);
      setLoading(false);
    };
    fetchInvoice();
  }, [id]);

  if (loading) return <p className="p-6">Loading invoice…</p>;
  if (errorMsg) return <p className="p-6 text-red-600">{errorMsg}</p>;
  if (!invoice) return <p className="p-6">Invoice tidak ditemukan.</p>;

  const {
    invoice_number,
    business,
    business_contact,
    logo_data_url,
    client,
    client_email,
    client_phone,
    due_date,
    items = [],
    subtotal = 0,
    discount_percent = 0,
    discount_value = 0,
    tax_percent = 0,
    tax_value = 0,
    total = 0,
    payment_method,
  } = invoice;

  return (
    <div className="p-6 flex flex-col items-center">
      <div className="mb-4 flex gap-2 self-end">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          size="sm"
          className="print:hidden"
        >
          Kembali
        </Button>
        <Button
          variant="outline"
          onClick={() => window.print()}
          size="sm"
          className="print:hidden bg-red-600 text-white hover:bg-red-700"
        >
          Cetak / PDF
        </Button>
      </div>

      <Card className="w-full max-w-4xl border print:border-0 print:shadow-none">
        <CardHeader>
          <div className="flex justify-between items-center print:hidden">
            <CardTitle>Invoice {invoice_number || "#0001"}</CardTitle>
            {logo_data_url && (
              <Image
                src={logo_data_url}
                alt="logo"
                width={80}
                height={80}
                className="h-20 w-20 object-cover rounded"
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Info Bisnis */}
          <div className="flex justify-between">
            <div className="space-y-1">
              <div className="text-sm text-gray-500">
                #{invoice_number || "0001"}
              </div>
              <div className="text-xl font-semibold">
                {business || "Nama Bisnis"}
              </div>
              <div className="text-base">
                Kontak: {business_contact || "Email / Telepon"}
              </div>
              <div className="text-sm text-gray-500">
                Dibuat:{" "}
                {new Date(invoice.created_at).toLocaleDateString("id-ID")}
              </div>
            </div>
          </div>

          <Separator />

          {/* Info Klien */}
          <div className="space-y-1">
            <div className="font-medium">Untuk:</div>
            <div>{client || "Nama Klien"}</div>
            <div>{client_email || "Email Klien"}</div>
            <div>{client_phone || "Telepon Klien"}</div>
          </div>

          <Separator />

          {/* Due Date */}
          <div className="space-y-1">
            <div className="font-medium">Tanggal Jatuh Tempo:</div>
            <div>
              {due_date ? new Date(due_date).toLocaleDateString("id-ID") : "-"}
            </div>
          </div>

          <Separator />

          {/* Daftar Item */}
          <div>
            <h4 className="font-semibold mb-2">Daftar Item</h4>

            {/* Scrollable Table untuk layar */}
            <div className="block print:hidden">
              <ScrollArea className="h-64 border rounded-md">
                <Table className="w-full text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left">Nama</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Harga</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((it: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>{it.name || "-"}</TableCell>
                        <TableCell className="text-right">{it.qty}</TableCell>
                        <TableCell className="text-right">
                          Rp {Number(it.price || 0).toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-right">
                          Rp{" "}
                          {Number(it.qty * it.price || 0).toLocaleString(
                            "id-ID"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>

            {/* Table HTML biasa untuk print */}
            <div className="hidden print:block">
              <table className="w-full text-sm border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-2 py-1 text-left">Nama</th>
                    <th className="border px-2 py-1 text-right">Qty</th>
                    <th className="border px-2 py-1 text-right">Harga</th>
                    <th className="border px-2 py-1 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it: any, idx: number) => (
                    <tr key={idx}>
                      <td className="border px-2 py-1">{it.name || "-"}</td>
                      <td className="border px-2 py-1 text-right">{it.qty}</td>
                      <td className="border px-2 py-1 text-right">
                        Rp {Number(it.price || 0).toLocaleString("id-ID")}
                      </td>
                      <td className="border px-2 py-1 text-right">
                        Rp{" "}
                        {Number(it.qty * it.price || 0).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Separator />

          {/* Summary */}
          <div className="space-y-1 text-right text-sm">
            <div>Subtotal: Rp {subtotal.toLocaleString("id-ID")}</div>
            <div>
              Diskon ({discount_percent}%): Rp{" "}
              {discount_value.toLocaleString("id-ID")}
            </div>
            <div>
              Pajak ({tax_percent}%): Rp {tax_value.toLocaleString("id-ID")}
            </div>
            <div className="font-bold text-lg">
              Total: Rp {total.toLocaleString("id-ID")}
            </div>
          </div>

          <Separator />

          {/* Metode Pembayaran */}
          <div className="space-y-1">
            <div className="font-medium">Metode Pembayaran:</div>
            <div>{payment_method || "-"}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
