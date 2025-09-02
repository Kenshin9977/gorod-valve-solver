import { useState, useEffect } from "react";
import mapImg from "./assets/map.jpg";
import valveImg from "./assets/valve.png";
import greenLightImg from "./assets/green_light.png";
import cryptexImg from "./assets/cryptex.webp";

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
  if (visited.size === Object.keys(graph).length && start === end) return [{ zone: end, number: null }];
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

  const [zonesData, setZonesData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/zones.json")
      .then((res) => res.json())
      .then((data) => setZonesData(data));
  }, []);

  const handleClick = (zone: string, e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, zone });
  };

  const selectZone = (zone: string, type: "start" | "end" | "reset") => {
    const newClicks = { ...clicks };

    if (type === "start") {
      Object.keys(newClicks).forEach((z) => { if (newClicks[z] === 1) newClicks[z] = 0; });
      if (zone === end) setEnd(null);
      newClicks[zone] = 1;
      setStart(zone);
    }

    if (type === "end") {
      Object.keys(newClicks).forEach((z) => { if (newClicks[z] === 2) newClicks[z] = 0; });

      if (zone === start) setStart(null);

      newClicks[zone] = 2;
      setEnd(zone);
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
    <body className="bg-gray-900 m-0">
    <div className="h-screen bg-gray-900 text-white flex flex-col items-center p-4">
      {/* Carte (occupe l’espace restant au-dessus du texte) */}
      <div className="relative flex-grow flex justify-center items-center min-h-0">
        <img
          src={mapImg}
          alt="map"
          className="w-full max-w-[400px] max-h-full object-contain"
        />
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
                top: `${z.y}`,
                left: `${z.x}`,
                borderColor: isStart ? "#4ade80" : isEnd ? "#a78bfa" : "gray",
                width: "11%",
                height: "auto",
              }}
            >
              {pathItem && !isEnd && (
                <span
                  className="absolute -top-1 left-1 font-bold text-white"
                  style={{
                    fontSize: '150%', // 40% de la largeur du bouton parent
                    WebkitTextStroke: "1px black",
                  }}
                >
                  {pathItem.number}
                </span>
              )}
              <img src={valveImg} alt="valve" className="w-full h-auto object-contain" />
              {isEnd && (
                <img
                  src={cryptexImg}
                  alt="cryptex"
                  className="absolute top-0 left-0 w-full h-auto pointer-events-none object-contain"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Résultat texte (réserve toujours de la place fixe) */}
      <div className="mt-2 flex justify-center w-full h-[11rem] shrink-0">
        <div className="text-left leading-relaxed w-full max-w-[512px]">
          {path ? (
            path.map((p, i) => (
              <div key={i}>
                {i + 1}. {p.zone}
                {i !== path.length - 1 ? ` : ${p.number ?? "-"}` : ""}
              </div>
            ))
          ) : (
            Array.from({ length: 7 }).map((_, i) => <div key={i}>&nbsp;</div>)
          )}
        </div>
      </div>

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
    </body>
  );
}