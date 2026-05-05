import { FinanceFormPage } from "@/components/pages/MenuCrudPages";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FinanceFormPage edit id={id} />;
}
