# AI-Powered Resume Builder & ATS Score Checker

A complete web application for building AI-powered resumes and checking ATS (Applicant Tracking System) scores using Google's Gemini API. Built with vanilla HTML, CSS, JavaScript, and Node.js - **no frameworks or databases required**.

## Features

### 🚀 Resume Builder
- **AI-Powered Content Generation** using Gemini API
- **Professional Summary** - Auto-generated based on job description
- **Experience Descriptions** - AI-enhanced bullet points
- **Skills Suggestions** - AI-recommended skills matching job requirements
- **Project Descriptions** - AI-generated project summaries
- **Modular Sections**: Personal Info, Experience, Education, Skills, Projects, Certifications
- **Real-time Preview** with keyword highlighting
- **Download Options**: PDF (via print) and TXT format
- **Local Storage** - Auto-save resume progress
- **Dark/Light Mode** - Persistent theme toggle
- **Two Resume Styles**: Formal and Casual

### 📊 ATS Score Checker
- **Score Calculation** - Keyword matching algorithm (0-100 score)
- **Keyword Analysis** - Shows matched and missing keywords
- **AI Improvement Suggestions** - Top 5 actionable recommendations via Gemini API
- **Resume Upload** - Supports .pdf, .docx, and .txt files
- **Visual Progress Bar** - Color-coded score display
- **Dark/Light Mode** - Consistent theming

## Project Structure

```
resume/
├── frontend/
│   ├── index.html          # Home page with navigation
│   ├── build.html          # Resume builder interface
│   ├── ats.html            # ATS score checker
│   ├── style.css           # Complete styling with dark mode
│   └── script.js           # Frontend logic and API calls
├── backend/
│   ├── server.js           # Node.js server with Gemini integration
│   ├── package.json        # Dependencies configuration
│   └── .env                # Environment variables (API key)
└── readme.md              # This file
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- Gemini API Key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Step 1: Install Dependencies

Navigate to the backend folder and install required packages:

```bash
cd backend
npm install node-fetch dotenv
```

### Step 2: Configure API Key

1. Open `backend/.env` file
2. Replace `your_gemini_api_key_here` with your actual Gemini API key:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

### Step 3: Start the Server

From the `backend` folder, run:

```bash
node server.js
```

You should see:
```
Server running at http://localhost:3000/
Frontend: http://localhost:3000/
Build Resume: http://localhost:3000/build.html
ATS Checker: http://localhost:3000/ats.html
```

### Step 4: Open in Browser

Open your browser and navigate to:
```
http://localhost:3000
```

## Usage Guide

### Building a Resume

1. **Home Page**: Click "Build Resume with AI"
2. **Enter Details**:
   - Company Name
   - Job Description (paste the full job posting)
   - Experience Level (Fresher/Experienced)
   - Resume Style (Formal/Casual)
3. **Click "Generate Resume"** to display the editor
4. **Fill in Personal Information**:
   - Full Name, Email, Phone, Location, LinkedIn
5. **Use AI Features**:
   - Click "✨ Generate with AI" for Professional Summary
   - Click "✨ Suggest Skills with AI" for relevant skills
   - Click "✨ Enhance with AI" for experience descriptions
   - Click "✨ Generate with AI" for project descriptions
6. **Add More Sections**:
   - Use "+ Add Experience/Education/Project/Certification" buttons
7. **Preview**: Click "Preview" to see formatted resume with keyword highlights
8. **Download**:
   - "Download PDF" - Opens print dialog for PDF save
   - "Download TXT" - Downloads plain text version for ATS compatibility

### Checking ATS Score

1. **Home Page**: Click "ATS Score Checker"
2. **Enter Details**:
   - Company Name
   - Job Description
   - Experience Level
3. **Upload Resume**: Select your resume file (.pdf, .docx, or .txt)
4. **Click "Generate ATS Score"**
5. **Review Results**:
   - Overall ATS Score (0-100)
   - Matched Keywords (green)
   - Missing Keywords (red)
   - Top 5 AI-powered improvement suggestions

## Technical Details

### Frontend
- **Pure HTML5, CSS3, JavaScript** (no frameworks)
- **Responsive Design** with mobile support
- **LocalStorage** for resume caching
- **CSS Variables** for theming
- **Print-friendly CSS** for PDF generation
- **Fetch API** for backend communication

### Backend
- **Node.js HTTP Server** (built-in modules only)
- **No database** - stateless design
- **Gemini API Integration** for AI content generation
- **Keyword Extraction Algorithm** for ATS scoring
- **CORS Support** for frontend communication
- **File Serving** for static frontend files

### AI Integration

**Gemini API** is used for:
1. **Professional Summary Generation** - Personalized based on job description
2. **Skills Suggestion** - Relevant skills extraction from job requirements
3. **Experience Enhancement** - Professional bullet points with achievements
4. **Project Descriptions** - Technical project summaries
5. **ATS Improvement Suggestions** - Actionable recommendations for score improvement

### Data Flow

```
Frontend (browser)
    ↓
    ↓ HTTP Request (POST /generate-content or /ats-score)
    ↓
Backend (server.js)
    ↓
    ↓ API Call
    ↓
Gemini API
    ↓
    ↓ AI Response
    ↓
Backend (process & format)
    ↓
    ↓ JSON Response
    ↓
Frontend (display)
```

## API Endpoints

### POST /generate-content
Generate AI-powered resume content.

**Request Body**:
```json
{
  "type": "summary|skills|experience|project",
  "jobDescription": "string",
  "experienceLevel": "fresher|experienced",
  "companyName": "string",
  "jobTitle": "string" (for experience),
  "projectName": "string" (for project),
  "technologies": "string" (for project)
}
```

**Response**:
```json
{
  "content": "AI-generated content"
}
```

### POST /ats-score
Calculate ATS score and generate suggestions.

**Request Body**:
```json
{
  "resumeText": "string",
  "jobDescription": "string",
  "experienceLevel": "fresher|experienced",
  "companyName": "string"
}
```

**Response**:
```json
{
  "score": 85,
  "matchedKeywords": ["javascript", "react", "nodejs"],
  "missingKeywords": ["python", "docker"],
  "suggestions": ["suggestion 1", "suggestion 2", ...]
}
```

## Features Breakdown

### Dark/Light Mode
- Toggle switch in top-right corner
- Persistent across page navigation (localStorage)
- Smooth transitions
- Optimized for readability in both modes

### Local Storage
- Auto-saves resume data on every input change
- Persists across browser sessions
- Option to edit existing resume
- No data sent to server (privacy-focused)

### Keyword Highlighting
- Extracts keywords from job description
- Highlights matching keywords in resume preview
- Visual feedback for ATS optimization
- Yellow background for highlighted terms

### PDF Download
- Uses browser's native print functionality
- Clean, professional layout
- Print-optimized CSS (@media print)
- Removes UI elements from printed version

## Browser Support
- Chrome (recommended)
- Firefox
- Edge
- Safari
- Any modern browser with ES6 support

## Troubleshooting

### Server won't start
- Ensure Node.js is installed: `node --version`
- Check if port 3000 is available
- Install dependencies: `npm install`

### AI features not working
- Verify Gemini API key in `.env` file
- Check API key has not expired
- Ensure internet connection is active
- Check browser console for errors

### Resume not saving
- Check browser's localStorage is enabled
- Clear browser cache and try again
- Check browser console for JavaScript errors

### ATS score shows 0
- Ensure resume file contains readable text
- PDF/DOCX must be text-based (not scanned images)
- Try using TXT format for better compatibility

## Security Notes

- API key stored in `.env` file (not committed to version control)
- Never expose API key in frontend code
- CORS enabled for local development only
- No user data stored on server
- LocalStorage data remains on client browser only

## Limitations

- **No database** - Resume data stored locally in browser
- **Single server instance** - Not designed for multiple concurrent users
- **Gemini API rate limits** - Subject to Google's API quotas
- **PDF text extraction** - Basic text extraction only (no OCR)
- **No user authentication** - Open access application

## Future Enhancements

- Multiple resume templates
- Export to Word format
- Resume version comparison
- Cover letter generation
- LinkedIn profile import
- Advanced ATS simulation
- Multi-language support

## Credits

- **AI Model**: Google Gemini API
- **Icons**: Unicode characters (no external dependencies)
- **Design**: Custom CSS with modern UI principles

## License

This project is open-source and available for personal and commercial use.

## Support

For issues or questions:
1. Check browser console for errors
2. Verify API key configuration
3. Ensure all dependencies are installed
4. Check Node.js version compatibility

---

**Note**: Gemini API is used for AI-generated resume content and ATS improvement suggestions. An active API key is required for full functionality.

**Happy Resume Building! 🚀**
