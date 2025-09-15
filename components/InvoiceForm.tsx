"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { NumericFormat } from "react-number-format";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface Item {
  name: string;
  qty: number;
  unit: string;
  price: number;
}

interface InvoiceFormProps {
  onSuccess?: () => void; // callback selesai simpan
  defaultValues?: any; // data invoice untuk edit
}

function generateInvoiceNumber() {
  const d = new Date();
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `INV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}${String(d.getDate()).padStart(2, "0")}-${rand}`;
}

export default function InvoiceForm({
  onSuccess,
  defaultValues,
}: InvoiceFormProps) {
  const [invoiceNumber, setInvoiceNumber] = useState(
    defaultValues?.invoice_number || ""
  );
  const [client, setClient] = useState(defaultValues?.client || "");
  const [clientEmail, setClientEmail] = useState(
    defaultValues?.client_email || ""
  );
  const [clientPhone, setClientPhone] = useState(
    defaultValues?.client_phone || ""
  );
  const [business, setBusiness] = useState(defaultValues?.business || "");
  const [businessContact, setBusinessContact] = useState(
    defaultValues?.business_contact || ""
  );
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(
    defaultValues?.logo_data_url || null
  );
  const [items, setItems] = useState<Item[]>(
    defaultValues?.items || [{ name: "", qty: 1, unit: "", price: 0 }]
  );
  const [dueDate, setDueDate] = useState(defaultValues?.due_date || "");
  const [paymentMethod, setPaymentMethod] = useState(
    defaultValues?.payment_method || "Transfer Bank"
  );
  const [status, setStatus] = useState<"Draft" | "Sent" | "Paid" | "Overdue">(
    defaultValues?.status || "Draft"
  );
  const [discountPercent, setDiscountPercent] = useState(
    defaultValues?.discount_percent || 0
  );
  const [taxPercent, setTaxPercent] = useState(
    defaultValues?.tax_percent || 11
  );

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const nameRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!invoiceNumber) setInvoiceNumber(generateInvoiceNumber());
  }, [invoiceNumber]);

  const handleItemChange = (
    index: number,
    field: keyof Item,
    value: string | number
  ) => {
    const updated = [...items];
    if (field === "qty")
      updated[index].qty = Math.max(0, Math.floor(Number(value) || 0));
    else if (field === "price") updated[index].price = Number(value) || 0;
    else updated[index][field] = String(value);
    setItems(updated);
  };

  const addItem = () => {
    const idx = items.length;
    setItems([...items, { name: "", qty: 1, unit: "", price: 0 }]);
    setTimeout(() => nameRefs.current[idx]?.focus(), 50);
  };

  const removeItem = (index: number) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const handleLogoUpload: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(String(reader.result));
    reader.readAsDataURL(file);
  };

  const subtotal = items.reduce((s, it) => s + it.qty * it.price, 0);
  const discountValue = (subtotal * discountPercent) / 100;
  const taxable = subtotal - discountValue;
  const taxValue = (taxable * taxPercent) / 100;
  const total = taxable + taxValue;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!client.trim()) e.client = "Nama klien wajib diisi";
    if (!business.trim()) e.business = "Nama bisnis wajib diisi";
    if (!dueDate) e.dueDate = "Pilih tanggal jatuh tempo";
    if (items.length === 0) e.items = "Tambahkan minimal 1 item";
    items.forEach((it, idx) => {
      if (!it.name?.trim()) e[`item-${idx}`] = "Nama item wajib";
      if (it.qty <= 0) e[`item-qty-${idx}`] = "Kuantitas minimal 1";
      if (it.price < 0) e[`item-price-${idx}`] = "Harga tidak boleh negatif";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setAlert(null);

    const payload = {
      invoice_number: invoiceNumber,
      client,
      client_email: clientEmail,
      client_phone: clientPhone,
      business,
      business_contact: businessContact,
      logo_data_url: logoDataUrl,
      items,
      due_date: dueDate,
      payment_method: paymentMethod,
      status,
      discount_percent: discountPercent,
      tax_percent: taxPercent,
      subtotal,
      discount_value: discountValue,
      tax_value: taxValue,
      total,
    };

    let error;
    if (defaultValues?.id) {
      // update
      ({ error } = await supabase
        .from("invoices")
        .update(payload)
        .eq("id", defaultValues.id));
    } else {
      // insert
      ({ error } = await supabase.from("invoices").insert([payload]));
    }

    setLoading(false);

    if (error) {
      setAlert({
        type: "error",
        message: "Gagal menyimpan invoice. " + error.message,
      });
    } else {
      setAlert({
        type: "success",
        message: defaultValues?.id
          ? "Invoice berhasil diupdate!"
          : "Invoice berhasil dibuat!",
      });
      if (onSuccess) onSuccess();
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (!defaultValues?.id) {
        // reset hanya untuk tambah baru
        setInvoiceNumber(generateInvoiceNumber());
        setClient("");
        setClientEmail("");
        setClientPhone("");
        setBusiness("");
        setBusinessContact("");
        setLogoDataUrl(null);
        setItems([{ name: "", qty: 1, unit: "", price: 0 }]);
        setDueDate("");
        setPaymentMethod("Transfer Bank");
        setStatus("Draft");
        setDiscountPercent(0);
        setTaxPercent(11);
        setErrors({});
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="shadow-xl border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-indigo-600">
            {defaultValues?.id
              ? "✏️ Edit Invoice"
              : "🚀 Buat Invoice Gratis & Cepat"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alert && (
            <div
              className={`p-3 rounded text-sm mb-4 ${
                alert.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {alert.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Invoice info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>Nomor Invoice</Label>
                <Input
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as typeof status)}
                  className="w-full rounded-md border px-3 py-2"
                >
                  <option>Draft</option>
                  <option>Sent</option>
                  <option>Paid</option>
                  <option>Overdue</option>
                </select>
              </div>
            </div>

            {/* Client & Business */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Nama Klien</Label>
                <Input
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  placeholder="Nama klien"
                />
                {errors.client && (
                  <p className="text-sm text-red-500">{errors.client}</p>
                )}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Input
                    placeholder="Email klien"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                  />
                  <Input
                    placeholder="Telepon klien"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nama Bisnis</Label>
                <Input
                  value={business}
                  onChange={(e) => setBusiness(e.target.value)}
                  placeholder="Nama bisnis"
                />
                {errors.business && (
                  <p className="text-sm text-red-500">{errors.business}</p>
                )}
                <Input
                  className="mt-2"
                  placeholder="Kontak / alamat singkat"
                  value={businessContact}
                  onChange={(e) => setBusinessContact(e.target.value)}
                />
                <div className="flex items-center gap-3 mt-2">
                  <label className="text-sm font-medium">Logo (opsional)</label>
                  <label className="cursor-pointer inline-flex items-center px-3 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition">
                    Pilih File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  {logoDataUrl && (
                    <Image
                      src={logoDataUrl}
                      alt="logo"
                      width={40}
                      height={40}
                      className="object-cover rounded"
                    />
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Due date & payment */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <Label>Jatuh Tempo</Label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-md border px-3 py-2"
                />
                {errors.dueDate && (
                  <p className="text-sm text-red-500">{errors.dueDate}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label>Metode Pembayaran</Label>
                <select
                  className="w-full rounded-md border px-3 py-2"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option>Transfer Bank</option>
                  <option>QRIS</option>
                  <option>Cash</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Diskon (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={discountPercent}
                  onChange={(e) =>
                    setDiscountPercent(Number(e.target.value || 0))
                  }
                />
              </div>
            </div>

            <Separator />

            {/* Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">📦 Daftar Item</h3>
                <Button type="button" variant="outline" onClick={addItem}>
                  + Tambah Item
                </Button>
              </div>
              {errors.items && (
                <p className="text-sm text-red-500">{errors.items}</p>
              )}

              <div className="space-y-3">
                {items.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: idx * 0.03 }}
                    className="grid grid-cols-12 gap-3 p-3 border rounded-lg"
                  >
                    <div className="col-span-5 space-y-1">
                      <Label>Nama Item</Label>
                      <Input
                        ref={(el) => (nameRefs.current[idx] = el)}
                        value={item.name}
                        onChange={(e) =>
                          handleItemChange(idx, "name", e.target.value)
                        }
                      />
                      {errors[`item-${idx}`] && (
                        <p className="text-sm text-red-500">
                          {errors[`item-${idx}`]}
                        </p>
                      )}
                    </div>

                    <div className="col-span-2 space-y-1">
                      <Label>Qty</Label>
                      <Input
                        type="number"
                        min={1}
                        value={String(item.qty)}
                        onChange={(e) =>
                          handleItemChange(idx, "qty", e.target.value)
                        }
                      />
                      {errors[`item-qty-${idx}`] && (
                        <p className="text-sm text-red-500">
                          {errors[`item-qty-${idx}`]}
                        </p>
                      )}
                    </div>

                    <div className="col-span-2 space-y-1">
                      <Label>Satuan</Label>
                      <Input
                        value={item.unit}
                        onChange={(e) =>
                          handleItemChange(idx, "unit", e.target.value)
                        }
                      />
                    </div>

                    <div className="col-span-3 space-y-1">
                      <Label>Harga</Label>
                      <NumericFormat
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix="Rp "
                        value={item.price}
                        customInput={Input}
                        onValueChange={(values) =>
                          handleItemChange(idx, "price", values.floatValue ?? 0)
                        }
                      />
                      {errors[`item-price-${idx}`] && (
                        <p className="text-sm text-red-500">
                          {errors[`item-price-${idx}`]}
                        </p>
                      )}
                    </div>

                    <div className="col-span-12 flex justify-between items-center mt-2">
                      <div className="text-sm text-gray-600">
                        Sub: Rp{" "}
                        {(item.qty * item.price).toLocaleString("id-ID")}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeItem(idx)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Tax & totals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="space-y-2">
                <Label>PPN (%)</Label>
                <Input
                  type="number"
                  min={0}
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(Number(e.target.value || 0))}
                />
              </div>
              <div className="text-right text-sm space-y-1">
                <div>Subtotal: Rp {subtotal.toLocaleString("id-ID")}</div>
                <div>
                  Diskon: Rp {discountValue.toLocaleString("id-ID")} (
                  {discountPercent}%)
                </div>
                <div>
                  PPN: Rp {taxValue.toLocaleString("id-ID")} ({taxPercent}%)
                </div>
                <div className="pt-2 text-xl font-bold text-indigo-700">
                  Total: Rp {total.toLocaleString("id-ID")}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-center">
              <Button
                type="submit"
                className="w-full md:w-1/3 bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={loading}
              >
                {loading
                  ? "Menyimpan..."
                  : defaultValues?.id
                  ? "Update Invoice"
                  : "Generate Invoice"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="border mt-8">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Preview Singkat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm text-gray-500">#{invoiceNumber}</div>
              <div className="text-xl font-semibold">
                {business || "Nama Bisnis"}
              </div>
              <div className="text-base">
                Kontak: {businessContact || "Email / Telepon"}
              </div>
              <div className="text-sm text-gray-500">
                Dibuat: {new Date().toLocaleDateString("id-ID")}
              </div>
            </div>
            {logoDataUrl && (
              <Image
                src={logoDataUrl}
                alt="logo"
                width={80}
                height={80}
                className="h-20 w-20 object-cover rounded"
              />
            )}
          </div>

          <div>
            <div className="font-medium">Untuk:</div>
            <div>{client || "Nama Klien"}</div>
            {clientEmail && (
              <div className="text-sm text-gray-600">{clientEmail}</div>
            )}
            {clientPhone && (
              <div className="text-sm text-gray-600">{clientPhone}</div>
            )}
          </div>

          <div>
            <div className="font-medium">Tanggal Jatuh Tempo:</div>
            <div>
              {dueDate ? new Date(dueDate).toLocaleDateString("id-ID") : "-"}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Item</h4>
            <table className="w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1 text-left">Nama</th>
                  <th className="border px-2 py-1 text-right">Qty</th>
                  <th className="border px-2 py-1 text-right">Harga</th>
                  <th className="border px-2 py-1 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="border px-2 py-1">{it.name || "-"}</td>
                    <td className="border px-2 py-1 text-right">{it.qty}</td>
                    <td className="border px-2 py-1 text-right">
                      Rp {it.price.toLocaleString("id-ID")}
                    </td>
                    <td className="border px-2 py-1 text-right">
                      Rp {(it.qty * it.price).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-1 text-right text-sm">
            <div>Subtotal: Rp {subtotal.toLocaleString("id-ID")}</div>
            <div>
              Diskon: Rp {discountValue.toLocaleString("id-ID")} (
              {discountPercent}%)
            </div>
            <div>
              PPN: Rp {taxValue.toLocaleString("id-ID")} ({taxPercent}%)
            </div>
            <div className="font-bold text-lg">
              Total: Rp {total.toLocaleString("id-ID")}
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Metode Pembayaran: {paymentMethod}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
