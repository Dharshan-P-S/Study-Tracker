// frontend/src/services/db.js (Dexie Setup)
import Dexie from 'dexie';

export const db = new Dexie('studyApp');
db.version(1).stores({
  subjects: '++id, &name, userId', // ++id is auto-incrementing, &name is unique
  chapters: '++id, &name, subjectId',
  topics: '++id, title, chapterId',
  syncQueue: '++id, action, timestamp', // Our queue for offline actions
});