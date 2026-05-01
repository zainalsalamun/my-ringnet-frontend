import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function useAuth() {
  const router = useRouter();
  
  useEffect(() => {
    // In a real app, you might check a cookie or make a /me request
    // For now, based on the requirements, checking localStorage
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    }
  }, [router]);
}
