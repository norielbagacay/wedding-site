import { Heart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabaseEnv } from "../../lib/supabase-env";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-muted p-4">
      <div className="flex items-center gap-2 font-medium">
        <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Heart className="size-4" />
        </span>
        Wedding site
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Sign in</CardTitle>
          <CardDescription>Enter your email and password to manage the site.</CardDescription>
        </CardHeader>
        <CardContent>
          {supabaseEnv() ? (
            <LoginForm />
          ) : (
            <p role="alert" className="text-sm text-destructive">
              Supabase isn’t connected yet. Add the keys from .env.example to .env and restart the
              server.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
