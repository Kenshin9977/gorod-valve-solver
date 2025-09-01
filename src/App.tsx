import { useState } from "react";
import mapImg from "./assets/map.png";
import valveImg from "./assets/valve.png";
import greenLightImg from "./assets/green_light.png";
import cryptexImg from "./assets/cryptex.webp";
import zonesData from "./zones.json";


// Graphe des connexions (inchangé)
const graph = {
  "Departement Store": [
    { to: "Infirmary", number: 2 },
    { to: "Armory", number: 1 },
    { to: "Dragon Command", number: 3 },
  ],
  "Infirmary": [
    { to: "Tank Station", number: 1 },
    { to: "Departement Store", number: 2 },
    { to: "Dragon Command", number: 3 },
  ],
  "Tank Station": [
    { to: "Supply Drop", number: 2 },
    { to: "Infirmary", number: 2 },
    { to: "Armory", number: 3 },
  ],
  "Supply Drop": [
    { to: "Dragon Command", number: 1 },
    { to: "Armory", number: 2 },
    { to: "Tank Station", number: 3 },
  ],
  "Dragon Command": [
    { to: "Departement Store", number: 2 },
    { to: "Infirmary", number: 3 },
    { to: "Supply Drop", number: 1 },
  ],
  "Armory": [
    { to: "Departement Store", number: 3 },
    { to: "Supply Drop", number: 1 },
    { to: "Tank Station", number: 2 },
  ],
};

// Recherche de chemin hamiltonien (inchangé)
function findHamiltonianPath(graph, start, end, visited = new Set()) {
  if (visited.size === Object.keys(graph).length && start === end) return [end];
  visited.add(start);

  for (const { to, number } of graph[start]) {
    if (!visited.has(to) || to === end) {
      const path = findHamiltonianPath(graph, to, end, new Set(visited));
      if (path) return [{ zone: start, number }, ...path];
    }
  }
  return null;
}

export default function App() {
  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const [clicks, setClicks] = useState<{ [key: string]: number }>({});
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; zone: string } | null>(null);

  const handleClick = (zone: string, e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, zone });
  };

  const selectZone = (zone: string, type: "start" | "end" | "reset") => {
    const newClicks = { ...clicks };

    if (type === "start") {
      Object.keys(newClicks).forEach((z) => { if (newClicks[z] === 1) newClicks[z] = 0; });
      newClicks[zone] = 1;
      setStart(zone);
    }

    if (type === "end") {
      Object.keys(newClicks).forEach((z) => { if (newClicks[z] === 2) newClicks[z] = 0; });
      if (zone !== start) {
        newClicks[zone] = 2;
        setEnd(zone);
      }
    }

    if (type === "reset") {
      if (zone === start) setStart(null);
      if (zone === end) setEnd(null);
      newClicks[zone] = 0;
    }

    setClicks(newClicks);
    setContextMenu(null);
  };

  const path = start && end ? findHamiltonianPath(graph, start, end) : null;

  return (
    <div className="flex flex-col items-center p-4 relative">
      {/* Carte */}
      <div className="relative">
        <img src={mapImg} alt="map" className="w-[800px]" />
        {zonesData.map((z) => {
          const isStart = clicks[z.name] === 1;
          const isEnd = clicks[z.name] === 2;
          const pathItem = path?.find((p) => p.zone === z.name);

          return (
            <button
              key={z.name}
              onClick={(e) => handleClick(z.name, e)}
              className="absolute rounded-full border-4"
              style={{
                top: z.y,
                left: z.x,
                borderColor: isStart ? "lightgreen" : isEnd ? "violet" : "gray",
              }}
            >
              {/* Numéro si start ou milieu de path, pas sur end */}
              {pathItem && !isEnd && (
                <span
                  className="absolute -top-4 left-1 text-2xl font-bold text-white"
                  style={{ WebkitTextStroke: "1px black" }}
                >
                  {pathItem.number}
                </span>
              )}

              {/* Icône */}
              <img src={valveImg} alt="valve" className="w-12 h-12" />

              {isEnd && (
                <img
                  src={cryptexImg}
                  alt="cryptex"
                  className="absolute top-0 left-0 w-12 h-12 pointer-events-none"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Résultat texte */}
      {path && (
        <div className="mt-4 text-white text-center">
          {path.map((p, i) => (
            <div key={i}>
              {i + 1}. {p.zone} : {p.number ?? "-"}
            </div>
          ))}
        </div>
      )}

      {/* Menu contextuel */}
      {contextMenu && (
        <div
          className="absolute bg-gray-800 text-white rounded-lg shadow-lg p-2 flex gap-2"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button onClick={() => selectZone(contextMenu.zone, "start")}>
            <img src={greenLightImg} alt="start" className="w-8 h-8" />
          </button>
          <button onClick={() => selectZone(contextMenu.zone, "end")}>
            <img src={cryptexImg} alt="end" className="w-8 h-8" />
          </button>
          <button onClick={() => selectZone(contextMenu.zone, "reset")}>❌</button>
        </div>
      )}
    </div>
  );
}