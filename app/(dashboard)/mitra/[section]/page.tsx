import MitraPortalSectionPage from "@/components/pages/MitraPortalPages";

export default async function Page({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  return <MitraPortalSectionPage section={section} />;
}
