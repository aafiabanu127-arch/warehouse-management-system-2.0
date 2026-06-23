import { useState, useEffect } from 'react';
import { getReports, createReport, deleteReport, exportReportCSV, exportReportExcel, exportReportPDF } from '../api/reports';

type Report = {
  id: number;
  title: string;
  report_type: string;
  status: string;
  created_at: string;
};

const REPORT_TYPES = [
  { value: 'INVENTORY', label: 'Inventory Report' },
  { value: 'WAREHOUSE', label: 'Warehouse Utilization' },
  { value: 'STOCK',     label: 'Stock Movements' },
  { value: 'SPACE',     label: 'Space Allocation' },
];

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const [reports, setReports]       = useState<Report[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState('');
  const [generating, setGenerating] = useState(false);
  const [selType, setSelType]       = useState('INVENTORY');
  const [selTitle, setSelTitle]     = useState('');

  const load = () => {
    setIsLoading(true);
    getReports()
      .then(d => setReports(Array.isArray(d) ? d : d.results ?? []))
      .catch(() => setError('Failed to load reports.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleGenerate = async () => {
    if (!selTitle.trim()) { setError('Please enter a report title.'); return; }
    setGenerating(true); setError('');
    try {
      await createReport(selType, selTitle.trim());
      setSelTitle('');
      load();
    } catch { setError('Failed to generate report.'); }
    finally { setGenerating(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this report?')) return;
    try { await deleteReport(id); load(); }
    catch { setError('Failed to delete report.'); }
  };

  const handleExport = async (id: number, format: 'csv' | 'excel' | 'pdf', title: string) => {
    try {
      const ext = format === 'excel' ? 'xlsx' : format;
      const fn = format === 'csv' ? exportReportCSV : format === 'excel' ? exportReportExcel : exportReportPDF;
      const blob = await fn(id);
      downloadBlob(blob, `${title}.${ext}`);
    } catch { setError('Export failed. Try again.'); }
  };

  const statusColor = (s: string) =>
    s === 'COMPLETED' ? 'bg-green-100 text-green-800' :
    s === 'FAILED'    ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800';

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Reports</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Generate panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-base font-medium text-gray-700 mb-4">Generate New Report</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Report Type</label>
            <select
              value={selType}
              onChange={e => setSelType(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {REPORT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <label className="text-xs text-gray-500">Title</label>
            <input
              value={selTitle}
              onChange={e => setSelTitle(e.target.value)}
              placeholder="e.g. June Inventory Report"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {generating ? 'Generating…' : 'Generate'}
          </button>
        </div>
      </div>

      {/* Reports table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 text-left">Title</th>
              <th className="px-5 py-3 text-left">Type</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Created</th>
              <th className="px-5 py-3 text-left">Export</th>
              <th className="px-5 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">Loading…</td></tr>
            )}
            {!isLoading && reports.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">No reports yet. Generate one above.</td></tr>
            )}
            {reports.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 transition">
                <td className="px-5 py-3 font-medium text-gray-800">{r.title}</td>
                <td className="px-5 py-3 text-gray-500">{REPORT_TYPES.find(t => t.value === r.report_type)?.label ?? r.report_type}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(r.status)}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="px-5 py-3">
                  {r.status === 'COMPLETED' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleExport(r.id, 'csv',   r.title)} className="text-xs text-blue-600 hover:underline">CSV</button>
                      <button onClick={() => handleExport(r.id, 'excel', r.title)} className="text-xs text-green-600 hover:underline">Excel</button>
                      <button onClick={() => handleExport(r.id, 'pdf',   r.title)} className="text-xs text-red-600 hover:underline">PDF</button>
                    </div>
                  )}
                </td>
                <td className="px-5 py-3">
                  <button onClick={() => handleDelete(r.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}