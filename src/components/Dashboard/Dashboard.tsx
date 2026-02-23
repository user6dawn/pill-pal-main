import { useEffect, useState } from 'react';
import { Calendar, Pill, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Medication {
  id: string;
  drug_name: string;
  dosage: string;
  frequency: string;
}

interface DoseLog {
  id: string;
  medication_id: string;
  scheduled_time: string;
  status: string;
  medications?: Medication;
}

interface TodayStats {
  total: number;
  taken: number;
  missed: number;
  pending: number;
}

export function Dashboard() {
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [todayDoses, setTodayDoses] = useState<DoseLog[]>([]);
  const [stats, setStats] = useState<TodayStats>({ total: 0, taken: 0, missed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const { data: medsData } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: logsData } = await supabase
        .from('dose_logs')
        .select('*, medications(*)')
        .eq('user_id', user?.id)
        .gte('scheduled_time', today.toISOString())
        .lt('scheduled_time', tomorrow.toISOString())
        .order('scheduled_time', { ascending: true });

      setMedications(medsData || []);
      setTodayDoses(logsData || []);

      const taken = logsData?.filter(d => d.status === 'taken').length || 0;
      const missed = logsData?.filter(d => d.status === 'missed').length || 0;
      const pending = logsData?.filter(d => d.status !== 'taken' && d.status !== 'missed').length || 0;

      setStats({
        total: logsData?.length || 0,
        taken,
        missed,
        pending
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-white mt-1 ">Welcome back! Here's your medication for today.</p>
      </div>

      <div >
        <div className="bg-white rounded-lg shadow p-20 pt-6 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-black mt-1">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Doses</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-black mt-1">{stats.missed}</p>
              <p className="text-sm text-gray-600">Missed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-black mt-1">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div className=' justify-between'>
            <p className="text-3xl font-bold text-black mt-1">{stats.taken}</p>
           <p className="text-sm text-gray-600">Taken</p>
            </div>
          </div>
        </div>


      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 ">
            <h2 className="text-xl font-semibold text-gray-800">Active Medications</h2>
          </div>
          <div className="p-6">
            {medications.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No active medications</p>
            ) : (
              <div className="space-y-3">
                {medications.map((med) => (
                  <div key={med.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Pill className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-800">{med.drug_name}</p>
                      <p className="text-sm text-gray-600">{med.dosage} - {med.frequency}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 ">
            <h2 className="text-xl font-semibold text-gray-800">Today's Schedule</h2>
          </div>
          <div className="p-6">
            {todayDoses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No doses scheduled for today</p>
            ) : (
              <div className="space-y-3">
                {todayDoses.map((dose) => (
                  <div key={dose.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-800">
                          {dose.medications?.drug_name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600">{formatTime(dose.scheduled_time)}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      dose.status === 'taken'
                        ? 'bg-green-100 text-green-700'
                        : dose.status === 'missed'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {dose.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
