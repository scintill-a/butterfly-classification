import * as tf from "@tensorflow/tfjs";

let model: tf.GraphModel | null = null;
let labels: string[] = [];

export const loadModelAndLabels = async () => {
  if (!model) {
    model = await tf.loadGraphModel("/tfjsv6_model/model.json");

    const res = await fetch("/tfjsv6_model/labels.json");
    labels = await res.json();
  }
};

export const predictImage = async (img: HTMLImageElement) => {
  //: Promise<{ label: string; confidence: number }> , set a type for output
  if (!model || labels.length === 0) await loadModelAndLabels();

  const tensor = tf.browser
    .fromPixels(img)
    .resizeNearestNeighbor([224, 224])
    .toFloat()
    .div(255.0)
    .expandDims();

  if (!model) {
    throw new Error("Model is not loaded");
  }
  const prediction = model.predict(tensor) as tf.Tensor;
  const data = await prediction.data();
  const predictedIndex = data.indexOf(Math.max(...data));
  const confidence = Math.max(...data) * 100; // Convert to percentage

  return { label: labels[predictedIndex] || "Unknown", confidence };
};
