"use client";

import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabaseBrowser.auth.signOut();
    router.replace("/login");
  };

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
    >
      Logout
    </Button>
  );
}