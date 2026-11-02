import type { Metadata } from "next";
import { Inventory } from "@/components/inventory/Inventory";

export const metadata: Metadata = { title: "HL Fitness Studio | Inventory" };
export default function InventoryPage() {
  return <Inventory />;
}
