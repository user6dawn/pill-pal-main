import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Medication {
  id: string;
  drug_name: string;
  dosage: string;
}

interface ScheduleFormProps {
  medicationId: string;
  medications: Medication[];
  onClose: () => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function ScheduleForm({ medicationId, medications, onClose }: ScheduleFormProps) {
  const [formData, setFormData] = useState({
    medication_id: medicationId || '',
    time_of_day: '09:00',
    days_of_week: DAYS_OF_WEEK,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleDay = (day: string) => {
    if (formData.days_of_week.includes(day)) {
      setFormData({
        ...formData,
        days_of_week: formData.days_of_week.filter(d => d !== day)
      });
    } else {
      setFormData({
        ...formData,
        days_of_week: [...formData.days_of_week, day]
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.days_of_week.length === 0) {
      setError('Please select at least one day');
      return;
    }

    setLoading(true);

    try {
      await supabase
        .from('medication_schedules')
        .insert({
          medication_id: formData.medication_id,
          time_of_day: formData.time_of_day,
          days_of_week: formData.days_of_week,
        });

      onClose();
    } catch (err) {
      setError('Failed to save schedule');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Add Schedule</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="medication_id" className="block text-sm font-medium text-gray-700 mb-1">
              Medication *
            </label>
            <select
              id="medication_id"
              required
              value={formData.medication_id}
              onChange={(e) => setFormData({ ...formData, medication_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a medication</option>
              {medications.map((med) => (
                <option key={med.id} value={med.id}>
                  {med.drug_name} - {med.dosage}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="time_of_day" className="block text-sm font-medium text-gray-700 mb-1">
              Time of Day *
            </label>
            <input
              id="time_of_day"
              type="time"
              required
              value={formData.time_of_day}
              onChange={(e) => setFormData({ ...formData, time_of_day: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Days of Week *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <label
                  key={day}
                  className="flex items-center p-3 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.days_of_week.includes(day)}
                    onChange={() => toggleDay(day)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{day}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Add Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
