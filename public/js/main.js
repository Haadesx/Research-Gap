document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const authContainer = document.getElementById('auth-container');
    const loginSection = document.getElementById('login-section');
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const uploadedFiles = document.getElementById('uploaded-files');
    const fileCount = document.getElementById('file-count');
    const analyzeBtn = document.getElementById('analyze-btn');
    const resultsSection = document.getElementById('results-section');
    const uploadSection = document.getElementById('upload-section');
    const resultsContainer = document.getElementById('results-container');
    const newAnalysisBtn = document.getElementById('new-analysis-btn');
    const loadingIndicator = document.querySelector('.loading');
    const historySidePanel = document.getElementById('history-side-panel');
    const sideHistoryListContainer = document.getElementById('side-history-list');
    const toggleHistoryBtn = document.getElementById('toggle-history-panel-btn');
    
    // Chat elements
    // const chatContainer = document.getElementById('chat-container');
    // const chatMessages = document.getElementById('chat-messages');
    // const chatInput = document.getElementById('chat-input');
    // const sendMessageBtn = document.getElementById('send-message-btn');
    // const toggleChatBtn = document.getElementById('toggle-chat-btn');
    
    // Store uploaded files and analysis results
    let files = [];
    let user = null;
    let analysisResults = null;
    // let chatHistory = [];
    
    // Initialize particles.js for background effect
    if (window.particlesJS) {
        particlesJS('particles-js', {
            "particles": {
                "number": {
                    "value": 50,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": "#3f51b5"
                },
                "shape": {
                    "type": "circle",
                    "stroke": {
                        "width": 0,
                        "color": "#000000"
                    },
                    "polygon": {
                        "nb_sides": 5
                    }
                },
                "opacity": {
                    "value": 0.5,
                    "random": true,
                    "anim": {
                        "enable": false,
                        "speed": 1,
                        "opacity_min": 0.1,
                        "sync": false
                    }
                },
                "size": {
                    "value": 3,
                    "random": true,
                    "anim": {
                        "enable": false,
                        "speed": 40,
                        "size_min": 0.1,
                        "sync": false
                    }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#3f51b5",
                    "opacity": 0.2,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 2,
                    "direction": "none",
                    "random": false,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": {
                        "enable": false,
                        "rotateX": 600,
                        "rotateY": 1200
                    }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {
                        "enable": true,
                        "mode": "grab"
                    },
                    "onclick": {
                        "enable": true,
                        "mode": "push"
                    },
                    "resize": true
                },
                "modes": {
                    "grab": {
                        "distance": 140,
                        "line_linked": {
                            "opacity": 0.6
                        }
                    },
                    "push": {
                        "particles_nb": 4
                    }
                }
            },
            "retina_detect": true
        });
    }
    
    // Check authentication status on page load
    checkAuth();
    
    // Add floating animation to key elements for visual interest
    // Moved this to be applied after UI sections are potentially shown
    // document.querySelectorAll('h1, h2, .upload-container, .file-list').forEach(el => {
    //     el.classList.add('float-animation');
    // });
    
    // Make sure all animations are properly initialized
    // Moved this call into showAuthenticatedUI and showLoginUI to ensure correct timing
    // if (window.appAnimations) {
    //     // Initialize animations
    //     initializeAnimations();
    // }
    
    // Function to add result card animations
    function addResultCardAnimations() {
        document.querySelectorAll('.result-item').forEach(item => {
            item.classList.add('result-card');
        });
    }
    
    // Function to check authentication status
    async function checkAuth() {
        try {
            const response = await fetch('/api/user');
            const data = await response.json();
            
            if (data.isAuthenticated) {
                user = data.user;
                showAuthenticatedUI();
                loadSessionData();
                // loadChatHistory(); // Don't load chat history
            } else {
                user = null; // Explicitly set user to null
                // Not authenticated: Show Login UI
                showLoginUI();
            }
            updateAuthUI();

        } catch (error) {
            console.error('Error checking authentication:', error);
            // Error during auth check: Default to Login UI
            user = null;
            showLoginUI();
            updateAuthUI();
        }
    }
    
    // Function to load saved session data
    function loadSessionData() {
        const savedData = JSON.parse(localStorage.getItem(`researchGapApp_${user.id}`) || '{}');
        
        if (savedData.files && savedData.files.length > 0) {
            // Can't restore File objects, but we can show that there was a previous session
            if (confirm('You have a previous session with uploaded papers. Would you like to restore it?')) {
                if (savedData.analysisResults) {
                    analysisResults = savedData.analysisResults;
                    displayResults(analysisResults);
                    resultsSection.classList.remove('hidden');
                    uploadSection.classList.add('hidden');
                    // toggleChatBtn.classList.remove('hidden');
                }
            }
        }
    }
    
    // Function to save session data
    function saveSessionData() {
        if (!user) return;
        
        const fileNames = files.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type
        }));
        
        const dataToSave = {
            files: fileNames,
            analysisResults: analysisResults,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem(`researchGapApp_${user.id}`, JSON.stringify(dataToSave));
    }
    
    // Function to load chat history
    // async function loadChatHistory() { ... }

    // Function to update auth UI based on authentication status
    function updateAuthUI() {
        if (user) {
            authContainer.innerHTML = `
                <div class="user-info">
                    <img src="${user.picture || '/img/default-avatar.png'}" alt="User Avatar" width="32" height="32">
                    <span>Hello, ${user.name}</span>
                    <a href="/auth/logout" class="logout-btn">Sign Out</a>
                </div>
            `;
            // Optional: Animate user info appearance if needed
            anime.remove(authContainer.querySelector('.user-info'));
            anime({
                targets: authContainer.querySelector('.user-info'),
                opacity: [0, 1],
                translateY: [-10, 0],
                duration: 500
            });
        } else {
            // When logged out, the login section is shown, so header auth might be minimal or hidden
            // Or show a simple sign-in prompt if header is always visible
            authContainer.innerHTML = ''; // Clear it when logged out, as login button is in its own section
            /* Alternative: Keep a simple prompt if header is always visible
            authContainer.innerHTML = `
                <div class="user-info">
                    <a href="/auth/google" class="btn btn-sm btn-outline-primary">Sign In</a>
                </div>
            `;
            anime.remove(authContainer.querySelector('.user-info'));
            anime({
                targets: authContainer.querySelector('.user-info'),
                opacity: [0, 1], duration: 500, delay: 300
            });
            */
        }
    }

    // Function to show authenticated UI (Upload Section for logged-in users)
    function showAuthenticatedUI() {
        console.log("Showing Authenticated UI (Upload Section)");
        loginSection.classList.add('hidden');
        resultsSection.classList.add('hidden');
        uploadSection.classList.remove('hidden');

        // Animate the upload section entrance
        // Using window.animateSection assuming animations.js is loaded and defines it globally
        if (window.animateSection) {
            animateSection('upload-section');
        } else {
            console.warn('animateSection function not found. Skipping entrance animation.');
            // Fallback: simple immediate display if animation function missing
             uploadSection.style.opacity = 1;
             uploadSection.style.transform = 'none';
        }

        // Remove floating animation application from here if entry animation handles it
        applyFloatingAnimations('#upload-section');
    }

    // Function to show login UI
    function showLoginUI() {
        console.log("Showing Login UI");
        loginSection.classList.remove('hidden');
        uploadSection.classList.add('hidden');
        resultsSection.classList.add('hidden');

        // Animate login section elements
        if (window.animateSection) {
             animateSection('login-section');
        } else {
            console.warn('animateSection function not found. Skipping entrance animation.');
             loginSection.style.opacity = 1;
             loginSection.style.transform = 'none';
        }
         // Clear any potential leftover analysis results from previous sessions/demo
         analysisResults = null;
         resultsContainer.innerHTML = '';
         // chatHistory = [];
         // chatMessages.innerHTML = '';
         if (toggleChatBtn) toggleChatBtn.classList.add('hidden');
         if (chatContainer) chatContainer.classList.add('hidden');
    }
    
    // Helper function to apply floating animations (Keep if desired, or remove if entry animations suffice)
    function applyFloatingAnimations(sectionSelector) {
        // Ensure elements exist before adding class
        const elements = document.querySelectorAll(`${sectionSelector} h2, ${sectionSelector} .upload-container, ${sectionSelector} .file-list`);
        elements.forEach(el => {
            if (el && !el.classList.contains('float-animation')) {
                el.classList.add('float-animation');
            }
        });
    }

    // Add event listeners for drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropArea.classList.add('highlight');
    }

    function unhighlight() {
        dropArea.classList.remove('highlight');
    }

    // Handle file drop
    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const droppedFiles = dt.files;
        handleFiles(droppedFiles);
    }

    // Handle file input change
    fileInput.addEventListener('change', () => handleFiles(fileInput.files));

    // Handle files function
    function handleFiles(newFiles) {
        for (let i = 0; i < newFiles.length; i++) {
            // Filter out non-document files
            const file = newFiles[i];
            const fileType = file.type;
            const validTypes = [
                'application/pdf',
                'text/plain',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];
            
            if (validTypes.includes(fileType) || 
                file.name.endsWith('.pdf') || 
                file.name.endsWith('.txt') || 
                file.name.endsWith('.doc') || 
                file.name.endsWith('.docx')) {
                files.push(file);
            } else {
                alert(`File ${file.name} is not a supported document format.`);
            }
        }
        
        updateFileList();
        analyzeBtn.disabled = files.length < 1;
    }

    // Update file list UI
    function updateFileList() {
        uploadedFiles.innerHTML = '';
        fileCount.textContent = `(${files.length})`;
        
        files.forEach((file, index) => {
            const li = document.createElement('li');
            
            // Get file extension
            const extension = file.name.split('.').pop().toLowerCase();
            
            // Determine icon based on file type
            let iconClass = 'fa-file';
            if (extension === 'pdf') {
                iconClass = 'fa-file-pdf';
            } else if (['doc', 'docx'].includes(extension)) {
                iconClass = 'fa-file-word';
            } else if (extension === 'txt') {
                iconClass = 'fa-file-alt';
            }
            
            const fileSize = formatFileSize(file.size);
            
            li.innerHTML = `
                <div class="file-info">
                    <i class="fas ${iconClass} file-icon"></i>
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${fileSize}</span>
                </div>
                <button class="remove-file" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            uploadedFiles.appendChild(li);
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-file').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                files.splice(index, 1);
                updateFileList();
                analyzeBtn.disabled = files.length < 1;
            });
        });
    }

    // Format file size for display
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Analyze button click event
    analyzeBtn.addEventListener('click', async () => {
        if (files.length === 0) return;
        
        // Show loading indicator
        uploadSection.classList.add('hidden');
        resultsSection.classList.remove('hidden');
        loadingIndicator.classList.remove('hidden');
        
        try {
            // Process files and extract text
            const fileContents = await Promise.all(files.map(extractTextFromFile));
            
            // Send extracted text to API for analysis
            const results = await analyzeResearchGaps(fileContents);
            
            // Save analysis results
            analysisResults = results;
            saveSessionData();
            
            // Display results
            displayResults(results);
            
            // Hide loading overlay (animation will handle closing)
            if (window.animateLoading) {
                animateLoading(false);
            } else {
                loadingIndicator.classList.add('hidden'); // Fallback
            }
            
            // Show chat button
            // toggleChatBtn.classList.remove('hidden');
        } catch (error) {
            console.error('Error during analysis:', error);
            
            if (error.status === 401) {
                // Authentication error
                showLoginUI();
                alert('Your session has expired. Please sign in again.');
            } else if (error.status === 429) {
                // Rate limit error
                resultsContainer.innerHTML = `
                    <div class="error-message">
                        <h3>Rate Limit Exceeded</h3>
                        <p>You have exceeded the free tier limit of 5 requests per minute. Please try again later.</p>
                    </div>
                `;
                loadingIndicator.classList.add('hidden');
            } else {
                // General error
                resultsContainer.innerHTML = `
                    <div class="error-message">
                        <h3>Error During Analysis</h3>
                        <p>Sorry, there was an error processing your request: ${error.message || 'Unknown error'}</p>
                    </div>
                `;
                loadingIndicator.classList.add('hidden');
            }
        }
    });

    // New Analysis button click event
    newAnalysisBtn.addEventListener('click', () => {
        console.log("New Analysis button clicked");
        // Reset the application state
        files = [];
        analysisResults = null; // Clear current results variable
        updateFileList();
        analyzeBtn.disabled = true;
        resultsContainer.innerHTML = ''; // Clear previous results display
        resultsSection.classList.add('hidden'); // Hide results section
        resultsSection.classList.remove('active'); // Remove active class if set
        uploadSection.classList.remove('hidden'); // Show upload section
        
        // Ensure the upload section animates in correctly
        if (window.animateSection) {
            animateSection('upload-section'); 
        } else {
            // Fallback if animation function isn't available
            uploadSection.style.opacity = 1;
            uploadSection.style.transform = 'none';
        }
        
        // Apply floating animations to the now visible upload section
        applyFloatingAnimations('#upload-section'); 

        // Close history panel if it's open
        if (historySidePanel && historySidePanel.classList.contains('open')) {
            historySidePanel.classList.remove('open');
            document.body.classList.remove('history-panel-open');
        }

        // Clear session data related to results (keep files? depends on desired behavior)
        // For now, let's clear everything for a truly new analysis
        if (user) {
            localStorage.removeItem(`researchGapApp_${user.id}`); 
        }
        // Or, selectively save just the empty state:
        // saveSessionData(); 
    });
    
    // Toggle chat button click event
    // toggleChatBtn.addEventListener('click', toggleChat);
    
    // Send message button click event
    // sendMessageBtn.addEventListener('click', sendMessage);
    
    // Send message on Enter key (but allow Shift+Enter for new lines)
    // chatInput.addEventListener('keypress', (e) => {
    //     if (e.key === 'Enter' && !e.shiftKey) {
    //         e.preventDefault();
    //         sendMessage();
    //     }
    // });
    
    // Function to handle sending chat messages
    // async function sendMessage() { ... }
    
    // Function to add a loading message while waiting for response
    // function addLoadingMessage() { ... }
    
    // Function to scroll to the bottom of the chat
    // function scrollToBottom() { ... }
    
    // Function to show error message in the chat
    // function showError(message, details = '') { ... }
    
    // Function to add a message to the chat UI
    // function addMessageToChat(role, content) { ... }
    
    // Function to render chat history
    // function renderChatHistory() { ... }

    // Extract text from different file types
    async function extractTextFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            const fileName = file.name;
            const fileType = fileName.split('.').pop().toLowerCase();
            
            reader.onload = async function(event) {
                try {
                    let text = '';
                    
                    if (fileType === 'pdf') {
                        // Handle PDF files using PDF.js
                        const typedArray = new Uint8Array(event.target.result);
                        const pdf = await pdfjsLib.getDocument(typedArray).promise;
                        
                        let fullText = '';
                        for (let i = 1; i <= pdf.numPages; i++) {
                            const page = await pdf.getPage(i);
                            const textContent = await page.getTextContent();
                            const pageText = textContent.items.map(item => item.str).join(' ');
                            fullText += pageText + '\n';
                        }
                        
                        text = fullText;
                    } else if (fileType === 'txt') {
                        // Handle TXT files
                        text = event.target.result;
                    } else if (['doc', 'docx'].includes(fileType)) {
                        // For DOC and DOCX, we would need a server-side solution
                        // For now, we'll just provide a placeholder
                        text = `[Content of ${fileName} - Server-side processing required for DOC/DOCX]`;
                    }
                    
                    resolve({
                        fileName,
                        text,
                    });
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                reject(new Error(`Failed to read file: ${fileName}`));
            };
            
            if (fileType === 'txt' || ['doc', 'docx'].includes(fileType)) {
                reader.readAsText(file);
            } else {
                reader.readAsArrayBuffer(file);
            }
        });
    }

    // Function to analyze research gaps using the API
    async function analyzeResearchGaps(fileContents) {
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ papers: fileContents })
            });
            
            if (!response.ok) {
                const error = new Error('Failed to communicate with the analysis API. Please try again later.');
                error.status = response.status;
                throw error;
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Function to display analysis results
    function displayResults(results) {
        // Log the full results object for debugging
        console.log("Full results object received by displayResults:", JSON.stringify(results, null, 2));
        
        resultsContainer.innerHTML = '';
        loadingIndicator.classList.add('hidden');
        
        // Add active class to results section for animation
        resultsSection.classList.add('active');
        
        // Basic check if results exist and have gaps
        if (!results || !results.gaps || results.gaps.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-gaps result-card">
                    <h3>No Research Gaps Found</h3>
                    <p>The analysis did not identify any specific research gaps in the provided papers. This could be due to:</p>
                    <ul>
                        <li>The papers covering the topic thoroughly</li>
                        <li>The papers being from different research domains</li>
                        <li>Insufficient text extraction from the documents</li>
                    </ul>
                    <p>Try uploading different papers or check that the documents were processed correctly.</p>
                </div>
            `;
            return;
        }
        
        // Create a summary section with enhanced styling
        const summary = document.createElement('div');
        summary.className = 'summary result-card';
        const summaryText = typeof results.summary === 'string' ? results.summary.trim() : '';

        if (!summaryText) {
            console.warn("Summary text is empty or missing in results object.");
            summary.innerHTML = `
                <h3>Analysis Summary</h3>
                <p>Summary not available.</p>
            `;
        } else {
            summary.innerHTML = `
                <h3>Analysis Summary</h3>
                <p>${summaryText}</p>
                <!-- Model info display removed -->
            `;
        }
        resultsContainer.appendChild(summary);
        // Animate the summary card entrance
        anime({
            targets: summary,
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 700,
            easing: 'easeOutExpo'
        });
        
        // Add the timeline visualization before the gaps
        if (window.appAnimations && window.appAnimations.animateAnalysisTimeline) {
            setTimeout(() => {
                window.appAnimations.animateAnalysisTimeline(results);
            }, 500);
        }
        
        // Create a section for each identified gap
        const gapsContainer = document.createElement('div');
        gapsContainer.className = 'gaps-container animate-stagger';
        
        const gapsTitle = document.createElement('h3');
        gapsTitle.textContent = 'Identified Research Gaps';
        gapsTitle.className = 'animate-title';
        gapsContainer.appendChild(gapsTitle);
        
        results.gaps.forEach((gap, index) => {
            const gapElement = document.createElement('div');
            gapElement.className = 'gap-item result-card';
            gapElement.setAttribute('data-gap-index', index + 1);

            const rotation = Math.random() * 1 - 0.5; // Reduced rotation
            gapElement.style.transform = `rotate(${rotation}deg)`;

            const gapTitleText = gap.title || 'Research Opportunity';
            const gapDescriptionText = gap.description || 'No description provided.';
            const relatedPapersText = Array.isArray(gap.relatedPapers) ? gap.relatedPapers.join(', ') : 'All papers';

            // Wrap content in gap-content div
            gapElement.innerHTML = `
                <span class="gap-number">${index + 1}</span>
                <div class="gap-content">
                    <h4 class="gap-title">${gapTitleText}</h4>
                    <p class="gap-description">${gapDescriptionText}</p>
                    <div class="paper-references">
                        <strong>Related Papers:</strong> ${relatedPapersText}
                    </div>
                </div>
            `;
            
            // Delayed appearance of each gap item
            setTimeout(() => {
                gapsContainer.appendChild(gapElement);
                // Trigger animation with anime.js
                if (window.appAnimations && window.appAnimations.animateNewMessage) {
                    window.appAnimations.animateNewMessage(gapElement);
                }
            }, index * 300);
        });
        
        resultsContainer.appendChild(gapsContainer);
        
        // Add recommendations section if available
        if (results.recommendations && results.recommendations.length > 0) {
            const recommendationsContainer = document.createElement('div');
            recommendationsContainer.className = 'recommendations-container result-card';
            
            const recommendationsTitle = document.createElement('h3');
            recommendationsTitle.textContent = 'Research Recommendations';
            recommendationsContainer.appendChild(recommendationsTitle);
            
            const recommendationsList = document.createElement('ul');
            results.recommendations.forEach((recommendation, index) => {
                const li = document.createElement('li');
                // Access the description property directly from the recommendation object
                const recommendationText = recommendation.description || 'Recommendation not available.';
                li.textContent = recommendationText;
                
                // Add staggered animation to recommendations
                setTimeout(() => {
                    recommendationsList.appendChild(li);
                    if (window.appAnimations && window.appAnimations.animatePulse) {
                        window.appAnimations.animatePulse(li);
                    }
                }, index * 200);
            });
            
            recommendationsContainer.appendChild(recommendationsList);
            resultsContainer.appendChild(recommendationsContainer);
        }
        
        // Show the chat button with animation - REMOVED
        // if (toggleChatBtn) toggleChatBtn.classList.remove('hidden');
        // if (window.appAnimations && window.appAnimations.animateNewMessage && toggleChatBtn) {
        //     window.appAnimations.animateNewMessage(toggleChatBtn);
        // }
        
        // Add result card animations
        addResultCardAnimations();
    }
    
    // Add event listener for beforeunload to save session
    window.addEventListener('beforeunload', () => {
        saveSessionData();
    });

    // Initialize PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

    // --- History Side Panel Logic ---
    function toggleHistoryPanel() {
        const isOpen = historySidePanel.classList.toggle('open');
        document.body.classList.toggle('history-panel-open', isOpen);
        if (isOpen) {
            fetchHistory(); // Fetch history when panel opens
        }
    }

    async function fetchHistory() {
        if (!sideHistoryListContainer) return; 
        sideHistoryListContainer.innerHTML = '<p>Loading history...</p>'; 
        try {
            console.log("Fetching history from /api/history"); // Debug
            const response = await fetch('/api/history');
            console.log("History fetch response status:", response.status); // Debug
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Received history data:", JSON.stringify(data, null, 2)); // Debug: Log received data
            
            // Add check for data.history existence
            if (data && data.history) {
                console.log(`Calling displayHistory with ${data.history.length} items`); // Debug
                displayHistory(data.history);
            } else {
                console.warn("Received data object does not contain a 'history' array:", data); // Debug
                displayHistory([]); // Display empty state
            }

        } catch (error) {
            console.error('Error fetching or processing history:', error); // Modified log message
            sideHistoryListContainer.innerHTML = '<p class="error-message">Could not load history. Please try again.</p>';
        }
    }

    function displayHistory(historyItems) {
        console.log("displayHistory called with:", historyItems); // Debug: Log items received by displayHistory
        if (!sideHistoryListContainer) return; 
        if (!Array.isArray(historyItems) || historyItems.length === 0) { // Added Array check
            console.log("No valid history items to display."); // Debug
            sideHistoryListContainer.innerHTML = '<p class="no-history">No analysis history found.</p>';
            return;
        }

        sideHistoryListContainer.innerHTML = ''; 
        historyItems.forEach((item, index) => {
            try { // Add try...catch around item processing
                console.log(`Processing history item ${index}:`, item); // Debug: Log each item
                const div = document.createElement('div');
                div.className = 'history-item';
                // Ensure item properties exist before accessing
                const analysisId = item.analysisId || `unknown-${index}`;
                const timestamp = item.timestamp || new Date().toISOString();
                const paperCount = item.paperCount || 0;
                const paperNamesArray = Array.isArray(item.paperNames) ? item.paperNames : [];
                const paperNames = paperNamesArray.join(', ') || 'N/A';
                const summaryPreview = item.summaryPreview || 'Summary not available';
                
                div.setAttribute('data-analysis-id', analysisId);
                const date = new Date(timestamp).toLocaleString();

                div.innerHTML = `
                    <div class="history-item-header">
                        <span class="history-item-date">${date}</span>
                        <span class="history-item-count">${paperCount} paper(s)</span>
                    </div>
                    <p class="history-item-papers" title="${paperNames}">Papers: ${paperNames}</p>
                    <p class="history-item-summary">${summaryPreview}</p>
                `;

                div.addEventListener('click', () => loadHistoryItem(analysisId));
                sideHistoryListContainer.appendChild(div);
            } catch (itemError) {
                console.error(`Error processing history item ${index}:`, itemError, item); // Log error and the item that caused it
                // Optionally add an error placeholder for this specific item
            }
        });
    }

    async function loadHistoryItem(analysisId) {
        console.log(`Loading history item: ${analysisId}`);
        try {
            const response = await fetch(`/api/history/${analysisId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const fullResult = await response.json();
            
            // Restore the state
            analysisResults = fullResult;
            saveSessionData(); 
            displayResults(fullResult);
            uploadSection.classList.add('hidden');
            resultsSection.classList.remove('hidden');
            historySidePanel.classList.remove('open'); // Close panel after loading
            document.body.classList.remove('history-panel-open');
            
            // Ensure the results section animates in if needed
            if (window.animateSection) {
                 animateSection('results-section');
            } else {
                resultsSection.style.opacity = 1;
                resultsSection.style.transform = 'none';
            }

        } catch (error) {
            console.error(`Error loading history item ${analysisId}:`, error);
            alert('Could not load the selected history item.');
        }
    }

    // Event Listener for History Panel Toggle
    if (toggleHistoryBtn) {
        toggleHistoryBtn.addEventListener('click', toggleHistoryPanel);
    }

    // --- End History Side Panel Logic ---
}); 