"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Invoice = {
  id: string;
  invoice_number: string;
};

export default function DeleteInvoiceDialog({
  invoice,
  open,
  onClose,
  onConfirm,
}: {
  invoice: Invoice | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={() => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hapus Invoice</DialogTitle>
        </DialogHeader>
        <p className="mt-2">
          Apakah Anda yakin ingin menghapus invoice #{invoice?.invoice_number}?
        </p>
        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button className="bg-gray-200 hover:bg-gray-300 text-gray-800" onClick={onClose}>Batal</Button>
          <Button className="bg-red-600 text-white hover:bg-red-700" onClick={onConfirm}>Hapus</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
