import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Medication {
  id: string;
  drug_name: string;
  dosage: string;
}

interface SideEffectFormProps {
  onClose: () => void;
}

export function SideEffectForm({ onClose }: SideEffectFormProps) {
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [formData, setFormData] = useState({
    medication_id: '',
    description: '',
    severity: 'mild' as 'mild' | 'moderate' | 'severe',
    occurred_at: new Date().toISOString().slice(0, 16),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      const { data } = await supabase
        .from('medications')
        .select('id, drug_name, dosage')
        .eq('user_id', user?.id)
        .eq('is_active', true);

      setMedications(data || []);
    } catch (error) {
      console.error('Error loading medications:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await supabase.from('side_effects').insert({
        user_id: user?.id,
        medication_id: formData.medication_id,
        description: formData.description,
        severity: formData.severity,
        occurred_at: formData.occurred_at,
      });

      onClose();
    } catch (err) {
      setError('Failed to save side effect');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Report Side Effect</h2>
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
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the side effect you experienced..."
            />
          </div>

          <div>
            <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-1">
              Severity *
            </label>
            <select
              id="severity"
              required
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value as 'mild' | 'moderate' | 'severe' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </div>

          <div>
            <label htmlFor="occurred_at" className="block text-sm font-medium text-gray-700 mb-1">
              When did it occur? *
            </label>
            <input
              id="occurred_at"
              type="datetime-local"
              required
              value={formData.occurred_at}
              onChange={(e) => setFormData({ ...formData, occurred_at: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> If you're experiencing severe side effects, please contact your healthcare provider immediately.
            </p>
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
              {loading ? 'Saving...' : 'Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
