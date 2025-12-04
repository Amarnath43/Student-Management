import React, { useState } from 'react';
import StudentsList from '../components/StudentsList';
import CreateStudentModal from '../components/CreateStudent';

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const handleCreated = (student) => {
    // bump reload key so StudentsList refetches
    setReloadKey(k => k + 1);
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800 sm:text-2xl ">Student Management</h1>
            <p className="text-sm text-gray-600 mt-1 sm:text-md ">
              Manage students and their marks. Add, edit, view and delete students. Click a row's
              <span className="ml-1 font-medium">View Marks</span> to add marks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow"
              aria-label="Add student"
            >
              {/* simple plus icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span className="sm:inline text-sm">Add Student</span>
            </button>
          </div>
        </header>

        <main>
          <StudentsList reload={reloadKey} />
        </main>
      </div>

      <CreateStudentModal isOpen={modalOpen} onClose={closeModal} onCreated={handleCreated} />
    </div>
  );
}
