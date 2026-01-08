'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Save, Upload, X, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface OrganizationProfileProps {
  organization: any;
  isAdmin: boolean;
}

const INDUSTRIES = [
  { value: 'FINANCIAL_SERVICES', label: 'Financial Services' },
  { value: 'HEALTHCARE', label: 'Healthcare' },
  { value: 'MANUFACTURING', label: 'Manufacturing' },
  { value: 'RETAIL', label: 'Retail' },
  { value: 'TECHNOLOGY', label: 'Technology' },
  { value: 'PUBLIC_SECTOR', label: 'Public Sector' },
  { value: 'CONSULTING', label: 'Consulting' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'OTHER', label: 'Other' },
];

const SIZES = [
  { value: 'STARTUP', label: 'Startup (1-10 employees)' },
  { value: 'SMALL', label: 'Small (11-50 employees)' },
  { value: 'MEDIUM', label: 'Medium (51-250 employees)' },
  { value: 'LARGE', label: 'Large (251-1000 employees)' },
  { value: 'ENTERPRISE', label: 'Enterprise (1000+ employees)' },
];

export function OrganizationProfile({ organization, isAdmin }: OrganizationProfileProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [formData, setFormData] = useState({
    name: organization.name || '',
    legalName: organization.legalName || '',
    industry: organization.industry || '',
    region: organization.region || '',
    size: organization.size || '',
    euPresence: organization.euPresence || false,
    headquarters: organization.headquarters || '',
    registrationNumber: organization.registrationNumber || '',
    description: organization.description || '',
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/organization/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update organization');
      }

      toast.success('Organization profile updated');
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update organization');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch('/api/organization/logo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload logo');
      }

      toast.success('Logo uploaded successfully');
      router.refresh();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleDeleteLogo = async () => {
    if (!confirm('Are you sure you want to delete the organization logo?')) {
      return;
    }

    try {
      const response = await fetch('/api/organization/logo', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete logo');
      }

      toast.success('Logo deleted');
      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete logo');
    }
  };

  return (
    <div className="space-y-6">
      {/* Logo Section */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Logo</CardTitle>
          <CardDescription>
            Upload your organization's logo. Recommended size: 200x200px, max 5MB.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg bg-muted">
              {organization.logoUrl ? (
                <Image
                  src={organization.logoUrl}
                  alt="Organization logo"
                  width={128}
                  height={128}
                  className="object-contain"
                />
              ) : (
                <Building2 className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <div className="relative">
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                    disabled={isUploadingLogo}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    disabled={isUploadingLogo}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploadingLogo ? 'Uploading...' : 'Upload Logo'}
                  </Button>
                </div>
                {organization.logoUrl && (
                  <Button type="button" variant="outline" onClick={handleDeleteLogo}>
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Organization Information</CardTitle>
              <CardDescription>Basic details about your organization</CardDescription>
            </div>
            {isAdmin && !isEditing && (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Organization Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name *</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              ) : (
                <p className="text-sm text-muted-foreground">{organization.name || 'Not set'}</p>
              )}
            </div>

            {/* Legal Name */}
            <div className="space-y-2">
              <Label htmlFor="legalName">Legal Name</Label>
              {isEditing ? (
                <Input
                  id="legalName"
                  value={formData.legalName}
                  onChange={(e) => handleChange('legalName', e.target.value)}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {organization.legalName || 'Not set'}
                </p>
              )}
            </div>

            {/* Industry */}
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              {isEditing ? (
                <Select value={formData.industry} onValueChange={(value) => handleChange('industry', value)}>
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select industry..." />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry.value} value={industry.value}>
                        {industry.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {INDUSTRIES.find((i) => i.value === organization.industry)?.label || 'Not set'}
                </p>
              )}
            </div>

            {/* Organization Size */}
            <div className="space-y-2">
              <Label htmlFor="size">Organization Size</Label>
              {isEditing ? (
                <Select value={formData.size} onValueChange={(value) => handleChange('size', value)}>
                  <SelectTrigger id="size">
                    <SelectValue placeholder="Select size..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZES.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {SIZES.find((s) => s.value === organization.size)?.label || 'Not set'}
                </p>
              )}
            </div>

            {/* Headquarters */}
            <div className="space-y-2">
              <Label htmlFor="headquarters">Headquarters Location</Label>
              {isEditing ? (
                <Input
                  id="headquarters"
                  placeholder="e.g., Brussels, Belgium"
                  value={formData.headquarters}
                  onChange={(e) => handleChange('headquarters', e.target.value)}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {organization.headquarters || 'Not set'}
                </p>
              )}
            </div>

            {/* Region */}
            <div className="space-y-2">
              <Label htmlFor="region">Primary Region</Label>
              {isEditing ? (
                <Input
                  id="region"
                  placeholder="e.g., European Union"
                  value={formData.region}
                  onChange={(e) => handleChange('region', e.target.value)}
                />
              ) : (
                <p className="text-sm text-muted-foreground">{organization.region || 'Not set'}</p>
              )}
            </div>

            {/* Registration Number */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              {isEditing ? (
                <Input
                  id="registrationNumber"
                  placeholder="Company registration or VAT number"
                  value={formData.registrationNumber}
                  onChange={(e) => handleChange('registrationNumber', e.target.value)}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {organization.registrationNumber || 'Not set'}
                </p>
              )}
            </div>

            {/* EU Presence */}
            <div className="space-y-2 col-span-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="euPresence">EU Presence</Label>
                {organization.euPresence ? (
                  <Badge variant="default">Yes</Badge>
                ) : (
                  <Badge variant="secondary">No</Badge>
                )}
              </div>
              {isEditing && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="euPresence"
                    checked={formData.euPresence}
                    onChange={(e) => handleChange('euPresence', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="euPresence" className="cursor-pointer font-normal">
                    This organization has a presence in the European Union
                  </Label>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">Description</Label>
              {isEditing ? (
                <Textarea
                  id="description"
                  placeholder="Brief description of your organization..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={4}
                />
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {organization.description || 'Not set'}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="pt-6 border-t">
            <h4 className="font-semibold mb-4">Organization Statistics</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Team Members</p>
                <p className="text-2xl font-bold">{organization._count.users}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">AI Systems</p>
                <p className="text-2xl font-bold">{organization._count.aiSystems}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-sm font-medium">
                  {new Date(organization.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {isEditing && isAdmin && (
            <div className="flex gap-4 pt-4 border-t">
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => {
                setIsEditing(false);
                setFormData({
                  name: organization.name || '',
                  legalName: organization.legalName || '',
                  industry: organization.industry || '',
                  region: organization.region || '',
                  size: organization.size || '',
                  euPresence: organization.euPresence || false,
                  headquarters: organization.headquarters || '',
                  registrationNumber: organization.registrationNumber || '',
                  description: organization.description || '',
                });
              }}>
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
