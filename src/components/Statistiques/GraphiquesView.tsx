import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Sale, Product } from '../../types';

interface GraphiquesViewProps {
  sales: Sale[];
  products: Product[];
}

export const GraphiquesView: React.FC<GraphiquesViewProps> = ({ sales, products }) => {
  // Compute category sales dynamically
  const categoryTotals: Record<string, number> = {};
  sales.forEach((s) => {
    s.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const catName = prod ? prod.categorie : 'Général';
      categoryTotals[catName] = (categoryTotals[catName] || 0) + item.total;
    });
  });

  const categoryData = Object.keys(categoryTotals).length > 0
    ? Object.entries(categoryTotals).map(([name, value]) => ({ name, value }))
    : [
        { name: 'Boissons', value: 45 },
        { name: 'Épicerie', value: 30 },
        { name: 'Laitiers', value: 25 },
      ];

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  // Compute top customers dynamically
  const customerTotals: Record<string, number> = {};
  sales.forEach((s) => {
    const cName = s.clientNom || 'Client Passager';
    customerTotals[cName] = (customerTotals[cName] || 0) + s.total;
  });

  const topCustomersData = Object.keys(customerTotals).length > 0
    ? Object.entries(customerTotals)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5)
    : [
        { name: 'Ahmed Benali', total: 18500 },
        { name: 'Karim Saidi', total: 14200 },
        { name: 'Yacine Amrani', total: 12000 },
      ];

  // Daily Sales chart data derived from sales
  const dayMap: Record<string, number> = { Lun: 0, Mar: 0, Mer: 0, Jeu: 0, Ven: 0, Sam: 0, Dim: 0 };
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  sales.forEach((s) => {
    if (s.date) {
      const d = new Date(s.date.replace(' ', 'T'));
      if (!isNaN(d.getTime())) {
        const dName = dayNames[d.getDay()];
        if (dayMap[dName] !== undefined) {
          dayMap[dName] += s.total;
        }
      }
    }
  });

  const dailyData = [
    { day: 'Lun', sales: dayMap['Lun'] || (sales.length === 0 ? 12500 : 0) },
    { day: 'Mar', sales: dayMap['Mar'] || (sales.length === 0 ? 18900 : 0) },
    { day: 'Mer', sales: dayMap['Mer'] || (sales.length === 0 ? 15400 : 0) },
    { day: 'Jeu', sales: dayMap['Jeu'] || (sales.length === 0 ? 22100 : 0) },
    { day: 'Ven', sales: dayMap['Ven'] || (sales.length === 0 ? 34500 : 0) },
    { day: 'Sam', sales: dayMap['Sam'] || (sales.length === 0 ? 29800 : 0) },
    { day: 'Dim', sales: dayMap['Dim'] || (sales.length === 0 ? 16200 : 0) },
  ];

  // Hourly Sales chart data derived from sales
  const hourMap: Record<string, number> = { '08h': 0, '10h': 0, '12h': 0, '14h': 0, '16h': 0, '18h': 0, '20h': 0 };
  sales.forEach((s) => {
    if (s.date && s.date.includes(' ')) {
      const timePart = s.date.split(' ')[1];
      const hourNum = parseInt(timePart.split(':')[0], 10);
      if (hourNum < 10) hourMap['08h'] += s.total;
      else if (hourNum < 12) hourMap['10h'] += s.total;
      else if (hourNum < 14) hourMap['12h'] += s.total;
      else if (hourNum < 16) hourMap['14h'] += s.total;
      else if (hourNum < 18) hourMap['16h'] += s.total;
      else if (hourNum < 20) hourMap['18h'] += s.total;
      else hourMap['20h'] += s.total;
    }
  });

  const hourlyData = [
    { hour: '08h', sales: hourMap['08h'] || (sales.length === 0 ? 1200 : 0) },
    { hour: '10h', sales: hourMap['10h'] || (sales.length === 0 ? 4500 : 0) },
    { hour: '12h', sales: hourMap['12h'] || (sales.length === 0 ? 8900 : 0) },
    { hour: '14h', sales: hourMap['14h'] || (sales.length === 0 ? 6200 : 0) },
    { hour: '16h', sales: hourMap['16h'] || (sales.length === 0 ? 11200 : 0) },
    { hour: '18h', sales: hourMap['18h'] || (sales.length === 0 ? 14500 : 0) },
    { hour: '20h', sales: hourMap['20h'] || (sales.length === 0 ? 9800 : 0) },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Chart */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-900 dark:text-white text-base">
            Graphique des Ventes Quotidiennes
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Sales Chart */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-900 dark:text-white text-base">
            Graphique des ventes par heure
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Bar dataKey="sales" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Category Chart */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-900 dark:text-white text-base">
            Ventes par Catégorie
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Customers Chart */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-900 dark:text-white text-base">
            Meilleurs Clients
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={topCustomersData}>
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={100} />
                <Tooltip />
                <Bar dataKey="total" fill="#f59e0b" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
