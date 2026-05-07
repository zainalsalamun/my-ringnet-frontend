import { UserFormPage } from "@/components/pages/UserManagementPage";

export default function Page() {
  return <UserFormPage defaultRole="admin" backHref="/users/admin" />;
}
