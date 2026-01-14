import React, { useState, useRef, useEffect } from 'react';
import './ImagePixelator.css';

const ImagePixelator = ({ imageUrl, onAreaSelected }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [selection, setSelection] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    if (imageUrl && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        imageRef.current = img;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        setImageLoaded(true);
      };
      
      img.src = imageUrl;
    }
  }, [imageUrl]);

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e) => {
    if (!imageLoaded) return;
    const pos = getMousePos(e);
    setStartPos(pos);
    setCurrentPos(pos);
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !imageLoaded) return;
    const pos = getMousePos(e);
    setCurrentPos(pos);
    drawSelection(startPos, pos);
  };

  const handleMouseUp = (e) => {
    if (!isDrawing || !imageLoaded) return;
    setIsDrawing(false);
    
    // Obtener posición final directamente del evento (no del estado)
    const endPos = getMousePos(e);
    
    const width = Math.abs(endPos.x - startPos.x);
    const height = Math.abs(endPos.y - startPos.y);
    
    console.log('🖱️ Mouse UP - Dimensiones:', { width, height });
    console.log('🖱️ Posiciones:', { startPos, endPos });
    
    if (width > 10 && height > 10) {
      const selectionArea = {
        x: Math.min(startPos.x, endPos.x),
        y: Math.min(startPos.y, endPos.y),
        width: width,
        height: height
      };
      
      console.log('✅ Área válida, enviando:', selectionArea);
      setSelection(selectionArea);
      onAreaSelected(selectionArea);
    } else {
      console.log('❌ Área demasiado pequeña, no se guarda. Width:', width, 'Height:', height);
    }
  };

  const drawSelection = (start, end) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Redibujar imagen
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (imageRef.current) {
      ctx.drawImage(imageRef.current, 0, 0);
    }
    
    // Dibujar rectángulo de selección
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(
      start.x,
      start.y,
      end.x - start.x,
      end.y - start.y
    );
    
    // Dibujar overlay semi-transparente
    ctx.fillStyle = 'rgba(220, 38, 38, 0.2)';
    ctx.fillRect(
      start.x,
      start.y,
      end.x - start.x,
      end.y - start.y
    );
  };

  const clearSelection = () => {
    setSelection(null);
    onAreaSelected(null);
    
    // Redibujar imagen sin selección
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (imageRef.current) {
      ctx.drawImage(imageRef.current, 0, 0);
    }
  };

  return (
    <div className="image-pixelator">
      <div className="pixelator-instructions">
        <p>
          ✂️ <strong>Paso 1:</strong> Arrastra el mouse sobre el nombre del estudiante (desde arriba hacia abajo).
        </p>
        <p>
          ✂️ <strong>Paso 2:</strong> La imagen se recortará eliminando todo lo que esté ARRIBA del rectángulo.
        </p>
        <p style={{ color: '#0369a1', fontWeight: 'bold' }}>
          💡 Tip: Dibuja el rectángulo justo DEBAJO del nombre para eliminarlo completamente.
        </p>
        {selection && (
          <div className="selection-info">
            <span className="badge badge-success">✓ Área marcada - Se recortará todo lo de arriba. Baja y haz clic en "FINALIZAR"</span>
            <button 
              type="button"
              onClick={clearSelection} 
              className="btn btn-sm btn-outline"
              style={{ marginLeft: '10px' }}
            >
              🔄 Redibujar
            </button>
          </div>
        )}
      </div>
      
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setIsDrawing(false)}
          style={{ cursor: isDrawing ? 'crosshair' : 'default' }}
        />
      </div>
      
      {!imageLoaded && (
        <div className="loading-overlay">
          <span className="loading"></span>
          <p>Cargando imagen...</p>
        </div>
      )}
    </div>
  );
};

export default ImagePixelator;
