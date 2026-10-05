"use client";
import { useAuth } from "./auth-provider";
import { Button } from "@/components/ui/button";

export function LogoutButton({ className }) {
  const { logout } = useAuth();
  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={async () => {
        await logout();
        window.location.href = "/";
      }}
    >
      Sign out
    </Button>
  );
}
