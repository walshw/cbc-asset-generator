let body;
let slider;
let typewriter;
let audioSource;
let rangeInterval;
let audioLogInterval;
let audioCtx;
let analyser;
let dataArray;
let bufferLength;
let count = 0;

window.onload = () => {
    body = document.getElementsByTagName("body")[0];
    slider = document.getElementById("slider");
    typewriter = document.getElementById("typewriter");
    audioSource = document.getElementById("userAudio");
};

const uploadAndUseFont = (input) => {
    // I would like to support drag and drop files : )

    // frequency and amplitude https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API

    // https://www.sciencebuddies.org/F0SIcVCx1EXH1YdmU152SeF3K7Y=/650x293/-/https/www.sciencebuddies.org/cdn/Files/12180/10/amplitude-frequency.png
    // Amplitude: Max distance from the equilibrium of a wave
    // Frequency: Distance between period of a wave

    // frequency + amplitude -> weight + width?

    // https://stackoverflow.com/a/63461964/13239430
    // getByteTimeDomainData()
    // Returns byte array of 0-255, which maps from - to + so 128 is 0
    // so if youre graphing out a wave, each element in the array is a point 
    // x - time
    // y - pressure/amplitude (0 < compression) (0 > rarefraction)

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        const fileName = input.files[0].name;

        reader.onload = (e) => {
            const style = document.createElement("style");
            style.textContent = `
            @font-face{
                font-family: '${fileName}';
                src: url(${e.target.result}) format("woff2 supports-variations"),
                     url(${e.target.result}) format("woff2-variations");
            }`;
            document.head.appendChild(style);
            typewriter.style.fontFamily = `"${fileName}"`;
            document.getElementById("fontLabel").innerText = fileName;

            // startRangeLoop();
        }
        reader.readAsDataURL(input.files[0]);
    }
}

const uploadAndUseImage = (input) => {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        const fileName = input.files[0].name;

        reader.onload = (e) => {
            document.getElementById("picture").src = e.target.result;
            document.getElementById("imageLabel").innerText = fileName;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

const uploadAndUseAudio = (input) => {
    if (input.files && input.files[0]) {
        audioSource.src = URL.createObjectURL(input.files[0]);
        document.getElementById("audioLabel").innerText = input.files[0].name;

        setupAudio();
        startLoggingAudio();
    }
}

const startLoggingAudio = () => {
    // calculating average amplitude using Root mean square?
    analyser.getByteTimeDomainData(dataArray);
    const squaredAverage = dataArray.reduce((sum, current) => sum + Math.pow((current - 128) / 128, 2), 0) / bufferLength;
    let shmudgedNumber = Math.round(squaredAverage * 100000);
    const clamped = Math.min(Math.max(shmudgedNumber, 1), 100);
    typewriter.style.fontVariationSettings = `"wght" ${clamped}, "wdth" 0`;
    
    // TODO: Find smoother ways

    requestAnimationFrame(startLoggingAudio);
}

const startRangeLoop = () => {
    if (rangeInterval) {
        clearInterval(rangeInterval);
    }

    rangeInterval = setInterval(() => {
        slider.value = count;
        count = (count + 1) % slider.max;
        typewriter.style.fontWeight = count;

        typewriter.style.fontVariationSettings = `"wght" ${count}, "wdth" 0`
    }, 10);
}

const setupAudio = () => {
    audioCtx = new AudioContext();
    audioSource.onplay = () => audioCtx.resume();
    analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaElementSource(audioSource);
    analyser.fftSize = 256;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    audioSource.volume = 0.25;
    audioSource.loop = true;
    audioSource.play();
}