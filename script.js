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

    const defaultText = `在工作或学习中遇到不开心的时候，不妨静下来好好想想，自己到底是对是错。生活中不是你对别人好，别人就该对你好，你要明白这个道理，每个人都有自己的原则，有人功利，有人善良，你不可能要求别人什么。有时间的话，不妨到处走走，在雄伟的高山之间，放声大喊，一吐心中的阴郁，在浪漫的大海之间，看潮起潮落，感悟人生的起伏跌宕，在落日余晖中感受天地的宁静，洗涤心中的贪念。当你遭遇失恋的时候，不要太悲伤，失去的并非能忘记，拥有的并非不会失去。那些缘来缘去都只是人生的一个瞬间，而人生里那些大段的时间，你会和那个懂你，爱你，珍惜你的人一起度过，好好珍惜在你身边默默陪着你的人。每个人都懂得这个道理，可是还是有人执迷不悟，苦苦执着于那个无缘的人，不肯放手，伤了自己，苦了别人。爱他或她就让那份美好的记忆藏在心底，我们都是在爱的挫折中，逐渐成长起来，才知道什么是爱，又该怎样去爱。希望多年以后再次相遇，还能洒脱的说一句，谢谢你曾经爱过我。当你的婚姻出现问题的时候，多些宽容，多些理解，少些责骂。婚姻本来就是两个人的事，一味的埋怨对方，根本不能解决任何问题。多想想曾经的美好回忆，想想两人同吃一碗面的艰难日子，想想曾经心里的感动。试着做一下换位思考，自己错在哪里，多给自己，也给对方一些机会，人都会有缺点，错误，多些包容，你会活得更轻松。如果真的缘尽了，不妨轻轻的放开手，让彼此都留下美好的回忆，道一声珍重再见，如果不能做朋友，也不可能做敌人，就做那个熟悉的陌生人吧。毕竟生活还是要继续，我们还要继续寻找那个有缘之人。当你和孩子出现问题的时候，不妨想想自己的青春年少，想想那些无知的轻狂岁月，我们都是从年轻走过来的。试着去了解今天的孩子想的什么，喜欢什么，当你以一个朋友的身份去了解他们的时候，你就已经是他们的朋友了，多些沟通，多些理解，多些包容，他们才会向你倾诉他们的烦恼，困惑，迷茫。人生不是十全十美，当你的心觉得累了的时候，不妨为自己的心找一个出口。换一个工作，换一种生活，也换一种对待生活的态度。`;

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

            if (typedText === displayText.textContent) {
                isStarted = false;
                updateStats();
                stopTimer();  // Stop the timer when typing is complete
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
});
