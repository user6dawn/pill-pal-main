import { useEffect, useState } from 'react';
import { Plus, Clock, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ScheduleForm } from './ScheduleForm';

interface Medication {
  id: string;
  drug_name: string;
  dosage: string;
}

interface Schedule {
  id: string;
  medication_id: string;
  time_of_day: string;
  days_of_week: string[];
  is_active: boolean;
  medications?: Medication;
}

export function ScheduleManager() {
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedMedId, setSelectedMedId] = useState<string>('');

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

      const { data: schedulesData } = await supabase
        .from('medication_schedules')
        .select('*, medications(id, drug_name, dosage)')
        .in('medication_id', medsData?.map(m => m.id) || [])
        .order('time_of_day', { ascending: true });

      setMedications(medsData || []);
      setSchedules(schedulesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;

    try {
      await supabase.from('medication_schedules').delete().eq('id', id);
      loadData();
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const handleAddSchedule = (medId: string) => {
    setSelectedMedId(medId);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedMedId('');
    loadData();
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const groupSchedulesByMedication = () => {
    const grouped: Record<string, Schedule[]> = {};
    schedules.forEach(schedule => {
      if (!grouped[schedule.medication_id]) {
        grouped[schedule.medication_id] = [];
      }
      grouped[schedule.medication_id].push(schedule);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading schedules...</div>
      </div>
    );
  }

  const groupedSchedules = groupSchedulesByMedication();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Medication Schedules</h1>
        <p className="text-white mt-1">Set up when you should take each medication</p>
      </div>

      {showForm && (
        <ScheduleForm
          medicationId={selectedMedId}
          medications={medications}
          onClose={handleFormClose}
        />
      )}

      <div className="space-y-4">
        {medications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No active medications</p>
            <p className="text-gray-400 mt-2">Add medications first to create schedules</p>
          </div>
        ) : (
          medications.map((med) => (
            <div key={med.id} className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{med.drug_name}</h2>
                  <p className="text-gray-600">{med.dosage}</p>
                </div>
                <button
                  onClick={() => handleAddSchedule(med.id)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Schedule
                </button>
              </div>

              <div className="p-6">
                {!groupedSchedules[med.id] || groupedSchedules[med.id].length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No schedules set for this medication</p>
                ) : (
                  <div className="space-y-3">
                    {groupedSchedules[med.id].map((schedule) => (
                      <div key={schedule.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <Clock className="w-5 h-5 text-blue-600 mr-3" />
                          <div>
                            <p className="font-medium text-gray-800">{formatTime(schedule.time_of_day)}</p>
                            <p className="text-sm text-gray-600">
                              {schedule.days_of_week.length === 7
                                ? 'Every day'
                                : schedule.days_of_week.join(', ')}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
