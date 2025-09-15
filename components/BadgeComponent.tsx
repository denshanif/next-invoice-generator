import { Badge as BadgeUI } from "@/components/ui/badge";
import Link from "next/link";

export default function BadgeComponent() {
  return (
    <div className="fixed bottom-4 right-4">
      <Link href="https://denshanif.my.id" target="_blank" rel="noopener noreferrer">
        <BadgeUI variant="outline" className="cursor-pointer hover:bg-gray-200">
          Developed by Denshanif
        </BadgeUI>
      </Link>
    </div>
  );
}
