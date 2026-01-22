import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="font-heading text-2xl font-bold text-foreground">
            Creator OS
          </Link>
        </div>

        {/* Signup Form */}
        <div className="rounded-xl bg-frosted-snow p-8">
          <h1 className="font-heading text-xl font-semibold text-card-foreground">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Start selling in minutes
          </p>

          <form className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-card-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="border-border bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-card-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                className="border-border bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-evergreen text-primary-foreground hover:bg-evergreen/90"
            >
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-evergreen hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
