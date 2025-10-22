import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTopicsForSubject, createTopicForSubject, updateTopicStatus } from '../api/topicApi';
import { getSubjectById } from '../api/subjectsApi';
import { logStudySession } from '../api/sessionApi';
import { getImagesForSubject } from '../api/imageApi';
import Timer from '../components/Timer';
import TopicEditorModal from '../components/TopicEditorModal';
import ImageUploadModal from '../components/ImageUploadModal';
import ImageViewerModal from '../components/ImageViewerModal';
import NotesModal from '../components/NotesModal';
import { DndContext, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// --- Icon Components ---
const NoteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L15.232 5.232z" />
  </svg>
);
const NotesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.536a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

// --- TopicCard with Due Date Display ---
const TopicCard = ({ topic, onEditClick, onNotesClick, isDragging, isOverlay, isAnyEditing }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: topic._id });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging || isOverlay ? 0 : 1,
    cursor: 'grab',
    transition: isOverlay ? 'none' : 'box-shadow 150ms ease, transform 150ms ease',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`relative p-4 rounded-lg transition-all ${isOverlay ? 'shadow-2xl scale-[1.02]' : 'shadow-sm hover:shadow-md'} bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 pr-10">
          <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">{topic.title}</h4>
          <div className="flex items-center gap-2">
            {topic.notes && topic.notes.length > 0 && <NotesIcon />}
          </div>
          {topic.dueDate && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Due: {new Date(topic.dueDate).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
              </p>
          )}
        </div>
      </div>
      {!isAnyEditing && (
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 ">
            <button onClick={(e) => { e.stopPropagation(); onEditClick(); }} onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full p-2 shadow-sm hover:shadow-md" aria-label="Edit topic"><EditIcon /></button>
            <button onClick={(e) => { e.stopPropagation(); onNotesClick(); }} onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full p-2 shadow-sm hover:shadow-md" aria-label="Edit notes"><NotesIcon /></button>
        </div>
      )}
    </div>
  );
};

// --- ImageCard Component ---
const ImageCard = ({ image, onClick }) => {
  const statusColors = { 'To Study': 'border-blue-500', 'Partially Studied': 'border-yellow-500', 'Fully Studied': 'border-green-500', 'To Be Revised': 'border-red-500' };
  return (
    <div onClick={onClick} className={`w-48 flex-shrink-0 border-t-4 ${statusColors[image.status]} rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-slate-800`}>
      <img src={image.imageUrl} alt={image.description} className="w-full h-32 object-contain rounded-t-sm" />
      <div className="p-2">
        <p className="text-sm ... truncate">{image.description || 'No description'}</p>
        {/* 👇 Display Due Date */}
        {image.dueDate && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Due: {new Date(image.dueDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
            </p>
        )}
      </div>
    </div>
  );
};

// --- Column Component ---
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

  useEffect(() => {
    if (topics.length === 0 && images.length === 0) return;

    const stored = localStorage.getItem('openModal');
    if (!stored) return;

    try {
      const { type, id } = JSON.parse(stored);

      if (type === 'topic' || type === 'notes') {
        const topic = topics.find(t => t._id === id);
        if (topic) {
          setEditingTopic(topic);
          if (type === 'topic') setIsModalOpen(true);
          else setIsNotesModalOpen(true);
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
      setTopics(prev => prev.map(t => (t._id === topicId ? { ...t, status: newStatus } : t)));
      try {
        await updateTopicStatus(topicId, newStatus);
      } catch (error) {
        console.error('Failed to update topic status', error);
        setTopics(prev => prev.map(t => (t._id === topicId ? originalTopic : t)));
      }
    }
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;
    try {
      await createTopicForSubject(subjectId, { title: newTopicTitle, dueDate: newTopicDueDate });
      setNewTopicTitle('');
      setNewTopicDueDate(null);
      fetchAllData(); // Refresh list to show new topic
    } catch (error) { console.error('Failed to add topic', error); }
  };

  const handleSessionComplete = async (duration) => {
    try {
      await logStudySession({ subjectId, duration });
      alert(`Logged a study session of ${Math.floor(duration / 60)} minutes!`);
    } catch (error) {
      console.error('Failed to log session', error);
      alert('Could not save your study session. Please try again.');
    }
  };

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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            Back to Subjects
          </Link>
          <div className="w-full sm:w-auto"><Timer onSessionComplete={handleSessionComplete} /></div>
        </header>

        <h1 className="text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100 mb-6">
          {subject ? subject.name : 'Loading...'}
        </h1>

        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Image Library</h2>
            <button onClick={() => setIsUploadModalOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-semibold shadow flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" /></svg>
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
          <form onSubmit={handleAddTopic} className="mb-8 flex flex-col sm:flex-row gap-3 items-stretch">
            <input type="text" value={newTopicTitle} onChange={(e) => setNewTopicTitle(e.target.value)} placeholder="Add a new topic to 'To Study'..." className="flex-grow p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500" />
            <DatePicker
                selected={newTopicDueDate}
                onChange={(date) => setNewTopicDueDate(date)}
                showTimeSelect
                minDate={new Date()}
                timeIntervals={15}
                timeFormat="h:mm aa" // 
                dateFormat="MM/dd/yyyy h:mm aa" // 
                isClearable
                placeholderText="Set due date (optional)"
                className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 w-full sm:w-auto"
                wrapperClassName="w-full sm:w-auto flex-shrink-0"
                calendarClassName="dark-mode-calendar" // Keep dark mode styling
             />
            <button type="submit" className="bg-blue-600 text-white px-5 py-3 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 font-semibold shadow flex items-center justify-center gap-2 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
              Add Topic
            </button>
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
    </DndContext>
  );
};

export default StudyBoardPage;