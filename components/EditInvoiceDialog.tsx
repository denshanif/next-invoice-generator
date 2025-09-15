"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import InvoiceForm from "@/components/InvoiceForm";

type Invoice = {
  id: string;
  invoice_number: string;
  client: string;
  client_email: string;
  created_at: string;
};

export default function EditInvoiceDialog({
  invoice,
  open,
  onClose,
  onSuccess,
}: {
  invoice: Invoice | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Invoice #{invoice?.invoice_number}</DialogTitle>
        </DialogHeader>
        {invoice && <InvoiceForm defaultValues={invoice} onSuccess={onSuccess} />}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
