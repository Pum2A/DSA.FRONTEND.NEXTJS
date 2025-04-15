"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      await fetch("http://localhost:5178/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      router.push("/login");
    };

    logout();
  }, [router]);

  return <p>Wylogowywanie...</p>;
}
