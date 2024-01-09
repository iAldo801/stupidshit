let audioContext = null;
let analyser = null;
let candleRemoved = false;
let updateCounter = 0;
const updateInterval = 15;

async function startMicrophone() {
  try {
    audioContext = new AudioContext();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const microphone = audioContext.createMediaStreamSource(stream);

    analyser = audioContext.createAnalyser();
    microphone.connect(analyser);

    detectBlow();
  } catch (error) {
    console.error('Error accessing microphone:', error);
    alert('Failed to access microphone. Please grant microphone access and try again.');
  }
}

async function stopMicrophone() {
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}

function detectBlow() {
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);

  let sum = 0;
  for (let i = 0; i < bufferLength; i++) {
    sum += dataArray[i];
  }
  const average = sum / bufferLength;
  const threshold = 100;

  if (average > threshold && !candleRemoved) {
    const candles = document.querySelectorAll('.candle');
    if (candles.length > 0) {
      const lastCandle = candles[candles.length - 1];
      lastCandle.remove();
      candleRemoved = true;
    }
  } else {
    candleRemoved = false;
  }

  if (updateCounter >= updateInterval) {
    document.getElementById('threshold-level').innerHTML = average.toFixed(2);
    updateCounter = 0;
  } else {
    updateCounter++;
  }

  requestAnimationFrame(detectBlow);
}

function addCandle(event) {
  const cake = document.getElementById('cake');
  const newCandle = document.createElement('div');
  newCandle.className = 'candle';
  newCandle.style.left = `${event.clientX - cake.offsetLeft}px`;
  newCandle.style.top = `${event.clientY - cake.offsetTop - 50}px`;
  cake.appendChild(newCandle);
}
