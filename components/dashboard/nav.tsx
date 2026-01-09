'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Server,
  ShieldCheck,
  FileSearch,
  Users,
  AlertTriangle,
  FileText,
  GraduationCap,
  AlertCircle,
  BarChart3,
  Settings,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  testId: string;
  category?: string;
}

const navItems: NavItem[] = [
  // Top-level items (no category)
  {
    title: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
    testId: 'nav-overview',
  },
  {
    title: 'AI Systems',
    href: '/dashboard/systems',
    icon: Server,
    testId: 'nav-systems',
  },

  // Phase 1: Assessment & Classification
  {
    title: 'Risk Classification',
    href: '/dashboard/classification',
    icon: ShieldCheck,
    testId: 'nav-classification',
    category: 'Phase 1: Assessment',
  },
  {
    title: 'Gap Assessment',
    href: '/dashboard/gap-assessment',
    icon: FileSearch,
    testId: 'nav-gap-assessment',
    category: 'Phase 1: Assessment',
  },

  // Phase 2: Compliance Framework
  {
    title: 'Governance',
    href: '/dashboard/governance',
    icon: Users,
    testId: 'nav-governance',
    category: 'Phase 2: Framework',
  },
  {
    title: 'Risk Management',
    href: '/dashboard/risk-management',
    icon: AlertTriangle,
    testId: 'nav-risk-management',
    category: 'Phase 2: Framework',
  },
  {
    title: 'Documentation',
    href: '/dashboard/documentation',
    icon: FileText,
    testId: 'nav-documentation',
    category: 'Phase 2: Framework',
  },

  // Phase 3: Operations
  {
    title: 'Training',
    href: '/dashboard/training',
    icon: GraduationCap,
    testId: 'nav-training',
    category: 'Phase 3: Operations',
  },
  {
    title: 'Incidents',
    href: '/dashboard/incidents',
    icon: AlertCircle,
    testId: 'nav-incidents',
    category: 'Phase 3: Operations',
  },
  {
    title: 'Monitoring',
    href: '/dashboard/monitoring',
    icon: BarChart3,
    testId: 'nav-monitoring',
    category: 'Phase 3: Operations',
  },

  // Bottom-level item (no category)
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    testId: 'nav-settings',
  },
];

// Define phases in order
const phases = ['Phase 1: Assessment', 'Phase 2: Framework', 'Phase 3: Operations'];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white">
      {/* Header */}
      <div className="flex h-16 items-center border-b border-slate-800 px-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <ShieldCheck className="h-8 w-8 text-blue-400" />
          <h1 className="text-xl font-bold">EU AI Act Lab</h1>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {/* Top-level items (without category) */}
        {navItems.map((item) => {
          if (!item.category) {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={item.testId}
                className={cn(
                  'flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors hover:bg-slate-800',
                  isActive ? 'bg-slate-800 text-white' : 'text-slate-300'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          }
          return null;
        })}

        {/* Grouped items by phase */}
        <div className="mt-4 space-y-6">
          {phases.map((phase) => {
            const phaseItems = navItems.filter((item) => item.category === phase);

            if (phaseItems.length === 0) return null;

            return (
              <div key={phase}>
                {/* Phase Header */}
                <div className="px-6 py-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {phase}
                  </h3>
                </div>
                {/* Phase Items */}
                {phaseItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      data-testid={item.testId}
                      className={cn(
                        'flex items-center gap-3 px-6 py-2 text-sm transition-colors hover:bg-slate-800',
                        isActive ? 'bg-slate-800 text-white' : 'text-slate-300'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 p-4">
        <p className="text-center text-xs text-slate-400">
          EU AI Act Implementation Lab
          <br />
          v1.0.0
        </p>
      </div>
    </div>
  );
}
