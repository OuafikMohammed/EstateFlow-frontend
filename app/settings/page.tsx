"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { User, Building2, Bell, CreditCard, Shield } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    whatsapp: true,
    digest: true,
  })

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "agency", label: "Agency Info", icon: Building2 },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "security", label: "Security", icon: Shield },
  ]

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Spinner />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-serif font-bold text-[var(--color-text-light)] mb-2">Settings</h1>
          <p className="text-[var(--color-muted-foreground)]">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass rounded-lg p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-accent)] text-[var(--color-bg-dark)]"
                        : "text-[var(--color-text-light)] hover:bg-[var(--color-bg-card)]"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="glass rounded-lg p-6">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-serif font-bold text-[var(--color-text-light)]">Profile Settings</h2>

                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-accent)] flex items-center justify-center text-2xl font-bold text-[var(--color-bg-dark)]">
                      {user?.fullName
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "U"}
                    </div>
                    <Button
                      variant="outline"
                      className="border-[var(--color-border)] text-[var(--color-text-light)] bg-transparent"
                    >
                      Change Avatar
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-[var(--color-text-light)]">
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        value={user?.fullName || ""}
                        className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[var(--color-text-light)]">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ""}
                        className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-[var(--color-text-light)]">
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        value={user?.phone || ""}
                        placeholder="Not set"
                        className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-[var(--color-text-light)]">
                        Role
                      </Label>
                      <Input
                        id="role"
                        value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ""}
                        className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-[var(--color-text-light)]">
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself..."
                      className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                      rows={4}
                    />
                  </div>

                  <Button className="bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-accent)] text-[var(--color-bg-dark)]">
                    Save Changes
                  </Button>
                </div>
              )}

              {/* Agency Tab */}
              {activeTab === "agency" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-serif font-bold text-[var(--color-text-light)]">Agency Information</h2>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="agencyName" className="text-[var(--color-text-light)]">
                        Agency Name
                      </Label>
                      <Input
                        id="agencyName"
                        value={user?.companyName || ""}
                        className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyId" className="text-[var(--color-text-light)]">
                        Company ID
                      </Label>
                      <Input
                        id="companyId"
                        value={user?.companyId || ""}
                        className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website" className="text-[var(--color-text-light)]">
                        Website
                      </Label>
                      <Input
                        id="website"
                        placeholder="https://yourcompany.com"
                        className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                      />
                    </div>
                  </div>

                  <Button className="bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-accent)] text-[var(--color-bg-dark)]">
                    Save Changes
                  </Button>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-serif font-bold text-[var(--color-text-light)]">
                    Notification Preferences
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[var(--color-bg-card)] rounded-lg">
                      <div>
                        <p className="font-semibold text-[var(--color-text-light)]">Email Notifications</p>
                        <p className="text-sm text-[var(--color-muted-foreground)]">
                          Receive email alerts for new leads
                        </p>
                      </div>
                      <Switch
                        checked={notifications.email}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[var(--color-bg-card)] rounded-lg">
                      <div>
                        <p className="font-semibold text-[var(--color-text-light)]">SMS Notifications</p>
                        <p className="text-sm text-[var(--color-muted-foreground)]">
                          Get SMS alerts for urgent matters
                        </p>
                      </div>
                      <Switch
                        checked={notifications.sms}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, sms: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[var(--color-bg-card)] rounded-lg">
                      <div>
                        <p className="font-semibold text-[var(--color-text-light)]">WhatsApp Notifications</p>
                        <p className="text-sm text-[var(--color-muted-foreground)]">Receive updates via WhatsApp</p>
                      </div>
                      <Switch
                        checked={notifications.whatsapp}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, whatsapp: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[var(--color-bg-card)] rounded-lg">
                      <div>
                        <p className="font-semibold text-[var(--color-text-light)]">Weekly Digest</p>
                        <p className="text-sm text-[var(--color-muted-foreground)]">Get a weekly performance summary</p>
                      </div>
                      <Switch
                        checked={notifications.digest}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, digest: checked })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === "billing" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-serif font-bold text-[var(--color-text-light)]">
                    Billing & Subscription
                  </h2>

                  <div className="p-6 bg-[var(--color-bg-card)] rounded-lg border border-[var(--color-border)]">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-[var(--color-text-light)]">Professional Plan</h3>
                        <p className="text-[var(--color-muted-foreground)]">Free Trial</p>
                      </div>
                      <Button className="bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-accent)] text-[var(--color-bg-dark)]">
                        Upgrade Plan
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-serif font-bold text-[var(--color-text-light)]">Security Settings</h2>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-[var(--color-text-light)]">
                        Current Password
                      </Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-[var(--color-text-light)]">
                        New Password
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-[var(--color-text-light)]">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        className="bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-light)]"
                      />
                    </div>
                  </div>

                  <Button className="bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-accent)] text-[var(--color-bg-dark)]">
                    Update Password
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
