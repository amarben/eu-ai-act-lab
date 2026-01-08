'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  History,
  Shield,
  Database,
  BarChart3,
  FlaskConical,
  Eye,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import { DocumentationEditor } from './documentation-editor';
import { VersionHistory } from './version-history';
import { AttachmentList } from './attachment-list';

interface DocumentationDetailProps {
  documentation: any;
  userId: string;
}

const SECTIONS = [
  {
    id: 'intendedUse',
    label: 'Intended Use',
    icon: FileText,
    description: 'Purpose and intended use of the AI system',
    regulatoryRef: 'EU AI Act Article 11(1)(a)',
  },
  {
    id: 'foreseeableMisuse',
    label: 'Foreseeable Misuse',
    icon: AlertTriangle,
    description: 'Foreseeable misuse scenarios and prevention',
    regulatoryRef: 'EU AI Act Article 11(1)(a)',
  },
  {
    id: 'systemArchitecture',
    label: 'Architecture',
    icon: Shield,
    description: 'System architecture and technical design',
    regulatoryRef: 'EU AI Act Article 11(1)(b)',
  },
  {
    id: 'trainingData',
    label: 'Training Data',
    icon: Database,
    description: 'Data governance and training datasets',
    regulatoryRef: 'EU AI Act Article 11(1)(c)',
  },
  {
    id: 'modelPerformance',
    label: 'Performance',
    icon: BarChart3,
    description: 'Performance metrics and limitations',
    regulatoryRef: 'EU AI Act Article 11(1)(d)',
  },
  {
    id: 'validationTesting',
    label: 'Validation',
    icon: FlaskConical,
    description: 'Validation and testing procedures',
    regulatoryRef: 'EU AI Act Article 11(1)(e)',
  },
  {
    id: 'humanOversightDoc',
    label: 'Human Oversight',
    icon: Eye,
    description: 'Human oversight mechanisms',
    regulatoryRef: 'EU AI Act Article 11(1)(f)',
  },
  {
    id: 'cybersecurity',
    label: 'Cybersecurity',
    icon: Lock,
    description: 'Cybersecurity measures and controls',
    regulatoryRef: 'EU AI Act Article 11(1)(g)',
  },
];

export function DocumentationDetail({ documentation, userId }: DocumentationDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const getApprovalStatus = () => {
    if (documentation.approvedBy) {
      return { label: 'Approved', variant: 'default' as const, icon: CheckCircle2 };
    }
    if (documentation.reviewedBy) {
      return { label: 'Under Review', variant: 'secondary' as const, icon: Clock };
    }
    return { label: 'Draft', variant: 'outline' as const, icon: Circle };
  };

  const approvalStatus = getApprovalStatus();
  const StatusIcon = approvalStatus.icon;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Documentation Overview</CardTitle>
              <CardDescription>
                EU AI Act Article 11 - Technical Documentation Requirements
              </CardDescription>
            </div>
            <Badge variant={approvalStatus.variant} className="flex items-center gap-1">
              <StatusIcon className="h-3 w-3" />
              {approvalStatus.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Completeness Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Completeness</span>
              <span className="text-muted-foreground">
                {Math.round(documentation.completenessPercentage)}%
              </span>
            </div>
            <Progress value={documentation.completenessPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {SECTIONS.filter((s) => documentation[s.id]?.trim()).length} of {SECTIONS.length}{' '}
              sections completed
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm font-medium">Version</p>
              <p className="text-sm text-muted-foreground">{documentation.version}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Last Updated</p>
              <p className="text-sm text-muted-foreground">
                {new Date(documentation.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Prepared By</p>
              <p className="text-sm text-muted-foreground">{documentation.preparedBy}</p>
            </div>
            {documentation.reviewedBy && (
              <div>
                <p className="text-sm font-medium">Reviewed By</p>
                <p className="text-sm text-muted-foreground">{documentation.reviewedBy}</p>
              </div>
            )}
            {documentation.approvedBy && (
              <>
                <div>
                  <p className="text-sm font-medium">Approved By</p>
                  <p className="text-sm text-muted-foreground">{documentation.approvedBy}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Approval Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(documentation.approvalDate).toLocaleDateString()}
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sections">Edit Sections</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
          <TabsTrigger value="history">Version History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {SECTIONS.map((section) => {
              const SectionIcon = section.icon;
              const isCompleted = documentation[section.id]?.trim();

              return (
                <Card key={section.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <SectionIcon className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-base">{section.label}</CardTitle>
                      </div>
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <CardDescription className="text-xs">{section.regulatoryRef}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                    {isCompleted && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {documentation[section.id].substring(0, 150)}...
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Edit Sections Tab */}
        <TabsContent value="sections">
          <DocumentationEditor documentation={documentation} userId={userId} sections={SECTIONS} />
        </TabsContent>

        {/* Attachments Tab */}
        <TabsContent value="attachments">
          <AttachmentList
            documentationId={documentation.id}
            attachments={documentation.attachments}
            sections={SECTIONS}
          />
        </TabsContent>

        {/* Version History Tab */}
        <TabsContent value="history">
          <VersionHistory versions={documentation.versions} currentVersion={documentation.version} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
