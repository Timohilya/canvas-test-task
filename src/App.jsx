import { useRef, useState, useEffect } from 'react';
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [polygons, setPolygons] = useState([]);
  const [points, setPoints] = useState([]);

  console.log('component render');

  // API CALLS
  const getPolygons = async () => {
    console.log('getPolygons');
    setLoading(true);
    const res = await fetch('http://localhost:3000/getPolygons');
    const data = await res.json();
    setPolygons(data);
    setLoading(false);
  };

  const addPolygon = async (points) => {
    console.log('addPolygon');
    setLoading(true);
    await fetch('http://localhost:3000/addPolygon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points }),
    });
    getPolygons();
  };

  const deletePolygon = (id) => async () => {
    console.log('deletePolygon');
    setLoading(true);
    await fetch(`http://localhost:3000/deletePolygon/${id}`, {
      method: 'DELETE',
    });
    getPolygons();
  };

  useEffect(() => {
    console.log('Initializing app...');
    getPolygons();

    const canvas = canvasRef.current;

    function getNewPoints(e, currentPoints) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      return [...currentPoints, [x, y]];
    }

    function handleClick(e) {
      setPoints((prevPoints) => getNewPoints(e, prevPoints));
    }

    async function handleDoubleClick(e) {
      setPoints((prevPoints) => {
        const newPoints = getNewPoints(e, prevPoints);
        if (newPoints.length >= 3) {
          addPolygon(newPoints);
          return [];
        }
        return newPoints;
      });
    }

    let clickTimeout = null;
    function handleClickWithTimeout(e) {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
        handleDoubleClick(e);
        clickTimeout = null;
      } else {
        clickTimeout = setTimeout(() => {
          handleClick(e);
          clickTimeout = null;
        }, 300);
      }
    }

    canvas.addEventListener('click', handleClickWithTimeout);
    return () => {
      console.log('remove listeners');
      canvas.removeEventListener('click', handleClickWithTimeout);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    console.log('Rendering canvas...');
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    function drawPolygon(pts, closed) {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i][0], pts[i][1]);
      }

      if (closed) {
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 150, 255, 0.2)';
        ctx.fill();
      }

      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 2;
      ctx.stroke();

      for (const [x, y] of pts) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = 'blue';
        ctx.fill();
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    polygons.forEach((p) => drawPolygon(p.points, true));

    if (points.length) {
      drawPolygon(points, false);
    }
  }, [points, polygons]);

  return (
    <>
      <h1>Test task</h1>
      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          width="600"
          height="400"
          style={{ background: "url('https://picsum.photos/600/400')" }}
        ></canvas>
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
          </div>
        )}
      </div>
      {polygons.map(({ id, name, points }) => (
        <div key={id}>
          <span>{`${name}: [${points.map(p => `[${p[0]}, ${p[1]}]`).join(', ')}]`} </span>
          <button onClick={deletePolygon(id)}>DELETE {id}</button>
        </div>
      ))}
    </>
  );
}

export default App;
