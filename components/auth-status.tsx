"use client"

import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import Link from "next/link"

export default function AuthStatus() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Spinner />
          <span>Loading authentication...</span>
        </div>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card className="p-4">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">You are not logged in</p>
          <div className="flex gap-2">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="space-y-2">
        <p className="text-sm font-medium">Logged in as:</p>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        {user.fullName && <p className="text-sm">{user.fullName}</p>}
      </div>
    </Card>
  )
}
