import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogOut } from "lucide-react"

// Placeholder data
const user = {
  name: "John Doe",
  email: "john@example.com",
}

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground lg:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account
        </p>
      </div>

      {/* Profile Settings */}
      <div className="max-w-xl">
        <div className="rounded-xl bg-frosted-snow p-6 lg:p-8">
          <h2 className="font-heading text-lg font-semibold text-card-foreground">
            Profile
          </h2>

          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-card-foreground">
                Creator name
              </Label>
              <Input
                id="name"
                type="text"
                defaultValue={user.name}
                className="border-border bg-background text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-card-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                defaultValue={user.email}
                disabled
                className="border-border bg-muted text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <Button className="bg-evergreen text-primary-foreground hover:bg-evergreen/90">
              Save changes
            </Button>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="max-w-xl">
        <div className="rounded-xl border border-destructive/20 bg-surface-dark p-6 lg:p-8">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Account
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign out of your account
          </p>

          <Button
            variant="outline"
            className="mt-6 border-destructive/30 text-destructive-foreground hover:bg-destructive/10 bg-transparent"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
