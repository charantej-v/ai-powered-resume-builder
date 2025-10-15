// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const currentTheme = localStorage.getItem('theme') || 'light';

if (currentTheme === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    if (themeToggle) themeToggle.checked = true;
}

if (themeToggle) {
    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    });
}

// Build Resume Page Logic
if (window.location.pathname.includes('build.html')) {
    const resumeBuilderSplit = document.getElementById('resumeBuilderSplit');
    const newResumeBtn = document.getElementById('newResumeBtn');
    const editResumeBtn = document.getElementById('editResumeBtn');
    const newResumeSection = document.getElementById('newResumeSection');
    const editResumeSection = document.getElementById('editResumeSection');
    const generateResumeBtn = document.getElementById('generateResumeBtn');
    const companyName = document.getElementById('companyName');
    const jobDescription = document.getElementById('jobDescription');
    const experienceLevel = document.getElementById('experienceLevel');
    const resumeStyle = document.getElementById('resumeStyle');
    const resumeFile = document.getElementById('resumeFile');
    const fileInfo = document.getElementById('fileInfo');
    const professionalSummary = document.getElementById('professionalSummary');
    const skills = document.getElementById('skills');

    // Toggle between New Resume and Edit Resume
    newResumeBtn.addEventListener('click', () => {
        newResumeBtn.classList.add('active');
        editResumeBtn.classList.remove('active');
        newResumeSection.style.display = 'block';
        editResumeSection.style.display = 'none';
        resumeBuilderSplit.style.display = 'flex';
        localStorage.removeItem('resumeData');
        clearResumeFields();
        updateLivePreview();
    });

    editResumeBtn.addEventListener('click', () => {
        editResumeBtn.classList.add('active');
        newResumeBtn.classList.remove('active');
        newResumeSection.style.display = 'none';
        editResumeSection.style.display = 'block';
        resumeBuilderSplit.style.display = 'none';
    });

    // File upload handler for Edit Resume
    if (resumeFile) {
        resumeFile.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                fileInfo.textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
            }
        });
    }

    // Load Resume for Editing button
    const loadResumeBtn = document.getElementById('loadResumeBtn');
    if (loadResumeBtn) {
        loadResumeBtn.addEventListener('click', () => {
            const file = resumeFile.files[0];
            if (!file) {
                alert('Please upload a resume file first');
                return;
            }
            
            // Show the builder with modules
            resumeBuilderSplit.style.display = 'flex';
            updateLivePreview();
            
            // Scroll to the builder
            resumeBuilderSplit.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    // Show builder on page load for new resume
    if (newResumeBtn.classList.contains('active')) {
        resumeBuilderSplit.style.display = 'flex';
        updateLivePreview();
    }

    // Generate Resume Button
    if (generateResumeBtn) {
        generateResumeBtn.addEventListener('click', async () => {
            generateResumeBtn.disabled = true;
            generateResumeBtn.textContent = 'Generating...';
            
            // Update preview one final time
            updateLivePreview();
            saveResumeData();
            alert('Resume generated successfully! You can download it using the buttons above.');
            
            generateResumeBtn.disabled = false;
            generateResumeBtn.textContent = 'Generate Resume';
        });
    }

    // Professional Summary Generation
    const generateSummaryBtn = document.getElementById('generateSummaryBtn');
    
    if (generateSummaryBtn) {
        generateSummaryBtn.addEventListener('click', async () => {
        generateSummaryBtn.disabled = true;
        generateSummaryBtn.textContent = 'Generating...';
        
        try {
            const response = await fetch('https://ai-powered-resume-builder-1-27ju.onrender.com/generate-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'summary',
                    jobDescription: jobDescription.value || '',
                    experienceLevel: experienceLevel.value,
                    companyName: companyName.value || ''
                })
            });
            
            const data = await response.json();
            professionalSummary.value = data.content;
            saveResumeData();
        } catch (error) {
            alert('Error generating summary: ' + error.message);
        }
        
        generateSummaryBtn.disabled = false;
        generateSummaryBtn.textContent = '✨ Generate with AI';
        });
    }

    // Skills Generation
    const generateSkillsBtn = document.getElementById('generateSkillsBtn');
    
    if (generateSkillsBtn) {
        generateSkillsBtn.addEventListener('click', async () => {
        generateSkillsBtn.disabled = true;
        generateSkillsBtn.textContent = 'Generating...';
        
        try {
            const response = await fetch('https://ai-powered-resume-builder-1-27ju.onrender.com/generate-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'skills',
                    jobDescription: jobDescription.value || '',
                    experienceLevel: experienceLevel.value
                })
            });
            
            const data = await response.json();
            skills.value = data.content;
            saveResumeData();
        } catch (error) {
            alert('Error generating skills: ' + error.message);
        }
        
        generateSkillsBtn.disabled = false;
        generateSkillsBtn.textContent = '✨ Format Skills with AI';
        });
    }

    // Experience AI Enhancement
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('ai-exp-btn')) {
            const expItem = e.target.closest('.experience-item');
            const expDesc = expItem.querySelector('.expDesc');
            const expTitle = expItem.querySelector('.expTitle').value;
            
            if (!expTitle) {
                alert('Please fill in job title');
                return;
            }
            
            e.target.disabled = true;
            e.target.textContent = 'Generating...';
            
            try {
                const response = await fetch('https://ai-powered-resume-builder-1-27ju.onrender.com/generate-content', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'experience',
                        jobDescription: jobDescription.value || '',
                        jobTitle: expTitle,
                        experienceLevel: experienceLevel.value
                    })
                });
                
                const data = await response.json();
                expDesc.value = data.content;
                saveResumeData();
            } catch (error) {
                alert('Error generating experience: ' + error.message);
            }
            
            e.target.disabled = false;
            e.target.textContent = '✨ Enhance with AI';
        }
        
        // Project AI Generation
        if (e.target.classList.contains('ai-proj-btn')) {
            const projItem = e.target.closest('.project-item');
            const projDesc = projItem.querySelector('.projDesc');
            const projName = projItem.querySelector('.projName').value;
            const projTech = projItem.querySelector('.projTech').value;
            
            if (!projName) {
                alert('Please fill in project name');
                return;
            }
            
            e.target.disabled = true;
            e.target.textContent = 'Generating...';
            
            try {
                const response = await fetch('https://ai-powered-resume-builder-1-27ju.onrender.com/generate-content', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'project',
                        projectName: projName,
                        technologies: projTech || '',
                        jobDescription: jobDescription.value || ''
                    })
                });
                
                const data = await response.json();
                projDesc.value = data.content;
                saveResumeData();
            } catch (error) {
                alert('Error generating project description: ' + error.message);
            }
            
            e.target.disabled = false;
            e.target.textContent = '✨ Generate the description with AI';
        }
    });

    // Add Experience
    const addExperienceBtn = document.getElementById('addExperienceBtn');
    if (addExperienceBtn) {
        addExperienceBtn.addEventListener('click', () => {
        const container = document.getElementById('experienceContainer');
        const newExp = document.createElement('div');
        newExp.className = 'experience-item';
        newExp.innerHTML = `
            <div class="form-group">
                <label>Job Title</label>
                <input type="text" class="expTitle" placeholder="Software Engineer">
            </div>
            <div class="form-group">
                <label>Company</label>
                <input type="text" class="expCompany" placeholder="Tech Corp">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Start Date</label>
                    <input type="text" class="expStart" placeholder="Jan 2022">
                </div>
                <div class="form-group">
                    <label>End Date</label>
                    <input type="text" class="expEnd" placeholder="Present">
                </div>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="expDesc" rows="3" placeholder="Describe your role..."></textarea>
                <button class="ai-btn-small ai-exp-btn">✨ Enhance with AI</button>
            </div>
        `;
        container.appendChild(newExp);
        });
    }

    // Add Education
    const addEducationBtn = document.getElementById('addEducationBtn');
    if (addEducationBtn) {
        addEducationBtn.addEventListener('click', () => {
        const container = document.getElementById('educationContainer');
        const newEdu = document.createElement('div');
        newEdu.className = 'education-item';
        newEdu.innerHTML = `
            <div class="form-group">
                <label>Degree</label>
                <input type="text" class="eduDegree" placeholder="Bachelor of Science in Computer Science">
            </div>
            <div class="form-group">
                <label>Institution</label>
                <input type="text" class="eduInstitution" placeholder="University Name">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Year</label>
                    <input type="text" class="eduYear" placeholder="2018 - 2022">
                </div>
                <div class="form-group">
                    <label>GPA (Optional)</label>
                    <input type="text" class="eduGpa" placeholder="3.8/4.0">
                </div>
            </div>
        `;
        container.appendChild(newEdu);
        });
    }

    // Add Project
    const addProjectBtn = document.getElementById('addProjectBtn');
    if (addProjectBtn) {
        addProjectBtn.addEventListener('click', () => {
        const container = document.getElementById('projectsContainer');
        const newProj = document.createElement('div');
        newProj.className = 'project-item';
        newProj.innerHTML = `
            <div class="form-group">
                <label>Project Name</label>
                <input type="text" class="projName" placeholder="E-commerce Website">
            </div>
            <div class="form-group">
                <label>Technologies</label>
                <input type="text" class="projTech" placeholder="React, Node.js, MongoDB">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="projDesc" rows="2" placeholder="Describe your project..."></textarea>
                <button class="ai-btn-small ai-proj-btn">✨ Generate the description with AI</button>
            </div>
        `;
        container.appendChild(newProj);
        });
    }

    // Add Certification
    const addCertificationBtn = document.getElementById('addCertificationBtn');
    if (addCertificationBtn) {
        addCertificationBtn.addEventListener('click', () => {
        const container = document.getElementById('certificationsContainer');
        const newCert = document.createElement('div');
        newCert.className = 'certification-item';
        newCert.innerHTML = `
            <div class="form-group">
                <label>Certification Name</label>
                <input type="text" class="certName" placeholder="AWS Certified Solutions Architect">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Issuing Organization</label>
                    <input type="text" class="certOrg" placeholder="Amazon Web Services">
                </div>
                <div class="form-group">
                    <label>Year</label>
                    <input type="text" class="certYear" placeholder="2023">
                </div>
            </div>
        `;
        container.appendChild(newCert);
        });
    }

    // Add Achievement
    const addAchievementBtn = document.getElementById('addAchievementBtn');
    if (addAchievementBtn) {
        addAchievementBtn.addEventListener('click', () => {
        const container = document.getElementById('achievementsContainer');
        const newAch = document.createElement('div');
        newAch.className = 'achievement-item';
        newAch.innerHTML = `
            <div class="form-group">
                <label>Achievement Title</label>
                <input type="text" class="achTitle" placeholder="Won First Prize in Hackathon">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="achDesc" rows="2" placeholder="Describe your achievement..."></textarea>
            </div>
        `;
        container.appendChild(newAch);
        });
    }

    // Auto-save resume data
    function saveResumeData() {
        const data = {
            companyName: companyName.value,
            jobDescription: jobDescription.value,
            experienceLevel: experienceLevel.value,
            resumeStyle: resumeStyle.value,
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            location: document.getElementById('location').value,
            linkedin: document.getElementById('linkedin').value,
            github: document.getElementById('github').value,
            professionalSummary: professionalSummary.value,
            skills: skills.value,
            experience: [],
            education: [],
            projects: [],
            certifications: [],
            achievements: []
        };

        document.querySelectorAll('.experience-item').forEach(item => {
            data.experience.push({
                title: item.querySelector('.expTitle').value,
                company: item.querySelector('.expCompany').value,
                start: item.querySelector('.expStart').value,
                end: item.querySelector('.expEnd').value,
                description: item.querySelector('.expDesc').value
            });
        });

        document.querySelectorAll('.education-item').forEach(item => {
            data.education.push({
                degree: item.querySelector('.eduDegree').value,
                institution: item.querySelector('.eduInstitution').value,
                year: item.querySelector('.eduYear').value,
                gpa: item.querySelector('.eduGpa').value
            });
        });

        document.querySelectorAll('.project-item').forEach(item => {
            data.projects.push({
                name: item.querySelector('.projName').value,
                technologies: item.querySelector('.projTech').value,
                description: item.querySelector('.projDesc').value
            });
        });

        document.querySelectorAll('.certification-item').forEach(item => {
            data.certifications.push({
                name: item.querySelector('.certName').value,
                organization: item.querySelector('.certOrg').value,
                year: item.querySelector('.certYear').value
            });
        });

        document.querySelectorAll('.achievement-item').forEach(item => {
            data.achievements.push({
                title: item.querySelector('.achTitle').value,
                description: item.querySelector('.achDesc').value
            });
        });

        localStorage.setItem('resumeData', JSON.stringify(data));
    }

    function clearResumeFields() {
        document.querySelectorAll('input, textarea').forEach(field => {
            if (field.type !== 'checkbox') field.value = '';
        });
    }

    // Live preview update function
    function updateLivePreview() {
        const livePreviewContent = document.getElementById('livePreviewContent');
        if (!livePreviewContent) return;

        const style = resumeStyle.value;
        livePreviewContent.className = `preview-content ${style}`;
        
        let html = `
            <h1>${document.getElementById('fullName').value || 'Your Name'}</h1>
            <div class="contact-info">
                <span>${document.getElementById('email').value || 'email@example.com'}</span>
                <span>${document.getElementById('phone').value || '+1 234 567 8900'}</span>
                <span>${document.getElementById('location').value || 'Location'}</span>
                ${document.getElementById('linkedin') && document.getElementById('linkedin').value ? `<span>${document.getElementById('linkedin').value}</span>` : ''}
                ${document.getElementById('github') && document.getElementById('github').value ? `<span>${document.getElementById('github').value}</span>` : ''}
            </div>
        `;

        if (professionalSummary.value) {
            html += `
                <h2>Professional Summary</h2>
                <p>${highlightKeywords(professionalSummary.value)}</p>
            `;
        }

        const experiences = [];
        document.querySelectorAll('.experience-item').forEach(item => {
            const title = item.querySelector('.expTitle').value;
            if (title) {
                experiences.push({
                    title: title,
                    company: item.querySelector('.expCompany').value,
                    start: item.querySelector('.expStart').value,
                    end: item.querySelector('.expEnd').value,
                    description: item.querySelector('.expDesc').value
                });
            }
        });

        if (experiences.length > 0) {
            html += '<h2>Experience</h2>';
            experiences.forEach(exp => {
                html += `
                    <h3>${exp.title} - ${exp.company}</h3>
                    <p><em>${exp.start} - ${exp.end}</em></p>
                    <p>${highlightKeywords(exp.description)}</p>
                `;
            });
        }

        const education = [];
        document.querySelectorAll('.education-item').forEach(item => {
            const degree = item.querySelector('.eduDegree').value;
            if (degree) {
                education.push({
                    degree: degree,
                    institution: item.querySelector('.eduInstitution').value,
                    year: item.querySelector('.eduYear').value,
                    gpa: item.querySelector('.eduGpa').value
                });
            }
        });

        if (education.length > 0) {
            html += '<h2>Education</h2>';
            education.forEach(edu => {
                html += `
                    <h3>${edu.degree}</h3>
                    <p>${edu.institution} | ${edu.year}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</p>
                `;
            });
        }

        if (skills.value) {
            html += `
                <h2>Skills</h2>
                <p>${highlightKeywords(skills.value)}</p>
            `;
        }

        const projects = [];
        document.querySelectorAll('.project-item').forEach(item => {
            const name = item.querySelector('.projName').value;
            if (name) {
                projects.push({
                    name: name,
                    technologies: item.querySelector('.projTech').value,
                    description: item.querySelector('.projDesc').value
                });
            }
        });

        if (projects.length > 0) {
            html += '<h2>Projects</h2>';
            projects.forEach(proj => {
                html += `
                    <h3>${proj.name}</h3>
                    <p><em>${proj.technologies}</em></p>
                    <p>${highlightKeywords(proj.description)}</p>
                `;
            });
        }

        const certifications = [];
        document.querySelectorAll('.certification-item').forEach(item => {
            const name = item.querySelector('.certName').value;
            if (name) {
                certifications.push({
                    name: name,
                    organization: item.querySelector('.certOrg').value,
                    year: item.querySelector('.certYear').value
                });
            }
        });

        if (certifications.length > 0) {
            html += '<h2>Certifications</h2>';
            certifications.forEach(cert => {
                html += `<p><strong>${cert.name}</strong> - ${cert.organization} (${cert.year})</p>`;
            });
        }

        const achievements = [];
        document.querySelectorAll('.achievement-item').forEach(item => {
            const title = item.querySelector('.achTitle').value;
            if (title) {
                achievements.push({
                    title: title,
                    description: item.querySelector('.achDesc').value
                });
            }
        });

        if (achievements.length > 0) {
            html += '<h2>Achievements</h2>';
            achievements.forEach(ach => {
                html += `
                    <h3>${ach.title}</h3>
                    <p>${ach.description}</p>
                `;
            });
        }

        livePreviewContent.innerHTML = html;
    }

    // Auto-save on input change and update live preview
    if (resumeBuilderSplit) {
        resumeBuilderSplit.addEventListener('input', () => {
            saveResumeData();
            updateLivePreview();
        });
    }

    function highlightKeywords(text) {
        if (!text || !jobDescription.value) return text;
        
        const keywords = extractKeywords(jobDescription.value);
        let highlighted = text;
        
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            highlighted = highlighted.replace(regex, match => `<span class="highlight">${match}</span>`);
        });
        
        return highlighted;
    }

    function extractKeywords(text) {
        const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can'];
        const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
        const wordFreq = {};
        
        words.forEach(word => {
            if (word.length > 3 && !commonWords.includes(word)) {
                wordFreq[word] = (wordFreq[word] || 0) + 1;
            }
        });
        
        return Object.keys(wordFreq).slice(0, 20);
    }

    // PDF Download
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', () => {
            updateLivePreview();
            setTimeout(() => window.print(), 100);
        });
    }

    // TXT Download
    const downloadTxtBtn = document.getElementById('downloadTxtBtn');
    if (downloadTxtBtn) {
        downloadTxtBtn.addEventListener('click', () => {
            const data = localStorage.getItem('resumeData');
            if (!data) {
                alert('No resume data found');
                return;
            }

            const resume = JSON.parse(data);
            let txt = `${resume.fullName}\n`;
            txt += `${resume.email} | ${resume.phone} | ${resume.location}\n`;
            if (resume.linkedin) txt += `${resume.linkedin}\n`;
            if (resume.github) txt += `${resume.github}\n`;
            txt += `\n`;
            
            if (resume.professionalSummary) {
                txt += `PROFESSIONAL SUMMARY\n${resume.professionalSummary}\n\n`;
            }
            
            if (resume.experience && resume.experience.length > 0) {
                txt += `EXPERIENCE\n`;
                resume.experience.forEach(exp => {
                    txt += `${exp.title} - ${exp.company}\n`;
                    txt += `${exp.start} - ${exp.end}\n`;
                    txt += `${exp.description}\n\n`;
                });
            }
            
            if (resume.education && resume.education.length > 0) {
                txt += `EDUCATION\n`;
                resume.education.forEach(edu => {
                    txt += `${edu.degree}\n`;
                    txt += `${edu.institution} | ${edu.year}`;
                    if (edu.gpa) txt += ` | GPA: ${edu.gpa}`;
                    txt += `\n\n`;
                });
            }
            
            if (resume.skills) {
                txt += `SKILLS\n${resume.skills}\n\n`;
            }
            
            if (resume.projects && resume.projects.length > 0) {
                txt += `PROJECTS\n`;
                resume.projects.forEach(proj => {
                    txt += `${proj.name}\n`;
                    txt += `${proj.technologies}\n`;
                    txt += `${proj.description}\n\n`;
                });
            }
            
            if (resume.certifications && resume.certifications.length > 0) {
                txt += `CERTIFICATIONS\n`;
                resume.certifications.forEach(cert => {
                    txt += `${cert.name} - ${cert.organization} (${cert.year})\n`;
                });
            }
            
            if (resume.achievements && resume.achievements.length > 0) {
                txt += `\nACHIEVEMENTS\n`;
                resume.achievements.forEach(ach => {
                    txt += `${ach.title}\n`;
                    txt += `${ach.description}\n\n`;
                });
            }

            const blob = new Blob([txt], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'resume.txt';
            a.click();
            URL.revokeObjectURL(url);
        });
    }
}

// ATS Score Checker Logic
if (window.location.pathname.includes('ats.html')) {
    const generateAtsBtn = document.getElementById('generateAtsBtn');
    const resumeFile = document.getElementById('resumeFile');
    const fileInfo = document.getElementById('fileInfo');
    const atsResults = document.getElementById('atsResults');

    resumeFile.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            fileInfo.textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
        }
    });

    generateAtsBtn.addEventListener('click', async () => {
        const companyName = document.getElementById('atsCompanyName').value;
        const jobDescription = document.getElementById('atsJobDescription').value;
        const experienceLevel = document.getElementById('atsExperienceLevel').value;
        const file = resumeFile.files[0];

        if (!file) {
            alert('Please upload a resume file');
            return;
        }

        generateAtsBtn.disabled = true;
        generateAtsBtn.textContent = 'Analyzing...';

        const reader = new FileReader();
        reader.onload = async (e) => {
            const resumeText = e.target.result;

            try {
                const response = await fetch('http://localhost:3000/ats-score', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        resumeText,
                        jobDescription,
                        experienceLevel,
                        companyName
                    })
                });

                const data = await response.json();
                displayAtsResults(data);
            } catch (error) {
                alert('Error calculating ATS score: ' + error.message);
            }

            generateAtsBtn.disabled = false;
            generateAtsBtn.textContent = 'Generate ATS Score';
        };

        reader.readAsText(file);
    });

    function displayAtsResults(data) {
        document.getElementById('atsScoreValue').textContent = data.score;
        document.getElementById('progressFill').style.width = data.score + '%';

        const matchedKeywords = document.getElementById('matchedKeywords');
        matchedKeywords.innerHTML = '';
        data.matchedKeywords.forEach(keyword => {
            const tag = document.createElement('span');
            tag.className = 'keyword-tag matched';
            tag.textContent = keyword;
            matchedKeywords.appendChild(tag);
        });

        const missingKeywords = document.getElementById('missingKeywords');
        missingKeywords.innerHTML = '';
        data.missingKeywords.forEach(keyword => {
            const tag = document.createElement('span');
            tag.className = 'keyword-tag missing';
            tag.textContent = keyword;
            missingKeywords.appendChild(tag);
        });

        const suggestions = document.getElementById('suggestions');
        suggestions.innerHTML = '';
        data.suggestions.forEach((suggestion, index) => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = `${index + 1}. ${suggestion}`;
            suggestions.appendChild(item);
        });

        atsResults.style.display = 'block';
        atsResults.scrollIntoView({ behavior: 'smooth' });
    }
}
