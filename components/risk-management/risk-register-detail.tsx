'use client';

/**
 * Risk Register Detail Component
 *
 * TestIDs for Playwright demos:
 * - risk-register-summary-card: Summary statistics card
 * - risk-register-add-risk-button: Add new risk button
 * - risk-card-{index}: Individual risk card
 * - risk-{index}-edit-button: Edit risk button
 * - risk-{index}-delete-button: Delete risk button
 * - risk-{index}-add-mitigation-button: Add mitigation action button
 * - risk-{index}-treatment-select: Treatment decision select
 * - mitigation-{index}-{actionIndex}-status-select: Mitigation action status select
 * - mitigation-{index}-{actionIndex}-delete-button: Delete mitigation action button
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Shield,
  CheckCircle2,
  Clock,
  XCircle,
  PlayCircle,
} from 'lucide-react';
import { toast } from 'sonner';
// TEMPORARY: Commented out to work around webpack compilation issue
// import { AddRiskDialog } from './add-risk-dialog';
// import { EditRiskDialog } from './edit-risk-dialog';
// import { AddMitigationDialog } from './add-mitigation-dialog';
// import { TreatmentDecisionDialog } from './treatment-decision-dialog';

interface Risk {
  id: string;
  title: string;
  type: string;
  description: string;
  affectedStakeholders: string[];
  potentialImpact: string;
  likelihood: number;
  impact: number;
  inherentRiskScore: number;
  riskLevel: string;
  treatmentDecision: string | null;
  treatmentJustification: string | null;
  residualLikelihood: number | null;
  residualImpact: number | null;
  residualRiskScore: number | null;
  mitigationActions: Array<{
    id: string;
    description: string;
    responsibleParty: string;
    dueDate: Date | null;
    status: string;
    effectivenessRating: number | null;
    completionDate: Date | null;
    notes: string | null;
  }>;
  humanOversight: {
    id: string;
    oversightMeasure: string;
    frequencyOfReview: string;
    responsiblePerson: string;
  } | null;
}

interface RiskRegisterDetailProps {
  riskRegister: {
    id: string;
    lastAssessedDate: Date;
    aiSystem: {
      id: string;
      name: string;
      businessPurpose: string;
      deploymentStatus: string;
      riskClassification: {
        category: string;
      } | null;
    };
    risks: Risk[];
  };
}

const RISK_TYPE_LABELS: Record<string, string> = {
  BIAS: 'Bias & Discrimination',
  SAFETY: 'Safety & Security',
  MISUSE: 'Misuse & Abuse',
  TRANSPARENCY: 'Transparency & Explainability',
  PRIVACY: 'Privacy & Data Protection',
  CYBERSECURITY: 'Cybersecurity',
  OTHER: 'Other',
};

const TREATMENT_LABELS: Record<string, string> = {
  ACCEPT: 'Accept',
  MITIGATE: 'Mitigate',
  TRANSFER: 'Transfer',
  AVOID: 'Avoid',
};

const STATUS_LABELS: Record<string, string> = {
  PLANNED: 'Planned',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

function getRiskLevelBadge(level: string) {
  const variants = {
    HIGH: 'destructive',
    MEDIUM: 'default',
    LOW: 'secondary',
  } as const;

  return (
    <Badge variant={variants[level as keyof typeof variants] || 'secondary'}>
      {level}
    </Badge>
  );
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case 'IN_PROGRESS':
      return <PlayCircle className="h-4 w-4 text-blue-600" />;
    case 'PLANNED':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'CANCELLED':
      return <XCircle className="h-4 w-4 text-gray-400" />;
    default:
      return <Clock className="h-4 w-4 text-gray-400" />;
  }
}

export function RiskRegisterDetail({ riskRegister }: RiskRegisterDetailProps) {
  const router = useRouter();
  const [isAddRiskOpen, setIsAddRiskOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  const [addingMitigationFor, setAddingMitigationFor] = useState<string | null>(null);
  const [treatmentDecisionFor, setTreatmentDecisionFor] = useState<Risk | null>(null);
  const [deletingRiskId, setDeletingRiskId] = useState<string | null>(null);
  const [deletingActionId, setDeletingActionId] = useState<string | null>(null);

  const calculateStats = () => {
    const total = riskRegister.risks.length;
    const high = riskRegister.risks.filter((r) => r.riskLevel === 'HIGH').length;
    const medium = riskRegister.risks.filter((r) => r.riskLevel === 'MEDIUM').length;
    const low = riskRegister.risks.filter((r) => r.riskLevel === 'LOW').length;
    const mitigated = riskRegister.risks.filter((r) => r.treatmentDecision === 'MITIGATE').length;
    const accepted = riskRegister.risks.filter((r) => r.treatmentDecision === 'ACCEPT').length;
    const totalActions = riskRegister.risks.reduce((sum, r) => sum + r.mitigationActions.length, 0);
    const completedActions = riskRegister.risks.reduce(
      (sum, r) => sum + r.mitigationActions.filter((a) => a.status === 'COMPLETED').length,
      0
    );

    return { total, high, medium, low, mitigated, accepted, totalActions, completedActions };
  };

  const stats = calculateStats();

  const handleDeleteRisk = async (riskId: string) => {
    if (!confirm('Are you sure you want to delete this risk? This action cannot be undone.')) {
      return;
    }

    setDeletingRiskId(riskId);
    try {
      const response = await fetch(`/api/risks?id=${riskId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to delete risk');
      }

      toast.success('Risk deleted successfully');
      router.refresh();
    } catch (error) {
      console.error('Error deleting risk:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete risk');
    } finally {
      setDeletingRiskId(null);
    }
  };

  const handleDeleteMitigation = async (actionId: string) => {
    if (!confirm('Are you sure you want to delete this mitigation action?')) {
      return;
    }

    setDeletingActionId(actionId);
    try {
      const response = await fetch(`/api/mitigation-actions?id=${actionId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to delete mitigation action');
      }

      toast.success('Mitigation action deleted successfully');
      router.refresh();
    } catch (error) {
      console.error('Error deleting mitigation action:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete mitigation action');
    } finally {
      setDeletingActionId(null);
    }
  };

  const handleUpdateMitigationStatus = async (actionId: string, status: string) => {
    try {
      const response = await fetch('/api/mitigation-actions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId, status }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to update status');
      }

      toast.success('Status updated successfully');
      router.refresh();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <Card data-testid="risk-register-summary-card">
        <CardHeader>
          <CardTitle>Risk Summary</CardTitle>
          <CardDescription>Overview of identified risks and mitigation progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total Risks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.high}</div>
              <div className="text-xs text-muted-foreground">High Priority</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{stats.medium}</div>
              <div className="text-xs text-muted-foreground">Medium Priority</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.low}</div>
              <div className="text-xs text-muted-foreground">Low Priority</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Mitigation Actions Progress</span>
                <span>
                  {stats.completedActions}/{stats.totalActions} Completed
                </span>
              </div>
              <Progress
                value={stats.totalActions > 0 ? (stats.completedActions / stats.totalActions) * 100 : 0}
                className="h-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Mitigated</span>
                <Badge variant="outline">{stats.mitigated}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <span className="text-sm font-medium">Accepted</span>
                <Badge variant="outline">{stats.accepted}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Risk Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Identified Risks</h2>
        <Button onClick={() => setIsAddRiskOpen(true)} data-testid="risk-register-add-risk-button">
          <Plus className="mr-2 h-4 w-4" />
          Add Risk
        </Button>
      </div>

      {/* Risks List */}
      {riskRegister.risks.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-muted rounded-full p-4">
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No Risks Identified Yet</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Start identifying and documenting risks for this AI system
              </p>
            </div>
            <Button onClick={() => setIsAddRiskOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Risk
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {riskRegister.risks.map((risk, index) => (
            <Card key={risk.id} data-testid={`risk-card-${index}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{risk.title}</h3>
                      {getRiskLevelBadge(risk.riskLevel)}
                      <Badge variant="outline">{RISK_TYPE_LABELS[risk.type] || risk.type}</Badge>
                      {risk.treatmentDecision && (
                        <Badge variant="secondary">{TREATMENT_LABELS[risk.treatmentDecision]}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Likelihood: {risk.likelihood}/5</span>
                      <span>Impact: {risk.impact}/5</span>
                      <span>Score: {risk.inherentRiskScore}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingRisk(risk)}
                      data-testid={`risk-${index}-edit-button`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteRisk(risk.id)}
                      disabled={deletingRiskId === risk.id}
                      data-testid={`risk-${index}-delete-button`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Risk Description */}
                <div>
                  <p className="text-sm font-medium mb-1">Description</p>
                  <p className="text-sm text-muted-foreground">{risk.description}</p>
                </div>

                {/* Affected Stakeholders */}
                <div>
                  <p className="text-sm font-medium mb-2">Affected Stakeholders</p>
                  <div className="flex flex-wrap gap-2">
                    {risk.affectedStakeholders.map((stakeholder, idx) => (
                      <Badge key={idx} variant="outline">
                        {stakeholder}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Potential Impact */}
                <div>
                  <p className="text-sm font-medium mb-1">Potential Impact</p>
                  <p className="text-sm text-muted-foreground">{risk.potentialImpact}</p>
                </div>

                {/* Treatment Decision */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium">Treatment Decision</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTreatmentDecisionFor(risk)}
                      data-testid={`risk-${index}-treatment-select`}
                    >
                      {risk.treatmentDecision ? 'Update Treatment' : 'Set Treatment'}
                    </Button>
                  </div>
                  {risk.treatmentJustification && (
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm">{risk.treatmentJustification}</p>
                    </div>
                  )}
                  {risk.residualRiskScore !== null && (
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <span className="font-medium">Residual Risk:</span>
                      <span>Likelihood: {risk.residualLikelihood}/5</span>
                      <span>Impact: {risk.residualImpact}/5</span>
                      <span>Score: {risk.residualRiskScore}</span>
                    </div>
                  )}
                </div>

                {/* Mitigation Actions */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium">
                      Mitigation Actions ({risk.mitigationActions.length})
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAddingMitigationFor(risk.id)}
                      data-testid={`risk-${index}-add-mitigation-button`}
                    >
                      <Plus className="mr-2 h-3 w-3" />
                      Add Action
                    </Button>
                  </div>

                  {risk.mitigationActions.length === 0 ? (
                    <div className="bg-amber-50 p-4 rounded-lg flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-900">No mitigation actions yet</p>
                        <p className="text-sm text-amber-700">
                          Add mitigation actions to reduce the likelihood or impact of this risk
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {risk.mitigationActions.map((action, actionIndex) => (
                        <div
                          key={action.id}
                          className="border rounded-lg p-3 space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{action.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>Responsible: {action.responsibleParty}</span>
                                {action.dueDate && (
                                  <span>
                                    Due: {new Date(action.dueDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                value={action.status}
                                onChange={(e) =>
                                  handleUpdateMitigationStatus(action.id, e.target.value)
                                }
                                className="text-xs border rounded px-2 py-1"
                                data-testid={`mitigation-${index}-${actionIndex}-status-select`}
                              >
                                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                ))}
                              </select>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteMitigation(action.id)}
                                disabled={deletingActionId === action.id}
                                data-testid={`mitigation-${index}-${actionIndex}-delete-button`}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(action.status)}
                            <span className="text-xs">{STATUS_LABELS[action.status]}</span>
                            {action.completionDate && (
                              <span className="text-xs text-muted-foreground">
                                • Completed {new Date(action.completionDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {action.notes && (
                            <div className="bg-muted p-2 rounded text-xs">
                              <p className="font-medium mb-1">Notes:</p>
                              <p>{action.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Human Oversight */}
                {risk.humanOversight && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-2">Human Oversight</p>
                    <div className="bg-blue-50 p-3 rounded-lg space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Measure:</span> {risk.humanOversight.oversightMeasure}
                      </div>
                      <div>
                        <span className="font-medium">Review Frequency:</span>{' '}
                        {risk.humanOversight.frequencyOfReview}
                      </div>
                      <div>
                        <span className="font-medium">Responsible Person:</span>{' '}
                        {risk.humanOversight.responsiblePerson}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      {/* TEMPORARY: Commented out to work around webpack compilation issue */}
      {/* <AddRiskDialog
        isOpen={isAddRiskOpen}
        onClose={() => setIsAddRiskOpen(false)}
        riskRegisterId={riskRegister.id}
      /> */}

      {/* {editingRisk && (
        <EditRiskDialog
          isOpen={true}
          onClose={() => setEditingRisk(null)}
          risk={editingRisk}
        />
      )}

      {addingMitigationFor && (
        <AddMitigationDialog
          isOpen={true}
          onClose={() => setAddingMitigationFor(null)}
          riskId={addingMitigationFor}
        />
      )}

      {treatmentDecisionFor && (
        <TreatmentDecisionDialog
          isOpen={true}
          onClose={() => setTreatmentDecisionFor(null)}
          risk={treatmentDecisionFor}
        />
      )} */}
    </div>
  );
}
