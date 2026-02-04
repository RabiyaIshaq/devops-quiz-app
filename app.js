// DevOps Quiz App - Enhanced Version
class DevOpsQuiz {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.selectedTopic = '';
        this.userAnswers = new Map();
        this.flaggedQuestions = new Set();
        this.totalTimeUsed = 0;
        this.timePerQuestion = 60;
        this.timeRemaining = 60;
        this.timerInterval = null;
        this.quizStarted = false;
        this.topicQuestions = [];
        this.performanceChart = null;
       
        // Initialize
        this.init();
    }
   
    async init() {
        // Load questions
        await this.loadQuestions();
       
        // Setup event listeners
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
       
        // Show welcome screen
        this.showWelcomeScreen();
    }
   
    async loadQuestions() {
        try {
            const response = await fetch('data/questions.json');
            this.questions = await response.json();
            console.log(`Loaded ${this.questions.length} DevOps questions`);
        } catch (error) {
            console.error('Error loading questions:', error);
            this.showError('Failed to load questions. Please check the questions.json file.');
        }
    }
   
    showWelcomeScreen() {
        document.getElementById('welcome-section').classList.remove('hidden');
        document.getElementById('topic-selection').classList.add('hidden');
        document.getElementById('quiz-section').classList.add('hidden');
        document.getElementById('results-section').classList.add('hidden');
    }
   
    showTopicSelection() {
        document.getElementById('welcome-section').classList.add('hidden');
        document.getElementById('topic-selection').classList.remove('hidden');
        this.displayTopics();
    }
   
    displayTopics() {
        const topicsContainer = document.querySelector('.topics-container');
        topicsContainer.innerHTML = '';
       
        const topics = [...new Set(this.questions.map(q => q.topic))];
       
        if (topics.length === 0) {
            topicsContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>No topics available. Please add questions to the question bank.</p>
                </div>
            `;
            return;
        }
       
        topics.forEach(topic => {
            const topicQuestions = this.questions.filter(q => q.topic === topic);
            const topicCard = document.createElement('div');
            topicCard.className = 'topic-card';
            topicCard.innerHTML = `
                <div class="topic-icon">
                    <i class="${this.getTopicIcon(topic)}"></i>
                </div>
                <div class="topic-info">
                    <h3>${topic}</h3>
                    <p>${topicQuestions.length} questions</p>
                    <div class="topic-difficulty">
                        <span class="difficulty-dot easy"></span>
                        <span class="difficulty-dot medium"></span>
                        <span class="difficulty-dot hard"></span>
                    </div>
                </div>
                <div class="topic-action">
                    <i class="fas fa-arrow-right"></i>
                </div>
            `;
           
            topicCard.addEventListener('click', () => this.startQuiz(topic));
            topicsContainer.appendChild(topicCard);
        });
    }
   
    getTopicIcon(topic) {
        const icons = {
            'Continuous Integration': 'fas fa-sync-alt',
            'Continuous Delivery': 'fas fa-truck-loading',
            'Infrastructure as Code': 'fas fa-server',
            'Version Control Systems': 'fas fa-code-branch',
            'DevOps Culture': 'fas fa-users'
        };
        return icons[topic] || 'fas fa-question-circle';
    }
   
    startQuiz(topic) {
        this.selectedTopic = topic;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers.clear();
        this.flaggedQuestions.clear();
        this.totalTimeUsed = 0;
        this.quizStarted = true;
        this.topicQuestions = this.questions.filter(q => q.topic === topic);
       
        // Hide topic selection, show quiz
        document.getElementById('topic-selection').classList.add('hidden');
        document.getElementById('quiz-section').classList.remove('hidden');
       
        // Update UI
        this.updateStats();
        this.loadQuestion();
    }
   
    loadQuestion() {
        if (this.currentQuestionIndex >= this.topicQuestions.length) {
            this.showResults();
            return;
        }
       
        const question = this.topicQuestions[this.currentQuestionIndex];
       
        // Update progress
        const progress = ((this.currentQuestionIndex + 1) / this.topicQuestions.length) * 100;
        document.getElementById('quiz-progress-bar').style.width = `${progress}%`;
       
        // Update counters
        document.getElementById('current-question').textContent = this.currentQuestionIndex + 1;
        document.getElementById('total-questions').textContent = this.topicQuestions.length;
       
        // Update question
        document.getElementById('question-topic').textContent = question.topic;
        document.getElementById('question-text').textContent = question.question;
       
        // Set difficulty based on question ID
        const difficulty = this.getQuestionDifficulty(question.id);
        document.querySelector('.difficulty').textContent = difficulty;
       
        // Load options
        this.loadOptions(question);
       
        // Update navigation buttons
        this.updateNavigationButtons();
       
        // Start timer
        this.startTimer();
       
        // Update flagged status
        this.updateFlagButton();
       
        // Hide feedback modal
        document.getElementById('feedback-modal').classList.add('hidden');
    }
   
    loadOptions(question) {
        const optionsContainer = document.querySelector('.options-container');
        optionsContainer.innerHTML = '';
       
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.innerHTML = `
                <div class="option-number">${String.fromCharCode(65 + index)}</div>
                <div class="option-text">${option}</div>
            `;
            optionElement.dataset.index = index;
           
            // Check if already selected
            if (this.userAnswers.has(this.currentQuestionIndex) &&
                this.userAnswers.get(this.currentQuestionIndex) === index) {
                optionElement.classList.add('selected');
            }
           
            optionElement.addEventListener('click', () => this.selectOption(index));
            optionsContainer.appendChild(optionElement);
        });
    }
   
    selectOption(optionIndex) {
        // Remove selected from all options
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });
       
        // Add selected to clicked option
        const selectedOption = document.querySelector(`.option[data-index="${optionIndex}"]`);
        selectedOption.classList.add('selected');
       
        // Store answer
        this.userAnswers.set(this.currentQuestionIndex, optionIndex);
       
        // Enable submit button
        document.getElementById('submit-btn').disabled = false;
    }
   
    startTimer() {
        this.timeRemaining = this.timePerQuestion;
        this.updateTimerDisplay();
       
        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
           
            if (this.timeRemaining <= 0) {
                clearInterval(this.timerInterval);
                this.autoSubmit();
            }
        }, 1000);
    }
   
    updateTimerDisplay() {
        document.getElementById('timer-value').textContent = this.timeRemaining;
       
        // Update circular progress
        const circumference = 176; // 2 * π * r (r = 28)
        const offset = circumference - (this.timeRemaining / this.timePerQuestion) * circumference;
        document.querySelector('.timer-progress').style.strokeDashoffset = offset;
       
        // Change color when time is low
        const timerValue = document.getElementById('timer-value');
        if (this.timeRemaining <= 10) {
            timerValue.style.color = '#f44336';
            document.querySelector('.timer-progress').style.stroke = '#f44336';
        } else if (this.timeRemaining <= 30) {
            timerValue.style.color = '#FF9800';
            document.querySelector('.timer-progress').style.stroke = '#FF9800';
        } else {
            timerValue.style.color = '#4CAF50';
            document.querySelector('.timer-progress').style.stroke = '#4CAF50';
        }
    }
   
    submitAnswer() {
        if (!this.userAnswers.has(this.currentQuestionIndex)) {
            this.showToast('Please select an answer first!', 'warning');
            return;
        }
       
        clearInterval(this.timerInterval);
        this.totalTimeUsed += (this.timePerQuestion - this.timeRemaining);
       
        const question = this.topicQuestions[this.currentQuestionIndex];
        const userAnswer = this.userAnswers.get(this.currentQuestionIndex);
       
        // Show feedback modal
        this.showFeedback(question, userAnswer);
       
        // Update UI to show correct/incorrect
        document.querySelectorAll('.option').forEach((opt, index) => {
            if (index === question.answerIndex) {
                opt.classList.add('correct');
            } else if (index === userAnswer && index !== question.answerIndex) {
                opt.classList.add('incorrect');
            }
            opt.style.pointerEvents = 'none';
        });
       
        // Update score if correct
        if (userAnswer === question.answerIndex) {
            this.score++;
            question.answeredCorrectly = true;
        }
       
        // Update stats
        this.updateStats();
       
        // Hide submit button, show next navigation
        document.getElementById('submit-btn').style.display = 'none';
        document.getElementById('continue-btn').style.display = 'block';
    }
   
    showFeedback(question, userAnswer) {
        const isCorrect = userAnswer === question.answerIndex;
        const modal = document.getElementById('feedback-modal');
        const icon = document.getElementById('feedback-icon');
        const title = document.getElementById('feedback-title');
        const text = document.getElementById('feedback-text');
        const correctAnswer = document.getElementById('correct-answer');
       
        // Set feedback content
        if (isCorrect) {
            icon.innerHTML = '<i class="fas fa-check-circle" style="color: #4CAF50"></i>';
            title.textContent = 'Correct! 🎉';
            title.style.color = '#4CAF50';
            text.textContent = question.explanation;
            correctAnswer.classList.add('hidden');
        } else {
            icon.innerHTML = '<i class="fas fa-times-circle" style="color: #f44336"></i>';
            title.textContent = 'Incorrect! 😞';
            title.style.color = '#f44336';
            text.textContent = question.explanation;
            correctAnswer.classList.remove('hidden');
            correctAnswer.textContent = `Correct Answer: ${question.options[question.answerIndex]}`;
        }
       
        // Update feedback stats
        document.getElementById('time-taken-feedback').textContent =
            this.timePerQuestion - this.timeRemaining;
        document.getElementById('accuracy-feedback').textContent =
            Math.round((this.score / (this.currentQuestionIndex + 1)) * 100);
       
        // Show modal
        modal.classList.remove('hidden');
    }
   
    nextQuestion() {
        this.currentQuestionIndex++;
        this.loadQuestion();
    }
   
    prevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.loadQuestion();
        }
    }
   
    showHint() {
        const question = this.topicQuestions[this.currentQuestionIndex];
        const answerLength = question.options[question.answerIndex].length;
       
        let hint = '';
        if (answerLength < 30) {
            hint = "Hint: The correct answer is relatively short and concise.";
        } else if (answerLength < 60) {
            hint = "Hint: The correct answer is of medium length and provides a clear definition.";
        } else {
            hint = "Hint: The correct answer is detailed and explains a concept thoroughly.";
        }
       
        this.showToast(hint, 'info');
        document.getElementById('hint-btn').disabled = true;
    }
   
    toggleFlag() {
        const questionId = this.topicQuestions[this.currentQuestionIndex].id;
        if (this.flaggedQuestions.has(questionId)) {
            this.flaggedQuestions.delete(questionId);
            this.showToast('Question unflagged', 'info');
        } else {
            this.flaggedQuestions.add(questionId);
            this.showToast('Question flagged for review', 'warning');
        }
        this.updateFlagButton();
    }
   
    updateFlagButton() {
        const questionId = this.topicQuestions[this.currentQuestionIndex]?.id;
        const flagBtn = document.getElementById('flag-btn');
        if (this.flaggedQuestions.has(questionId)) {
            flagBtn.innerHTML = '<i class="fas fa-flag"></i> Unflag';
            flagBtn.classList.add('flagged');
        } else {
            flagBtn.innerHTML = '<i class="far fa-flag"></i> Flag';
            flagBtn.classList.remove('flagged');
        }
    }
   
    showResults() {
        clearInterval(this.timerInterval);
       
        // Hide quiz, show results
        document.getElementById('quiz-section').classList.add('hidden');
        document.getElementById('results-section').classList.remove('hidden');
       
        // Calculate results
        const totalQuestions = this.topicQuestions.length;
        const correctAnswers = this.score;
        const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
       
        // Update results display
        document.getElementById('final-score').textContent = accuracy;
        document.getElementById('correct-count').textContent = correctAnswers;
        document.getElementById('total-answered').textContent = totalQuestions;
        document.getElementById('time-taken').textContent = this.totalTimeUsed;
        document.getElementById('accuracy').textContent = accuracy;
       
        // Set score message
        this.setScoreMessage(accuracy);
       
        // Create performance chart
        this.createPerformanceChart();
    }
   
    setScoreMessage(accuracy) {
        const message = document.getElementById('score-message');
        const description = document.getElementById('score-description');
       
        if (accuracy >= 90) {
            message.textContent = 'DevOps Master! 🏆';
            description.textContent = 'Outstanding performance! You have expert-level DevOps knowledge.';
        } else if (accuracy >= 75) {
            message.textContent = 'Excellent Work! 👍';
            description.textContent = 'Strong DevOps understanding with room for some advanced topics.';
        } else if (accuracy >= 60) {
            message.textContent = 'Good Job! 📚';
            description.textContent = 'Solid foundation in DevOps principles. Keep learning!';
        } else if (accuracy >= 40) {
            message.textContent = 'Keep Practicing! 💪';
            description.textContent = 'You have basic understanding. Review the explanations to improve.';
        } else {
            message.textContent = 'Learning Journey Begins! 🚀';
            description.textContent = 'DevOps is a continuous learning process. Review the questions and try again!';
        }
    }
   
    createPerformanceChart() {
        const ctx = document.getElementById('performanceChart').getContext('2d');
       
        if (this.performanceChart) {
            this.performanceChart.destroy();
        }
       
        const topicStats = {};
        this.topicQuestions.forEach((q, index) => {
            const topic = q.topic;
            if (!topicStats[topic]) topicStats[topic] = { correct: 0, total: 0 };
            topicStats[topic].total++;
            if (this.userAnswers.get(index) === q.answerIndex) {
                topicStats[topic].correct++;
            }
        });
       
        const topics = Object.keys(topicStats);
        const percentages = topics.map(topic => {
            const stats = topicStats[topic];
            return Math.round((stats.correct / stats.total) * 100);
        });
       
        this.performanceChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: topics,
                datasets: [{
                    label: 'Accuracy %',
                    data: percentages,
                    backgroundColor: [
                        '#667eea', '#764ba2', '#4CAF50', '#FF9800', '#9C27B0'
                    ],
                    borderColor: [
                        '#5568d4', '#653a92', '#3d8b40', '#e68900', '#7b1fa2'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Accuracy (%)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
   
    restartQuiz() {
        this.startQuiz(this.selectedTopic);
    }
   
    updateStats() {
        document.getElementById('score-value').textContent = this.score;
       
        const accuracy = this.currentQuestionIndex > 0
            ? Math.round((this.score / this.currentQuestionIndex) * 100)
            : 0;
       
        // Update any other stats displays
    }
   
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const submitBtn = document.getElementById('submit-btn');
       
        prevBtn.disabled = this.currentQuestionIndex === 0;
        submitBtn.disabled = !this.userAnswers.has(this.currentQuestionIndex);
        submitBtn.style.display = 'block';
    }
   
    getQuestionDifficulty(id) {
        // Simple difficulty based on question number
        const num = parseInt(id.replace('Q', ''));
        if (num <= 8) return 'Easy';
        if (num <= 16) return 'Medium';
        return 'Hard';
    }
   
    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'warning' ? 'exclamation-triangle' :
                                  type === 'error' ? 'times-circle' :
                                  type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
       
        // Add to document
        document.body.appendChild(toast);
       
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
   
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
            <button onclick="location.reload()" class="btn secondary">
                <i class="fas fa-redo"></i> Reload
            </button>
        `;
       
        document.querySelector('main').innerHTML = '';
        document.querySelector('main').appendChild(errorDiv);
    }
   
    setupEventListeners() {
        // Welcome screen
        document.getElementById('start-quiz-btn').addEventListener('click', () => this.showTopicSelection());
       
        // Topic selection
        document.getElementById('back-to-welcome').addEventListener('click', () => this.showWelcomeScreen());
       
        // Quiz navigation
        document.getElementById('prev-btn').addEventListener('click', () => this.prevQuestion());
        document.getElementById('submit-btn').addEventListener('click', () => this.submitAnswer());
        document.getElementById('continue-btn').addEventListener('click', () => this.nextQuestion());
        document.getElementById('hint-btn').addEventListener('click', () => this.showHint());
        document.getElementById('flag-btn').addEventListener('click', () => this.toggleFlag());
       
        // Modal
        document.querySelector('.close-modal').addEventListener('click', () => {
            document.getElementById('feedback-modal').classList.add('hidden');
        });
       
        // Results actions
        document.getElementById('restart-btn').addEventListener('click', () => this.restartQuiz());
        document.getElementById('change-topic-btn').addEventListener('click', () => this.showTopicSelection());
        document.getElementById('review-btn').addEventListener('click', () => {
            this.showToast('Review feature coming soon!', 'info');
        });
    }
   
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (!this.quizStarted) return;
           
            switch(e.key) {
                case '1':
                case '2':
                case '3':
                case '4':
                    const optionIndex = parseInt(e.key) - 1;
                    if (optionIndex >= 0 && optionIndex < 4) {
                        this.selectOption(optionIndex);
                    }
                    break;
                case 'Enter':
                    if (document.getElementById('submit-btn').style.display !== 'none') {
                        this.submitAnswer();
                    } else if (!document.getElementById('feedback-modal').classList.contains('hidden')) {
                        this.nextQuestion();
                    }
                    break;
                case 'ArrowRight':
                case ' ':
                    if (document.getElementById('submit-btn').style.display === 'none') {
                        this.nextQuestion();
                    }
                    break;
                case 'ArrowLeft':
                    this.prevQuestion();
                    break;
                case 'h':
                case 'H':
                    if (!document.getElementById('hint-btn').disabled) {
                        this.showHint();
                    }
                    break;
                case 'f':
                case 'F':
                    this.toggleFlag();
                    break;
            }
        });
    }
   
    autoSubmit() {
        if (!this.userAnswers.has(this.currentQuestionIndex)) {
            // Auto-select first option
            this.selectOption(0);
        }
        this.submitAnswer();
        this.showToast('Time\'s up! Answer submitted automatically.', 'warning');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.quiz = new DevOpsQuiz();
    console.log('DevOps Quiz Enhanced Edition initialized');
});

// Add CSS for toast notifications
const toastCSS = `
.toast {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 10px;
    color: white;
    font-weight: bold;
    z-index: 1000;
    animation: slideIn 0.3s ease;
    max-width: 300px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.toast-info {
    background: #2196F3;
}

.toast-success {
    background: #4CAF50;
}

.toast-warning {
    background: #FF9800;
}

.toast-error {
    background: #f44336;
}

.toast-content {
    display: flex;
    align-items: center;
    gap: 10px;
}

.fade-out {
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
`;

// Inject toast styles
const style = document.createElement('style');
style.textContent = toastCSS;
document.head.appendChild(style);
