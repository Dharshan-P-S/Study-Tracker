import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTopicsForSubject, createTopicForSubject, updateTopicStatus } from '../api/topicApi';
import { logStudySession } from '../api/sessionApi';
import { getImagesForSubject } from '../api/imageApi';
import Timer from '../components/Timer';
import TopicEditorModal from '../components/TopicEditorModal';
import ImageUploadModal from '../components/ImageUploadModal';
import ImageViewerModal from '../components/ImageViewerModal';
import { DndContext, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// --- Icon Components (No Changes) ---
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

// --- TopicCard (No Changes) ---
const TopicCard = ({ topic, onEditClick, isDragging, isOverlay, isAnyEditing }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: topic._id });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging || isOverlay ? 0 : 1,
    cursor: 'grab',
    transition: isOverlay ? 'none' : 'box-shadow 150ms ease, transform 150ms ease',
  };
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={`relative p-4 rounded-lg transition-all shadow-sm hover:shadow-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700`}>
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 pr-10">
          <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">{topic.title}</h4>
          <div className="flex items-center gap-2">{topic.text && <NoteIcon />} {topic.imageUrl && <ImageIcon />}</div>
        </div>
      </div>
      {!isAnyEditing && (
        <button onClick={(e) => { e.stopPropagation(); onEditClick(); }} onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} className="absolute -right-3 top-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full p-2 shadow-sm hover:shadow-md" aria-label="Edit topic"><EditIcon /></button>
      )}
    </div>
  );
};

// --- ImageCard (No Changes) ---
const ImageCard = ({ image, onClick }) => {
  const statusColors = { 'To Study': 'border-blue-500', 'Partially Studied': 'border-yellow-500', 'Fully Studied': 'border-green-500', 'To Be Revised': 'border-red-500' };
  return (
    <div onClick={onClick} className={`w-48 flex-shrink-0 border-t-4 ${statusColors[image.status]} rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-slate-800`}>
      <img src={image.imageUrl} alt={image.description} className="w-full h-32 object-cover rounded-t-sm" />
      <div className="p-2"><p className="text-sm text-slate-600 dark:text-slate-300 truncate">{image.description || 'No description'}</p></div>
    </div>
  );
};

// --- Column (No Changes) ---
const Column = ({ id, title, topics, onTopicClick, activeId, isAnyEditing }) => {
  const { setNodeRef } = useDroppable({ id });
  const statusColors = { 'To Study': 'border-blue-500', 'Partially Studied': 'border-yellow-500', 'Fully Studied': 'border-green-500', 'To Be Revised': 'border-red-500' };
  return (
    <div className={`bg-slate-100 dark:bg-slate-800/50 rounded-lg flex-1 border-t-4 ${statusColors[id]}`}>
      <h3 className="font-bold p-4 text-lg text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700">{title}</h3>
      <div ref={setNodeRef} className="p-4 space-y-3 min-h-[200px]">
        {topics.length > 0 ? (
          topics.map(topic => <TopicCard key={topic._id} topic={topic} onEditClick={() => onTopicClick(topic)} isDragging={activeId === topic._id} isAnyEditing={isAnyEditing}/>)
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
  const [topics, setTopics] = useState([]);
  const [images, setImages] = useState([]);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);
  const [editingTopic, setEditingTopic] = useState(null);
  const [activeId, setActiveId] = useState(null);

  const activeTopic = useMemo(() => topics.find(topic => topic._id === activeId), [activeId, topics]);

  const fetchAllData = () => {
    getTopicsForSubject(subjectId).then(setTopics).catch(console.error);
    getImagesForSubject(subjectId).then(setImages).catch(console.error);
  };

  // Effect 1: Fetch all data on initial load or when the subject changes.
  useEffect(() => {
    fetchAllData();
  }, [subjectId]);

  // --- NEW ---
  // Effect 2: This hook runs AFTER the images have been loaded.
  // It checks localStorage to see if a modal was open before a reload.
  useEffect(() => {
    // We must wait for images to be loaded to avoid a race condition.
    if (images.length > 0) {
      const lastOpenImageId = localStorage.getItem('lastOpenImageId');
      if (lastOpenImageId) {
        const imageToOpen = images.find(img => img._id === lastOpenImageId);
        if (imageToOpen) {
          // If we find the image, restore the state to open the modal.
          setViewingImage(imageToOpen);
          setIsViewerOpen(true);
        } else {
          // If the ID is invalid (e.g., image was deleted), clean up localStorage.
          localStorage.removeItem('lastOpenImageId');
        }
      }
    }
  }, [images]); // The key is adding `images` to the dependency array.

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
      const newTopic = await createTopicForSubject(subjectId, { title: newTopicTitle });
      setTopics(prev => [...prev, newTopic]);
      setNewTopicTitle('');
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
  };

  const closeModal = () => {
    setEditingTopic(null);
    setIsModalOpen(false);
  };

  // --- MODIFIED ---
  const openImageViewer = (image) => {
    setViewingImage(image);
    setIsViewerOpen(true);
    // Save the ID to localStorage when the viewer is opened.
    localStorage.setItem('lastOpenImageId', image._id);
  };

  // --- MODIFIED ---
  const closeImageViewer = () => {
    setViewingImage(null);
    setIsViewerOpen(false);
    // Clean up localStorage when the viewer is closed by the user.
    localStorage.removeItem('lastOpenImageId');
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
              <div className="flex items-center justify-center w-full"><p className="text-slate-500">No images uploaded for this subject yet.</p></div>
            )}
          </div>
        </section>

        <main>
          <form onSubmit={handleAddTopic} className="mb-8 flex gap-3">
            <input type="text" value={newTopicTitle} onChange={(e) => setNewTopicTitle(e.target.value)} placeholder="Add a new topic to 'To Study'..." className="flex-grow p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"/>
            <button type="submit" className="bg-blue-600 text-white px-5 py-3 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 font-semibold shadow flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
              Add Topic
            </button>
          </form>

          <div className="flex flex-col md:flex-row gap-6">
            {Object.entries(columns).map(([status, topicsInColumn]) => (
              <Column key={status} id={status} title={status} topics={topicsInColumn} onTopicClick={openModal} activeId={activeId} isAnyEditing={isModalOpen} />
            ))}
          </div>

          <TopicEditorModal isOpen={isModalOpen} onRequestClose={closeModal} topic={editingTopic} onTopicUpdate={fetchAllData} />
        </main>

        <ImageUploadModal isOpen={isUploadModalOpen} onRequestClose={() => setIsUploadModalOpen(false)} subjectId={subjectId} onUploadComplete={fetchAllData} />

        {/* --- MODIFIED: This component will now correctly reopen on refresh --- */}
        <ImageViewerModal 
          isOpen={isViewerOpen} 
          onRequestClose={closeImageViewer} 
          image={viewingImage} 
          onUpdate={fetchAllData} 
          subjectId={subjectId} 
        />
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTopic ? (
          <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">{activeTopic.title}</h4>
            <div className="flex items-center gap-2">
              {activeTopic.text && <NoteIcon />}
              {activeTopic.imageUrl && <ImageIcon />}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default StudyBoardPage;