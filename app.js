// DevOps Quiz App - Simplified Fixed Version
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
    this.timerInterval = null;
    this.topicQuestions = [];
    this.performanceChart = null;
    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  async init() {
    try {
      const res = await fetch('data/questions.json');
      this.questions = await res.json();
    } catch {
      alert('Error loading questions.json');
    }
    this.setupEvents();
    this.show('welcome-section');
  }

  show(id) {
    ['welcome-section','topic-selection','quiz-section','results-section']
      .forEach(sec => document.getElementById(sec).classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
  }

  setupEvents() {
    document.getElementById('start-quiz-btn').onclick = () => this.showTopics();
    document.getElementById('back-to-welcome').onclick = () => this.show('welcome-section');
    document.getElementById('prev-btn').onclick = () => this.prev();
    document.getElementById('submit-btn').onclick = () => this.submit();
    document.getElementById('continue-btn').onclick = () => this.next();
    document.getElementById('hint-btn').onclick = () => alert('Hint feature');
    document.getElementById('flag-btn').onclick = () => this.toggleFlag();
    document.getElementById('restart-btn').onclick = () => this.startQuiz(this.selectedTopic);
    document.getElementById('change-topic-btn').onclick = () => this.showTopics();
  }

  showTopics() {
    this.show('topic-selection');
    const container = document.querySelector('.topics-container');
    container.innerHTML = '';
    [...new Set(this.questions.map(q => q.topic))].forEach(t => {
      const card = document.createElement('div');
      card.className = 'topic-card';
      card.textContent = `${t} (${this.questions.filter(q=>q.topic===t).length} questions)`;
      card.onclick = () => this.startQuiz(t);
      container.appendChild(card);
    });
  }

  startQuiz(topic) {
    this.selectedTopic = topic;
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.userAnswers.clear();
    this.topicQuestions = this.questions.filter(q => q.topic === topic);
    this.show('quiz-section');
    this.loadQuestion();
  }

  loadQuestion() {
    if (this.currentQuestionIndex >= this.topicQuestions.length) return this.results();
    const q = this.topicQuestions[this.currentQuestionIndex];
    document.getElementById('question-text').textContent = q.question;
    document.getElementById('question-topic').textContent = q.topic;
    document.getElementById('current-question').textContent = this.currentQuestionIndex+1;
    document.getElementById('total-questions').textContent = this.topicQuestions.length;
    const opts = document.querySelector('.options-container');
    opts.innerHTML = '';
    q.options.forEach((opt,i)=>{
      const div=document.createElement('div');
      div.className='option'; div.textContent=opt;
      div.onclick=()=>{this.userAnswers.set(this.currentQuestionIndex,i);this.updateButtons();};
      opts.appendChild(div);
    });
    this.updateButtons();
  }

  updateButtons() {
    document.getElementById('prev-btn').disabled = this.currentQuestionIndex===0;
    const submit=document.getElementById('submit-btn');
    const cont=document.getElementById('continue-btn');
    if(this.userAnswers.has(this.currentQuestionIndex)){
      submit.disabled=false; submit.style.display='block'; cont.style.display='none';
    } else { submit.disabled=true; cont.style.display='none'; }
  }

  submit() {
    const q=this.topicQuestions[this.currentQuestionIndex];
    const ans=this.userAnswers.get(this.currentQuestionIndex);
    if(ans===q.answerIndex) this.score++;
    this.updateStats();
    document.getElementById('submit-btn').style.display='none';
    document.getElementById('continue-btn').style.display='block';
  }

  next(){this.currentQuestionIndex++;this.loadQuestion();}
  prev(){if(this.currentQuestionIndex>0){this.currentQuestionIndex--;this.loadQuestion();}}

  updateStats() {
    document.getElementById('score-value').textContent=this.score;
    const acc=Math.round((this.score/(this.currentQuestionIndex+1))*100);
    document.getElementById('accuracy').textContent=acc;
  }

  toggleFlag() {
    const id=this.topicQuestions[this.currentQuestionIndex].id;
    if(this.flaggedQuestions.has(id)) this.flaggedQuestions.delete(id);
    else this.flaggedQuestions.add(id);
  }

  results() {
    this.show('results-section');
    const total=this.topicQuestions.length;
    const acc=Math.round((this.score/total)*100);
    document.getElementById('final-score').textContent=acc;
    document.getElementById('correct-count').textContent=this.score;
    document.getElementById('total-answered').textContent=total;
    this.chart();
  }

  chart() {
    const ctx=document.getElementById('performanceChart').getContext('2d');
    if(this.performanceChart) this.performanceChart.destroy();
    const stats={};
    this.topicQuestions.forEach((q,i)=>{
      if(!stats[q.topic]) stats[q.topic]={correct:0,total:0};
      stats[q.topic].total++;
      if(this.userAnswers.get(i)===q.answerIndex) stats[q.topic].correct++;
    });
    const topics=Object.keys(stats);
    const data=topics.map(t=>Math.round((stats[t].correct/stats[t].total)*100));
    this.performanceChart=new Chart(ctx,{type:'bar',data:{labels:topics,datasets:[{data}]},options:{scales:{y:{beginAtZero:true,max:100}}}});
  }
}

new DevOpsQuiz();
