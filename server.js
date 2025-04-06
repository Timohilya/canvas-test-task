import express from 'express';
import cors from 'cors'; 
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const POLYGON_FILE = path.join(__dirname, 'polygons.json');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const loadPolygons = async () => {
  try {
    const data = await fs.readFile(POLYGON_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const savePolygons = async (polygons) => {
  await fs.writeFile(POLYGON_FILE, JSON.stringify(polygons, null, 2));
};

app.post('/addPolygon', async (req, res) => {
  await sleep(5000);

  const { points } = req.body;

  const polygons = await loadPolygons();
  const newPlygonId = polygons.length ? polygons[polygons.length - 1].id + 1 : 1;
  const newPolygon = {
    id: newPlygonId,
    name: `P ${newPlygonId}`,
    points
  };
  polygons.push(newPolygon);
  await savePolygons(polygons);

  res.status(201).json(newPolygon);
});

app.delete('/deletePolygon/:id', async (req, res) => {
  await sleep(5000);
  const polygonId = parseInt(req.params.id);

  const polygons = await loadPolygons();
  const index = polygons.findIndex((p) => p.id === polygonId);

  polygons.splice(index, 1);
  await savePolygons(polygons);

  res.status(200).send(`Polygon with id ${polygonId} deleted`);
});

app.get('/getPolygons', async (req, res) => {
  await sleep(5000);
  const polygons = await loadPolygons();
  res.json(polygons);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
