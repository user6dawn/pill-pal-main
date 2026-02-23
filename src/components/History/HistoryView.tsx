import { useEffect, useState } from 'react';
import { Calendar, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface DoseLog {
  id: string;
  medication_id: string;
  scheduled_time: string;
  status: string;
  notes: string | null;
  medications?: {
    drug_name: string;
    dosage: string;
  };
}

interface AdherenceStats {
  total: number;
  taken: number;
  missed: number;
  skipped: number;
  adherenceRate: number;
}

export function HistoryView() {
  const { user } = useAuth();
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');
  const [stats, setStats] = useState<AdherenceStats>({
    total: 0,
    taken: 0,
    missed: 0,
    skipped: 0,
    adherenceRate: 0,
  });

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user, timeRange]);

  const loadHistory = async () => {
    try {
      const now = new Date();
      let startDate = new Date();

      if (timeRange === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (timeRange === 'month') {
        startDate.setDate(now.getDate() - 30);
      } else {
        startDate = new Date(0);
      }

      const { data } = await supabase
        .from('dose_logs')
        .select('*, medications(drug_name, dosage)')
        .eq('user_id', user?.id)
        .gte('scheduled_time', startDate.toISOString())
        .order('scheduled_time', { ascending: false });

      setDoseLogs(data || []);

      const taken = data?.filter(d => d.status === 'taken').length || 0;
      const missed = data?.filter(d => d.status === 'missed').length || 0;
      const skipped = data?.filter(d => d.status === 'skipped').length || 0;
      const total = data?.length || 0;
      const adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 0;

      setStats({ total, taken, missed, skipped, adherenceRate });
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const groupByDate = () => {
    const grouped: Record<string, DoseLog[]> = {};
    doseLogs.forEach(log => {
      const date = formatDate(log.scheduled_time);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(log);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading history...</div>
      </div>
    );
  }

  const groupedLogs = groupByDate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">History & Reports</h1>
        <p className="text-white mt-1">Review your medication adherence and history</p>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => setTimeRange('week')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            timeRange === 'week'
              ? 'bg-white  text-blue-600'
              : 'bg-white text-gray-500 hover:bg-gray-700 hover:text-white'
          }`}
        >
          Last 7 Days
        </button>
        <button
          onClick={() => setTimeRange('month')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            timeRange === 'month'
              ? 'bg-white  text-blue-600'
              : 'bg-white text-gray-500 hover:bg-gray-700 hover:text-white'
          }`}
        >
          Last 30 Days
        </button>
        <button
          onClick={() => setTimeRange('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            timeRange === 'all'
              ? 'bg-white  text-blue-600'
              : 'bg-white text-gray-500 hover:bg-gray-700 hover:text-white'
          }`}
        >
          All Time
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Doses</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
            </div>
            <Calendar className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taken</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.taken}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Missed</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.missed}</p>
            </div>
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Adherence Rate</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.adherenceRate}%</p>
            </div>
            <TrendingUp className="w-10 h-10 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 pb-0">
          <h2 className="text-xl font-semibold text-gray-800">Dose History</h2>
        </div>
        <div className="p-6">
          {doseLogs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No dose logs found</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedLogs).map(([date, logs]) => (
                <div key={date}>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">{date}</h3>
                  <div className="space-y-2">
                    {logs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center flex-1">
                          {log.status === 'taken' ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                          ) : log.status === 'missed' ? (
                            <XCircle className="w-5 h-5 text-red-600 mr-3" />
                          ) : (
                            <Clock className="w-5 h-5 text-orange-600 mr-3" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">
                              {log.medications?.drug_name || 'Unknown'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatDateTime(log.scheduled_time)}
                            </p>
                            {log.notes && (
                              <p className="text-sm text-gray-500 mt-1">{log.notes}</p>
                            )}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          log.status === 'taken'
                            ? 'bg-green-100 text-green-700'
                            : log.status === 'missed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
