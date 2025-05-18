"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useLoadingStore } from "@/app/store/loadingStore";

export default function LoaderNavigationTrigger() {
  const setLoading = useLoadingStore((s) => s.setLoading);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000); // szybkie nawigacje (mrugnięcie)
    return () => clearTimeout(timer);
  }, [pathname, setLoading]);

  return null;
}
