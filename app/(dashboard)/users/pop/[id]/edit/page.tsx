import { PopFormPage } from "@/components/pages/PopPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PopFormPage edit id={id} />;
}
