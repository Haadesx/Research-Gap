const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const asyncHandler = require('express-async-handler');
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const Groq = require('groq');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config();

// --- Supabase Setup ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or Key not found in .env file. History will not be persistent.');
    // Optionally exit or handle differently if Supabase is critical
    // process.exit(1);
}
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
console.log(supabase ? 'Supabase client initialized.' : 'Supabase client not initialized (missing credentials).');
// ---------------------

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'research_gap_identifier_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'your-client-id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-client-secret',
    callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
    // In a production app, you would typically save the user to a database
    return done(null, profile);
}));

// Serialize and deserialize user
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Auth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/');
    }
);

app.get('/api/user', (req, res) => {
    if (req.isAuthenticated()) {
        return res.json({
            isAuthenticated: true,
            user: {
                id: req.user.id,
                name: req.user.displayName,
                email: req.user.emails?.[0]?.value,
                picture: req.user.photos?.[0]?.value
            }
        });
    }
    return res.json({ isAuthenticated: false });
});

app.get('/auth/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/login');
    });
});

// Login page route
app.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, '../public/login/index.html'));
});

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// Initialize Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Rate limiting setup - 5 requests per minute for free tier
const userRequests = new Map();

function isRateLimited(req) {
    if (!req.isAuthenticated()) {
        return false; // Non-authenticated users can't access the API anyway
    }

    const userId = req.user.id;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 5; // 5 requests per minute for free tier
    
    if (!userRequests.has(userId)) {
        userRequests.set(userId, []);
    }
    
    const userRequestTimes = userRequests.get(userId);
    
    // Filter out requests that are older than the window
    const recentRequests = userRequestTimes.filter(time => now - time < windowMs);
    userRequests.set(userId, recentRequests);
    
    if (recentRequests.length >= maxRequests) {
        return true; // User is rate limited
    }
    
    // Add current request time
    recentRequests.push(now);
    userRequests.set(userId, recentRequests);
    
    return false; // User is not rate limited
}

// Function to create a prompt for research gap analysis
function createAnalysisPrompt(papers) {
    let prompt = `You are a world-class research analyst with PhD-level expertise in systematic literature reviews and meta-analysis. 
    I'm providing the content of ${papers.length} research papers for your analysis. 
    Please conduct a rigorous, comprehensive systematic review to identify significant research gaps and opportunities for future investigation.
    
    Your analysis should be extremely detailed and include:
    
    1. Comprehensive Synthesis of Literature:
       - Identify all major themes, methodologies, and findings across papers
       - Perform a detailed comparison of findings, highlighting consensus and contradictions
       - Map the theoretical frameworks and models used across the studies
       - Identify the evolution of research in this domain over time
    
    2. Deep Research Gap Analysis (be extremely specific):
       - Areas where existing research is limited, contradictory, or non-existent
       - Methodological limitations, weaknesses, or biases in current approaches
       - Understudied populations, contexts, variables, or edge cases
       - Underutilized or novel theoretical perspectives that could yield new insights
       - Geographic regions, time periods, or cultural contexts that need further research
       - Technical limitations in current implementations or approaches
       - Scale or generalizability issues in existing studies
    
    3. Critical Quality Assessment:
       - Rigorously evaluate the methodological quality of each study
       - Assess sample sizes, data collection methods, and analytical approaches
       - Identify potential sources of bias or confounding variables
       - Evaluate the internal and external validity of findings
       - Examine the comprehensiveness and appropriateness of research questions
    
    4. Detailed Future Research Roadmap:
       - Specific research questions that would address identified gaps
       - Methodological innovations or improvements that could overcome current limitations
       - Interdisciplinary perspectives that might generate breakthrough insights
       - Sequential research agenda with short-term and long-term priorities
       - Potential technological advancements that could enable new research directions
       - Practical and theoretical implications of addressing these gaps
    
    For each paper, I am providing the content:
    `;
    
    papers.forEach((paper, index) => {
        prompt += `PAPER ${index + 1}: ${paper.fileName}\n\n`;
        
        // Add a truncated version of the paper if it's too long
        const maxLength = 15000; // Limiting each paper to avoid exceeding context limits
        let paperText = paper.text;
        if (paperText.length > maxLength) {
            paperText = paperText.substring(0, maxLength) + "... [content truncated due to length]";
        }
        
        prompt += `${paperText}\n\n`;
    });
    
    prompt += `
    Please respond with a VALID JSON object that includes:
    
    1. A "summary" field with a comprehensive synthesis of the papers, including:
       - Key themes and findings
       - Methodological approaches
       - Theoretical frameworks
       - Strengths and limitations of the current research body
    
    2. A "gaps" array, with each gap containing:
       - "title": A clear, specific title for the identified gap
       - "description": A detailed explanation of the gap, including specific evidence from the papers
       - "significance": A thorough explanation of why this gap is important to address
       - "currentState": Assessment of the current research state regarding this gap
       - "relatedPapers": An array of the paper filenames related to this gap
    
    3. A "recommendations" array with items containing:
       - "title": A clear title for the recommendation
       - "description": A detailed explanation of the recommended research direction
       - "methodology": Suggested methodological approach
       - "potentialImpact": The potential academic and practical impact of this research
       - "timeframe": Whether this is a short-term or long-term research priority
    
    4. A "limitations" field noting any limitations in your analysis due to paper content or length constraints
    
    5. A "futureDirections" field providing a strategic research agenda that would systematically address the identified gaps
    
    ENSURE YOUR RESPONSE IS FORMATTED AS VALID JSON. Test the JSON structure to make sure it can be properly parsed.`;
    
    return prompt;
}

/**
 * Generates an AI response using the specified model
 * @param {string} message - User's message
 * @param {Array} chatHistory - Array of previous chat messages
 * @param {string} model - The AI model to use: gemini-1.5-pro, gpt-4o, claude-3-opus, groq models, or gemini-pro
 * @param {string} sessionId - The session ID
 * @returns {Promise<Object>} - Object containing the AI response
 */
async function generateAIResponse(message, chatHistory, model, sessionId) {
    console.log(`Generating response using ${model}`);
    
    // Check if the model is a Gemini model
    if (model.includes('gemini')) {
        return await generateGeminiResponse(message, chatHistory, model);
    } 
    // Handle OpenAI models (e.g., gpt-4o)
    else if (model.includes('gpt')) {
        return await generateOpenAIResponse(message, chatHistory, model);
    } 
    // Handle Claude models (e.g., claude-3-opus)
    else if (model.includes('claude')) {
        return await generateClaudeResponse(message, chatHistory, model);
    }
    // Handle Groq models (e.g., llama-3.1-8b-instant, llama-3.2-90b-vision-preview)
    else if (['llama-3.1-8b-instant', 'llama-3.2-11b-vision-preview', 'llama-3.2-1b-preview', 
              'llama-3.2-3b-preview', 'llama-3.2-90b-vision-preview', 'llama-3.3-70b-specdec',
              'llama-3.3-70b-versatile', 'mistral-saba-24b', 'llama-guard-3-8b'].includes(model)) {
        return await generateGroqResponse(message, chatHistory, model);
    }
    else {
        throw new Error(`Unsupported model: ${model}`);
    }
}

/**
 * Generates a response using Google's Gemini models
 * @param {string} message - User's message
 * @param {Array} chatHistory - Array of previous chat messages
 * @param {string} modelName - The specific Gemini model to use
 * @returns {Promise<Object>} - Object containing the AI response
 */
async function generateGeminiResponse(message, chatHistory, modelName) {
    try {
        // Get the model
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // Format chat history for Gemini
        const formattedHistory = chatHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));
        
        // Start a chat session
        const chat = model.startChat({
            history: formattedHistory,
            generationConfig: {
                maxOutputTokens: 2048,
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
            },
        });
        
        // Send the message and get a response
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();
        
        return {
            response: text,
            model: modelName
        };
    } catch (error) {
        console.error(`Error generating Gemini response with ${modelName}:`, error);
        throw error;
    }
}

/**
 * Generates a response using OpenAI models
 * @param {string} message - User's message
 * @param {Array} chatHistory - Array of previous chat messages
 * @param {string} modelName - The specific OpenAI model to use
 * @returns {Promise<Object>} - Object containing the AI response
 */
async function generateOpenAIResponse(message, chatHistory, modelName) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables.');
        }
        
        // Initialize OpenAI client
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        
        // Format chat history for OpenAI
        const formattedMessages = chatHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
        }));
        
        // Add the user's current message
        formattedMessages.push({
            role: 'user',
            content: message
        });
        
        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: modelName,
            messages: formattedMessages,
            max_tokens: 2048,
            temperature: 0.7,
        });
        
        return {
            response: completion.choices[0].message.content,
            model: modelName
        };
    } catch (error) {
        console.error(`Error generating OpenAI response with ${modelName}:`, error);
        throw error;
    }
}

/**
 * Generates a response using Anthropic Claude models
 * @param {string} message - User's message
 * @param {Array} chatHistory - Array of previous chat messages
 * @param {string} modelName - The specific Claude model to use
 * @returns {Promise<Object>} - Object containing the AI response
 */
async function generateClaudeResponse(message, chatHistory, modelName) {
    try {
        if (!process.env.ANTHROPIC_API_KEY) {
            throw new Error('Anthropic API key is not configured. Please add ANTHROPIC_API_KEY to your environment variables.');
        }
        
        // Initialize Anthropic client
        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
        });
        
        // Format chat history for Claude
        let messages = [];
        for (const msg of chatHistory) {
            messages.push({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            });
        }
        
        // Add the user's current message
        messages.push({
            role: 'user',
            content: message
        });
        
        // Call Claude API
        const response = await anthropic.messages.create({
            model: modelName,
            messages: messages,
            max_tokens: 2048,
        });
        
        return {
            response: response.content[0].text,
            model: modelName
        };
    } catch (error) {
        console.error(`Error generating Claude response with ${modelName}:`, error);
        throw error;
    }
}

/**
 * Generates a response using Groq models
 * @param {string} message - User's message
 * @param {Array} chatHistory - Array of previous chat messages
 * @param {string} modelName - The specific Groq model to use
 * @returns {Promise<Object>} - Object containing the AI response
 */
async function generateGroqResponse(message, chatHistory, modelName) {
    try {
        if (!process.env.GROQ_API_KEY) {
            throw new Error('Groq API key is not configured. Please add GROQ_API_KEY to your environment variables.');
        }
        
        // Initialize Groq client
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });
        
        // Format chat history for Groq (similar to OpenAI format)
        const formattedMessages = chatHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
        }));
        
        // Add the user's current message
        formattedMessages.push({
            role: 'user',
            content: message
        });
        
        // Call Groq API
        const completion = await groq.chat.completions.create({
            model: modelName,
            messages: formattedMessages,
            max_tokens: 2048,
            temperature: 0.7,
        });
        
        return {
            response: completion.choices[0].message.content,
            model: modelName
        };
    } catch (error) {
        console.error(`Error generating Groq response with ${modelName}:`, error);
        throw error;
    }
}

// Auth middleware - require login for API endpoints
function requireLogin(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Authentication required' });
}

// API endpoint for analyzing research papers
app.post('/api/analyze', requireLogin, asyncHandler(async (req, res) => {
    // Check rate limiting
    if (isRateLimited(req)) {
        return res.status(429).json({ 
            error: 'Rate limit exceeded', 
            message: 'You have exceeded the free tier limit of 5 requests per minute. Please try again later.' 
        });
    }

    const { papers } = req.body;
    
    if (!papers || !Array.isArray(papers) || papers.length === 0) {
        return res.status(400).json({ 
            error: true, 
            message: 'No papers provided for analysis',
            details: 'Please upload at least one research paper to analyze.'
        });
    }

    console.log(`Starting analysis of ${papers.length} papers:`);
    papers.forEach((paper, index) => {
        console.log(`  Paper ${index + 1}: ${paper.fileName} (${paper.text.length} characters)`);
    });
    
    const prompt = createAnalysisPrompt(papers);
    console.log(`Analysis prompt generated (${prompt.length} characters)`);
    
    const modelOptions = [
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "llama-3.1-8b-instant",
        "gemini-2.5-pro-preview-03-25",
        "mistral-saba-24b",
        "llama-3.2-90b-vision-preview",
        "gemini-1.5-pro",
        "gemini-pro"
    ];
    
    let analysisResult;
    let success = false;
    let lastError = null;
    let usedModel = null;
    const userId = req.user.id;
    const analysisId = `analysis-${Date.now()}-${userId.substring(0, 5)}`; 
    
    for (const modelName of modelOptions) {
        if (success) break;
        
        try {
            console.log(`Attempting analysis using model: ${modelName}`);
            let startTime = Date.now();
            let text = '';
            let rawApiResponse = null; // To store raw response if needed for debugging

            // --- Call appropriate model provider --- 
            if (modelName.includes('gemini') || modelName.includes('gemma')) {
                const model = genAI.getGenerativeModel({ model: modelName });
                console.log(`Sending request to ${modelName} (Google)...`);
                startTime = Date.now();
                const result = await model.generateContent(prompt);
                rawApiResponse = result.response; // Store raw response
                text = rawApiResponse.text();
            } else if (['llama-3.1-8b-instant', 'llama-3.2-11b-vision-preview', /* other groq models */].includes(modelName)) {
                if (!process.env.GROQ_API_KEY) throw new Error('Groq API key not configured');
                const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
                console.log(`Sending request to ${modelName} (Groq)...`);
                startTime = Date.now();
                const completion = await groq.chat.completions.create({
                    model: modelName,
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 4096,
                    temperature: 0.7,
                });
                rawApiResponse = completion; // Store raw response
                text = completion.choices[0].message.content;
            } else {
                throw new Error(`Unsupported model provider for: ${modelName}`);
            }
            // --- End model provider logic --- 

            const endTime = Date.now();
            const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(2);
            console.log(`${modelName} responded in ${elapsedSeconds}s`);
            console.log(`Received response of ${text.length} characters from ${modelName}`);

            // Extract and parse JSON
            const jsonMatch = text.match(/```json\n([\s\S]*)\n```/) || text.match(/```\n([\s\S]*)\n```/) || text.match(/{[\s\S]*}/);
            const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
            console.log(`Parsing JSON response (${jsonStr.length} characters)`);
            try {
                analysisResult = JSON.parse(jsonStr);
            } catch (parseError) {
                console.error(`Error parsing JSON from ${modelName}:`, parseError.message);
                console.error(`Invalid JSON response snippet:`, jsonStr.substring(0, 500) + "...");
                throw new Error(`Failed to parse JSON response from ${modelName}`);
            }
            
            success = true;
            usedModel = modelName;
            console.log(`Successfully parsed response from ${modelName}`);

            // Add metadata
            const historyEntryData = {
                user_id: userId, // Match Supabase column name
                analysis_id: analysisId,
                timestamp: new Date(startTime).toISOString(), // Ensure ISO string for timestamptz
                paper_count: papers.length,
                paper_names: papers.map(p => p.fileName),
                model_used: modelName,
                processing_time: elapsedSeconds,
                analysis_data: analysisResult // Store the full parsed JSON result
            };

            // ---> Save successful result to Supabase <--- 
            if (supabase) {
                const { data, error: dbError } = await supabase
                    .from('analysis_history') // Your table name
                    .insert([historyEntryData]);

                if (dbError) {
                    console.error(`Supabase insert error for ${analysisId}:`, dbError);
                    // Decide if this should prevent sending response to user
                    // Maybe just log it and continue for now
                } else {
                    console.log(`Saved analysis ${analysisId} to Supabase for user ${userId}.`);
                }
            } else {
                console.warn('Supabase client not initialized, skipping history save.');
            }
            // ------------------------------------------

            analysisResult.analysisId = analysisId;

        } catch (modelError) {
            console.error(`Error with model ${modelName}:`, modelError);
            lastError = modelError;
        }
    }
    
    if (!success) {
        console.error('All models failed:', lastError);
        // Return structured error response (no changes needed here)
        analysisResult = {
            summary: "We attempted to analyze your research papers, but encountered an issue with our AI service.",
            gaps: [
                {
                    title: "Service temporarily unavailable",
                    description: "We couldn't process your request with any available model. This might be due to rate limits, service issues, or problems with the input data.",
                    significance: "Please try again later or with different papers.",
                    currentState: "Service disruption",
                    relatedPapers: papers.map(p => p.fileName)
                }
            ],
            recommendations: [
                {
                    title: "Try again later",
                    description: "Our AI service may be experiencing temporary issues. Please try again in a few minutes.",
                    methodology: "Same approach",
                    potentialImpact: "May work on next attempt",
                    timeframe: "Short-term"
                },
                {
                    title: "Reduce paper length",
                    description: "If your papers are very lengthy, try uploading shorter segments or abstracts.",
                    methodology: "Content reduction",
                    potentialImpact: "May improve processing success",
                    timeframe: "Short-term"
                }
            ],
            limitations: "The analysis could not be completed due to technical issues.",
            futureDirections: "Please try again later with the same or different papers.",
            modelUsed: "fallback",
            error: lastError ? lastError.message : "Unknown error",
            timestamp: new Date().toISOString(),
            paperCount: papers.length
        };
        analysisResult.analysisId = analysisId; // Include ID even in fallback
    }
    
    console.log(`Analysis complete. Sending response for ${analysisId} using model: ${usedModel || 'fallback'}`);
    return res.json(analysisResult);
}));

// API endpoint to get analysis history (fetch from Supabase)
app.get('/api/history', requireLogin, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const MAX_HISTORY_SUMMARY = 20; 

    if (!supabase) {
        console.warn('Supabase client not initialized, cannot fetch history.');
        return res.json({ history: [] });
    }

    const { data: history, error: dbError } = await supabase
        .from('analysis_history')
        .select('analysis_id, timestamp, paper_count, paper_names, analysis_data->summary, model_used') // Select specific fields, access nested summary
        .eq('user_id', userId) // Filter by user
        .order('timestamp', { ascending: false }) // Sort by newest first
        .limit(MAX_HISTORY_SUMMARY);

    if (dbError) {
        console.error(`Supabase history fetch error for user ${userId}:`, dbError);
        return res.status(500).json({ error: true, message: 'Could not fetch history' });
    }

    const historySummary = history.map(item => ({
        analysisId: item.analysis_id,
        timestamp: item.timestamp,
        paperCount: item.paper_count,
        paperNames: item.paper_names,
        // Handle potential null summary from select
        summaryPreview: item.summary ? (item.summary + '').substring(0, 150) + '...' : 'No summary available',
        modelUsed: item.model_used
    }));

    console.log(`Sending history summary (${historySummary.length} items) for user ${userId}`);
    res.json({ history: historySummary });
}));

// API endpoint to get a specific full history item (fetch from Supabase)
app.get('/api/history/:analysisId', requireLogin, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const analysisId = req.params.analysisId;

    if (!supabase) {
        console.warn('Supabase client not initialized, cannot fetch history item.');
        return res.status(500).json({ error: true, message: 'Database client not available' });
    }

    const { data: fullHistoryItem, error: dbError } = await supabase
        .from('analysis_history')
        .select('analysis_data') // Select only the full result object
        .eq('user_id', userId)
        .eq('analysis_id', analysisId)
        .maybeSingle(); // Returns single object or null

    if (dbError) {
        console.error(`Supabase history item fetch error for ${analysisId}, user ${userId}:`, dbError);
        return res.status(500).json({ error: true, message: 'Could not fetch history item' });
    }

    if (fullHistoryItem && fullHistoryItem.analysis_data) {
        console.log(`Sending full history item ${analysisId} for user ${userId}`);
        res.json(fullHistoryItem.analysis_data);
    } else {
        console.log(`History item ${analysisId} not found for user ${userId}`);
        res.status(404).json({ error: true, message: 'History item not found' });
    }
}));

// Serve the main HTML file for routes other than API and login
app.get('*', (req, res) => {
    // Check if user is authenticated
    if (!req.isAuthenticated() && !req.path.startsWith('/login') && !req.path.startsWith('/auth/')) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
