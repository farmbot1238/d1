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

// دالة لتهيئة العناصر
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
    
    console.log('العناصر:', {
        mainMenu: mainMenu ? '✅' : '❌',
        quizArea: quizArea ? '✅' : '❌',
        resultArea: resultArea ? '✅' : '❌'
    });
}

// انتظر تحميل الصفحة كاملة
window.addEventListener('load', function() {
    console.log('الصفحة تحمّلت بالكامل');
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
        showError('حدث خطأ في تحميل الأسئلة');
        return null;
    }
}

function showError(message) {
    const menu = document.getElementById('mainMenu');
    if (menu) {
        menu.innerHTML = `
            <div style="text-align:center; padding:50px;">
                <p style="color:#8b1538;">⚠️ ${message}</p>
                <button onclick="location.reload()" style="margin-top:20px; padding:10px 30px; background:#0f4e3a; color:white; border:none; border-radius:30px;">إعادة تحميل</button>
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
    
    if (!mainMenu) initElements();
    
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
    
    if (!mainMenu) initElements();
    
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
    
    if (!mainMenu || !quizArea || !resultArea) {
        initElements();
    }
    
    if (mainMenu) mainMenu.style.display = 'none';
    if (quizArea) quizArea.style.display = 'block';
    if (resultArea) resultArea.style.display = 'none';
    
    if (quizArea) quizArea.classList.remove('hidden');
    if (mainMenu) mainMenu.classList.add('hidden');
    if (resultArea) resultArea.classList.add('hidden');
    
    displayQuestion();
    updateNavButtons();
    isLoading = false;
}

function displayQuestion() {
    if (!currentQuiz.questions.length) return;
    
    const q = currentQuiz.questions[currentQuiz.currentIndex];
    if (!q || !questionText) return;
    
    questionText.textContent = q.question;
    
    let optionsHtml = '';
    q.options.forEach((opt, index) => {
        const isSelected = currentQuiz.userAnswers[currentQuiz.currentIndex] === index;
        optionsHtml += `<div class="option ${isSelected ? 'selected' : ''}" onclick="selectOption(${index})">${opt}</div>`;
    });
    
    if (optionsContainer) optionsContainer.innerHTML = optionsHtml;
    if (questionCounter) questionCounter.textContent = `سؤال ${currentQuiz.currentIndex + 1}/${currentQuiz.totalQuestions}`;
    if (progressBar) progressBar.style.width = `${((currentQuiz.currentIndex + 1) / currentQuiz.totalQuestions) * 100}%`;
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
    
    // التحقق: إذا كان هذا هو آخر سؤال، أظهر النتيجة فوراً
    if (currentQuiz.currentIndex === currentQuiz.totalQuestions - 1) {
        setTimeout(() => {
            showResults();
        }, 300);
    } else {
        setTimeout(() => {
            nextQuestion();
        }, 300);
    }
};

window.nextQuestion = function() {
    // إذا كان هذا هو آخر سؤال، أظهر النتيجة
    if (currentQuiz.currentIndex === currentQuiz.totalQuestions - 1) {
        showResults();
        return;
    }
    
    // غير ذلك انتقل للسؤال التالي
    if (currentQuiz.currentIndex < currentQuiz.totalQuestions - 1) {
        currentQuiz.currentIndex++;
        displayQuestion();
        updateNavButtons();
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
    console.log('عرض النتيجة');
    
    let score = 0;
    currentQuiz.questions.forEach((q, index) => {
        if (currentQuiz.userAnswers[index] === q.answer) {
            score++;
        }
    });
    
    if (quizArea) quizArea.style.display = 'none';
    if (resultArea) resultArea.style.display = 'block';
    
    if (quizArea) quizArea.classList.add('hidden');
    if (resultArea) resultArea.classList.remove('hidden');
    
    if (scoreDisplay) scoreDisplay.textContent = `${score}/${currentQuiz.totalQuestions}`;
    const percentage = Math.round((score / currentQuiz.totalQuestions) * 100);
    if (percentageDisplay) percentageDisplay.textContent = `${percentage}%`;
    
    let detailsHtml = '<table class="details-table"><thead><tr><th>السؤال</th><th>إجابتك</th><th>الإجابة الصحيحة</th></tr></thead><tbody>';
    
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
    if (mainMenu) mainMenu.style.display = 'block';
    if (quizArea) quizArea.style.display = 'none';
    if (resultArea) resultArea.style.display = 'none';
    
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

// حماية
document.addEventListener('contextmenu', (e) => e.preventDefault());
