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

const navItems = [
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
  {
    title: 'Risk Classification',
    href: '/dashboard/classification',
    icon: ShieldCheck,
    testId: 'nav-classification',
  },
  {
    title: 'Gap Assessment',
    href: '/dashboard/gap-assessment',
    icon: FileSearch,
    testId: 'nav-gap-assessment',
  },
  {
    title: 'Governance',
    href: '/dashboard/governance',
    icon: Users,
    testId: 'nav-governance',
  },
  {
    title: 'Risk Management',
    href: '/dashboard/risk-management',
    icon: AlertTriangle,
    testId: 'nav-risk-management',
  },
  {
    title: 'Documentation',
    href: '/dashboard/documentation',
    icon: FileText,
    testId: 'nav-documentation',
  },
  {
    title: 'Training',
    href: '/dashboard/training',
    icon: GraduationCap,
    testId: 'nav-training',
  },
  {
    title: 'Incidents',
    href: '/dashboard/incidents',
    icon: AlertCircle,
    testId: 'nav-incidents',
  },
  {
    title: 'Monitoring',
    href: '/dashboard/monitoring',
    icon: BarChart3,
    testId: 'nav-monitoring',
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    testId: 'nav-settings',
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <span className="font-bold text-lg">EU AI Act Lab</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  data-testid={item.testId}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <p className="text-xs text-muted-foreground text-center">
          EU AI Act Implementation Lab
          <br />
          v1.0.0
        </p>
      </div>
    </aside>
  );
}
