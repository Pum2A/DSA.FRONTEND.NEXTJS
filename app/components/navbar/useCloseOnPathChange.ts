import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function useCloseOnPathChange(setIsOpen: (v: boolean) => void) {
  const pathname = usePathname();
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);
}
