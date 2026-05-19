import { FinanceFormPage } from "@/components/pages/MenuCrudPages";

export default async function Page({ searchParams }: { searchParams: Promise<{ invoice?: string }> }) {
  const params = await searchParams;
  return <FinanceFormPage invoiceQuery={params.invoice || ""} />;
}
