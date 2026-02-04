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
            const optionElement = document
