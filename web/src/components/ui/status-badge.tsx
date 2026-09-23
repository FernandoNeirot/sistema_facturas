import type { InvoiceStatus } from "@/schemas/invoice.schema";

const statusStyles: Record<InvoiceStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  SENT: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  PAID: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  OVERDUE: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  return <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[status]}`}>{status}</span>;
}
