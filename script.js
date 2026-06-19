const videoElement = document.getElementById("video");
const countElement = document.getElementById("count");

const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

hands.onResults(onResults);

// Store previous count so speech only happens when count changes
let lastCount = -1;

// Text-to-Speech Function
function speakCount(count) {
  if (count === lastCount) return;

  lastCount = count;

  // Stop any ongoing speech
  window.speechSynthesis.cancel();

  const messages = [
    "Zero fingers detected",
    "One finger detected",
    "Two fingers detected",
    "Three fingers detected",
    "Four fingers detected",
    "Five fingers detected"
  ];

  const speech = new SpeechSynthesisUtterance(messages[count]);

  speech.lang = "en-US";
  speech.rate = 1;
  speech.pitch = 1;

  window.speechSynthesis.speak(speech);
}

// Finger Counting Logic
function countFingers(landmarks) {
  let count = 0;

  // Thumb
  if (landmarks[4].x < landmarks[3].x) count++;

  // Index Finger
  if (landmarks[8].y < landmarks[6].y) count++;

  // Middle Finger
  if (landmarks[12].y < landmarks[10].y) count++;

  // Ring Finger
  if (landmarks[16].y < landmarks[14].y) count++;

  // Pinky Finger
  if (landmarks[20].y < landmarks[18].y) count++;

  return count;
}

// Process MediaPipe Results
function onResults(results) {
  if (
    results.multiHandLandmarks &&
    results.multiHandLandmarks.length > 0
  ) {
    const landmarks = results.multiHandLandmarks[0];
    const fingers = countFingers(landmarks);

    // Update count on screen
    countElement.innerText = fingers;

    // Speak count
    speakCount(fingers);
  }
}

// Start Webcam
navigator.mediaDevices
  .getUserMedia({
    video: true
  })
  .then(function (stream) {
    videoElement.srcObject = stream;

    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await hands.send({
          image: videoElement
        });
      },
      width: 640,
      height: 480
    });

    camera.start();
  })
  .catch(function (error) {
    console.log("Camera Error:", error);
  });
