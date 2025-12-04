// frontend/src/pages/StudyBoardPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import Modal from 'react-modal';
import { useParams, Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { DndContext, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

import { getTopicsForSubject, createTopicForSubject, updateTopicStatus, getTopicById, updateTopicNotes } from '../api/topicApi';
import { getSubjectById } from '../api/subjectsApi';
import { logStudySession } from '../api/sessionApi';
import { getImagesForSubject } from '../api/imageApi';

import Timer from '../components/Timer';
import TopicEditorModal from '../components/TopicEditorModal';
import ImageUploadModal from '../components/ImageUploadModal';
import ImageViewerModal from '../components/ImageViewerModal';
import NotesModal from '../components/NotesModal';

Modal.setAppElement('#root');

// --- Small icons ---
const NotesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.536a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L15.232 5.232z" />
  </svg>
);

// --- ImageCard (defined before usage to avoid ImageCard undefined error) ---
const ImageCard = ({ image, onClick }) => {
  const statusColors = { 'To Study': 'border-blue-500', 'Partially Studied': 'border-yellow-500', 'Fully Studied': 'border-green-500', 'To Be Revised': 'border-red-500' };
  return (
    <div onClick={onClick} className={`w-48 flex-shrink-0 border-t-4 ${statusColors[image.status]} rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-slate-800`}>
      <img src={image.imageUrl} alt={image.description} className="w-full h-32 object-contain rounded-t-sm" />
      <div className="p-2"><p className="text-sm text-slate-600 dark:text-slate-300 truncate">{image.description || 'No description'}</p></div>
    </div>
  );
};

// --- TopicCard ---
const TopicCard = ({ topic, onEditClick, onNotesClick, isDragging, isOverlay, isAnyEditing }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: topic._id });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging || isOverlay ? 0 : 1,
    cursor: 'grab',
    transition: isOverlay ? 'none' : 'box-shadow 150ms ease, transform 150ms ease',
  };

  const isOverdue = topic.dueDate && new Date(topic.dueDate) < new Date() && topic.status !== 'Fully Studied';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`relative p-4 rounded-lg transition-all ${isOverlay ? 'shadow-2xl scale-[1.02]' : 'shadow-sm hover:shadow-md'} 
                  ${isOverdue ? 'bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'}`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 pr-10">
          <h4 className={`font-semibold mb-2 ${isOverdue ? 'text-red-800 dark:text-red-200' : 'text-slate-800 dark:text-slate-100'}`}>{topic.title}</h4>
          <div className="flex items-center gap-2">
            {topic.notes && topic.notes.length > 0 && <NotesIcon />}
            {/* badges */}
            {topic.dueDate && new Date(topic.dueDate) < (new Date()) && topic.status !== 'Fully Studied' && (
              <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">Unfinished (Past Due)</span>
            )}
            {topic.status === 'Fully Studied' && (
              <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">Completed</span>
            )}
          </div>
          {topic.dueDate && (
            <p className={`text-xs mt-1 font-medium ${isOverdue ? 'text-red-600 dark:text-red-300' : 'text-slate-500 dark:text-slate-400'}`}>
              Due: {new Date(topic.dueDate).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
              {isOverdue && " (Overdue)"}
            </p>
          )}
        </div>
      </div>
      {!isAnyEditing && (
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1">
          <button onClick={(e) => { e.stopPropagation(); onEditClick(); }} onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full p-2 shadow-sm hover:shadow-md" aria-label="Edit topic"><EditIcon /></button>
          <button onClick={(e) => { e.stopPropagation(); onNotesClick(); }} onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full p-2 shadow-sm hover:shadow-md" aria-label="Edit notes"><NotesIcon /></button>
        </div>
      )}
    </div>
  );
};

// --- Column ---
const Column = ({ id, title, topics, onTopicClick, onNotesClick, activeId, isAnyEditing }) => {
  const { setNodeRef } = useDroppable({ id });
  const statusColors = { 'To Study': 'border-blue-500', 'Partially Studied': 'border-yellow-500', 'Fully Studied': 'border-green-500', 'To Be Revised': 'border-red-500' };
  return (
    <div className={`bg-slate-100 dark:bg-slate-800/50 rounded-lg flex-1 border-t-4 ${statusColors[id]}`}>
      <h3 className="font-bold p-4 text-lg text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700">{title}</h3>
      <div ref={setNodeRef} className="p-4 space-y-3 min-h-[200px]">
        {topics.length > 0 ? (
          topics.map(topic => <TopicCard key={topic._id} topic={topic} onEditClick={() => onTopicClick(topic)} onNotesClick={() => onNotesClick(topic)} isDragging={activeId === topic._id} isAnyEditing={isAnyEditing} />)
        ) : (
          <div className="flex items-center justify-center h-full text-center text-sm text-slate-500 dark:text-slate-400 py-4">Drop topics here.</div>
        )}
      </div>
    </div>
  );
};

// --- Main Page ---
const StudyBoardPage = () => {
  const { subjectId } = useParams();
  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [images, setImages] = useState([]);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDueDate, setNewTopicDueDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);
  const [editingTopic, setEditingTopic] = useState(null);
  const [activeId, setActiveId] = useState(null);

  // Recreate modal state
  const [matchedTopics, setMatchedTopics] = useState([]);
  const [isRecreateOpen, setIsRecreateOpen] = useState(false);
  const [copyNotes, setCopyNotes] = useState(true);

  useEffect(() => {
    // restore open modal if any
    const stored = localStorage.getItem('openModal');
    if (!stored) return;
    try {
      const { type, id } = JSON.parse(stored);
      if (type === 'topic' || type === 'notes') {
        const topic = topics.find(t => t._id === id);
        if (topic) {
          if (type === 'topic') {
            setEditingTopic(topic);
            setIsModalOpen(true);
          } else {
            setEditingTopic(topic);
            setIsNotesModalOpen(true);
          }
        } else localStorage.removeItem('openModal');
      } else if (type === 'image') {
        const image = images.find(img => img._id === id);
        if (image) {
          setViewingImage(image);
          setIsViewerOpen(true);
        } else localStorage.removeItem('openModal');
      }
    } catch (err) {
      console.error('Failed to restore modal', err);
      localStorage.removeItem('openModal');
    }
  }, [topics, images]);

  const activeTopic = useMemo(() => topics.find(topic => topic._id === activeId), [activeId, topics]);

  const fetchAllData = () => {
    getSubjectById(subjectId).then(setSubject).catch(console.error);
    getTopicsForSubject(subjectId).then(setTopics).catch(console.error);
    getImagesForSubject(subjectId).then(setImages).catch(console.error);
  };

  useEffect(() => {
    fetchAllData();
  }, [subjectId]);

  const columns = useMemo(() => ({
    'To Study': topics.filter(t => t.status === 'To Study'),
    'Partially Studied': topics.filter(t => t.status === 'Partially Studied'),
    'Fully Studied': topics.filter(t => t.status === 'Fully Studied'),
    'To Be Revised': topics.filter(t => t.status === 'To Be Revised'),
  }), [topics]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;
    const topicId = active.id;
    const newStatus = over.id;
    const originalTopic = topics.find((t) => t._id === topicId);
    if (originalTopic && originalTopic.status !== newStatus) {
      const validStatuses = ['To Study', 'Partially Studied', 'Fully Studied', 'To Be Revised'];
      if (!validStatuses.includes(newStatus)) return;
      setTopics(prev => prev.map(t => (t._1d === topicId ? { ...t, status: newStatus } : t)));
      try {
        await updateTopicStatus(topicId, newStatus);
      } catch (error) {
        console.error('Failed to update topic status', error);
        setTopics(prev => prev.map(t => (t._id === topicId ? originalTopic : t)));
      }
    }
  };

  // Helper: start-of-day for a date
  const startOfDay = (d) => {
    const x = new Date(d);
    x.setHours(0,0,0,0);
    return x;
  };

  // Duplicate check: compute whether a non-outdated topic with same title already exists
  const computeDuplicateExists = () => {
    const norm = newTopicTitle.trim().toLowerCase();
    if (!norm) return false;
    const todayStart = startOfDay(new Date());
    return topics.some(t => {
      if (!t.title) return false;
      if (t.title.trim().toLowerCase() !== norm) return false;
      // If the topic has no dueDate -> treat as "not outdated" (so count as duplicate)
      if (!t.dueDate) return true;
      // If dueDate start >= todayStart => not outdated (count as duplicate)
      const dueStart = startOfDay(new Date(t.dueDate));
      return dueStart >= todayStart;
    });
  };

  const duplicateExists = computeDuplicateExists();

  // Add topic button behaviour:
  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;

    // If a non-outdated duplicate exists, block creation
    if (duplicateExists) {
      alert('A topic with this title already exists and is not past due. Please edit the existing topic or change the title before adding a duplicate.');
      return;
    }

    // If a due date was selected and it's in the past (date only), block creation
    if (newTopicDueDate) {
      // compare date parts: if selected date's start < today's start => it's a past date
      if (startOfDay(newTopicDueDate) < startOfDay(new Date())) {
        alert("You cannot add a new topic with a past due date. For productivity/detox, create it for today or a future date.");
        return;
      }
    }

    // create normally
    try {
      await createTopicForSubject(subjectId, { title: newTopicTitle.trim(), dueDate: newTopicDueDate });
      setNewTopicTitle('');
      setNewTopicDueDate(null);
      fetchAllData();
    } catch (error) {
      console.error('Failed to add topic', error);
      alert('Failed to add topic. See console.');
    }
  };

  // Find matches (exact title, outdated (dueDate < today start) and unfinished)
  const findMatchesForTitle = (title) => {
    const norm = title.trim().toLowerCase();
    if (!norm) return [];
    const todayStart = startOfDay(new Date());
    const candidates = topics.filter(t => {
      if (!t.title || !t.dueDate) return false;
      const due = new Date(t.dueDate);
      const isPastDate = startOfDay(due) < todayStart;
      const unfinished = t.status !== 'Fully Studied';
      return t.title.trim().toLowerCase() === norm && isPastDate && unfinished;
    });
    if (candidates.length === 0) return [];
    // choose the one with latest dueDate among matches (A: choose latest dueDate)
    candidates.sort((a,b) => new Date(b.dueDate) - new Date(a.dueDate));
    return candidates;
  };

  // When user clicks the "Recreate from last unfinished" button
  const onOpenRecreate = (matches) => {
    setMatchedTopics(matches);
    setCopyNotes(true);
    setIsRecreateOpen(true);
  };

  const handleRecreateConfirm = async () => {
    // create new topic copying parentTopicId and isRepeated
    try {
      const parent = matchedTopics[0]; // latest dueDate (we sorted earlier)
      const payload = { title: newTopicTitle.trim(), dueDate: newTopicDueDate };
      payload.parentTopicId = parent._id;
      payload.isRepeated = true;
      const created = await createTopicForSubject(subjectId, payload);
      // optionally copy notes
      if (copyNotes) {
        const source = await getTopicById(parent._id);
        if (source && source.notes && source.notes.length > 0) {
          // update created topic's notes
          await updateTopicNotes(created._id, source.notes, null);
        }
      }
      // Reset and refresh
      setNewTopicTitle('');
      setNewTopicDueDate(null);
      setMatchedTopics([]);
      setIsRecreateOpen(false);
      fetchAllData();
    } catch (err) {
      console.error('Failed to recreate topic:', err);
      alert('Failed to recreate topic. See console.');
    }
  };

  // Modal helpers for main UI
  const openModal = (topic) => {
    setEditingTopic(topic);
    setIsModalOpen(true);
    localStorage.setItem('openModal', JSON.stringify({ type: 'topic', id: topic._id }));
  };
  const closeModal = () => {
    setEditingTopic(null);
    setIsModalOpen(false);
    localStorage.removeItem('openModal');
  };

  const openNotesModal = (topic) => {
    setEditingTopic(topic);
    setIsNotesModalOpen(true);
    localStorage.setItem('openModal', JSON.stringify({ type: 'notes', id: topic._id }));
  };
  const closeNotesModal = () => {
    setEditingTopic(null);
    setIsNotesModalOpen(false);
    localStorage.removeItem('openModal');
  };

  const openImageViewer = (image) => {
    setViewingImage(image);
    setIsViewerOpen(true);
    localStorage.setItem('openModal', JSON.stringify({ type: 'image', id: image._id }));
  };
  const closeImageViewer = () => {
    setViewingImage(null);
    setIsViewerOpen(false);
    localStorage.removeItem('openModal');
  };

  return (
    <DndContext onDragStart={(event) => setActiveId(event.active.id)} onDragEnd={(event) => { handleDragEnd(event); setActiveId(null); }} onDragCancel={() => setActiveId(null)}>
      <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <header className="flex flex-wrap justify-between items-center gap-4 pb-4 mb-6 border-b border-slate-200 dark:border-slate-700">
          <Link to="/subjects" className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg inline-flex items-center gap-2 transition-colors">
            ← Back to Subjects
          </Link>
          <div className="w-full sm:w-auto"><Timer onSessionComplete={() => {}} /></div>
        </header>

        <h1 className="text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100 mb-6">
          {subject ? subject.name : 'Loading...'}
        </h1>

        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Image Library</h2>
            <button onClick={() => setIsUploadModalOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-semibold shadow flex items-center gap-2">
              Add Image
            </button>
          </div>
          <div className="flex gap-4 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg overflow-x-auto min-h-[10rem]">
            {images.length > 0 ? (
              images.map(img => <ImageCard key={img._id} image={img} onClick={() => openImageViewer(img)} />)
            ) : (
              <div className="flex items-center justify-center w-full"><p className="text-slate-500">Add Topics as Images...</p></div>
            )}
          </div>
        </section>

        <main>
          <form onSubmit={handleAddTopic} className="mb-4 flex flex-col sm:flex-row gap-3 items-stretch">
            <input type="text" value={newTopicTitle} onChange={(e) => setNewTopicTitle(e.target.value)} placeholder="Add a new topic to 'To Study'..." className="flex-grow p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500" />
            <DatePicker
              selected={newTopicDueDate}
              onChange={(date) => setNewTopicDueDate(date)}
              showTimeSelect
              timeIntervals={1}
              minDate={new Date()}
              timeFormat="h:mm aa"
              dateFormat="MM/dd/yyyy h:mm aa"
              isClearable
              placeholderText="Set due date (optional)"
              className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm w-full sm:w-auto"
              wrapperClassName="w-full sm:w-auto flex-shrink-0"
            />

            <div className="flex items-center gap-2">
              <button type="submit" className="bg-blue-600 text-white px-5 py-3 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 font-semibold shadow flex items-center gap-2">
                Add Topic
              </button>

              {/* Show Recreate button when exact match exists AND no non-outdated duplicate exists */}
              {newTopicTitle.trim().length > 0 && (() => {
                const matches = findMatchesForTitle(newTopicTitle);
                if (matches.length > 0 && !duplicateExists) {
                  return (
                    <button type="button" onClick={() => onOpenRecreate(matches)} className="bg-amber-500 text-white px-4 py-3 rounded-md hover:bg-amber-600 font-semibold shadow">
                      Recreate from last unfinished
                    </button>
                  );
                }
                return null;
              })()}
            </div>
          </form>

          <div className="flex flex-col md:flex-row gap-6">
            {Object.entries(columns).map(([status, topicsInColumn]) => (
              <Column key={status} id={status} title={status} topics={topicsInColumn} onTopicClick={openModal} onNotesClick={openNotesModal} activeId={activeId} isAnyEditing={isModalOpen || isNotesModalOpen || isViewerOpen} />
            ))}
          </div>

          <TopicEditorModal isOpen={isModalOpen} onRequestClose={closeModal} topic={editingTopic} onTopicUpdate={fetchAllData} />
          <NotesModal isOpen={isNotesModalOpen} onRequestClose={closeNotesModal} topic={editingTopic} onUpdate={fetchAllData} />
          <ImageUploadModal isOpen={isUploadModalOpen} onRequestClose={() => setIsUploadModalOpen(false)} subjectId={subjectId} onUploadComplete={fetchAllData} />
          <ImageViewerModal isOpen={isViewerOpen} onRequestClose={closeImageViewer} image={viewingImage} onUpdate={fetchAllData} subjectId={subjectId} />
        </main>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTopic ? (
          <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl scale-[1.02]">
            <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">{activeTopic.title}</h4>
            <div className="flex items-center gap-2">
              {activeTopic.notes && activeTopic.notes.length > 0 && <NotesIcon />}
            </div>
            {activeTopic.dueDate && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Due: {new Date(activeTopic.dueDate).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
              </p>
            )}
          </div>
        ) : null}
      </DragOverlay>

      {/* Recreate / Copy notes modal */}
      <Modal isOpen={isRecreateOpen} onRequestClose={() => setIsRecreateOpen(false)} className="max-w-md mx-auto mt-24 bg-white dark:bg-slate-800 p-6 rounded-md shadow-lg" overlayClassName="fixed inset-0 bg-black/40">
        <h3 className="text-lg font-semibold mb-2">Recreate from past unfinished topic</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          A past unfinished topic with the same title was found (we pick the most recent past date). You can recreate it on the date you chose.
        </p>
        {matchedTopics[0] && (
          <div className="mb-3 p-3 bg-slate-50 dark:bg-slate-700 rounded">
            <div className="font-semibold">{matchedTopics[0].title}</div>
            <div className="text-xs text-slate-500">Due: {new Date(matchedTopics[0].dueDate).toLocaleString()}</div>
            <div className="text-xs text-slate-500">Status: {matchedTopics[0].status}</div>
          </div>
        )}

        <label className="flex items-center gap-2 mb-4">
          <input type="checkbox" checked={copyNotes} onChange={(e) => setCopyNotes(e.target.checked)} />
          <span className="text-sm">Copy notes from old topic?</span>
        </label>

        <div className="flex justify-end gap-3">
          <button onClick={() => setIsRecreateOpen(false)} className="px-3 py-2 rounded border">Cancel</button>
          <button onClick={handleRecreateConfirm} className="px-3 py-2 rounded bg-blue-600 text-white">Create</button>
        </div>
      </Modal>
    </DndContext>
  );
};

export default StudyBoardPage;
