import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Bot,
  Calendar,
  FileText,
  FolderOpen,
  Inbox,
  Newspaper,
  Palette,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { useCms } from '../app/providers/CmsContext';
import { cmsService } from '../services/cms/cmsService';
import type { DashboardMetrics } from '../types/cms';
import { summarizeEnquiriesByStatus } from '../utils/cmsStoreLogic';

const PIE_COLORS = ['#52128B', '#B21A83', '#F2C34E', '#0D9488', '#16A34A', '#64748B'];

export const AdminDashboard: React.FC = () => {
  const { state, adminPanelPath } = useCms();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    let active = true;
    void cmsService.fetchDashboardMetrics().then((res) => {
      if (active && res.ok && res.data) {
        setMetrics(res.data);
      }
    });
    return () => {
      active = false;
    };
  }, [state.enquiries?.length, state.pages?.length, state.media?.length]);

  const pages = state.pages || [];
  const enquiries = state.enquiries || [];
  const newsEvents = state.newsEvents || [];
  const media = state.media || [];
  const faqs = state.chatbot?.faqs || [];
  const activityLogs = state.activityLogs || [];

  const publishedPages = metrics?.kpis?.publishedPages ?? pages.filter((p) => p.status === 'published').length;
  const totalPages = metrics?.kpis?.totalPages ?? pages.length;
  const totalEnquiries = metrics?.kpis?.totalEnquiries ?? enquiries.length;
  const newEnquiries = metrics?.kpis?.newEnquiries ?? enquiries.filter((e) => e.status === 'New').length;
  const newsCount = metrics?.kpis?.newsCount ?? newsEvents.length;
  const upcomingEvents = newsEvents.filter((n) => n.type === 'event').length;
  const mediaCount = metrics?.kpis?.mediaCount ?? media.length;
  const faqCount = metrics?.kpis?.faqCount ?? faqs.length;

  const statusMap = summarizeEnquiriesByStatus(enquiries);
  const statusChartData = Object.entries(statusMap)
    .filter(([, count]) => count > 0)
    .map(([name, value]) => ({ name, value }));

  const programChartData =
    metrics?.programBreakdown && metrics.programBreakdown.length > 0
      ? metrics.programBreakdown.map((item) => ({
          program: item.program.includes('B.Pharm') ? 'B.Pharmacy' : item.program.includes('M.Pharm') ? 'M.Pharmacy' : item.program,
          count: item.count,
        }))
      : Object.entries(
          enquiries.reduce<Record<string, number>>((acc, e) => {
            const key = (e.interestedProgram || '').includes('B.Pharm') ? 'B.Pharmacy' : 'M.Pharmacy';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
          }, {})
        ).map(([program, count]) => ({ program, count }));

  const monthlyTrendData = metrics?.monthlyTrend || [];

  const kpis = [
    { label: 'Total Pages', value: totalPages, icon: FileText, to: `${adminPanelPath}/pages` },
    { label: 'Published Pages', value: publishedPages, icon: ShieldCheck, to: `${adminPanelPath}/pages` },
    { label: 'Total Enquiries', value: totalEnquiries, icon: Inbox, to: `${adminPanelPath}/enquiries` },
    { label: 'New Enquiries', value: newEnquiries, icon: Inbox, to: `${adminPanelPath}/enquiries` },
    { label: 'News Articles', value: newsCount, icon: Newspaper, to: `${adminPanelPath}/news` },
    { label: 'Events Listed', value: upcomingEvents, icon: Calendar, to: `${adminPanelPath}/news` },
    { label: 'Media Files', value: mediaCount, icon: FolderOpen, to: `${adminPanelPath}/media` },
    { label: 'Chatbot FAQs', value: faqCount, icon: Bot, to: `${adminPanelPath}/chatbot/faqs` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#171238]">Institutional CMS Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Live database statistics for {state.settings?.general?.collegeName || 'KITS College of Pharmacy for Women'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`${adminPanelPath}/appearance`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#52128B] bg-white border border-[#E8DFF5] rounded-full hover:bg-[#F5F0FC]"
          >
            <Palette className="w-3.5 h-3.5" /> Customize Appearance
          </Link>
          <Link
            to={`${adminPanelPath}/pages`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#52128B] rounded-full hover:bg-[#32105B]"
          >
            <Plus className="w-3.5 h-3.5" /> Manage Pages
          </Link>
        </div>
      </div>

      {/* 8 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Link
            key={kpi.label}
            to={kpi.to}
            className="bg-white border border-[#E8DFF5] hover:border-[#52128B] rounded-xl p-4 flex items-center justify-between transition-colors"
          >
            <div>
              <div className="text-xs text-slate-500">{kpi.label}</div>
              <div className="text-2xl font-bold text-[#171238] mt-1 tabular-nums">{kpi.value}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F5F0FC] text-[#52128B] flex items-center justify-center">
              <kpi.icon className="w-5 h-5" />
            </div>
          </Link>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E8DFF5] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#171238] font-sans">Enquiries Over Time</h2>
            <span className="text-[11px] text-slate-400">Live DB</span>
          </div>
          <div className="h-56">
            {monthlyTrendData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 text-center px-4">
                No admission enquiries recorded yet. Submissions will plot automatically.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDE9F7" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="enquiries" stroke="#52128B" fill="#F5F0FC" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#E8DFF5] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#171238] font-sans">Enquiries by Program</h2>
            <span className="text-[11px] text-slate-400">Live DB</span>
          </div>
          <div className="h-56">
            {programChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 text-center px-4">
                No program enquiries yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={programChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDE9F7" />
                  <XAxis dataKey="program" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#B21A83" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#E8DFF5] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#171238] font-sans">Enquiry Status Distribution</h2>
            <span className="text-[11px] text-slate-400">Live DB</span>
          </div>
          <div className="h-56">
            {statusChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 text-center px-4">
                No enquiries to classify yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {statusChartData.map((entry, idx) => (
                      <Cell key={entry.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Tables & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-[#E8DFF5] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#171238] font-sans">Recent Admission Enquiries</h2>
            <Link to={`${adminPanelPath}/enquiries`} className="text-xs font-semibold text-[#52128B] hover:underline">
              Manage All →
            </Link>
          </div>
          {enquiries.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">No admission enquiries have been received yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="border-b border-[#E8DFF5] text-slate-500">
                  <tr>
                    <th className="py-2 pr-3">Student</th>
                    <th className="py-2 pr-3">Program</th>
                    <th className="py-2 pr-3">City</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enquiries.slice(0, 5).map((e) => (
                    <tr key={e.id}>
                      <td className="py-2.5 pr-3 font-semibold text-[#171238]">{e.studentName}</td>
                      <td className="py-2.5 pr-3 text-slate-600">{e.interestedProgram}</td>
                      <td className="py-2.5 pr-3 text-slate-600">{e.city}</td>
                      <td className="py-2.5 font-medium text-[#52128B]">{e.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-white border border-[#E8DFF5] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#171238] font-sans">Recent Admin Activity</h2>
            <Link to={`${adminPanelPath}/activity-logs`} className="text-xs font-semibold text-[#52128B] hover:underline">
              Full Logs →
            </Link>
          </div>
          {activityLogs.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">No administrative activity logged yet.</p>
          ) : (
            <ul className="space-y-3 text-xs">
              {activityLogs.slice(0, 5).map((log) => (
                <li key={log.id} className="pb-2.5 border-b border-slate-100 last:border-0">
                  <div className="font-semibold text-[#171238]">{log.action}</div>
                  <div className="text-slate-500 mt-0.5 tabular-nums">
                    {log.module} · {log.actor} · {log.timestamp}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Engineering & Design Credit Strip */}
      <div className="pt-4 border-t border-[#E8DFF5] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <div>
          <span>KITS Pharmacy CMS v2.0 • </span>
          <span className="font-medium text-[#52128B]">Institutional Release</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Engineered &amp; Designed by</span>
          <span className="font-semibold text-[#52128B]">Infiniforge Technologies</span>
        </div>
      </div>
    </div>
  );
};
