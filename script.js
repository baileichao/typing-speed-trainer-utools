document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const stopButton = document.getElementById('stopButton');
    const typingArea = document.getElementById('typingArea');
    const displayText = document.getElementById('displayText');
    const typingInput = document.getElementById('typingInput');
    const timeElement = document.getElementById('time');
    const wpmElement = document.getElementById('wpm');
    const accuracyElement = document.getElementById('accuracy');
    const keystrokesElement = document.getElementById('keystrokes');
    const codeLengthElement = document.getElementById('codeLength');
    const backspacesElement = document.getElementById('backspaces');
    const errorsElement = document.getElementById('errors');
    const controlButtons = document.getElementById('controlButtons');
    const statsTableBody = document.getElementById('statsTableBody');
    const fontSelector = document.getElementById('fontSelector');

    const defaultText = `心的出口`;

    // 设置默认文本
    inputText.value = defaultText;

    let totalCharsTyped = 0;
    let correctCharsTyped = 0;
    let isPaused = false;
    let elapsedTime = 0;
    let totalKeystrokes = 0;
    let backspaceCount = 0;
    let isStarted = false;
    let currentLineIndex = 0;
    let typingStartTime = null;
    let typingTotalTime = 0;
    let timerInterval = null;
    let firstCharTyped = false;
    let lastCharTime = null;
    let totalActiveTypingTime = 0;
    let typingStartTimeString = '';
    let isResumed = false;

    // 从本地存储加载打字记录
    loadStatsFromLocalStorage();

    function resetStats() {
        totalCharsTyped = 0;
        correctCharsTyped = 0;
        elapsedTime = 0;
        totalKeystrokes = 0;
        backspaceCount = 0;
        typingTotalTime = 0;
        typingStartTime = null;
        firstCharTyped = false;
        lastCharTime = null;
        totalActiveTypingTime = 0;
        updateStats();
    }

    startButton.addEventListener('click', () => {
        console.log("Start button clicked"); // 调试信息
        const text = inputText.value.trim();
        if (text) {
            displayText.textContent = text;
            inputText.style.display = 'none';
            startButton.style.display = 'none';
            controlButtons.style.display = 'flex';
            typingArea.style.display = 'block';
            typingInput.focus();
            resetStats();
            isStarted = true;
            typingStartTimeString = getCurrentDateTimeString(); // 记录开始时间
        } else {
            console.error("Input text is empty"); // 调试信息
        }
    });

    pauseButton.addEventListener('click', () => {
        if (isPaused) {
            resumeTyping();
            pauseButton.textContent = '暂停';
        } else {
            pauseTyping();
            pauseButton.textContent = '继续';
        }
    });

    stopButton.addEventListener('click', () => {
        stopTyping();
    });

    typingInput.addEventListener('keydown', (event) => {
        if (!isPaused && !firstCharTyped && event.key !== 'Backspace') {
            firstCharTyped = true;
            startTimer();
        }
        if (event.key === 'Backspace') {
            backspaceCount++;
        }
        totalKeystrokes++;
    });

    typingInput.addEventListener('input', () => {
        if (!isPaused) {
            if (typingStartTime) {
                typingTotalTime += (new Date() - typingStartTime) / 1000;
                typingStartTime = null;
            }

            const typedText = typingInput.value;
            totalCharsTyped = countChars(typedText);
            correctCharsTyped = 0;

            const currentTime = new Date();

            if (lastCharTime) {
                const interval = (currentTime - lastCharTime) / 1000;
                totalActiveTypingTime += interval;
            }

            lastCharTime = currentTime;

            for (let i = 0; i < typedText.length; i++) {
                if (typedText[i] === displayText.textContent[i]) {
                    correctCharsTyped++;
                }
            }

            highlightText(typedText);

            if (typedText === displayText.textContent && !isPaused) {
                isStarted = false;
                updateStats();
                stopTimer();  // Stop the timer when typing is complete
                addStatsToTable();  // Add stats to table when typing is complete
                stopTyping();
            }

            updateStats();
            autoScrollTextarea();
        }
    });

    function startTyping() {
        typingTotalTime = 0;
        typingStartTime = null;
    }

    function pauseTyping() {
        isPaused = true;
        clearInterval(timerInterval);
    }

    function resumeTyping() {
        isPaused = false;
        isResumed = true;
        startTimer();
    }

    function stopTyping() {
        isPaused = false;
        isStarted = false;
        clearInterval(timerInterval);
        inputText.style.display = 'block';
        startButton.style.display = 'inline-block';
        controlButtons.style.display = 'none';
        typingArea.style.display = 'none';
        typingInput.value = '';
        typingInput.disabled = false;
        currentLineIndex = 0;
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            if (!isPaused) {
                elapsedTime += 0.1;
                timeElement.textContent = elapsedTime.toFixed(1);
            }
        }, 100);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    function updateStats() {
        const wpm = calculateWPM(totalCharsTyped, totalActiveTypingTime);
        wpmElement.textContent = wpm.toFixed(1);

        const accuracy = ((correctCharsTyped / totalCharsTyped) * 100).toFixed(1);
        accuracyElement.textContent = accuracy;

        const keystrokesPerSecond = totalKeystrokes / elapsedTime;
        keystrokesElement.textContent = keystrokesPerSecond.toFixed(1);

        const codeLength = totalKeystrokes / totalCharsTyped;
        codeLengthElement.textContent = codeLength.toFixed(1);

        const errors = calculateErrors(typingInput.value, displayText.textContent);
        errorsElement.textContent = errors;

        backspacesElement.textContent = backspaceCount;

        timeElement.textContent = elapsedTime.toFixed(1);
    }

    function calculateWPM(chars, activeTime) {
        if (activeTime === 0) return 0;
        return (chars / activeTime) * 60;
    }

    function calculateErrors(typedText, originalText) {
        let errors = 0;
        for (let i = 0; i < typedText.length; i++) {
            if (typedText[i] !== originalText[i]) {
                errors++;
            }
        }
        return errors;
    }

    function countChars(text) {
        let count = 0;
        for (let char of text) {
            if (char.match(/[^\x00-\xff]/) || char.match(/[.,\/#!$%\^&\*;:{}=\-_`~()]/)) {
                count += 1;
            } else {
                count += 1;
            }
        }
        return count;
    }

    function highlightText(typedText) {
        const text = displayText.textContent;
        let highlightedText = '';
        for (let i = 0; i < text.length; i++) {
            if (i < typedText.length) {
                if (typedText[i] === text[i]) {
                    highlightedText += `<span class="highlight">${text[i]}</span>`;
                } else {
                    highlightedText += `<span class="error">${text[i]}</span>`;
                }
            } else {
                highlightedText += text[i];
            }
        }
        displayText.innerHTML = highlightedText;
    }

    function autoScrollTextarea() {
        const typedText = typingInput.value;
        const lines = displayText.textContent.split('\n');
        const currentLine = typedText.split('\n').length;

        if (currentLine > currentLineIndex + 7) {
            currentLineIndex += 3;
            updateDisplayText();
        }
    }

    function updateDisplayText() {
        const lines = displayText.textContent.split('\n');
        const visibleLines = lines.slice(currentLineIndex, currentLineIndex + 7).join('\n');
        inputText.value = visibleLines;
    }

    function addStatsToTable() {
        const wpm = calculateWPM(totalCharsTyped, totalActiveTypingTime).toFixed(1);
        const accuracy = ((correctCharsTyped / totalCharsTyped) * 100).toFixed(1);
        const keystrokesPerSecond = (totalKeystrokes / elapsedTime).toFixed(1);
        const codeLength = (totalKeystrokes / totalCharsTyped).toFixed(1);
        const errors = calculateErrors(typingInput.value, displayText.textContent);
        const backspaces = backspaceCount;
        const time = elapsedTime.toFixed(1);

        const newRow = `
            <tr>
                <td>${typingStartTimeString}</td>
                <td>${time}</td>
                <td>${wpm}</td>
                <td>${accuracy}</td>
                <td>${keystrokesPerSecond}</td>
                <td>${codeLength}</td>
                <td>${backspaces}</td>
                <td>${errors}</td>
            </tr>
        `;

        statsTableBody.insertAdjacentHTML('afterbegin', newRow);

        // 保持最近5次记录
        while (statsTableBody.rows.length > 5) {
            statsTableBody.deleteRow(5);
        }

        // 保存打字记录到本地存储
        saveStatsToLocalStorage();
    }

    function saveStatsToLocalStorage() {
        const stats = [];
        for (let i = 0; i < statsTableBody.rows.length; i++) {
            const row = statsTableBody.rows[i];
            const record = {
                startTime: row.cells[0].textContent,
                time: row.cells[1].textContent,
                wpm: row.cells[2].textContent,
                accuracy: row.cells[3].textContent,
                keystrokesPerSecond: row.cells[4].textContent,
                codeLength: row.cells[5].textContent,
                backspaces: row.cells[6].textContent,
                errors: row.cells[7].textContent
            };
            stats.push(record);
        }
        localStorage.setItem('typingStats', JSON.stringify(stats));
    }

    function loadStatsFromLocalStorage() {
        const stats = JSON.parse(localStorage.getItem('typingStats')) || [];
        stats.forEach(record => {
            const newRow = `
                <tr>
                    <td>${record.startTime}</td>
                    <td>${record.time}</td>
                    <td>${record.wpm}</td>
                    <td>${record.accuracy}</td>
                    <td>${record.keystrokesPerSecond}</td>
                    <td>${record.codeLength}</td>
                    <td>${record.backspaces}</td>
                    <td>${record.errors}</td>
                </tr>
            `;
            statsTableBody.insertAdjacentHTML('beforeend', newRow);
        });
    }

    function getCurrentDateTimeString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    // 动态加载系统字体
    function loadSystemFonts() {
        const fontList = [
            "Arial", "Verdana", "Helvetica", "Tahoma", "Trebuchet MS", "Times New Roman",
            "Georgia", "Garamond", "Courier New", "Brush Script MT"
        ];
        fontList.forEach(font => {
            const option = document.createElement('option');
            option.value = font;
            option.textContent = font;
            fontSelector.appendChild(option);
        });
    }

    // 设置字体
    fontSelector.addEventListener('change', (event) => {
        const selectedFont = event.target.value;
        inputText.style.fontFamily = selectedFont;
        typingInput.style.fontFamily = selectedFont;
    });

    // 加载系统字体
    loadSystemFonts();
});
