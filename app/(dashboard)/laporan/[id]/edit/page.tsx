import { ReportFormPage } from "@/components/pages/MenuCrudPages";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReportFormPage edit id={id} />;
}
