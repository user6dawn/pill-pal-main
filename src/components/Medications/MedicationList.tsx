import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Pill } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { MedicationForm } from './MedicationForm';

interface Medication {
  id: string;
  drug_name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  is_active: boolean;
}

export function MedicationList() {
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);

  useEffect(() => {
    if (user) {
      loadMedications();
    }
  }, [user]);

  const loadMedications = async () => {
    try {
      const { data } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      setMedications(data || []);
    } catch (error) {
      console.error('Error loading medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medication?')) return;

    try {
      await supabase.from('medications').delete().eq('id', id);
      loadMedications();
    } catch (error) {
      console.error('Error deleting medication:', error);
    }
  };

  const handleEdit = (med: Medication) => {
    setEditingMed(med);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingMed(null);
    loadMedications();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading medications...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Medications</h1>
          <p className="text-white mt-1">Manage your medication list</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Medication
        </button>
      </div>

      {showForm && (
        <MedicationForm
          medication={editingMed}
          onClose={handleFormClose}
        />
      )}

      <div className="grid grid-cols-1 gap-4">
        {medications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No medications added yet</p>
            <p className="text-gray-400 mt-2">Click "Add Medication" to get started</p>
          </div>
        ) : (
          medications.map((med) => (
            <div key={med.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center">
                    <Pill className="w-6 h-6 text-blue-600 mr-3" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{med.drug_name}</h3>
                      <p className="text-gray-600 mt-1">
                        {med.dosage} - {med.frequency}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="text-gray-800">{formatDate(med.start_date)}</p>
                    </div>
                    {med.end_date && (
                      <div>
                        <p className="text-sm text-gray-500">End Date</p>
                        <p className="text-gray-800">{formatDate(med.end_date)}</p>
                      </div>
                    )}
                  </div>

                  {med.notes && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Notes</p>
                      <p className="text-gray-800">{med.notes}</p>
                    </div>
                  )}

                  <div className="mt-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      med.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {med.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(med)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(med.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
