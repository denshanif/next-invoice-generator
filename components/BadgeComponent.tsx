import { Badge as BadgeUI } from "@/components/ui/badge";
import Link from "next/link";

export default function BadgeComponent() {
  return (
    <div className="fixed bottom-4 right-4">
      <Link href="https://github.com/denshanif/next-invoice-generator" target="_blank" rel="noopener noreferrer">
        <BadgeUI variant="outline" className="cursor-pointer bg-white hover:bg-gray-100 shadow-md">
          ⭐ Star us on GitHub
        </BadgeUI>
      </Link>
    </div>
  );
}
