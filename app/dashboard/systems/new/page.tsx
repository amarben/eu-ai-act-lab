import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AISystemForm } from '@/components/systems/ai-system-form';

export default async function NewAISystemPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add AI System</h1>
        <p className="text-muted-foreground mt-2">
          Register a new AI system to begin compliance assessment
        </p>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>
            Provide details about the AI system you want to register
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AISystemForm />
        </CardContent>
      </Card>
    </div>
  );
}
