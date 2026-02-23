import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Medication {
  id: string;
  drug_name: string;
  dosage: string;
}

interface DoseLog {
  id: string;
  medication_id: string;
  scheduled_time: string;
  actual_time: string | null;
  status: string;
  notes: string | null;
  medications?: Medication;
}

export function DoseLogger() {
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [todayDoses, setTodayDoses] = useState<DoseLog[]>([]);
  const [selectedMedId, setSelectedMedId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const { data: medsData } = await supabase
        .from('medications')
        .select('id, drug_name, dosage')
        .eq('user_id', user?.id)
        .eq('is_active', true);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: logsData } = await supabase
        .from('dose_logs')
        .select('*, medications(id, drug_name, dosage)')
        .eq('user_id', user?.id)
        .gte('scheduled_time', today.toISOString())
        .lt('scheduled_time', tomorrow.toISOString())
        .order('scheduled_time', { ascending: false });

      setMedications(medsData || []);
      setTodayDoses(logsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const logDose = async (status: 'taken' | 'missed' | 'skipped') => {
    if (!selectedMedId) {
      alert('Please select a medication');
      return;
    }

    try {
      await supabase.from('dose_logs').insert({
        user_id: user?.id,
        medication_id: selectedMedId,
        scheduled_time: new Date().toISOString(),
        actual_time: status === 'taken' ? new Date().toISOString() : null,
        status,
        notes: notes || null,
      });

      setSelectedMedId('');
      setNotes('');
      loadData();
    } catch (error) {
      console.error('Error logging dose:', error);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Log Dose</h1>
        <p className="text-white mt-1">Record when you take your medications</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Log</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="medication" className="block text-sm font-medium text-gray-700 mb-1">
              Select Medication
            </label>
            <select
              id="medication"
              value={selectedMedId}
              onChange={(e) => setSelectedMedId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose a medication</option>
              {medications.map((med) => (
                <option key={med.id} value={med.id}>
                  {med.drug_name} - {med.dosage}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any notes about this dose..."
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => logDose('taken')}
              disabled={!selectedMedId}
              className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* <CheckCircle className="w-5 h-5 mr-2" /> */}
              Taken
            </button>
            <button
              onClick={() => logDose('missed')}
              disabled={!selectedMedId}
              className="flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* <XCircle className="w-5 h-5 mr-2" /> */}
              Missed
            </button>
            <button
              onClick={() => logDose('skipped')}
              disabled={!selectedMedId}
              className="flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* <Clock className="w-5 h-5 mr-2" /> */}
              Skipped
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 pb-0">
          <h2 className="text-xl font-semibold text-gray-800">Today's Logs</h2>
        </div>
        <div className="p-6">
          {todayDoses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No doses logged today</p>
          ) : (
            <div className="space-y-3">
              {todayDoses.map((log) => (
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
                        {formatDateTime(log.actual_time || log.scheduled_time)}
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
          )}
        </div>
      </div>
    </div>
  );
}
