import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

const hslToHex = (hsl) => {
  let [h, s, l] = hsl.match(/\d+/g).map(Number);
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const generateSingleColor = () => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = [60, 80, 50][Math.floor(Math.random() * 3)];
  const lightness = [50, 85, 20][Math.floor(Math.random() * 3)];
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export default function App() {
  const [artwork, setArtwork] = useState(null);
  const [palette, setPalette] = useState([]);
  const [artworkHistory, setArtworkHistory] = useState([]);
  const [paletteHistory, setPaletteHistory] = useState([]);

  const fetchRandomArtwork = async () => {
    setArtwork(null);
    const objectsRes = await fetch('https://collectionapi.metmuseum.org/public/collection/v1/objects');
    const objectsData = await objectsRes.json();

    let artworkData;
    do {
      const randomId = objectsData.objectIDs[Math.floor(Math.random() * objectsData.objectIDs.length)];
      const artworkRes = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${randomId}`);
      artworkData = await artworkRes.json();
    } while (!artworkData.primaryImageSmall);

    if (artwork) {
      setArtworkHistory((prev) => [artwork, ...prev]);
    }

    setArtwork(artworkData);
  };

  const generateColorPalette = () => {
    const baseHue = Math.floor(Math.random() * 360);
    const hues = [
      `hsl(${baseHue}, 60%, 50%)`,
      `hsl(${(baseHue + 30) % 360}, 60%, 50%)`,
      `hsl(${(baseHue + 60) % 360}, 60%, 50%)`,
      `hsl(${(baseHue + 180) % 360}, 60%, 50%)`
    ];
    const lightColor = `hsl(${baseHue}, 80%, 85%)`;
    const darkColor = `hsl(${baseHue}, 50%, 20%)`;

    if (palette.length > 0) {
      setPaletteHistory((prev) => [palette, ...prev]);
    }

    setPalette([...hues, lightColor, darkColor]);
  };

  const shuffleBoth = () => {
    setArtwork(null);
    fetchRandomArtwork();
    generateColorPalette();
  };

  const shuffleSingleColor = (index) => {
    setPalette((prevPalette) =>
      prevPalette.map((color, idx) => (idx === index ? generateSingleColor() : color))
    );
  };

  useEffect(() => {
    shuffleBoth();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto bg-gray-100 rounded-xl shadow-md text-center">
      <h1 className="text-2xl font-semibold mb-4 inline-block bg-yellow-500 px-2 py-1 rounded">Metropolitan Museum Artwork and Colour Palette Generator</h1>

      {artwork && (
        <div className="mb-4 flex flex-col items-center">
          <div className="p-2 bg-yellow-500 rounded shadow-lg inline-block">
            <img src={artwork.primaryImageSmall} alt={artwork.title} className="max-h-96 rounded-md shadow" />
          </div>
          <h2 className="mt-2 font-medium text-lg">
            <a href={artwork.objectURL} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">
              {artwork.title}
            </a>
          </h2>
          <p className="italic">{artwork.artistDisplayName || 'Unknown Artist'}, {artwork.objectDate}</p>
        </div>
      )}

      <div className="flex justify-center gap-4 mb-4">
        {palette.map((color, idx) => (
          <div key={idx} className="flex flex-col items-center relative">
            <div
              style={{ backgroundColor: color }}
              className="w-20 h-20 rounded-full shadow flex items-center justify-center"
            >
              <button onClick={() => shuffleSingleColor(idx)} className="text-black bg-white rounded-full p-1 shadow hover:bg-gray-200">
                <RefreshCw size={16} />
              </button>
            </div>
            <span className="text-xs text-black mt-1">{hslToHex(color)}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-center mb-4">
        <button onClick={fetchRandomArtwork} className="px-4 py-2 bg-yellow-500 text-black rounded-md shadow hover:bg-yellow-600">Shuffle Artwork</button>
        <button onClick={generateColorPalette} className="px-4 py-2 bg-yellow-500 text-black rounded-md shadow hover:bg-yellow-600">Shuffle Palette</button>
        <button onClick={shuffleBoth} className="px-4 py-2 bg-yellow-500 text-black rounded-md shadow hover:bg-yellow-600">Shuffle Both</button>
      </div>

      <div className="flex justify-center items-center gap-2 mb-2">
        <h3 className="font-medium text-lg">Shuffle History</h3>
        <button onClick={() => { setArtworkHistory([]); setPaletteHistory([]); }} className="px-2 py-1 bg-yellow-500 text-black rounded-md shadow hover:bg-yellow-600 text-xs">
          Reset History
        </button>
      </div>
      <div className="mb-4">
        <h4 className="font-medium">Artwork History</h4>
        <ul className="flex flex-col-reverse gap-2 items-center">
          {artworkHistory.map((art, idx) => (
            <li key={idx}>
              <a href={art.objectURL} target="_blank" rel="noopener noreferrer">
                <img src={art.primaryImageSmall} alt={art.title} className="h-16 inline-block rounded shadow-sm" />
                <p className="text-xs">{art.title}</p>
              </a>
            </li>
          ))}
        </ul>

        <h4 className="font-medium mt-4">Palette History</h4>
        <ul className="flex flex-col-reverse gap-2 items-center">
          {paletteHistory.map((pal, idx) => (
            <li key={idx} className="flex gap-1 justify-center">
              {pal.map((col, i) => (
                <div key={i} style={{ backgroundColor: col }} className="w-6 h-6 rounded-full shadow"></div>
              ))}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs mt-1 text-gray-500">Generator created by @bongislife69. All images belong to www.metmuseum.org</p>
    </div>
  );
}
