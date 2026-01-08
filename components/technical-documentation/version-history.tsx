'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, Eye } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Version {
  id: string;
  version: string;
  versionDate: Date;
  versionNotes: string;
  savedBy: string;
  snapshotData: string;
}

interface VersionHistoryProps {
  versions: Version[];
  currentVersion: string;
}

export function VersionHistory({ versions, currentVersion }: VersionHistoryProps) {
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);

  const viewVersionDetails = (version: Version) => {
    setSelectedVersion(version);
  };

  if (!versions || versions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </CardTitle>
          <CardDescription>No version history available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Version history will appear here when you save new versions of this documentation.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </CardTitle>
          <CardDescription>
            {versions.length} version{versions.length !== 1 ? 's' : ''} saved
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {versions.map((version) => {
              const isCurrent = version.version === currentVersion;

              return (
                <div
                  key={version.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">Version {version.version}</p>
                      {isCurrent && (
                        <Badge variant="default" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{version.versionNotes}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                      <span>Saved by {version.savedBy}</span>
                      <span>•</span>
                      <span>
                        {new Date(version.versionDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewVersionDetails(version)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Version Details Dialog */}
      <Dialog open={!!selectedVersion} onOpenChange={() => setSelectedVersion(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Version {selectedVersion?.version} Details</DialogTitle>
            <DialogDescription>
              Saved on{' '}
              {selectedVersion &&
                new Date(selectedVersion.versionDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
            </DialogDescription>
          </DialogHeader>

          {selectedVersion && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">Version Notes</h4>
                <p className="text-sm text-muted-foreground">{selectedVersion.versionNotes}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Snapshot Data</h4>
                <div className="space-y-3">
                  {(() => {
                    try {
                      const snapshot = JSON.parse(selectedVersion.snapshotData);
                      return Object.entries(snapshot).map(([key, value]) => {
                        if (!value) return null;
                        return (
                          <div key={key} className="border-l-2 pl-3">
                            <p className="text-sm font-medium capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                              {String(value).substring(0, 200)}
                              {String(value).length > 200 ? '...' : ''}
                            </p>
                          </div>
                        );
                      });
                    } catch {
                      return (
                        <p className="text-sm text-muted-foreground">
                          Unable to parse snapshot data
                        </p>
                      );
                    }
                  })()}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
