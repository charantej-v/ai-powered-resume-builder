const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Load environment variables
// Fix: Explicitly point dotenv to the project root (one level up from 'backend')
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') }); 

// Load the official Google Gen AI SDK
const { GoogleGenAI } = require('@google/genai'); 

const PORT = 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// --- DOTENV DEBUG CHECK (Temporary - REMOVE AFTER CONFIRMATION) ---
console.log('--- DOTENV DEBUG CHECK ---');
console.log(`__dirname is: ${__dirname}`);
console.log(`Path to .env loaded from: ${path.resolve(__dirname, '..', '.env')}`);
console.log(`Value of process.env.GEMINI_API_KEY is: ${GEMINI_API_KEY ? 'LOADED (Length: ' + GEMINI_API_KEY.length + ')' : 'UNDEFINED'}`);
console.log('--------------------------');
// --- END DEBUG CHECK ---

let ai = null; // Initialize ai client variable to null

// Check for the API key and initialize the client conditionally
if (GEMINI_API_KEY) {
    // This is the correct way to initialize the client with the key
    ai = new GoogleGenAI(GEMINI_API_KEY);
    console.log('Gemini AI client successfully initialized.');
} else {
    // Log a clear error if the key is missing but allow the server to start for static files
    console.error('ERROR: Gemini API key not found. Please set GEMINI_API_KEY in your .env file.');
    console.error('The API routes (/generate-content, /ats-score) will fail until the key is set.');
}


// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
};

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // API Routes
    if (pathname === '/generate-content' && req.method === 'POST') {
        await handleGenerateContent(req, res);
        return;
    }

    if (pathname === '/ats-score' && req.method === 'POST') {
        await handleAtsScore(req, res);
        return;
    }

    // Serve static files
    let filePath = path.join(__dirname, '..', 'frontend');
    
    if (pathname === '/') {
        filePath = path.join(filePath, 'index.html');
    } else {
        filePath = path.join(filePath, pathname);
    }

    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'text/plain';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('404 - File Not Found');
            } else {
                res.writeHead(500);
                res.end('500 - Internal Server Error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

// Generate content with Gemini API
async function handleGenerateContent(req, res) {
    let body = '';
    
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const data = JSON.parse(body);
            const { type, jobDescription, experienceLevel, companyName, jobTitle, projectName, technologies } = data;

            let prompt = '';

            switch (type) {
                case 'summary':
                    if (jobDescription && companyName) {
                        prompt = `Write a professional summary for a resume for a ${experienceLevel} applying to ${companyName}. Job description: ${jobDescription}. Keep it concise (3-4 sentences) and highlight relevant skills and experience.`;
                    } else if (jobDescription) {
                        prompt = `Write a professional summary for a resume for a ${experienceLevel}. Job description: ${jobDescription}. Keep it concise (3-4 sentences) and highlight relevant skills and experience.`;
                    } else {
                        prompt = `Write a professional summary for a ${experienceLevel} position. Keep it concise (3-4 sentences), generic, and highlight common skills and professional traits.`;
                    }
                    break;
                case 'skills':
                    if (jobDescription) {
                        prompt = `Based on this job description: ${jobDescription}, suggest 10-15 relevant technical and soft skills for a ${experienceLevel}. Return only the skills as a comma-separated list.`;
                    } else {
                        prompt = `Suggest 10-15 common technical and soft skills for a ${experienceLevel} in the tech industry. Return only the skills as a comma-separated list.`;
                    }
                    break;
                case 'experience':
                    if (jobDescription) {
                        prompt = `Write 3-4 professional bullet points for a ${jobTitle} position that align with this job description: ${jobDescription}. Focus on achievements and quantifiable results. Experience level: ${experienceLevel}.`;
                    } else {
                        prompt = `Write 3-4 professional bullet points for a ${jobTitle} position. Focus on achievements and quantifiable results. Experience level: ${experienceLevel}.`;
                    }
                    break;
                case 'project':
                    if (jobDescription) {
                        prompt = `Write a concise project description (2-3 sentences) for a project named "${projectName}" using technologies: ${technologies}. Make it relevant to this job description: ${jobDescription}. Focus on impact and technical skills.`;
                    } else {
                        prompt = `Write a concise project description (2-3 sentences) for a project named "${projectName}" using technologies: ${technologies}. Focus on impact and technical skills.`;
                    }
                    break;
                default:
                    prompt = 'Generate professional resume content.';
            }

            const content = await callGeminiAPI(prompt);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ content }));
        } catch (error) {
            console.error('Error in handleGenerateContent:', error.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message || 'Internal Server Error' }));
        }
    });
}

// Calculate ATS score
async function handleAtsScore(req, res) {
    let body = '';
    
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const data = JSON.parse(body);
            const { resumeText, jobDescription, experienceLevel, companyName } = data;

            let matchedKeywords = [];
            let missingKeywords = [];
            let score = 0;
            let prompt = '';

            // If job description is provided, calculate ATS score
            if (jobDescription && jobDescription.trim()) {
                // Extract keywords from job description
                const jobKeywords = extractKeywords(jobDescription);
                const resumeKeywords = extractKeywords(resumeText);

                // Calculate matched and missing keywords
                matchedKeywords = jobKeywords.filter(keyword => 
                    resumeKeywords.includes(keyword)
                );
                missingKeywords = jobKeywords.filter(keyword => 
                    !resumeKeywords.includes(keyword)
                );

                // Calculate score
                score = jobKeywords.length > 0 
                    ? Math.round((matchedKeywords.length / jobKeywords.length) * 100) 
                    : 0;

                // Get AI suggestions with job description
                prompt = `Analyze this resume for a ${experienceLevel} position${companyName ? ` at ${companyName}` : ''}. 
            
Job Description: ${jobDescription}

Resume Text: ${resumeText.substring(0, 2000)}

${missingKeywords.length > 0 ? `The resume is missing these keywords: ${missingKeywords.join(', ')}` : ''}

Provide exactly 5 specific, actionable improvement suggestions to increase the ATS score. Each suggestion should be one clear sentence. Number them 1-5.`;
            } else {
                // General resume analysis without job description
                prompt = `Analyze this resume for a ${experienceLevel} position. Provide exactly 5 specific, actionable improvement suggestions to make it more professional and ATS-friendly. Each suggestion should be one clear sentence. Number them 1-5.

Resume Text: ${resumeText.substring(0, 2000)}`;
                
                score = 75; // Default score when no job description
            }

            const aiResponse = await callGeminiAPI(prompt);
            const suggestions = parseAISuggestions(aiResponse);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                score,
                matchedKeywords: matchedKeywords.slice(0, 15),
                missingKeywords: missingKeywords.slice(0, 15),
                suggestions
            }));
        } catch (error) {
            console.error('Error in handleAtsScore:', error.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message || 'Internal Server Error' }));
        }
    });
}

// Call Gemini API (Refactored to use the official SDK)
async function callGeminiAPI(prompt) {
    if (!ai) {
        // Throw an error if the client wasn't initialized due to missing key
        throw new Error('Gemini API client not initialized. Cannot make API call. Check console for missing API key.');
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // Using a fast, highly capable model
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        // The SDK response simplifies access to the text content
        return response.text;

    } catch (error) {
        console.error('Gemini API Error:', error);
        // Throw a clearer error message
        throw new Error(`Gemini API call failed. Check console for details. Error: ${error.message}`);
    }
}

// Extract keywords from text
function extractKeywords(text) {
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'shall', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'them', 'their', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'dont', 'now'];
    
    const words = text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3 && !commonWords.includes(word));

    // Count frequency
    const wordFreq = {};
    words.forEach(word => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    // Sort by frequency and return top keywords
    return Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30)
        .map(([word]) => word);
}

// Parse AI suggestions
function parseAISuggestions(text) {
    const lines = text.split('\n').filter(line => line.trim());
    const suggestions = [];

    for (const line of lines) {
        // Match numbered suggestions (1., 2., etc. or 1) 2) etc.)
        const match = line.match(/^\d+[\.\)]\s*(.+)$/);
        if (match && suggestions.length < 5) {
            suggestions.push(match[1].trim());
        }
    }

    // If we didn't get 5 suggestions, take first 5 non-empty lines
    if (suggestions.length < 5) {
        const fallback = lines.filter(l => l.length > 20).slice(0, 5);
        return fallback.length > 0 ? fallback : [
            'Add more relevant keywords from the job description',
            'Quantify your achievements with specific metrics',
            'Include technical skills mentioned in the job posting',
            'Update your professional summary to match the role',
            'Add relevant certifications or training'
        ];
    }

    return suggestions.slice(0, 5);
}

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Frontend: http://localhost:${PORT}/`);
    console.log(`Build Resume: http://localhost:${PORT}/build.html`);
    console.log(`ATS Checker: http://localhost:${PORT}/ats.html`);
});