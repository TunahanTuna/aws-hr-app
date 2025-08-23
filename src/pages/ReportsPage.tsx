import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Users, FolderOpen, Clock, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../i18n/useLanguage';
import { useUsers, useCustomers, useProjects, useTimeEntries, useDivisions, useTaskTypes } from '../lib/graphql/hooks';

import { ReportCard } from '../components/charts/ReportCard';
import { BarChart } from '../components/charts/BarChart';
import { PieChart } from '../components/charts/PieChart';
import { DonutChart } from '../components/charts/DonutChart';
import { LineChart } from '../components/charts/LineChart';
import { RadarChart } from '../components/charts/RadarChart';
import { GaugeChart } from '../components/charts/GaugeChart';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import type { ReportFilters, TimeEntry, Project, Customer, User, Division, TaskType, ChartData } from '../types';
import { getCurrentDate } from '../utils/helpers';

export const ReportsPage: React.FC = () => {
  const { t } = useLanguage();

  // GraphQL hooks
  const { data: usersData, loading: usersLoading, error: usersError } = useUsers();
  const { data: customersData, loading: customersLoading, error: customersError } = useCustomers();
  const { data: projectsData, loading: projectsLoading, error: projectsError } = useProjects();
  const { data: timeEntriesData, loading: timeEntriesLoading, error: timeEntriesError } = useTimeEntries();
  const { data: divisionsData, loading: divisionsLoading, error: divisionsError } = useDivisions();
  const { data: taskTypesData, loading: taskTypesLoading, error: taskTypesError } = useTaskTypes();

  const users = useMemo(() => usersData?.users || [], [usersData?.users]);
  const customers = useMemo(() => customersData?.customers || [], [customersData?.customers]);
  const projects = useMemo(() => projectsData?.projects || [], [projectsData?.projects]);
  const timeEntries = useMemo(() => timeEntriesData?.time_entries || [], [timeEntriesData?.time_entries]);

  const loading = usersLoading || customersLoading || projectsLoading || timeEntriesLoading || divisionsLoading || taskTypesLoading;
  const error = usersError || customersError || projectsError || timeEntriesError || divisionsError || taskTypesError;

  const [reportFilters, setReportFilters] = useState<ReportFilters>({
    reportType: 'effortByProject',
    startDate: '2024-01-01',
    endDate: getCurrentDate(),
  });

  const filteredEntries = useMemo(() => {
    let entries = timeEntries.filter((entry: TimeEntry) => {
      const entryDate = new Date(entry.date);
      const startDate = new Date(reportFilters.startDate);
      const endDate = new Date(reportFilters.endDate);
      
      return entryDate >= startDate && entryDate <= endDate;
    });

    if (reportFilters.projectId) {
      entries = entries.filter((entry: TimeEntry) => entry.project_id === reportFilters.projectId);
    }

    return entries;
  }, [timeEntries, reportFilters]);

  const projectEffortData = useMemo(() => {
    const projectEfforts: { [key: string]: number } = {};
    
    filteredEntries.forEach((entry: TimeEntry) => {
      const project = projects.find((p: Project) => p.id === entry.project_id);
      if (project) {
        const customer = customers.find((c: Customer) => c.id === project.customer_id);
        const projectName = customer ? `${customer.name} - ${project.name}` : project.name;
        projectEfforts[projectName] = (projectEfforts[projectName] || 0) + entry.effort;
      }
    });

    return Object.entries(projectEfforts).map(([name, effort]) => ({
      label: name,
      value: effort,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    }));
  }, [filteredEntries, projects, customers]);

  const assigneeEffortData = useMemo(() => {
    const assigneeEfforts: { [key: string]: number } = {};
    
    filteredEntries.forEach((entry: TimeEntry) => {
      const user = users.find((u: User) => u.id === entry.user_id);
      if (user) {
        assigneeEfforts[user.name] = (assigneeEfforts[user.name] || 0) + entry.effort;
      }
    });

    return Object.entries(assigneeEfforts).map(([name, effort]) => ({
      label: name,
      value: effort,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    }));
  }, [filteredEntries, users]);

  // Derived collections for tables
  const divisions = useMemo(() => divisionsData?.divisions || [], [divisionsData?.divisions]);
  const taskTypes = useMemo(() => taskTypesData?.task_types || [], [taskTypesData?.task_types]);

  const projectTotals = useMemo(() => {
    const totals: { [key: string]: number } = {};
    filteredEntries.forEach((entry: TimeEntry) => {
      const project = projects.find((p: Project) => p.id === entry.project_id);
      if (!project) return;
      const customer = customers.find((c: Customer) => c.id === project.customer_id);
      const name = customer ? `${customer.name} - ${project.name}` : project.name;
      totals[name] = (totals[name] || 0) + entry.effort;
    });
    return Object.entries(totals)
      .map(([name, hours]) => ({ name, hours }))
      .sort((a, b) => b.hours - a.hours);
  }, [filteredEntries, projects, customers]);

  const assigneeTotals = useMemo(() => {
    const totals: { [key: string]: number } = {};
    filteredEntries.forEach((entry: TimeEntry) => {
      const user = users.find((u: User) => u.id === entry.user_id);
      if (!user) return;
      totals[user.name] = (totals[user.name] || 0) + entry.effort;
    });
    return Object.entries(totals)
      .map(([name, hours]) => ({ name, hours }))
      .sort((a, b) => b.hours - a.hours);
  }, [filteredEntries, users]);

  const divisionTotals = useMemo(() => {
    const totals: { [key: string]: number } = {};
    filteredEntries.forEach((entry: TimeEntry) => {
      const division = divisions.find((d: Division) => d.id === entry.division_id);
      const name = division ? division.name : 'Unknown';
      totals[name] = (totals[name] || 0) + entry.effort;
    });
    return Object.entries(totals)
      .map(([name, hours]) => ({ name, hours }))
      .sort((a, b) => b.hours - a.hours);
  }, [filteredEntries, divisions]);

  const taskTypeAverages = useMemo(() => {
    const totals: { [key: string]: { total: number; count: number } } = {};
    filteredEntries.forEach((entry: TimeEntry) => {
      const type = taskTypes.find((t: TaskType) => t.id === entry.task_type_id);
      const name = type ? type.name : 'Unknown';
      if (!totals[name]) totals[name] = { total: 0, count: 0 };
      totals[name].total += entry.effort;
      totals[name].count += 1;
    });
    return Object.entries(totals)
      .map(([name, v]) => ({ name, average: v.count ? v.total / v.count : 0, count: v.count }))
      .sort((a, b) => b.average - a.average);
  }, [filteredEntries, taskTypes]);

  const billableSummary = useMemo(() => {
    let billable = 0;
    let nonBillable = 0;
    filteredEntries.forEach((e: TimeEntry) => {
      if (e.is_billable) billable += e.effort; else nonBillable += e.effort;
    });
    return { billable, nonBillable, total: billable + nonBillable };
  }, [filteredEntries]);

  // === Chart datasets for summaries ===
  const colorPalette = ['#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#f87171', '#fb923c', '#22d3ee', '#f472b6'];

  const projectTotalsChart: ChartData[] = useMemo(() => {
    return projectTotals.map((row, idx) => ({
      label: row.name,
      value: row.hours,
      color: colorPalette[idx % colorPalette.length],
    }));
  }, [projectTotals]);

  const divisionTotalsChart: ChartData[] = useMemo(() => {
    return divisionTotals.map((row, idx) => ({
      label: row.name,
      value: row.hours,
      color: colorPalette[idx % colorPalette.length],
    }));
  }, [divisionTotals]);

  const billableSummaryChart: ChartData[] = useMemo(() => {
    return [
      { label: t('billable'), value: billableSummary.billable, color: '#34d399' },
      { label: t('nonBillable'), value: billableSummary.nonBillable, color: '#f87171' },
    ];
  }, [billableSummary, t]);

  const handleFilterChange = (field: keyof ReportFilters, value: string): void => {
    setReportFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center space-x-4"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="p-3 bg-blue-100 rounded-lg"
        >
          <BarChart3 className="h-8 w-8 text-blue-600" />
        </motion.div>
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl font-bold text-gray-900"
          >
            Reports & Analytics
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-gray-600 mt-1"
          >
            Comprehensive insights into time tracking and project performance
          </motion.p>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            icon: Clock,
            label: 'Total Hours',
            value: `${billableSummary.total.toFixed(1)}h`,
            color: 'blue',
            delay: 0.1
          },
          {
            icon: DollarSign,
            label: 'Billable Hours',
            value: `${billableSummary.billable.toFixed(1)}h`,
            color: 'green',
            delay: 0.2
          },
          {
            icon: Users,
            label: 'Active Users',
            value: new Set(filteredEntries.map((e: any) => e.user_id)).size,
            color: 'purple',
            delay: 0.3
          },
          {
            icon: FolderOpen,
            label: 'Active Projects',
            value: new Set(filteredEntries.map((e: any) => e.project_id)).size,
            color: 'orange',
            delay: 0.4
          }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: stat.delay, duration: 0.5 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <motion.div 
                    className={`p-2 bg-${stat.color}-100 rounded-lg`}
                    whileHover={{ rotate: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </motion.div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: stat.delay + 0.2, duration: 0.4 }}
                      className="text-2xl font-bold text-gray-900"
                    >
                      {stat.value}
                    </motion.p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-gray-500" />
              <CardTitle>{t('reportFilters')}</CardTitle>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
              >
                <Badge variant="jiraGray" className="ml-2">
                  {filteredEntries.length} entries
                </Badge>
              </motion.div>
            </div>
          </CardHeader>
          <CardContent>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.9
                  }
                }
              }}
              initial="hidden"
              animate="visible"
            >
              {[
                {
                  label: 'Report Type',
                  component: (
                    <Select
                      value={reportFilters.reportType}
                      onChange={(e) => handleFilterChange('reportType', e.target.value)}
                    >
                      <option value="effortByProject">{t('effortByProject')}</option>
                      <option value="effortByAssignee">{t('effortByAssignee')}</option>
                    </Select>
                  )
                },
                {
                  label: 'Start Date',
                  component: (
                    <Input 
                      type="date" 
                      value={reportFilters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    />
                  )
                },
                {
                  label: 'End Date',
                  component: (
                    <Input 
                      type="date" 
                      value={reportFilters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    />
                  )
                },
                {
                  label: 'Project',
                  component: (
                    <Select
                      value={reportFilters.projectId || ''}
                      onChange={(e) => handleFilterChange('projectId', e.target.value)}
                    >
                      <option value="">{t('allProjects')}</option>
                      {projects.map((project: Project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </Select>
                  )
                }
              ].map((field, index) => (
                <motion.div 
                  key={index}
                  className="space-y-2"
                  variants={{
                    hidden: { y: 20, opacity: 0 },
                    visible: { y: 0, opacity: 1 }
                  }}
                >
                  <label className="text-sm font-medium text-gray-700">{field.label}</label>
                  {field.component}
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Charts */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.3, duration: 0.6 }}
        >
          <ReportCard title={t('effortByProject')}>
            {loading || projectEffortData.length === 0 ? (
              <div className="flex items-center justify-center h-36 text-slate-500">
                {loading ? <LoadingSpinner /> : 'No project data available'}
              </div>
            ) : (
              <BarChart data={projectEffortData} height={350} />
            )}
          </ReportCard>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          <ReportCard 
            title={reportFilters.projectId 
              ? `${t('effortByAssignee')} for ${projects.find((p: Project) => p.id === reportFilters.projectId)?.name || 'Selected Project'}`
              : t('effortByAssignee')
            }
          >
            <DonutChart 
              data={assigneeEffortData} 
              height={350}
              centerText={t('totalHours')}
              centerValue={`${assigneeEffortData.reduce((acc, item) => acc + item.value, 0).toFixed(1)}h`}
            />
          </ReportCard>
        </motion.div>
      </motion.div>

      {/* Summary Charts */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.15,
              delayChildren: 1.6
            }
          }
        }}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={{
          hidden: { y: 50, opacity: 0 },
          visible: { y: 0, opacity: 1 }
        }}>
          <ReportCard title={t('projectTotals')}>
            <BarChart data={projectTotalsChart} height={300} />
          </ReportCard>
        </motion.div>

        <motion.div variants={{
          hidden: { y: 50, opacity: 0 },
          visible: { y: 0, opacity: 1 }
        }}>
          <ReportCard title={t('taskTypeAverages')}>
            <RadarChart 
              data={taskTypeAverages.map(item => ({
                subject: item.name,
                value: item.average,
                fullMark: Math.max(...taskTypeAverages.map(t => t.average)) * 1.2
              }))}
              height={300}
              color="#10b981"
            />
          </ReportCard>
        </motion.div>

        <motion.div variants={{
          hidden: { y: 50, opacity: 0 },
          visible: { y: 0, opacity: 1 }
        }}>
          <ReportCard title={t('assigneeTotals')}>
            <LineChart 
              data={assigneeTotals.map(item => ({ name: item.name, value: item.hours }))}
              height={300}
              variant="area"
              color="#8b5cf6"
              gradientFrom="#8b5cf6"
              gradientTo="#ede9fe"
            />
          </ReportCard>
        </motion.div>

        <motion.div variants={{
          hidden: { y: 50, opacity: 0 },
          visible: { y: 0, opacity: 1 }
        }}>
          <ReportCard title={t('divisionTotals')}>
            <PieChart data={divisionTotalsChart} height={300} showLegend={true} />
          </ReportCard>
        </motion.div>

        <motion.div variants={{
          hidden: { y: 50, opacity: 0 },
          visible: { y: 0, opacity: 1 }
        }}>
          <ReportCard title={t('billableSummary')}>
            <DonutChart 
              data={billableSummaryChart} 
              height={300}
              centerText={t('total')}
              centerValue={`${billableSummary.total.toFixed(1)}h`}
            />
          </ReportCard>
        </motion.div>

        <motion.div variants={{
          hidden: { y: 50, opacity: 0 },
          visible: { y: 0, opacity: 1 }
        }}>
          <ReportCard title={t('weeklyTrends')}>
            <LineChart 
              data={[
                { name: 'Week 1', value: billableSummary.total * 0.8 },
                { name: 'Week 2', value: billableSummary.total * 0.9 },
                { name: 'Week 3', value: billableSummary.total * 1.1 },
                { name: 'Week 4', value: billableSummary.total },
              ]}
              height={300}
              variant="line"
              color="#ef4444"
            />
          </ReportCard>
        </motion.div>

        <motion.div variants={{
          hidden: { y: 50, opacity: 0 },
          visible: { y: 0, opacity: 1 }
        }}>
          <ReportCard title={t('billableTargetProgress')}>
            <GaugeChart 
              value={billableSummary.billable}
              max={billableSummary.total}
              label={t('billableHours')}
              height={300}
              unit="h"
            />
          </ReportCard>
        </motion.div>

        <motion.div variants={{
          hidden: { y: 50, opacity: 0 },
          visible: { y: 0, opacity: 1 }
        }}>
          <ReportCard title={t('efficiencyRate')}>
            <GaugeChart 
              value={(billableSummary.billable / billableSummary.total) * 100}
              max={100}
              label={t('billableEfficiency')}
              height={300}
              unit="%"
            />
          </ReportCard>
        </motion.div>
      </motion.div>

      {filteredEntries.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto max-w-md">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <BarChart3 className="h-12 w-12" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
              <p className="mt-1 text-sm text-gray-500">
                No data found for the selected date range and filters.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
