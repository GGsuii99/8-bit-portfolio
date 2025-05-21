   // --- Global Sound Setup (Tone.js) ---
        // Ensure Tone.js is started by a user gesture for audio to play
        // This is crucial for browsers that require user interaction before playing audio.
        document.documentElement.addEventListener('mousedown', () => {
            if (Tone.context.state !== 'running') {
                Tone.start();
            }
        });
        document.documentElement.addEventListener('keydown', (e) => {
            if (Tone.context.state !== 'running') {
                Tone.start();
            }
        });

        // Basic Synth for 8-bit sounds
        const synth = new Tone.Synth({
            oscillator: { type: "square" }, // Square wave for 8-bit feel
            envelope: {
                attack: 0.005,
                decay: 0.1,
                sustain: 0.05,
                release: 0.1
            }
        }).toDestination();

        // New sound for typewriter effect
        const typewriterClick = new Tone.Synth({
            oscillator: { type: "square" },
            envelope: { attack: 0.001, decay: 0.02, sustain: 0, release: 0.01 }
        }).toDestination();

        function playSound(note = "C4", duration = "8n", volume = -10) {
            synth.triggerAttackRelease(note, duration, Tone.context.currentTime, volume);
        }

        function playTypewriterClick() {
            typewriterClick.triggerAttackRelease("C3", "64n", Tone.context.currentTime, -15); // Short, low click
        }

        // --- Loading Screen Logic ---
        const loadingOverlay = document.getElementById('loading-overlay');
        const progressBar = document.getElementById('progressBar');
        const percentageText = document.getElementById('percentageText');
        const loadingScreenText = document.getElementById('loadingScreenText'); // Get the loading text element
        const mainPortfolio = document.getElementById('main-portfolio');

        let progress = 0;
        const intervalTime = 100; // Increased to make loading longer
        const increment = 1;

        function updateProgress() {
            if (progress < 100) {
                progress += increment;
                if (progress > 100) {
                    progress = 100;
                }
                progressBar.style.width = progress + '%';
                percentageText.textContent = progress + '%';
                // Loading screen text always "LOADING..."
                loadingScreenText.textContent = 'LOADING...';
            } else {
                clearInterval(loadingInterval);
                percentageText.textContent = 'COMPLETE!';
                playSound("C5", "8n", -5); // Play a higher pitch beep for completion
                setTimeout(() => {
                    loadingOverlay.style.opacity = '0';
                    setTimeout(() => {
                        loadingOverlay.style.display = 'none';
                        mainPortfolio.style.display = 'flex'; // Show the portfolio
                        // Initialize the terminal after it's visible
                        initializeTerminal();
                    }, 1000); // Wait for fade out to complete
                }, 500);
            }
        }
        const loadingInterval = setInterval(updateProgress, intervalTime);

        // --- Portfolio Tab Logic ---
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                playSound("C4", "16n"); // Play sound on tab click

                // Stop any running effects when switching tabs
                if (isMatrixRainActive) {
                    toggleMatrixRain(false);
                }
                if (isDiscoModeActive) {
                    toggleDiscoMode(false);
                }
                if (isGlitchActive) {
                    toggleGlitchEffect(false);
                }
                if (isLightsOn) {
                    toggleLights(false);
                }

                // Remove 'active' from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                // Add 'active' to the clicked button
                button.classList.add('active');

                // Show the corresponding content
                const tabId = button.dataset.tab + '-content';
                document.getElementById(tabId).classList.add('active');
            });
        });

        // --- Terminal Logic ---
        const terminalOutput = document.getElementById('terminal-output');
        const terminalInput = document.getElementById('terminal-input');
        const promptText = 'C:\\USER>';

        // Optimized function to simulate typing text
        let currentTypingLineElement = null; // Global reference to the current line being typed

        function typeText(containerElement, text, speed = 30, callback = null, perCharSound = null) {
            // Create a new <pre> element for the current line of output
            // <pre> maintains whitespace and line breaks for ASCII art and terminal-like text.
            const lineElement = document.createElement('pre');
            // Remove margin from <pre> so it doesn't add extra space
            lineElement.style.margin = '0';
            lineElement.style.whiteSpace = 'pre-wrap'; // Ensure wrapping for long lines
            lineElement.style.wordWrap = 'break-word'; // Break words if necessary

            containerElement.appendChild(lineElement);
            containerElement.scrollTop = containerElement.scrollHeight; // Scroll to bottom before typing begins

            let i = 0;
            currentTypingLineElement = lineElement; // Set the global reference to this new line

            function type() {
                if (!currentTypingLineElement) { // If somehow cleared externally
                    if (callback) callback();
                    return;
                }

                if (i < text.length) {
                    if (perCharSound) perCharSound(); // Play sound for each character
                    let charToAdd = text.charAt(i);
                    // Handle HTML tags within the text
                    if (charToAdd === '<') {
                        let tagEnd = text.indexOf('>', i);
                        if (tagEnd !== -1) {
                            // Directly append HTML for tags like <img> or <span>
                            currentTypingLineElement.innerHTML += text.substring(i, tagEnd + 1);
                            i = tagEnd + 1;
                            charToAdd = ''; // Don't add a character, tag was handled
                        }
                    }

                    if (charToAdd) { // If it's a character (not an empty string from tag handling)
                        currentTypingLineElement.textContent += charToAdd;
                    }
                    i++;
                    containerElement.scrollTop = containerElement.scrollHeight; // Scroll to bottom
                    setTimeout(type, speed);
                } else {
                    currentTypingLineElement = null; // Clear global reference after line is complete
                    if (callback) callback();
                    containerElement.scrollTop = containerElement.scrollHeight; // Final scroll
                }
            }
            type();
        }


        // Define regular and easter egg commands
        const regularCommands = `Available commands:\n  - help: Show this message\n  - about: Learn about me\n  - projects: See my work\n  - contact: Get in touch\n  - clear: Clear the terminal\n  - time: Show current time\n  - date: Show current date\n  - credits: View credits`;

        const easterEggCommands = `Hidden commands:\n  - matrix: Activate Matrix Rain\n  - stop matrix: Deactivate Matrix Rain\n  - matrix off: Deactivate Matrix Rain (alias)\n  - history: Display a historical image\n  - ascii: Show random ASCII art\n  - ascii2: Show another random ASCII art\n  - cow: Display an ASCII cow\n  - disco: Activate disco mode\n  - stop disco: Deactivate disco mode\n  - star wars: Initiate Star Wars crawl\n  - 8ball: Ask the magic 8-ball\n  - fortune: Get a random fortune\n  - beep: Play a retro beep sound\n  - glitch: Apply a temporary glitch effect\n  - sysinfo: Display system information\n  - ping: Simulate a network ping\n  - whoami: Display user info\n  - echo [text]: Repeat text\n  - joke: Tell a joke\n  - quote: Get a random quote\n  - dice: Roll a die\n  - flipcoin: Flip a coin\n  - weather: Get mock weather\n  - calc: Mock calculator\n  - cat [filename]: Mock file content\n  - hack: Initiate mock hack\n  - shutdown: Simulate shutdown\n  - reboot: Simulate reboot\n  - lights on/off: Toggle screen brightness\n  - color [color]: Change terminal color\n  - konami: Konami code hint\n  - riddle: Get a riddle\n  - answer: Answer the riddle\n  - play song: Play a short melody\n  - typing test: Start a typing test\n  - matrixcode: Display a matrix code snippet\n  - typewriter: Simulate typewriter effect`; // Added new commands

        // State for riddle/answer
        let currentRiddle = null;
        let currentAnswer = null;
        const riddles = [
            { riddle: "I have cities, but no houses; forests, but no trees; and water, but no fish. What am I?", answer: "A map" },
            { riddle: "What has an eye, but cannot see?", answer: "A needle" },
            { riddle: "What is full of holes but still holds water?", answer: "A sponge" },
            { riddle: "What question can you never answer yes to?", answer: "Are you asleep yet?" }
        ];

        // Function to generate a short matrix code snippet
        function generateMatrixCodeSnippet(length = 40) {
            const chars = 'アァカサタナハマヤラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムヨロヲゴゾドボポヴッン0123456789';
            let snippet = '';
            for (let i = 0; i < length; i++) {
                snippet += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return snippet;
        }

        // Handle commands
        function handleCommand(command) {
            const lowerCommand = command.toLowerCase().trim();
            let response = '';

            // Display the command typed by the user first
            typeText(terminalOutput, `${promptText} ${command}`, 10, () => {
                playSound("E4", "32n"); // Play sound on command entry

                if (lowerCommand.startsWith('echo ')) {
                    response = command.substring(5).trim(); // Get text after 'echo '
                } else if (lowerCommand.startsWith('cat ')) {
                    const filename = lowerCommand.substring(4).trim();
                    if (filename === 'readme.txt') {
                        response = `File: readme.txt\n\nWelcome to my retro portfolio! This system is designed to showcase my projects and skills in a vintage computing environment. Explore the tabs, try the terminal commands, and don't forget to look for hidden features!\n\nLast Modified: 2025-05-21`;
                    } else if (filename === 'config.sys') {
                        response = `File: config.sys\n\nDEVICE=HIMEM.SYS\nDEVICE=EMM386.EXE NOEMS\nDOS=HIGH,UMB\nFILES=40\nBUFFERS=20\nSHELL=COMMAND.COM /P`;
                    } else {
                        response = `Error: File not found: ${filename}`;
                    }
                } else if (lowerCommand.startsWith('calc ')) {
                    response = 'Error: Calculator function not yet implemented. This is a retro system, after all!';
                } else if (lowerCommand.startsWith('lights ')) {
                    const action = lowerCommand.substring(7).trim();
                    if (action === 'on') {
                        toggleLights(true);
                        response = 'Lights: ON. Enjoy the glow!';
                    } else if (action === 'off') {
                        toggleLights(false);
                        response = 'Lights: OFF. Back to the shadows.';
                    } else {
                        response = 'Usage: lights [on/off]';
                    }
                } else if (lowerCommand.startsWith('color ')) {
                    const color = lowerCommand.substring(6).trim();
                    if (['green', 'blue', 'red', 'white', 'yellow'].includes(color)) {
                        terminalOutput.style.color = color;
                        terminalInput.style.color = color;
                        terminalInput.style.caretColor = color;
                        response = `Terminal color set to ${color}.`;
                    } else {
                        response = 'Usage: color [green/blue/red/white/yellow]';
                    }
                }
                else {
                    switch (lowerCommand) {
                        case 'help':
                            response = regularCommands;
                            break;
                        case 'about':
                            response = 'I am a passionate developer specializing in front-end web experiences with a retro flair. My skills include HTML, CSS, JavaScript, and various modern frameworks.';
                            break;
                        case 'projects':
                            response = 'My key projects include "Starfield Explorer" (HTML Canvas), "Retro Arcade Game" (JS/CSS), and a "Data Visualization Dashboard" (React/D3.js). Type "contact" for more details.';
                            break;
                        case 'contact':
                            response = 'You can reach me at developer@retro.com or find me on GitHub: github.com/retro-dev.';
                            break;
                        case 'clear':
                            terminalOutput.innerHTML = '';
                            break;
                        case 'matrix':
                            toggleMatrixRain(true);
                            response = 'Entering the Matrix... Type "stop matrix" or "matrix off" to exit.';
                            break;
                        case 'stop matrix':
                        case 'matrix off': // Alias for stop matrix
                            toggleMatrixRain(false);
                            response = 'Exiting the Matrix...';
                            break;
                        case 'secret':
                            response = easterEggCommands; // Now displays all easter egg commands
                            break;
                        case 'history':
                            // Placeholder image. Replace with your actual history.webp URL.
                            const imageUrl = 'https://placehold.co/400x300/000/FFF?text=Your+History+Image';
                            response = `<img src="${imageUrl}" alt="Historical Image" onerror="this.onerror=null;this.src='https://placehold.co/400x300/FF0000/FFFFFF?text=Image+Not+Found';" />`;
                            break;
                        case 'ascii':
                            response = getRandomAsciiArt();
                            break;
                        case 'ascii2':
                            response = getRandomAsciiArt2(); // Another set of ASCII art
                            break;
                        case 'cow':
                            response = getCowAscii();
                            break;
                        case 'disco':
                            toggleDiscoMode(true);
                            response = 'Disco mode activated! Groovy! Type "stop disco" to stop.';
                            break;
                        case 'stop disco':
                            toggleDiscoMode(false);
                            response = 'Disco mode deactivated. Back to the shadows.';
                            break;
                        case 'star wars':
                            response = getStarWarsCrawl();
                            break;
                        case '8ball':
                            response = getMagic8BallAnswer();
                            break;
                        case 'fortune':
                            response = getFortune();
                            break;
                        case 'beep':
                            playSound("C4", "32n", -5); // Play a specific beep sound
                            response = 'BEEP!';
                            break;
                        case 'glitch':
                            toggleGlitchEffect(true);
                            response = 'Initiating temporary visual distortion...';
                            setTimeout(() => {
                                toggleGlitchEffect(false);
                                typeText(terminalOutput, 'Glitch effect subsided.', 10);
                            }, 1500); // Glitch for 1.5 seconds
                            break;
                        case 'time':
                            response = `Current system time: ${new Date().toLocaleTimeString('en-US', { hour12: false })}`;
                            break;
                        case 'date':
                            response = `Current system date: ${new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}`;
                            break;
                        case 'sysinfo':
                            response = `OS: RETRO-OS v3.1\nCPU: 8-BIT PROCESSOR @ 10MHz\nRAM: 64KB\nSTORAGE: 1.44MB FLOPPY\nSTATUS: ONLINE`;
                            break;
                        case 'ping':
                            response = 'Pinging 127.0.0.1...';
                            setTimeout(() => {
                                typeText(terminalOutput, 'Reply from 127.0.0.1: bytes=32 time=5ms TTL=64');
                                typeText(terminalOutput, 'Reply from 127.0.0.1: bytes=32 time=6ms TTL=64');
                                typeText(terminalOutput, 'Reply from 127.0.0.1: bytes=32 time=4ms TTL=64');
                                typeText(terminalOutput, 'Ping statistics for 127.0.0.1:\n    Packets: Sent = 3, Received = 3, Lost = 0 (0% loss),\nApproximate round trip times in milli-seconds:\n    Minimum = 4ms, Maximum = 6ms, Average = 5ms');
                            }, 1000); // Simulate network delay
                            break;
                        case 'credits':
                            response = 'Developed by: RETRO-DEV\nSpecial thanks to: The 8-bit era\nVersion: 1.0.0';
                            break;
                        case 'whoami':
                            response = 'User: GUEST\nRole: COMMANDER\nAccess Level: 7\nLocation: VIRTUAL_REALITY';
                            break;
                        case 'joke':
                            const jokes = [
                                "Why don't scientists trust atoms? Because they make up everything!",
                                "Why did the computer go to the doctor? Because it had a virus!",
                                "What do you call a fake noodle? An impasta!"
                            ];
                            response = jokes[Math.floor(Math.random() * jokes.length)];
                            break;
                        case 'quote':
                            const quotes = [
                                "The only way to do great work is to love what you do. - Steve Jobs",
                                "That which does not kill us makes us stronger. - Friedrich Nietzsche",
                                "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt"
                            ];
                            response = quotes[Math.floor(Math.random() * quotes.length)];
                            break;
                        case 'dice':
                            response = `You rolled a: ${Math.floor(Math.random() * 6) + 1}`;
                            break;
                        case 'flipcoin':
                            response = Math.random() < 0.5 ? 'Heads' : 'Tails';
                            break;
                        case 'weather':
                            const weatherConditions = ['Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Foggy', 'Pixelated'];
                            const temperatures = ['20C', '25C', '15C', '10C', '30C'];
                            response = `Weather forecast: ${weatherConditions[Math.floor(Math.random() * weatherConditions.length)]}, ${temperatures[Math.floor(Math.random() * temperatures.length)]}`;
                            break;
                        case 'konami':
                            response = 'Up, Up, Down, Down, Left, Right, Left, Right, B, A, Start.';
                            break;
                        case 'riddle':
                            const randomIndex = Math.floor(Math.random() * riddles.length);
                            currentRiddle = riddles[randomIndex];
                            currentAnswer = currentRiddle.answer; // Store the answer
                            response = `Riddle: ${currentRiddle.riddle}`;
                            break;
                        case 'answer':
                            if (currentRiddle) {
                                response = `The answer is: ${currentAnswer}`;
                                currentRiddle = null; // Clear riddle after answer
                                currentAnswer = null;
                            } else {
                                response = 'No active riddle. Type "riddle" to get one!';
                            }
                            break;
                        case 'play song':
                            play8BitSong();
                            response = 'Playing a short tune...';
                            break;
                        case 'typing test':
                            response = 'Type the following phrase as fast as you can: "The quick brown fox jumps over the lazy dog."';
                            break;
                        case 'matrixcode':
                            response = generateMatrixCodeSnippet();
                            break;
                        case 'typewriter':
                            // Special handling for typewriter effect to play sound per character
                            typeText(terminalOutput, "Hello, world! This is a test of the emergency broadcast system.", 50, null, playTypewriterClick);
                            response = ''; // No immediate response, handled by typeText
                            break;
                        case '':
                            response = ''; // No response for empty command
                            break;
                        default:
                            response = `Error: Command not found: '${command}'. Type 'help' for available commands.`;
                            break;
                    }
                }

                // Only type response if it's not handled by special logic (like typewriter)
                if (response && lowerCommand !== 'ping' && lowerCommand !== 'glitch' && !lowerCommand.startsWith('echo ') && lowerCommand !== 'typewriter') {
                    typeText(terminalOutput, response, 10);
                } else if (lowerCommand.startsWith('echo ')) {
                    typeText(terminalOutput, response, 10); // Echo needs to type its response
                }
            });
        }

        // Event listener for terminal input
        terminalInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent new line in input field
                const command = terminalInput.value;
                terminalInput.value = ''; // Clear input
                handleCommand(command);
            }
        });

        // Initial welcome message for the terminal
        function initializeTerminal() {
            typeText(terminalOutput, 'Welcome to the Retro Portfolio CLI!', 20, () => {
                typeText(terminalOutput, 'Type "help" to see available commands.', 20, () => {
                    // 5% chance to add a hint for 'secret' here, after the help message
                    if (Math.random() < 0.05) {
                        typeText(terminalOutput, 'Psst... type \'secret\' for more commands.', 20);
                    }
                });
            });
            terminalInput.focus(); // Focus the input field
        }

        // --- Matrix Rain Easter Egg Logic ---
        const matrixCanvas = document.getElementById('matrix-canvas');
        const ctx = matrixCanvas.getContext('2d');
        let matrixAnimationId = null; // To store the requestAnimationFrame ID
        let isMatrixRainActive = false;

        // Set canvas dimensions to match the portfolio container
        function resizeMatrixCanvas() {
            matrixCanvas.width = mainPortfolio.clientWidth;
            matrixCanvas.height = mainPortfolio.clientHeight;
        }

        // Characters for the Matrix Rain
        const characters = 'アァカサタナハマヤラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムヨロヲゴゾドボポヴッン';
        const fontSize = 16;
        let columns;
        let drops;

        function initializeMatrixRain() {
            resizeMatrixCanvas(); // Set initial size
            columns = matrixCanvas.width / fontSize;
            drops = []; // y-position of each drop
            for (let x = 0; x < columns; x++) {
                drops[x] = 1; // Start at the top
            }
        }

        // Draw function for Matrix Rain
        function drawMatrixRain() {
            // Semi-transparent black rectangle to fade out old characters
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

            ctx.fillStyle = '#00ff00'; // Green text
            ctx.font = fontSize + 'px Pixelify Sans'; // Use Pixelify Sans for matrix characters
            for (let i = 0; i < drops.length; i++) {
                // Get a random character
                const text = characters.charAt(Math.floor(Math.random() * characters.length));
                // Draw the character
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                // Send the drop back to the top randomly
                if (drops[i] * fontSize * 1.5 > matrixCanvas.height && Math.random() > 0.975) { // Adjusted condition for better flow
                    drops[i] = 0;
                }
                // Increment y-position
                drops[i]++;
            }

            matrixAnimationId = requestAnimationFrame(drawMatrixRain);
        }

        // Toggle Matrix Rain visibility and animation
        function toggleMatrixRain(activate) {
            if (activate && !isMatrixRainActive) {
                matrixCanvas.style.display = 'block';
                initializeMatrixRain(); // Re-initialize in case of resize
                matrixAnimationId = requestAnimationFrame(drawMatrixRain);
                isMatrixRainActive = true;
            } else if (!activate && isMatrixRainActive) {
                cancelAnimationFrame(matrixAnimationId);
                matrixCanvas.style.display = 'none';
                isMatrixRainActive = false;
            }
        }

        // --- ASCII Art Easter Egg Logic ---
        const asciiArts = [
            `
  _  _
 | || |
 | || |_
 |__   _|
    |_|
            `,
            `
  /\\_/\\
 ( o.o )
  > ^ <
            `,
            `
  ______
 /      \\
|  O  O  |
|   __   |
 \\______/
            `,
            `
  .--.
 |o_o |
 |:_/ |
 //   \\ \\
(|     | )
/\\_   _/\\
(_/\\ /\\_)
            `
        ];

        const asciiArts2 = [ // Another set of ASCII art
            `
 ( (
  ) )
 ( (
  ) )
 ( (
            `,
            `
  .-.
 (o o)
 | O |
  \`-^-\`
            `,
            `
  /\\_/\\
 ( =.= )
  (   )
            `,
            `
  _  _
 /_\\/_\\
 \\_\\/_/
  \\/\\/
            `
        ];

        function getRandomAsciiArt() {
            return asciiArts[Math.floor(Math.random() * asciiArts.length)];
        }

        function getRandomAsciiArt2() {
            return asciiArts2[Math.floor(Math.random() * asciiArts2.length)];
        }

        // --- Cow ASCII Art Logic ---
        function getCowAscii() {
            return `
  _______
 < Moo!  >
  -------
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
            `;
        }

        // --- Disco Mode Easter Egg Logic ---
        let discoIntervalId = null;
        let isDiscoModeActive = false;
        const discoColors = ['#00ff00', '#00ffff', '#ff00ff', '#ffff00', '#ff0000', '#0000ff'];
        let currentColorIndex = 0;

        function toggleDiscoMode(activate) {
            if (activate && !isDiscoModeActive) {
                isDiscoModeActive = true;
                mainPortfolio.classList.add('disco-mode');
                // The animation handles the color changes via CSS keyframes
            } else if (!activate && isDiscoModeActive) {
                isDiscoModeActive = false;
                mainPortfolio.classList.remove('disco-mode');
                mainPortfolio.style.backgroundColor = '#1a1a1a'; // Reset to default
            }
        }

        // --- Star Wars Crawl Easter Egg Logic ---
        function getStarWarsCrawl() {
            return `
A long time ago in a galaxy far,
far away....

EPISODE IV
A NEW HOPE

It is a period of civil war.
Rebel spaceships, striking
from a hidden base, have won
their first victory against
the evil Galactic Empire.

During the battle, Rebel spies
managed to steal secret plans
to the Empire's ultimate weapon,
the DEATH STAR, an armored
space station with enough power
to destroy an entire planet.

Pursued by the Empire's sinister
agents, Princess Leia races home
aboard her happier starship, custodian of
the stolen plans that can save her
people and restore freedom to the
galaxy....
            `;
        }

        // --- Magic 8-Ball Easter Egg Logic ---
        const magic8BallAnswers = [
            'It is certain.',
            'It is decidedly so.',
            'Without a doubt.',
            'Yes, definitely.',
            'You may rely on it.',
            'As I see it, yes.',
            'Most likely.',
            'Outlook good.',
            'Yes.',
            'Signs point to yes.',
            'Reply hazy, try again.',
            'Better not tell you now.',
            'Cannot predict now.',
            'Concentrate and ask again.',
            'Don\'t count on it.',
            'My reply is no.',
            'My sources say no.',
            'Outlook not so good.',
            'Very doubtful.'
        ];

        function getMagic8BallAnswer() {
            return magic8BallAnswers[Math.floor(Math.random() * magic8BallAnswers.length)];
        }

        // --- Fortune Cookie Easter Egg Logic ---
        const fortunes = [
            'A beautiful, smart, and loving person will be coming into your life.',
            'A faithful friend is a strong defense.',
            'A truly rich life contains love and art in abundance.',
            'All your hard work will soon pay off.',
            'An exciting opportunity lies ahead.',
            'Be careful what you wish for. You might get it.',
            'Believe in yourself and others will too.',
            'Courtesy is contagious.',
            'Don\'t worry about money. The best things in life are free.',
            'Enjoy the good luck a companion brings you.',
            'Every day is a new beginning.',
            'Happiness is not a destination, it is a journey.',
            'If you desire to be a hit, you must be a miss.',
            'Keep your eyes open. You never know what you might see.',
            'Love is on the way.',
            'The early bird gets the worm, but the second mouse gets the cheese.',
            'The greatest risk is not taking one.',
            'You will soon be rewarded for your patience.',
            'Your future is as bright as your faith.',
            'Your talents will be recognized and suitably rewarded.'
        ];

        function getFortune() {
            return fortunes[Math.floor(Math.random() * fortunes.length)];
        }

        // --- Glitch Effect Easter Egg Logic ---
        let glitchTimeoutId = null;
        let isGlitchActive = false;

        function toggleGlitchEffect(activate) {
            if (activate && !isGlitchActive) {
                isGlitchActive = true;
                mainPortfolio.classList.add('glitch-active');
            } else if (!activate && isGlitchActive) {
                isGlitchActive = false;
                mainPortfolio.classList.remove('glitch-active');
                // Reset any inline styles that might have been applied by the animation
                mainPortfolio.style.transform = '';
                mainPortfolio.style.filter = '';
            }
        }

        // --- Lights Effect Easter Egg Logic ---
        let isLightsOn = false;
        function toggleLights(on) {
            if (on && !isLightsOn) {
                document.body.classList.add('lights-on');
                isLightsOn = true;
            } else if (!on && isLightsOn) {
                document.body.classList.remove('lights-on');
                isLightsOn = false;
            }
        }

        // --- Play 8-bit Song Logic ---
        function play8BitSong() {
            const melody = [
                { note: "C4", duration: "8n" },
                { note: "E4", duration: "8n" },
                { note: "G4", duration: "8n" },
                { note: "C5", duration: "4n" },
                { note: "G4", duration: "8n" },
                { note: "E4", duration: "8n" },
                { note: "C4", duration: "4n" }
            ];

            let time = Tone.context.currentTime;
            melody.forEach(noteObj => {
                synth.triggerAttackRelease(noteObj.note, noteObj.duration, time);
                time += Tone.Time(noteObj.duration).toSeconds();
            });
        }

        // Initial setup
        document.addEventListener('DOMContentLoaded', () => {
            // The loading screen handles the initial display of the portfolio.
            // When the portfolio becomes visible, initializeTerminal() is called.
            // The first tab ('about') is already set to active in HTML.
        });