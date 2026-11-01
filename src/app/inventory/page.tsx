import type { Metadata } from "next";
import { InventoryDemo } from "@/features/demo/InventoryDemo";

export const metadata: Metadata = { title: "HL Fitness Studio | Inventory" };
export default function InventoryPage() {
  return <InventoryDemo />;
}
