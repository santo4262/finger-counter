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

function countFingers(landmarks) {
  let count = 0;

  // Thumb
  if (landmarks[4].x < landmarks[3].x) count++;

  // Index
  if (landmarks[8].y < landmarks[6].y) count++;

  // Middle
  if (landmarks[12].y < landmarks[10].y) count++;

  // Ring
  if (landmarks[16].y < landmarks[14].y) count++;

  // Pinky
  if (landmarks[20].y < landmarks[18].y) count++;

  return count;
}

function onResults(results) {
  if (results.multiHandLandmarks &&
      results.multiHandLandmarks.length > 0) {

    const landmarks = results.multiHandLandmarks[0];
    const fingers = countFingers(landmarks);

    countElement.innerText = fingers;
  }
}

navigator.mediaDevices.getUserMedia({
  video: true
})
.then(function(stream) {

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
.catch(function(error) {
  console.log("Camera Error:", error);
});