import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image, Rect } from 'react-konva';
import useImage from 'use-image';

const KonvaImage = ({ imageUrl, stageWidth, stageHeight }) => {
  const [image] = useImage(imageUrl, 'anonymous');
  if (!image) return null;

  const scale = Math.min(stageWidth / image.width, stageHeight / image.height);
  const x = (stageWidth - image.width * scale) / 2;
  const y = (stageHeight - image.height * scale) / 2;

  return <Image image={image} x={x} y={y} scale={{ x: scale, y: scale }} />;
};

const AnnotationCanvas = ({ imageUrl, initialAnnotations, onAnnotationsChange, selectedColor }) => {
  const [annotations, setAnnotations] = useState(initialAnnotations || []);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState(null);
  const isDrawing = useRef(false);
  const initialized = useRef(false);

  // Only set annotations ONCE per image (prevent reset loop)
  useEffect(() => {
    if (!initialized.current) {
      setAnnotations(initialAnnotations || []);
      setHistory([]);
      setRedoStack([]);
      initialized.current = true;
    }
  }, [initialAnnotations]);

  const handleMouseDown = (e) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    isDrawing.current = true;
    setNewAnnotation({
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
      fill: selectedColor.fill,
      id: `anno-${Date.now()}-${Math.random()}`
    });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current || !newAnnotation) return;
    const pos = e.target.getStage().getPointerPosition();
    setNewAnnotation(prev => ({
      ...prev,
      width: pos.x - prev.x,
      height: pos.y - prev.y
    }));
  };

  const handleMouseUp = () => {
    if (!isDrawing.current || !newAnnotation) return;
    isDrawing.current = false;

    if (Math.abs(newAnnotation.width) > 2 && Math.abs(newAnnotation.height) > 2) {
      const updated = [...annotations, newAnnotation];
      setHistory(prev => [...prev, annotations]);
      setAnnotations(updated);
      setRedoStack([]);
      onAnnotationsChange(updated);
    }

    setNewAnnotation(null);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    const undone = [...annotations];
    setRedoStack(prev => [...prev, undone]);
    setHistory(prev => prev.slice(0, -1));
    setAnnotations(previous);
    onAnnotationsChange(previous);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setHistory(prev => [...prev, annotations]);
    setRedoStack(prev => prev.slice(0, -1));
    setAnnotations(next);
    onAnnotationsChange(next);
  };

  const stageWidth = window.innerWidth * 0.6;
  const stageHeight = window.innerHeight * 0.8;

  const canUndo = history.length > 0;
  const canRedo = redoStack.length > 0;

  const allAnnotations = newAnnotation ? [...annotations, newAnnotation] : annotations;

  return (
    <div className="relative w-full h-full flex flex-col items-center">
      {/* Undo/Redo buttons */}
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
          {allAnnotations.map((anno) => (
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
