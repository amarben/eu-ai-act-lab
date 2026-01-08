'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Shield, Calendar } from 'lucide-react';

interface UserSettingsProps {
  user: any;
}

export function UserSettings({ user }: UserSettingsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Your account details and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Profile */}
          <div className="flex items-center gap-4 pb-6 border-b">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || 'User'}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <User className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{user.name || 'User'}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                  {user.role === 'ADMIN' ? (
                    <Shield className="h-3 w-3 mr-1" />
                  ) : (
                    <User className="h-3 w-3 mr-1" />
                  )}
                  {user.role === 'ADMIN' ? 'Administrator' : 'User'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Account Type</Label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {user.role === 'ADMIN' ? 'Administrator' : 'Standard User'}
                </span>
              </div>
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Member Since</Label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password & Security */}
      <Card>
        <CardHeader>
          <CardTitle>Password & Security</CardTitle>
          <CardDescription>
            Manage your password and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              placeholder="••••••••"
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="••••••••"
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              disabled
            />
          </div>
          <Button disabled>Change Password (Coming Soon)</Button>
          <p className="text-xs text-muted-foreground">
            Password management is currently under development. Contact your administrator for password resets.
          </p>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Customize your experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about system updates and compliance alerts
                </p>
              </div>
              <Button variant="outline" disabled>
                Configure (Coming Soon)
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label>Language & Region</Label>
                <p className="text-sm text-muted-foreground">
                  Set your preferred language and regional settings
                </p>
              </div>
              <Button variant="outline" disabled>
                Configure (Coming Soon)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
