import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTopicsForSubject, updateTopic, createTopicForSubject } from '../api/topicApi';
import { logStudySession } from '../api/sessionApi';
import Timer from '../components/Timer';
import TopicEditorModal from '../components/TopicEditorModal';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const TopicCard = ({ topic, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: topic._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={onClick} className="p-3 bg-white border rounded-lg shadow-sm cursor-grab hover:shadow-md">
      <h4 className="font-semibold">{topic.title}</h4>
      {topic.imageUrl && <img src={topic.imageUrl} alt={topic.title} className="mt-2 w-full h-24 object-cover rounded" />}
    </div>
  );
};

const Column = ({ id, title, topics, onTopicClick }) => {
  const { setNodeRef } = useSortable({ id });
  return (
    <div className="bg-gray-100 p-4 rounded-lg flex-1">
      <h3 className="font-bold mb-4 text-lg">{title}</h3>
      <SortableContext id={id} items={topics} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="space-y-3 min-h-[100px]">
          {topics.map(topic => <TopicCard key={topic._id} topic={topic} onClick={() => onTopicClick(topic)} />)}
        </div>
      </SortableContext>
    </div>
  );
};

const StudyBoardPage = () => {
  const { subjectId } = useParams();
  const [topics, setTopics] = useState([]);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await getTopicsForSubject(subjectId);
        setTopics(data);
      } catch (error) {
        console.error("Failed to fetch topics", error);
      }
    };
    fetchTopics();
  }, [subjectId]);

  const columns = useMemo(() => ({
    'To Study': topics.filter(t => t.status === 'To Study'),
    'Partially Studied': topics.filter(t => t.status === 'Partially Studied'),
    'Fully Studied': topics.filter(t => t.status === 'Fully Studied'),
    'To Be Revised': topics.filter(t => t.status === 'To Be Revised'),
  }), [topics]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const originalTopic = topics.find(t => t._id === active.id);
    const newStatus = over.id;

    setTopics(prev => prev.map(t => t._id === active.id ? { ...t, status: newStatus } : t));

    try {
      await updateTopic(active.id, { status: newStatus });
    } catch (error) {
      console.error("Failed to update topic status", error);
      setTopics(prev => prev.map(t => t._id === active.id ? originalTopic : t));
    }
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;
    try {
      const newTopic = await createTopicForSubject(subjectId, { title: newTopicTitle });
      setTopics(prev => [...prev, newTopic]);
      setNewTopicTitle('');
    } catch (error) {
      console.error("Failed to add topic", error);
    }
  };

  const handleSessionComplete = async (duration) => {
    try {
      await logStudySession({ subjectId, duration });
      alert(`Logged a study session of ${Math.floor(duration / 60)} minutes!`);
    } catch (error) {
      console.error("Failed to log session", error);
      alert("Could not save your study session. Please try again.");
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

  const handleTopicUpdate = (updatedTopic) => {
    setTopics(topics.map(t => t._id === updatedTopic._id ? updatedTopic : t));
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <Link to="/subjects" className="text-blue-500 hover:underline">&larr; Back to Subjects</Link>
        <div className="w-auto">
          <Timer onSessionComplete={handleSessionComplete} />
        </div>
      </div>

      <form onSubmit={handleAddTopic} className="mb-6 flex gap-2">
        <input type="text" value={newTopicTitle} onChange={(e) => setNewTopicTitle(e.target.value)} placeholder="Add a new topic to 'To Study'..." className="flex-grow p-2 border rounded-md" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Add Topic</button>
      </form>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex flex-col md:flex-row gap-4">
          {Object.entries(columns).map(([status, topicsInColumn]) => (
            <Column key={status} id={status} title={status} topics={topicsInColumn} onTopicClick={openModal} />
          ))}
        </div>
      </DndContext>

      <TopicEditorModal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        topic={editingTopic}
        onTopicUpdate={handleTopicUpdate}
      />
    </div>
  );
};

export default StudyBoardPage;