'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getRiskColor, getComplianceColor, enumToLabel, formatDate } from '@/lib/utils';
import { Search, Eye, Edit, Trash2 } from 'lucide-react';

interface AISystem {
  id: string;
  name: string;
  businessPurpose: string;
  deploymentStatus: string;
  createdAt: Date;
  riskClassification?: {
    primaryCategory: string;
  } | null;
  gapAssessment?: {
    overallStatus: string;
    overallScore: number;
  } | null;
  createdBy: {
    name: string | null;
  } | null;
}

interface AISystemsListProps {
  systems: AISystem[];
}

export function AISystemsList({ systems }: AISystemsListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSystems = systems.filter((system) =>
    system.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    system.businessPurpose.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          data-testid="systems-search-input"
          placeholder="Search AI systems..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Systems Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="systems-grid">
        {filteredSystems.map((system) => (
          <Card key={system.id} className="hover:shadow-md transition-shadow" data-testid={`system-card-${system.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-1" data-testid={`system-name-${system.id}`}>
                    {system.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {system.businessPurpose}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Risk and Compliance Badges */}
              <div className="flex flex-wrap gap-2">
                {system.riskClassification ? (
                  <Badge
                    variant="outline"
                    className={getRiskColor(system.riskClassification.primaryCategory)}
                  >
                    {enumToLabel(system.riskClassification.primaryCategory)}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-500">
                    Not Classified
                  </Badge>
                )}

                {system.gapAssessment ? (
                  <Badge
                    variant="outline"
                    className={getComplianceColor(system.gapAssessment.overallStatus)}
                  >
                    {enumToLabel(system.gapAssessment.overallStatus)}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-500">
                    Not Assessed
                  </Badge>
                )}
              </div>

              {/* Deployment Status */}
              <div className="text-sm">
                <span className="text-muted-foreground">Status: </span>
                <span className="font-medium">
                  {enumToLabel(system.deploymentStatus)}
                </span>
              </div>

              {/* Compliance Score */}
              {system.gapAssessment && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Compliance</span>
                    <span className="font-medium">
                      {system.gapAssessment.overallScore}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${system.gapAssessment.overallScore}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="text-xs text-muted-foreground pt-2 border-t">
                <div>Created {formatDate(system.createdAt)}</div>
                {system.createdBy?.name && (
                  <div>by {system.createdBy.name}</div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/dashboard/systems/${system.id}`}>
                    <Eye className="mr-2 h-3 w-3" />
                    View
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/dashboard/systems/${system.id}/edit`}>
                    <Edit className="mr-2 h-3 w-3" />
                    Edit
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredSystems.length === 0 && searchQuery && (
        <div className="text-center py-12 text-muted-foreground">
          No AI systems found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
}
