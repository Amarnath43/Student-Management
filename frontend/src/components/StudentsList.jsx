// src/components/StudentsList.jsx
import React, { useEffect, useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import api from '../api';

/* Memoized row to avoid re-rendering all rows when modal/marks state changes */
const StudentRow = React.memo(function StudentRow({ index, serial, student, onViewMarks, onEdit, onDelete }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 text-sm text-gray-700">{serial}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{student.name}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{student.email}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{student.age}</td>
      <td className="px-4 py-3 text-sm text-gray-700 space-x-2">
        <button onClick={() => onViewMarks(student)} className="px-3 py-1 bg-blue-500 text-white rounded text-sm">View Marks</button>
        <button onClick={() => onEdit(student)} className="px-3 py-1 bg-yellow-400 text-white rounded text-sm">Edit</button>
        <button onClick={() => onDelete(student._id)} className="px-3 py-1 bg-red-500 text-white rounded text-sm">Delete</button>
      </td>
    </tr>
  );
});

const StudentCard = React.memo(function StudentCard({ serial, student, onViewMarks, onEdit, onDelete }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-indigo-600 grid place-items-center text-white font-semibold">
            {String(student.name || 'S').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{student.name}</div>
            <div className="text-xs text-gray-500 mt-0.5">{student.email}</div>
          </div>
        </div>

        <div className="text-sm text-gray-500">#{serial}</div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-gray-700">Age: <span className="font-medium">{student.age}</span></div>

        <div className="flex items-center gap-2">
          <button onClick={() => onViewMarks(student)} className="px-2 py-1 bg-blue-500 text-white rounded text-xs">View</button>
          <button onClick={() => onEdit(student)} className="px-2 py-1 bg-yellow-400 text-white rounded text-xs">Edit</button>
          <button onClick={() => onDelete(student._id)} className="px-2 py-1 bg-red-500 text-white rounded text-xs">Delete</button>
        </div>
      </div>
    </div>
  );
});

export default function StudentsList({ reload = 0 }) {
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  // separate loading flags
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [marksLoading, setMarksLoading] = useState(false);

  // modal/marks state
  const [marksModalOpen, setMarksModalOpen] = useState(false);
  const [activeStudent, setActiveStudent] = useState(null);
  const [activeMarks, setActiveMarks] = useState([]);
  const [addingMark, setAddingMark] = useState(false);
  const [markForm, setMarkForm] = useState({ subject: '', marks: '' });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState(null);

  // fetch students (separate loading)
  const fetchStudents = useCallback(async () => {
    try {
      setStudentsLoading(true);
      const res = await api.get(`/students?page=${page}&limit=${limit}`);
      setStudents(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to fetch students', 'error');
    } finally {
      setStudentsLoading(false);
    }
  }, [page, limit]);

  // effect: fetch on mount / page / reload
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents, reload]);

  // viewMarks opens modal immediately and fetches marks into modal state
  const viewMarks = useCallback(async (student) => {
    setActiveStudent(student);
    setActiveMarks([]);
    setMarksModalOpen(true);

    try {
      setMarksLoading(true);
      const res = await api.get(`/students/${student._id}`); // { student, marks }
      setActiveMarks(res.data.marks || []);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to fetch marks', 'error');
    } finally {
      setMarksLoading(false);
    }
  }, []);

  // delete handler (memoized so rows see stable reference)
  const deleteStudent = useCallback(async (studentId) => {
    const { isConfirmed } = await Swal.fire({
      title: 'Delete student?',
      text: 'This will remove the student and all their marks.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
    });
    if (!isConfirmed) return;
    try {
      await api.delete(`/students/${studentId}`);
      Swal.fire('Deleted', 'Student removed', 'success');
      fetchStudents();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to delete student', 'error');
    }
  }, [fetchStudents]);

  const openEdit = useCallback((student) => {
    setEditStudent({ ...student });
    setEditModalOpen(true);
  }, []);

  const submitEdit = useCallback(async () => {
    try {
        //client-side validation    
    
    if (!editStudent.name.trim()) { 
      return Swal.fire('Validation', 'Name is required', 'warning');
    }       
    if (!editStudent.email.trim()) {
      return Swal.fire('Validation', 'Email is required', 'warning');
    }
    if (!editStudent.age || isNaN(editStudent.age) || Number(editStudent.age) <= 0) {
      return Swal.fire('Validation', 'Valid age is required', 'warning');
    }   

      await api.put(`/students/${editStudent._id}`, {
        name: editStudent.name,
        email: editStudent.email,
        age: Number(editStudent.age)
      });
      
      Swal.fire({ title: 'Updated', icon: 'success', timer: 1000, showConfirmButton: false });
      setEditModalOpen(false);
      fetchStudents();

    } catch (err) {
      console.error(err);

      // 1. Extract the data safely
      const data = err?.response?.data;

      // 2. Check for Zod/Validation specific 'details' array
      let errorMessage = 'Failed to update'; // Default fallback

      if (data?.details && Array.isArray(data.details) && data.details.length > 0) {
        
        errorMessage = data.details.map(d => d.message).join('\n');
      } else if (data?.error) {
        // Fallback to the generic "Validation failed" message
        errorMessage = data.error;
      }

      // 3. Show the specific message
      Swal.fire('Error', errorMessage, 'error');
    }
  }, [editStudent, fetchStudents]);

  // addMark (keeps marksLoading separate)
  const addMark = useCallback(async () => {
    if (!markForm.subject) {
      return Swal.fire('Validation', 'Please provide subject', 'warning');
    }

    if (markForm.marks === '') {   
        return Swal.fire('Validation', 'Please provide marks', 'warning');
    }

    try {
      setAddingMark(true);
      await api.post('/marks', {
        studentId: activeStudent._id,
        subject: markForm.subject.trim(),
        marks: Number(markForm.marks)
      });
      const res = await api.get(`/students/${activeStudent._id}`);
      setActiveMarks(res.data.marks || []);
      setMarkForm({ subject: '', marks: '' });
      Swal.fire({ title: 'Added', icon: 'success', timer: 900, showConfirmButton: false });
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err?.response?.data?.error || 'Failed to add mark', 'error');
    } finally {
      setAddingMark(false);
    }
  }, [markForm, activeStudent]);


  // delete a single subject for the active student
const deleteSubject = async (subject) => {
  const { isConfirmed } = await Swal.fire({
    title: `Delete "${subject}"?`,
    text: 'This will remove this subject entry from the student.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete'
  });
  if (!isConfirmed) return;

  try {
    // Assumed backend endpoint: DELETE /api/marks/student/:studentId/subject
    // axios requires the body in `data` for DELETE
    await api.delete(`/marks/student/${activeStudent._id}/subject`, { data: { subject } });

    // Optimistically update UI by removing subject from activeMarks
    setActiveMarks(prev => prev.filter(m => m.subject !== subject));

    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Subject deleted', showConfirmButton: false, timer: 1200 });
  } catch (err) {
    console.error(err);
    Swal.fire('Error', err?.response?.data?.error || 'Failed to delete subject', 'error');
  }
};


  const offset = (page - 1) * limit;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      {/* Desktop / Tablet Table (sm and up) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {studentsLoading ? (
              <tr><td colSpan="5" className="px-4 py-4">Loading students...</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan="5" className="px-4 py-4 text-sm text-gray-600">No students found</td></tr>
            ) : (
              students.map((student, idx) => (
                <StudentRow
                  key={student._id}
                  index={idx}
                  serial={offset + idx + 1}
                  student={student}
                  onViewMarks={viewMarks}
                  onEdit={openEdit}
                  onDelete={deleteStudent}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards (sm:hidden) */}
      <div className="sm:hidden space-y-3">
        {studentsLoading ? (
          <div className="text-sm text-gray-600">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="text-sm text-gray-600">No students found</div>
        ) : (
          students.map((student, idx) => (
            <StudentCard
              key={student._id}
              serial={offset + idx + 1}
              student={student}
              onViewMarks={viewMarks}
              onEdit={openEdit}
              onDelete={deleteStudent}
            />
          ))
        )}
      </div>

      {/* pagination */}
      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-sm text-gray-600">Page {page} of {Math.max(1, Math.ceil(total / limit))} • {total} students</div>
        <div className="flex items-center">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            disabled={page >= Math.max(1, Math.ceil(total / limit))}
            onClick={() => setPage(p => Math.min(Math.max(1, Math.ceil(total / limit)), p + 1))}
            className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Marks Modal (keeps separate loading) */}
{marksModalOpen && activeStudent && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    aria-modal="true"
    role="dialog"
  >
    {/* backdrop */}
    <div
      className="absolute inset-0 bg-black/40"
      onClick={() => setMarksModalOpen(false)}
    />

    {/* modal */}
    <div className="relative w-full max-w-md transform rounded-lg bg-white shadow-xl ring-1 ring-black/5 animate-[fadeIn_160ms_ease]">
      {/* header */}
      <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-600 grid place-items-center text-white font-semibold">
            {String(activeStudent.name || 'S').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Marks for {activeStudent.name}</div>
          </div>
        </div>

        <button
          onClick={() => setMarksModalOpen(false)}
          className="inline-flex h-9 w-9 items-center justify-center rounded hover:bg-gray-100 text-gray-600"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* body */}
      <div className="px-5 py-4">
        {/* marks list */}
        <div className="max-h-64 overflow-auto space-y-3">
          {marksLoading ? (
            <div className="text-sm text-gray-600 text-center">Loading marks...</div>
          ) : activeMarks.length === 0 ? (
            <div className="rounded-md border border-dashed border-gray-200 p-5 text-center text-gray-500">
              <div className="mb-2 text-sm">No marks found</div>
              <div className="text-xs">Use the form below to add the first subject.</div>
            </div>
          ) : (
            <ul className="space-y-2">
              {activeMarks.map((m, i) => (
                <li key={i} className="flex items-center justify-between gap-3 rounded p-2 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-100 grid place-items-center text-sm font-semibold text-gray-700">
                      {String(m.subject || '').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{m.subject}</div>
                      <div className="text-xs text-gray-500">Subject</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-gray-50 px-3 py-1 text-sm font-medium text-gray-800">{m.marks}</div>

                    {/* delete subject button */}
                    <button
                      onClick={() => deleteSubject(m.subject)}
                      className="inline-flex items-center justify-center h-8 w-8 rounded hover:bg-red-50 text-red-600"
                      title={`Delete ${m.subject}`}
                      aria-label={`Delete ${m.subject}`}
                    >
                      {/* small trash icon (svg) */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H3a1 1 0 100 2h14a1 1 0 100-2h-2V3a1 1 0 00-1-1H6zm2 6a1 1 0 10-2 0v6a1 1 0 102 0V8zm4 0a1 1 0 10-2 0v6a1 1 0 102 0V8z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="my-4 border-t" />

        {/* add marks */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-700">Add Marks</h4>

          <div className="flex gap-2">
            <input
              placeholder="Subject"
              value={markForm.subject}
              onChange={(e) => setMarkForm(prev => ({ ...prev, subject: e.target.value }))}
              className="flex-1 rounded-md border px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-300"
            />
            <input
              placeholder="Marks"
              value={markForm.marks}
              onChange={(e) => setMarkForm(prev => ({ ...prev, marks: e.target.value }))}
              type="number"
              className="w-24 rounded-md border px-3 py-2 text-sm text-right placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-300"
            />
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => setMarksModalOpen(false)}
              className="px-3 py-1 rounded-md bg-gray-100 text-sm text-gray-700 hover:bg-gray-200"
            >
              Close
            </button>

            <button
              onClick={addMark}
              disabled={addingMark}
              className="px-3 py-1 rounded-md bg-blue-600 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {addingMark ? 'Saving...' : 'Add Marks'}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}


      {/* Edit Modal (unchanged) */}
      {editModalOpen && editStudent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded shadow-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Edit Student</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-gray-500">Close</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm">Name</label>
                <input name="name" value={editStudent.name} onChange={(e) => setEditStudent(prev => ({ ...prev, name: e.target.value }))} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm">Email</label>
                <input name="email" value={editStudent.email} onChange={(e) => setEditStudent(prev => ({ ...prev, email: e.target.value }))} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm">Age</label>
                <input name="age" type="number" value={editStudent.age} onChange={(e) => setEditStudent(prev => ({ ...prev, age: e.target.value }))} className="w-full border p-2 rounded" />
              </div>

              <div className="flex justify-end space-x-2 mt-2">
                <button onClick={() => setEditModalOpen(false)} className="px-3 py-1 bg-gray-100 rounded">Cancel</button>
                <button onClick={submitEdit} className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
