import { useEffect, useState } from 'react';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { SideEffectForm } from './SideEffectForm';

interface Medication {
  id: string;
  drug_name: string;
  dosage: string;
}

interface SideEffect {
  id: string;
  medication_id: string;
  description: string;
  severity: string;
  occurred_at: string;
  medications?: Medication;
}

export function SideEffectsTracker() {
  const { user } = useAuth();
  const [sideEffects, setSideEffects] = useState<SideEffect[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (user) {
      loadSideEffects();
    }
  }, [user]);

  const loadSideEffects = async () => {
    try {
      const { data } = await supabase
        .from('side_effects')
        .select('*, medications(id, drug_name, dosage)')
        .eq('user_id', user?.id)
        .order('occurred_at', { ascending: false });

      setSideEffects(data || []);
    } catch (error) {
      console.error('Error loading side effects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this side effect record?')) return;

    try {
      await supabase.from('side_effects').delete().eq('id', id);
      loadSideEffects();
    } catch (error) {
      console.error('Error deleting side effect:', error);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    loadSideEffects();
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'moderate':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'severe':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading side effects...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Side Effects</h1>
          <p className="text-white mt-1">Track and monitor medication side effects</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Report Side Effect
        </button>
      </div>

      {showForm && (
        <SideEffectForm onClose={handleFormClose} />
      )}

      <div className="space-y-4">
        {sideEffects.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No side effects reported</p>
            <p className="text-gray-400 mt-2">Click "Report Side Effect" to add one</p>
          </div>
        ) : (
          sideEffects.map((effect) => (
            <div key={effect.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-start">
                    <AlertCircle className="w-6 h-6 text-orange-600 mr-3 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {effect.medications?.drug_name || 'Unknown Medication'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(effect.severity)}`}>
                          {effect.severity}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{effect.medications?.dosage}</p>
                      <p className="text-gray-800 mb-3">{effect.description}</p>
                      <p className="text-sm text-gray-500">
                        Occurred: {formatDateTime(effect.occurred_at)}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(effect.id)}
                  className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {sideEffects.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> If you experience severe side effects, please contact your healthcare provider immediately.
          </p>
        </div>
      )}
    </div>
  );
}
