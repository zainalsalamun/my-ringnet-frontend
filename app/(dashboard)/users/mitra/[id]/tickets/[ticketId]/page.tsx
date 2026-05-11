import PartnerDetailPage from "@/components/pages/PartnerDetailPage";

export default async function Page({ params }: { params: Promise<{ id: string; ticketId: string }> }) {
  const { id } = await params;
  return <PartnerDetailPage id={id} />;
}
