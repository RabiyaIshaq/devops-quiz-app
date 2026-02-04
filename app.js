// DevOps Quiz App - Main Application Logic
class QuizApp {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.selectedTopic = '';
        this.userAnswers = new Map();
        this.quizStarted = false;
        this.timePerQuestion = 60; // seconds
        this.timeRemaining = 0;
        this.timerInterval = null;
        this.totalTimeUsed = 0;
        this.startTime = null;
        
        // Initialize the app
        this.init();
    }
    async init() {
        // Load questions from JSON file
        await this.loadQuestions();
        
        // Setup event listeners
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        
        // Display topics
        this.displayTopics();
    }
    
    async loadQuestions() {
        try {
            const response = await fetch('data/questions.json');
            this.questions = await response.json();
            console.log(`Loaded ${this.questions.length} questions successfully`);
        } catch (error) {
            console.error('Error loading questions:', error);
            // Fallback to empty array
            this.questions = [];
            // Show error message
            document.querySelector('.topics-container').innerHTML = 
                '<p class="error">Error loading questions. Please check the questions.json file.</p>';
        }
    }
    
    displayTopics() {
        const topicsContainer = document.querySelector('.topics-container');
        topicsContainer.innerHTML = '';
        
        // Get unique topics from questions
        const topics = [...new Set(this.questions.map(q => q.topic))];
        
        if (topics.length === 0) {
            topicsContainer.innerHTML = '<p class="error">No topics available. Please add questions first.</p>';
            return;
        }
        
        topics.forEach(topic => {
            const topicQuestions = this.questions.filter(q => q.topic === topic);
            const topicCard = document.createElement('div');
            topicCard.className = 'topic-card';
            topicCard.innerHTML = `
                <h3>${topic}</h3>
                <p>${topicQuestions.length} questions</p>
                <small>Click to start quiz</small>
            `;
            
            topicCard.addEventListener('click', () => {
                this.startQuiz(topic);
            });
            
            topicsContainer.appendChild(topicCard);
        });
    }
    
    startQuiz(topic) {
        this.selectedTopic = topic;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers.clear();
        this.quizStarted = true;
        this.totalTimeUsed = 0;
        this.startTime = Date.now();
        
        // Hide topic selection, show quiz
        document.getElementById('topic-selection').classList.add('hidden');
        document.getElementById('quiz-section').classList.remove('hidden');
        
        // Load first question
        this.loadQuestion();
    }
    
    loadQuestion() {
        const topicQuestions = this.questions.filter(q => q.topic === this.selectedTopic);
        
        if (this.currentQuestionIndex >= topicQuestions.length) {
            this.showResults();
            return;
        }
        
        const question = topicQuestions[this.currentQuestionIndex];
        
        // Update progress bar
        const progress = ((this.currentQuestionIndex + 1) / topicQuestions.length) * 100;
        document.querySelector('.progress-bar').style.width = `${progress}%`;
        
        // Update question count
        document.getElementById('current-question').textContent = this.currentQuestionIndex + 1;
        document.getElementById('total-questions').textContent = topicQuestions.length;
        
        // Update score
        document.getElementById('score-value').textContent = this.score;
        
        // Display question
        document.getElementById('question-topic').textContent = question.topic;
        document.getElementById('question-text').textContent = question.question;
        
        // Display options
        const optionsContainer = document.querySelector('.options-container');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.innerHTML = `
                <span class="option-number">${String.fromCharCode(65 + index)}</span>
                <span class="option-text">${option}</span>
            `;
            optionElement.dataset.index = index;
            
            // Check if user already selected this option
            if (this.userAnswers.has(this.currentQuestionIndex) && 
                this.userAnswers.get(this.currentQuestionIndex) === index) {
                optionElement.classList.add('selected');
            }
            
            optionElement.addEventListener('click', () => {
                this.selectOption(index);
            });
            
            optionsContainer.appendChild(optionElement);
        });
        
        // Update navigation buttons
        const prevBtn = document.getElementById('prev-btn');
        const submitBtn = document.getElementById('submit-btn');
        const nextBtn = document.getElementById('next-btn');
        
        prevBtn.disabled = this.currentQuestionIndex === 0;
        submitBtn.disabled = !this.userAnswers.has(this.currentQuestionIndex);
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
        
        // Start timer
        this.startTimer();
        
        // Hide feedback if visible
        document.getElementById('feedback').classList.add('hidden');
        
        // Reset hint button
        document.getElementById('hint-btn').textContent = 'Show Hint';
        document.getElementById('hint-btn').disabled = false;
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
        
        // Change color when time is running out
        if (this.timeRemaining <= 10) {
            document.getElementById('timer-value').style.color = '#f44336';
        } else {
            document.getElementById('timer-value').style.color = '#667eea';
        }
    }
    
    selectOption(optionIndex) {
        // Remove selected class from all options
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Add selected class to clicked option
        const selectedOption = document.querySelector(`.option[data-index="${optionIndex}"]`);
        selectedOption.classList.add('selected');
        
        // Store user's answer
        this.userAnswers.set(this.currentQuestionIndex, optionIndex);
        
        // Enable submit button
        document.getElementById('submit-btn').disabled = false;
    }
    
    submitAnswer() {
        if (!this.userAnswers.has(this.currentQuestionIndex)) {
            alert('Please select an answer first!');
            return;
        }
        
        clearInterval(this.timerInterval);
        this.totalTimeUsed += (this.timePerQuestion - this.timeRemaining);
        
        const topicQuestions = this.questions.filter(q => q.topic === this.selectedTopic);
        const question = topicQuestions[this.currentQuestionIndex];
        const userAnswer = this.userAnswers.get(this.currentQuestionIndex);
        
        // Show feedback
        const feedback = document.getElementById('feedback');
        const feedbackTitle = document.getElementById('feedback-title');
        const feedbackText = document.getElementById('feedback-text');
        const correctAnswerDiv = document.getElementById('correct-answer');
        
        if (userAnswer === question.answerIndex) {
            feedbackTitle.textContent = 'Correct! 🎉';
            feedbackTitle.style.color = '#4CAF50';
            feedbackText.textContent = question.explanation;
            correctAnswerDiv.classList.add('hidden');
            
            // Update score if first time correct
            if (!question.answeredCorrectly) {
                this.score++;
                question.answeredCorrectly = true;
            }
        } else {
            feedbackTitle.textContent = 'Incorrect! 😞';
            feedbackTitle.style.color = '#f44336';
            feedbackText.textContent = question.explanation;
            correctAnswerDiv.classList.remove('hidden');
            correctAnswerDiv.textContent = `Correct answer: ${question.options[question.answerIndex]}`;
        }
        
        feedback.classList.remove('hidden');
        
        // Update UI to show correct/incorrect
        document.querySelectorAll('.option').forEach((opt, index) => {
            if (index === question.answerIndex) {
                opt.classList.add('correct');
            } else if (index === userAnswer && index !== question.answerIndex) {
                opt.classList.add('incorrect');
            }
            opt.style.pointerEvents = 'none';
        });
        
        // Update score display
        document.getElementById('score-value').textContent = this.score;
        
        // Show next button, hide submit
        document.getElementById('next-btn').style.display = 'block';
        document.getElementById('submit-btn').style.display = 'none';
    }
    
    autoSubmit() {
        if (!this.userAnswers.has(this.currentQuestionIndex)) {
            // Auto-select first option if none selected
            this.selectOption(0);
        }
        this.submitAnswer();
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
        const topicQuestions = this.questions.filter(q => q.topic === this.selectedTopic);
        const question = topicQuestions[this.currentQuestionIndex];
        
        // Simple hint based on answer length
        const answerLength = question.options[question.answerIndex].length;
        let hint = '';
        
        if (answerLength < 30) {
            hint = "Hint: The correct answer is relatively short.";
        } else if (answerLength < 60) {
            hint = "Hint: The correct answer is of medium length.";
        } else {
            hint = "Hint: The correct answer is quite detailed.";
        }
        
        // Show as alert for simplicity
        alert(hint);
        
        // Disable hint button after use
        document.getElementById('hint-btn').disabled = true;
        document.getElementById('hint-btn').textContent = 'Hint Used';
    }
    
    showResults() {
        clearInterval(this.timerInterval);
        
        // Calculate total time if quiz completed
        if (this.startTime) {
            this.totalTimeUsed = Math.floor((Date.now() - this.startTime) / 1000);
        }
        
        document.getElementById('quiz-section').classList.add('hidden');
        document.getElementById('results-section').classList.remove('hidden');
        
        const topicQuestions = this.questions.filter(q => q.topic === this.selectedTopic);
        const totalQuestions = topicQuestions.length;
        const correctAnswers = this.score;
        const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        
        document.getElementById('final-score').textContent = accuracy;
        document.getElementById('correct-count').textContent = correctAnswers;
        document.getElementById('total-answered').textContent = totalQuestions;
        document.getElementById('accuracy').textContent = accuracy;
        document.getElementById('time-taken').textContent = this.totalTimeUsed;
        
        let message = '';
        if (accuracy >= 90) {
            message = 'Outstanding! DevOps Master! 🏆';
        } else if (accuracy >= 75) {
            message = 'Excellent! Strong DevOps knowledge! 👍';
        } else if (accuracy >= 60) {
            message = 'Good job! Solid understanding! 📚';
        } else if (accuracy >= 40) {
            message = 'Fair! Keep learning DevOps concepts! 💪';
        } else {
            message = 'Keep practicing! DevOps is a continuous journey! 🚀';
        }
        document.getElementById('score-message').textContent = message;
    }
    
    setupEventListeners() {
        // Navigation buttons
        document.getElementById('prev-btn').addEventListener('click', () => this.prevQuestion());
        document.getElementById('submit-btn').addEventListener('click', () => this.submitAnswer());
        document.getElementById('next-btn').addEventListener('click', () => this.nextQuestion());
        document.getElementById('continue-btn').addEventListener('click', () => this.nextQuestion());
        
        // Control buttons
        document.getElementById('hint-btn').addEventListener('click', () => this.showHint());
        document.getElementById('review-btn').addEventListener('click', () => {
            alert('Question marked for review. You can come back to it later.');
        });
        
        // Results buttons
        document.getElementById('restart-btn').addEventListener('click', () => {
            document.getElementById('results-section').classList.add('hidden');
            this.startQuiz(this.selectedTopic);
        });
        
        document.getElementById('change-topic-btn').addEventListener('click', () => {
            document.getElementById('results-section').classList.add('hidden');
            document.getElementById('topic-selection').classList.remove('hidden');
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
                    } else if (document.getElementById('next-btn').style.display === 'block') {
                        this.nextQuestion();
                    }
                    break;
                case 'ArrowRight':
                case ' ':
                    if (document.getElementById('next-btn').style.display === 'block') {
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
            }
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const quizApp = new QuizApp();
    console.log('DevOps Quiz App initialized');
});