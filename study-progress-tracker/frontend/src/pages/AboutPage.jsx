import React from 'react';
import { Link } from 'react-router-dom';

const FeatureSection = ({ title, description, imageUrl, imageAlt, reverse = false }) => (
  <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
    <div className={`flex flex-col md:flex-row items-center gap-8 md:gap-12 ${reverse ? 'md:flex-row-reverse' : ''}`}>
      <div className="w-full md:w-1/2">
        <img src={imageUrl} alt={imageAlt} className="rounded-lg shadow-2xl border-4 border-white dark:border-slate-700" />
      </div>
      <div className="w-full md:w-1/2">
        <h2 className="text-3xl font-bold mb-4 text-slate-800 dark:text-slate-100">{title}</h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  </div>
);

const AboutPage = () => {
  return (
    <div className="bg-slate-50 dark:bg-slate-900">
      <header className="text-center py-16 sm:py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Study Progress Tracker
          </h1>
          <p className="mt-6 text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            An all-in-one application designed to organize, track, and enhance your learning workflow, from initial notes to final revision.
          </p>
        </div>
      </header>

      <main>
        {/* Section 1 */}
        <div className="py-16 sm:py-24">
          <FeatureSection
            title="Organize Your Studies"
            description="Start by creating subjects. This is your main dashboard, giving you a clear overview of everything you're learning."
            imageUrl="/about-images/subjects-page.png"
            imageAlt="Subjects Page"
          />
        </div>
        
        {/* Section 2 (New) */}
        <div className="bg-white dark:bg-slate-800 py-16 sm:py-24">
          <FeatureSection
            title="Quickly Add Topics"
            description="Easily add new topics by simply typing a title. Your ideas are instantly added to the 'To Study' column, ready to be organized on your board."
            imageUrl="/about-images/study-board.png"
            imageAlt="Study Board with Add Topic form"
            reverse={true}
          />
        </div>

        {/* Section 3 (Renamed) */}
        <div className="py-16 sm:py-24">
           <FeatureSection
            title="Effortless Drag & Drop"
            description="Each subject opens a powerful Kanban-style board. Intuitively drag and drop topics between four clear stages: To Study, Partially Studied, Fully Studied, and To Be Revised."
            imageUrl="/about-images/drag-drop.png"
            imageAlt="Drag and Drop Topics"
          />
        </div>

        {/* Section 4 */}
        <div className="bg-white dark:bg-slate-800 py-16 sm:py-24">
          <FeatureSection
            title="Image-Centric Workflow"
            description="Upload images of book pages, whiteboards, or handwritten notes to a dedicated Image Library for each subject. Click an image to open the powerful annotator."
            imageUrl="/about-images/study-board.png"
            imageAlt="Study Board with Image Library"
            reverse={true}
          />
        </div>

        {/* Section 5 */}
        <div className="py-16 sm:py-24">
          <FeatureSection
            title="Digital Highlighting & Annotation"
            description="Mark up your images with colored highlights corresponding to your study status. Your annotations are saved and reloaded every time, with undo/redo support."
            imageUrl="/about-images/image-annotator.png"
            imageAlt="Image Annotation Tool"
          />
        </div>
        
        {/* Section 6 */}
        <div className="bg-white dark:bg-slate-800 py-16 sm:py-24">
          <FeatureSection
            title="Smart Text Extraction (OCR)"
            description="With one click, extract printed text directly from your images. Then, use a custom separator (like a newline) to automatically split the text and create multiple new topic cards instantly."
            imageUrl="/about-images/ocr-splitter.png"
            imageAlt="OCR and Topic Splitting Modal"
            reverse={true}
          />
        </div>
        
        {/* Section 7 */}
         <div className="py-16 sm:py-24">
            <FeatureSection
                title="Manage Topics and Notes"
                description="Quickly rename or delete topics. Add multiple reference notes, including YouTube videos and local file links, to keep all your resources in one place."
                imageUrl="/about-images/notes-modal.png"
                imageAlt="Notes Modal for a Topic"
            />
        </div>
        
        {/* Section 8 */}
        <div className="bg-white dark:bg-slate-800 py-16 sm:py-24">
          <FeatureSection
            title="Track Your Time & Analytics"
            description="Use the built-in study timer to log your sessions. All your focused work is automatically recorded and visualized in the analytics dashboard to track time per subject."
            imageUrl="/about-images/analytics-page.png"
            imageAlt="Analytics Page"
            reverse={true}
          />
        </div>

      </main>
      
      <footer className="fixed top-6 left-6 z-20">
        <Link 
          to="/subjects" 
          className="bg-blue-600 text-white font-semibold py-3 px-5 rounded-full shadow-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-transform hover:scale-105 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to App
        </Link>
      </footer>
    </div>
  );
};

export default AboutPage;