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
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button variant="destructive" onClick={onConfirm}>Hapus</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
