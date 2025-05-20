import { useRef, useState } from "react";
import { loadModelAndLabels, predictImage } from "./tfModel";

function App() {
  const imageRef = useRef<HTMLImageElement>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (imageRef.current) {
        imageRef.current.src = reader.result as string;
        setPrediction(null); // Reset
        setConfidence(null); // Reset
        setImageLoaded(true); // Mark image as loaded
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePredict = async () => {
    if (!imageLoaded || !imageRef.current) return; // Prevent prediction if no image
    setLoading(true); // loads first before awaiting the model
    try {
      await loadModelAndLabels();
      const result = await predictImage(imageRef.current);
      setPrediction(result.label);
      setConfidence(result.confidence);
    } catch (error) {
      console.error("Error during prediction:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Butterfly Classifier</h1>

      <input type="file" accept="image/*" onChange={handleImageUpload} />

      <div>
        <img
          ref={imageRef}
          alt="Preview"
          style={{
            width: 224,
            height: 224,
            margin: "20px",
            objectFit: "cover",
          }}
        />
      </div>

      <button onClick={handlePredict} disabled={!imageLoaded || loading}>
        Predict
      </button>

      {/* think of these are parameters needed to be checked to be used below */}
      {(loading || (prediction && confidence !== null)) && (
        <h2>
          {loading ? (
            <span>Loading...</span>
          ) : (
            <>
              Prediction: <span style={{ color: "green" }}>{prediction}</span>{" "}
              <br />
              Confidence:{" "}
              <span style={{ color: "blue" }}>{confidence?.toFixed(2)}%</span>
            </>
          )}
        </h2>
      )}
    </div>
  );
}

export default App;
