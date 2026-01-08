import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Server, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalSystems: number;
    highRiskSystems: number;
    complianceScore: number;
    activeIncidents: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-testid="dashboard-stats-grid">
      <Card data-testid="dashboard-total-systems-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total AI Systems</CardTitle>
          <Server className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="dashboard-total-systems-value">{stats.totalSystems}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Registered in your organization
          </p>
        </CardContent>
      </Card>

      <Card data-testid="dashboard-high-risk-systems-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">High-Risk Systems</CardTitle>
          <ShieldAlert className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="dashboard-high-risk-systems-value">{stats.highRiskSystems}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Requiring strict compliance
          </p>
        </CardContent>
      </Card>

      <Card data-testid="dashboard-compliance-score-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="dashboard-compliance-score-value">{stats.complianceScore}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            Overall compliance rate
          </p>
        </CardContent>
      </Card>

      <Card data-testid="dashboard-active-incidents-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="dashboard-active-incidents-value">{stats.activeIncidents}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Requiring investigation
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
