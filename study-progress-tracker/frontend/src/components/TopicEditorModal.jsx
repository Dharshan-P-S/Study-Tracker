// frontend/src/components/TopicEditorModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { updateTopic, deleteTopic } from '../api/topicApi';

Modal.setAppElement('#root');

const TopicEditorModal = ({ isOpen, onRequestClose, topic, onTopicUpdate }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (topic) {
      setTitle(topic.title || '');
      setDueDate(topic.dueDate ? new Date(topic.dueDate) : null);
    } else {
      setTitle('');
      setDueDate(null);
    }
  }, [topic]);

  // helper: startOfDay
  const startOfDay = (d) => {
    const x = new Date(d);
    x.setHours(0,0,0,0);
    return x;
  };

  // helper: is same date (local)
  const sameDate = (a,b) => {
    if (!a || !b) return false;
    return startOfDay(a).getTime() === startOfDay(b).getTime();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!topic) return;
    setSaving(true);

    try {
      const originalDue = topic.dueDate ? new Date(topic.dueDate) : null;
      const now = new Date();
      const todayStart = startOfDay(now);

      // 1) If original topic was outdated & unfinished (date part < today and status !== Fully Studied)
      const wasOutdatedUnfinished = originalDue && startOfDay(originalDue) < todayStart && topic.status !== 'Fully Studied';

      // 2) If user attempts to move an outdated unfinished topic to a future date (reschedule)
      if (wasOutdatedUnfinished && dueDate) {
        // allow if original dueDate is today but time passed (i.e., same date and originalDue < now) => allowed
        const originalIsTodayButTimePassed = originalDue && sameDate(originalDue, now) && originalDue < now;
        // if new dueDate is in future (date part > todayStart) and original is truly past (not the allowed today-time-over), block
        if (!originalIsTodayButTimePassed && startOfDay(dueDate) >= new Date(todayStart.getTime() + 24*60*60*1000)) {
          // user is trying to set future date (or tomorrow+) — block
          alert("Rescheduling a past unfinished topic is not allowed. To preserve accountability you can recreate the topic instead (use 'Recreate from last unfinished').");
          setSaving(false);
          return;
        }
      }

      // 3) If user sets dueDate to a past date (date part < today start), ask whether to mark Fully Studied
      let payload = { title, dueDate: dueDate ? dueDate : undefined };
      if (dueDate && startOfDay(dueDate) < todayStart) {
        // confirm marking as fully studied
        const confirmMark = window.confirm("You set the due date to a past date. Would you like to mark this topic as Fully Studied?");
        if (confirmMark) {
          payload.status = 'Fully Studied';
        }
      }

      // If dueDate is today but time already passed: editing allowed (user wanted that)
      // Send update
      await updateTopic(topic._id, payload);

      onTopicUpdate();
      onRequestClose();
    } catch (error) {
      console.error("Failed to update topic", error);
      alert("Error saving topic.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!topic) return;
    if (window.confirm(`Are you sure you want to delete the topic "${topic.title}"?`)) {
      try {
        await deleteTopic(topic._id);
        onTopicUpdate();
        onRequestClose();
      } catch (error) {
        console.error("Failed to delete topic", error);
        alert("Error deleting topic.");
      }
    }
  };

  if (!topic) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onRequestClose={onRequestClose} 
      contentLabel="Edit Topic"
      className="p-8 bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg border border-slate-200 dark:border-slate-700 focus:outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-75 flex justify-center items-center"
    >
      <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Edit Topic</h2>
      <form onSubmit={handleSave}>
        <div className="mb-4">
          <label className="block mb-1 font-semibold text-slate-600 dark:text-slate-300">Title</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 font-semibold text-slate-600 dark:text-slate-300">Due Date (Optional)</label>
          <DatePicker
            selected={dueDate}
            onChange={(date) => setDueDate(date)}
            showTimeSelect
            timeIntervals={15} 
            dateFormat="Pp"
            isClearable
            placeholderText="Click to select date and time"
            className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex justify-between items-center">
          <button 
            type="button" 
            onClick={handleDelete} 
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            disabled={saving}
          >
            Delete Topic
          </button>
          <div className="flex gap-4">
            <button type="button" onClick={onRequestClose} className="bg-slate-500 text-white px-4 py-2 rounded-md hover:bg-slate-600" disabled={saving}>Cancel</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default TopicEditorModal;
