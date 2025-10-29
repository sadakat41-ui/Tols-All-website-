/* /js/tools.js */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Word Counter
    const wordCounterTextarea = document.getElementById('wordCounterTextarea');
    if (wordCounterTextarea) {
        wordCounterTextarea.addEventListener('input', () => {
            const text = wordCounterTextarea.value;
            
            // Words
            const words = text.match(/\b\w+\b/g) || [];
            document.getElementById('word-count').innerText = words.length;
            
            // Characters (with spaces)
            document.getElementById('char-count').innerText = text.length;
            
            // Characters (without spaces)
            document.getElementById('char-count-no-space').innerText = text.replace(/\s/g, '').length;
            
            // Sentences
            const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
            document.getElementById('sentence-count').innerText = sentences.length;
            
            // Paragraphs
            const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0) || [];
            document.getElementById('paragraph-count').innerText = paragraphs.length;
        });
    }

    // 2. Calculator
    const calculatorDisplay = document.getElementById('calc-display');
    const calculatorButtons = document.querySelectorAll('.calc-btn');
    if (calculatorDisplay) {
        let currentInput = '0';
        let firstValue = null;
        let operator = null;
        let waitingForSecondValue = false;

        function updateDisplay() {
            calculatorDisplay.value = currentInput;
        }

        calculatorButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const { value } = e.target;
                
                if (!isNaN(value) || value === '.') { // Number or decimal
                    if (currentInput === '0' || waitingForSecondValue) {
                        currentInput = value;
                        waitingForSecondValue = false;
                    } else {
                        currentInput += value;
                    }
                } else if (value === 'C') { // Clear
                    currentInput = '0';
                    firstValue = null;
                    operator = null;
                    waitingForSecondValue = false;
                } else if (value === '=') { // Equals
                    if (firstValue === null || operator === null) return;
                    
                    const secondValue = parseFloat(currentInput);
                    let result;
                    const first = parseFloat(firstValue);

                    if (operator === '+') result = first + secondValue;
                    else if (operator === '-') result = first - secondValue;
                    else if (operator === '*') result = first * secondValue;
                    else if (operator === '/') result = first / secondValue;
                    
                    currentInput = String(result);
                    firstValue = null;
                    operator = null;
                } else { // Operator (+, -, *, /)
                    if (firstValue === null) {
                        firstValue = currentInput;
                    } else if (operator) {
                        // Handle chain operations
                        const secondValue = parseFloat(currentInput);
                        let result;
                        const first = parseFloat(firstValue);
                        if (operator === '+') result = first + secondValue;
                        else if (operator === '-') result = first - secondValue;
                        else if (operator === '*') result = first * secondValue;
                        else if (operator === '/') result = first / secondValue;
                        currentInput = String(result);
                        firstValue = currentInput;
                    }
                    waitingForSecondValue = true;
                    operator = value;
                }
                
                updateDisplay();
            });
        });
        updateDisplay();
    }

    // 3. Text to Speech
    const ttsTextarea = document.getElementById('tts-text');
    const ttsButton = document.getElementById('tts-button');
    const ttsVoiceSelect = document.getElementById('tts-voice');
    if (ttsButton) {
        let voices = [];
        const synth = window.speechSynthesis;

        function populateVoiceList() {
            voices = synth.getVoices();
            ttsVoiceSelect.innerHTML = ''; // Clear existing
            voices.forEach(voice => {
                let option = document.createElement('option');
                option.textContent = `${voice.name} (${voice.lang})`;
                option.setAttribute('data-lang', voice.lang);
                option.setAttribute('data-name', voice.name);
                ttsVoiceSelect.appendChild(option);
            });
        }
        populateVoiceList();
        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = populateVoiceList;
        }

        ttsButton.addEventListener('click', () => {
            if (synth.speaking) {
                synth.cancel();
            }
            if (ttsTextarea.value !== '') {
                const utterThis = new SpeechSynthesisUtterance(ttsTextarea.value);
                const selectedOption = ttsVoiceSelect.selectedOptions[0].getAttribute('data-name');
                const selectedVoice = voices.find(voice => voice.name === selectedOption);
                utterThis.voice = selectedVoice;
                synth.speak(utterThis);
            }
        });
    }

    // 4. QR Code Generator
    const qrForm = document.getElementById('qr-form');
    if (qrForm) {
        qrForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = document.getElementById('qr-text').value;
            const qrCodeContainer = document.getElementById('qr-code');
            qrCodeContainer.innerHTML = ''; // Clear old QR code

            if (!text) {
                alert('Please enter text or URL');
                return;
            }

            // This uses the 'qrcode.min.js' library
            new QRCode(qrCodeContainer, {
                text: text,
                width: 256,
                height: 256,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        });
    }

    // 5. Image Compressor
    const imageCompressorForm = document.getElementById('image-compressor-form');
    if (imageCompressorForm) {
        const imageInput = document.getElementById('image-input');
        const qualityInput = document.getElementById('quality-slider');
        const qualityValue = document.getElementById('quality-value');
        const resultContainer = document.getElementById('compression-result');
        const downloadBtn = document.getElementById('download-btn');
        let compressedImageURL = null;
        
        qualityInput.addEventListener('input', (e) => {
            qualityValue.textContent = e.target.value;
        });

        imageCompressorForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const file = imageInput.files[0];
            if (!file) {
                alert('Please select an image file.');
                return;
            }

            const quality = parseInt(qualityInput.value) / 100; // Convert 0-100 to 0-1

            const options = {
                maxSizeMB: 1, // (This is just a default, the quality slider is more important)
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                quality: quality
            }
            
            resultContainer.innerHTML = 'Compressing...';

            try {
                // This uses the 'browser-image-compression' library
                const compressedFile = await imageCompression(file, options);
                
                const originalSize = (file.size / 1024).toFixed(2);
                const compressedSize = (compressedFile.size / 1024).toFixed(2);
                const reduction = 100 - (compressedSize / originalSize) * 100;

                compressedImageURL = URL.createObjectURL(compressedFile);
                
                resultContainer.innerHTML = `
                    <p>Original Size: <strong>${originalSize} KB</strong></p>
                    <p>Compressed Size: <strong>${compressedSize} KB</strong></p>
                    <p>Reduction: <strong>${reduction.toFixed(1)}%</strong></p>
                    <img src="${compressedImageURL}" alt="Compressed Image" style="max-width: 100%; margin-top: 15px;">
                `;
                downloadBtn.href = compressedImageURL;
                downloadBtn.download = `compressed-${file.name}`;
                downloadBtn.style.display = 'inline-block';

            } catch (error) {
                console.error(error);
                resultContainer.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
                downloadBtn.style.display = 'none';
            }
        });
    }
});
