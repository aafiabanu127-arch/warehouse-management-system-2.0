import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  getDemandForecastSummary,
  getABCClassification,
  getProductVelocity,
  getDemandForecast,
} from '../api/forecasting';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';

const ABC_COLORS: Record<string, string> = { A: '#34d399', B: '#fbbf24', C: '#f87171' };
const CHART_COLORS = ['#34d399', '#60a5fa', '#fbbf24', '#f87171', '#a78bfa', '#fb923c'];

export default function Analytics() {
  const { isDark } = useTheme();
  const axisColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#334155' : '#cbd5e1';
  const tooltipStyle = isDark
    ? { backgroundColor: '#1e293b', border: '1px solid #334155', color: '#e2e8f0' }
    : { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#1e293b' };
  const [abcData, setAbcData]         = useState<any[]>([]);
  const [velocity, setVelocity]       = useState<any[]>([]);
  const [summary, setSummary]         = useState<any>(null);
  const [forecasts, setForecasts]     = useState<any[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState('');

  useEffect(() => {
    Promise.all([
      getABCClassification(),
      getProductVelocity(),
      getDemandForecastSummary(),
      getDemandForecast(),
    ])
      .then(([abc, vel, sum, fc]) => {
        setAbcData(Array.isArray(abc) ? abc : []);
        setVelocity(Array.isArray(vel) ? vel.slice(0, 8) : []);
        setSummary(sum);
        setForecasts(Array.isArray(fc) ? fc.slice(0, 5) : []);
      })
      .catch(() => setError('Failed to load analytics data.'))
      .finally(() => setIsLoading(false));
  }, []);

  // ABC summary pie data
  const abcSummary = ['A', 'B', 'C'].map((cat) => ({
    name: `Class ${cat}`,
    count: abcData.filter((x) => x.abc_class === cat).length,
    fill: ABC_COLORS[cat],
  }));

  // Forecast line chart ? flatten all products next-week predictions
  const forecastChartData = forecasts.map((f) => ({
    name: f.sku,
    week1: f.forecast_next_weeks?.[0]?.predicted_quantity ?? 0,
    week2: f.forecast_next_weeks?.[1]?.predicted_quantity ?? 0,
    week3: f.forecast_next_weeks?.[2]?.predicted_quantity ?? 0,
    week4: f.forecast_next_weeks?.[3]?.predicted_quantity ?? 0,
    trend: f.trend,
  }));

  if (isLoading) return <p className="text-slate-500 dark:text-slate-400">Loading analytics...</p>;
  if (error)     return <p className="text-red-400">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Analytics</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">
        AI-powered ABC classification, product velocity &amp; demand forecasting
      </p>

      {/* Summary KPI cards from backend */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Products Analyzed</p>
            <p className="text-4xl font-bold text-emerald-400">{summary.total_products_analyzed ?? 0}</p>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Reorder Candidates</p>
            <p className="text-4xl font-bold text-yellow-400">{summary.reorder_candidates?.length ?? 0}</p>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Increasing Demand</p>
            <p className="text-4xl font-bold text-green-400">{summary.products_with_increasing_demand?.length ?? 0}</p>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Decreasing Demand</p>
            <p className="text-4xl font-bold text-red-400">{summary.products_with_decreasing_demand?.length ?? 0}</p>
          </div>
        </div>
      )}

      {/* ABC Classification Table + Pie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
          <h2 className="text-lg font-semibold mb-1">ABC Classification</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">A = top 70% volume ? B = next 20% ? C = bottom 10%</p>
          {abcData.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm">No data yet.</p>
          ) : (
            <div className="overflow-y-auto max-h-64">
              <table className="w-full text-sm">
                <thead className="text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="text-left py-2">Product</th>
                    <th className="text-right py-2">OUT Qty</th>
                    <th className="text-center py-2">Class</th>
                  </tr>
                </thead>
                <tbody>
                  {abcData.map((item, i) => (
                    <tr key={i} className="border-t border-slate-200 dark:border-slate-700">
                      <td className="py-1.5 truncate max-w-[160px]">{item.product_name}</td>
                      <td className="py-1.5 text-right">{item.total_outbound_quantity}</td>
                      <td className="py-1.5 text-center">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-bold"
                          style={{ backgroundColor: ABC_COLORS[item.abc_class] + '33', color: ABC_COLORS[item.abc_class] }}
                        >
                          {item.abc_class}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
          <h2 className="text-lg font-semibold mb-4">ABC Distribution</h2>
          {abcSummary.every((c) => c.count === 0) ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={abcSummary} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {abcSummary.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Product Velocity */}
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5 mb-8">
        <h2 className="text-lg font-semibold mb-1">Product Velocity</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Total outbound quantity per product (fast movers first)</p>
        {velocity.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-sm">No outbound movement data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={velocity} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis type="number" stroke={axisColor} />
              <YAxis dataKey="product_name" type="category" stroke={axisColor} width={130} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="total_outbound_quantity" radius={[0, 4, 4, 0]}>
                {velocity.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* AI Demand Forecast Chart */}
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5 mb-8">
        <h2 className="text-lg font-semibold mb-1">AI Demand Forecast ? Next 4 Weeks</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Linear Regression model ? evaluated with MAE, RMSE &amp; R-squared ? auto model selection vs Moving Average
        </p>
        {forecastChartData.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-sm">No forecast data yet. Add stock movements first.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={forecastChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="name" stroke={axisColor} />
              <YAxis stroke={axisColor} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="week1" stroke="#34d399" strokeWidth={2} name="Week 1" />
              <Line type="monotone" dataKey="week2" stroke="#60a5fa" strokeWidth={2} name="Week 2" />
              <Line type="monotone" dataKey="week3" stroke="#fbbf24" strokeWidth={2} name="Week 3" />
              <Line type="monotone" dataKey="week4" stroke="#f87171" strokeWidth={2} name="Week 4" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Model Accuracy Distribution */}
      {summary?.model_accuracy_distribution && (
        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
          <h2 className="text-lg font-semibold mb-1">Model Accuracy Distribution</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">R-squared based accuracy labels across all forecasted products</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={Object.entries(summary.model_accuracy_distribution).map(([label, count]) => ({ label, count }))}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="label" stroke={axisColor} />
              <YAxis stroke={axisColor} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#34d399" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
