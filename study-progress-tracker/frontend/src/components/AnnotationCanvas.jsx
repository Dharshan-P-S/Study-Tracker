import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image, Rect } from 'react-konva';
import useImage from 'use-image';

const KonvaImage = ({ imageUrl, stageWidth, stageHeight }) => {
  const [image] = useImage(imageUrl, 'anonymous');

  if (!image) return null;

  // Fit image inside stage while maintaining aspect ratio
  const scale = Math.min(stageWidth / image.width, stageHeight / image.height);
  const x = (stageWidth - image.width * scale) / 2;
  const y = (stageHeight - image.height * scale) / 2;

  return <Image image={image} x={x} y={y} scale={{ x: scale, y: scale }} />;
};

const AnnotationCanvas = ({ imageUrl, initialAnnotations, onAnnotationsChange, selectedColor }) => {
  // History stores arrays of annotations
  const [history, setHistory] = useState([initialAnnotations || []]);
  const [historyStep, setHistoryStep] = useState(0);

  const [newAnnotation, setNewAnnotation] = useState(null);
  const isDrawing = useRef(false);

  // Reset history when a new image is loaded
  useEffect(() => {
    setHistory([initialAnnotations || []]);
    setHistoryStep(0);
  }, [initialAnnotations]);

  // Push a new state to history, removing all redo steps
  const pushToHistory = (newAnnos) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyStep + 1);
      newHistory.push(newAnnos);
      return newHistory;
    });
    setHistoryStep(prev => prev + 1);
    onAnnotationsChange(newAnnos);
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      const prevStep = historyStep - 1;
      setHistoryStep(prevStep);
      onAnnotationsChange(history[prevStep]);
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      const nextStep = historyStep + 1;
      setHistoryStep(nextStep);
      onAnnotationsChange(history[nextStep]);
    }
  };

  const handleMouseDown = (e) => {
    const stage = e.target.getStage();
    isDrawing.current = true;
    const pos = stage.getPointerPosition();
    setNewAnnotation({
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
      fill: selectedColor.fill,
      id: `anno-${Date.now()}-${Math.random()}`,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current || !newAnnotation) return;
    const pos = e.target.getStage().getPointerPosition();
    setNewAnnotation(prev => ({
      ...prev,
      width: pos.x - prev.x,
      height: pos.y - prev.y,
    }));
  };

  const handleMouseUp = () => {
    if (!isDrawing.current || !newAnnotation) return;
    isDrawing.current = false;

    if (Math.abs(newAnnotation.width) > 2 && Math.abs(newAnnotation.height) > 2) {
      // Push new annotation to history atomically
      const newAnnos = [...history[historyStep], newAnnotation];
      pushToHistory(newAnnos);
    }

    setNewAnnotation(null);
  };

  // Annotations to render
  const allAnnotations = newAnnotation ? [...history[historyStep], newAnnotation] : history[historyStep];

  // Stage size
  const stageWidth = window.innerWidth * 0.6;
  const stageHeight = window.innerHeight * 0.8;

  // Correct Undo/Redo states
  const canUndo = historyStep > 0 || (historyStep === 0 && history[0].length > 0);
  const canRedo = historyStep < history.length - 1;

  return (
    <div className="relative w-full h-full flex flex-col items-center">
      {/* Centered Undo/Redo buttons */}
      <div className="flex gap-4 mb-2">
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          className="bg-slate-700 text-white px-3 py-1 rounded-full disabled:opacity-50 text-lg font-bold"
        >
          ↺
        </button>
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          className="bg-slate-700 text-white px-3 py-1 rounded-full disabled:opacity-50 text-lg font-bold"
        >
          ↻
        </button>
      </div>

      <Stage
        width={stageWidth}
        height={stageHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="bg-black rounded-lg"
      >
        <Layer>
          <KonvaImage imageUrl={imageUrl} stageWidth={stageWidth} stageHeight={stageHeight} />
          {allAnnotations.map(anno => (
            <Rect
              key={anno.id}
              x={anno.x}
              y={anno.y}
              width={anno.width}
              height={anno.height}
              fill={anno.fill}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default AnnotationCanvas;
