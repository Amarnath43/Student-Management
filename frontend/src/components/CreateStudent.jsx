// src/components/CreateStudentModal.jsx
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from '../api';

export default function CreateStudentModal({ isOpen, onClose, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', age: '' });

  useEffect(() => {
    if (!isOpen) setForm({ name: '', email: '', age: '' });
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const submit = async () => {
    if (!form.name.trim()) {
      return Swal.fire('Validation', 'Name is required', 'warning');
    }
    if (!form.email.trim()) {
      return Swal.fire('Validation', 'Email is required', 'warning');
    }
    if (!form.age || isNaN(form.age) || Number(form.age) <= 0) {
      return Swal.fire('Validation', 'Valid age is required', 'warning');
    }

    setLoading(true);
    try {
      const payload = { name: form.name.trim(), email: form.email.trim(), age: Number(form.age) };
      const res = await api.post('/students', payload);
      Swal.fire({ title: 'Created', text: 'Student created successfully', icon: 'success', timer: 1400, showConfirmButton: false });
      if (onCreated) onCreated(res.data);
      setForm({ name: '', email: '', age: '' });
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.error || 'Failed to create student';
      Swal.fire('Error', msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Create Student</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-md p-2"
              placeholder="Full name"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-md p-2"
              placeholder="email@example.com"
              type="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Age</label>
            <input
              name="age"
              value={form.age}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-md p-2"
              type="number"
              min="0"
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button onClick={onClose} className="px-3 py-1 bg-gray-100 rounded-md">Cancel</button>
            <button
              onClick={submit}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
