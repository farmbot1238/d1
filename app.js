// app.js - الملف الرئيسي
console.log('app.js تم تحميله بنجاح');

let allQuestionsData = null;
let currentQuiz = {
    questions: [],
    userAnswers: [],
    currentIndex: 0,
    totalQuestions: 0
};
let isLoading = false;

// عناصر DOM
let mainMenu, quizArea, resultArea, questionText, optionsContainer;
let prevBtn, nextBtn, questionCounter, progressBar;
let scoreDisplay, percentageDisplay, detailsContainer;

// دالة لتهيئة العناصر بعد تحميل الصفحة
function initElements() {
    mainMenu = document.getElementById('mainMenu');
    quizArea = document.getElementById('quizArea');
    resultArea = document.getElementById('resultArea');
    questionText = document.getElementById('questionText');
    optionsContainer = document.getElementById('optionsContainer');
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');
    questionCounter = document.getElementById('questionCounter');
    progressBar = document.getElementById('progressBar');
    scoreDisplay = document.getElementById('scoreDisplay');
    percentageDisplay = document.getElementById('percentageDisplay');
    detailsContainer = document.getElementById('detailsContainer');
    
    console.log('العناصر تم تهيئتها:', {
        mainMenu: !!mainMenu,
        quizArea: !!quizArea,
        resultArea: !!resultArea
    });
}

// انتظار تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM جاهز');
    initElements();
    loadQuestions();
});

async function loadQuestions() {
    if (allQuestionsData) return allQuestionsData;
    
    try {
        console.log('جاري تحميل questions.json...');
        const response = await fetch('questions.json');
        if (!response.ok) throw new Error('فشل تحميل الأسئلة');
        allQuestionsData = await response.json();
        console.log('تم تحميل الأسئلة بنجاح');
        return allQuestionsData;
    } catch (error) {
        console.error('خطأ:', error);
        showError('حدث خطأ في تحميل الأسئلة. تأكد من وجود ملف questions.json');
        return null;
    }
}

function showError(message) {
    const mainMenuDiv = document.getElementById('mainMenu');
    if (mainMenuDiv) {
        mainMenuDiv.innerHTML = `
            <div style="text-align:center; padding:50px; background:#fff5e6; border-radius:30px; margin:20px;">
                <p style="color:#8b1538; font-size:1.3em;">⚠️ ${message}</p>
                <button onclick="location.reload()" style="margin-top:20px; padding:12px 30px; background:#0f4e3a; color:white; border:none; border-radius:30px; cursor:pointer;">إعادة تحميل</button>
            </div>
        `;
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

window.loadUnit = async function(unitNumber) {
    console.log('تحميل الوحدة:', unitNumber);
    if (isLoading) return;
    isLoading = true;
    
    // تأكد من تهيئة العناصر
    if (!mainMenu) {
        initElements();
    }
    
    const data = await loadQuestions();
    if (!data) {
        isLoading = false;
        return;
    }
    
    const unitKey = unitNumber.toString();
    if (!data.units[unitKey]) {
        console.error('الوحدة غير موجودة');
        isLoading = false;
        return;
    }
    
    currentQuiz.questions = [...data.units[unitKey].questions];
    currentQuiz.totalQuestions = currentQuiz.questions.length;
    currentQuiz.userAnswers = new Array(currentQuiz.totalQuestions).fill(null);
    currentQuiz.currentIndex = 0;
    
    startQuiz();
};

window.loadFinalExam = async function() {
    console.log('تحميل الامتحان الشامل');
    if (isLoading) return;
    isLoading = true;
    
    // تأكد من تهيئة العناصر
    if (!mainMenu) {
        initElements();
    }
    
    const data = await loadQuestions();
    if (!data) {
        isLoading = false;
        return;
    }
    
    let allQuestions = [];
    for (let i = 1; i <= 4; i++) {
        allQuestions = allQuestions.concat(data.units[i.toString()].questions);
    }
    
    currentQuiz.questions = shuffleArray([...allQuestions]).slice(0, 50);
    currentQuiz.totalQuestions = currentQuiz.questions.length;
    currentQuiz.userAnswers = new Array(currentQuiz.totalQuestions).fill(null);
    currentQuiz.currentIndex = 0;
    
    startQuiz();
};

function startQuiz() {
    console.log('بدء الامتحان');
    
    // تأكد من وجود العناصر
    if (!mainMenu || !quizArea || !resultArea) {
        initElements();
    }
    
    if (mainMenu) mainMenu.classList.add('hidden');
    if (quizArea) quizArea.classList.remove('hidden');
    if (resultArea) resultArea.classList.add('hidden');
    
    displayQuestion();
    updateNavButtons();
    isLoading = false;
}

function displayQuestion() {
    const q = currentQuiz.questions[currentQuiz.currentIndex];
    if (!q) return;
    
    if (questionText) questionText.textContent = q.question;
    
    let optionsHtml = '';
    q.options.forEach((opt, index) => {
        const isSelected = currentQuiz.userAnswers[currentQuiz.currentIndex] === index;
        optionsHtml += `<div class="option ${isSelected ? 'selected' : ''}" onclick="selectOption(${index})">${opt}</div>`;
    });
    if (optionsContainer) optionsContainer.innerHTML = optionsHtml;
    
    if (questionCounter) {
        questionCounter.textContent = `سؤال ${currentQuiz.currentIndex + 1}/${currentQuiz.totalQuestions}`;
    }
    const progressPercent = ((currentQuiz.currentIndex + 1) / currentQuiz.totalQuestions) * 100;
    if (progressBar) progressBar.style.width = `${progressPercent}%`;
}

window.selectOption = function(optionIndex) {
    currentQuiz.userAnswers[currentQuiz.currentIndex] = optionIndex;
    
    const options = document.querySelectorAll('.option');
    options.forEach((opt, idx) => {
        if (idx === optionIndex) {
            opt.classList.add('selected');
        } else {
            opt.classList.remove('selected');
        }
    });
    
    if (currentQuiz.currentIndex < currentQuiz.totalQuestions - 1) {
        setTimeout(() => {
            nextQuestion();
        }, 300);
    }
};

window.nextQuestion = function() {
    if (currentQuiz.currentIndex < currentQuiz.totalQuestions - 1) {
        currentQuiz.currentIndex++;
        displayQuestion();
        updateNavButtons();
    } else {
        showResults();
    }
};

window.previousQuestion = function() {
    if (currentQuiz.currentIndex > 0) {
        currentQuiz.currentIndex--;
        displayQuestion();
        updateNavButtons();
    }
};

function updateNavButtons() {
    if (prevBtn) prevBtn.disabled = currentQuiz.currentIndex === 0;
}

function showResults() {
    let score = 0;
    currentQuiz.questions.forEach((q, index) => {
        if (currentQuiz.userAnswers[index] === q.answer) {
            score++;
        }
    });
    
    if (quizArea) quizArea.classList.add('hidden');
    if (resultArea) resultArea.classList.remove('hidden');
    
    if (scoreDisplay) scoreDisplay.textContent = `${score}/${currentQuiz.totalQuestions}`;
    const percentage = Math.round((score / currentQuiz.totalQuestions) * 100);
    if (percentageDisplay) percentageDisplay.textContent = `${percentage}%`;
    
    let detailsHtml = '<table class="details-table"><thead><tr><th>السؤال</th><th>إجابتك</th><th>الإجابة الصحيحة</th></thead><tbody>';
    
    currentQuiz.questions.forEach((q, index) => {
        const userAns = currentQuiz.userAnswers[index];
        const userAnsText = userAns !== null ? q.options[userAns] : 'لم تجب';
        const correctAnsText = q.options[q.answer];
        const isCorrect = userAns === q.answer;
        
        detailsHtml += `<tr>
            <td>${q.question}</td>
            <td class="${isCorrect ? 'correct-answer' : 'wrong-answer'}">${userAnsText}</td>
            <td class="correct-answer">${correctAnsText}</td>
        </tr>`;
    });
    
    detailsHtml += '</tbody></table>';
    if (detailsContainer) detailsContainer.innerHTML = detailsHtml;
}

window.backToMenu = function() {
    if (mainMenu) mainMenu.classList.remove('hidden');
    if (quizArea) quizArea.classList.add('hidden');
    if (resultArea) resultArea.classList.add('hidden');
    currentQuiz = {
        questions: [],
        userAnswers: [],
        currentIndex: 0,
        totalQuestions: 0
    };
};

// حماية بسيطة
document.addEventListener('contextmenu', (e) => e.preventDefault());
