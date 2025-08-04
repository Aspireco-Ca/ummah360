const IslamicQuestion = require('../../frontend/src/components/IslamicQuestion');

class IslamicContentManager {
    constructor() {
        this.questionCache = new Map();
        this.categoryStats = new Map();
        this.difficultyStats = new Map();
        
        // Content validation settings
        this.validationRules = {
            minQuestionLength: 10,
            maxQuestionLength: 500,
            minAnswers: 2,
            maxAnswers: 6,
            maxAnswerLength: 200,
            requiredFields: ['text', 'answers', 'correctAnswer', 'category', 'source']
        };
        
        // Initialize content
        this.initializeContent();
    }

    async initializeContent() {
        try {
            console.log('Initializing Islamic content...');
            
            // Load all question categories
            await this.loadQuestionsByCategory('quran');
            await this.loadQuestionsByCategory('hadith');
            await this.loadQuestionsByCategory('fiqh');
            await this.loadQuestionsByCategory('history');
            await this.loadQuestionsByCategory('aqidah');
            
            this.generateStats();
            
            console.log(`✅ Islamic content initialized: ${this.getTotalQuestionsCount()} questions loaded`);
            this.logContentStats();
            
        } catch (error) {
            console.error('❌ Failed to initialize Islamic content:', error);
        }
    }

    async loadQuestionsByCategory(category) {
        try {
            let questions = [];
            
            switch (category.toLowerCase()) {
                case 'quran':
                    questions = IslamicQuestion.getQuranQuestions();
                    break;
                case 'hadith':
                    questions = IslamicQuestion.getHadithQuestions();
                    break;
                case 'fiqh':
                    questions = IslamicQuestion.getFiqhQuestions();
                    break;
                case 'history':
                    questions = IslamicQuestion.getHistoryQuestions();
                    break;
                case 'aqidah':
                    questions = IslamicQuestion.getAqidahQuestions();
                    break;
                default:
                    console.warn(`Unknown category: ${category}`);
                    return [];
            }
            
            // Validate questions
            const validQuestions = questions.filter(q => this.validateQuestion(q));
            
            // Cache questions
            this.questionCache.set(category, validQuestions);
            
            console.log(`📚 Loaded ${validQuestions.length} ${category} questions`);
            return validQuestions;
            
        } catch (error) {
            console.error(`Failed to load ${category} questions:`, error);
            return [];
        }
    }

    validateQuestion(question) {
        try {
            const rules = this.validationRules;
            
            // Check required fields
            for (const field of rules.requiredFields) {
                if (!question[field]) {
                    console.warn(`Question validation failed: missing ${field}`, question.id);
                    return false;
                }
            }
            
            // Validate question text length
            if (question.text.length < rules.minQuestionLength || 
                question.text.length > rules.maxQuestionLength) {
                console.warn(`Question validation failed: invalid text length`, question.id);
                return false;
            }
            
            // Validate answers
            if (!Array.isArray(question.answers) || 
                question.answers.length < rules.minAnswers || 
                question.answers.length > rules.maxAnswers) {
                console.warn(`Question validation failed: invalid answers array`, question.id);
                return false;
            }
            
            // Validate answer lengths
            for (const answer of question.answers) {
                if (typeof answer !== 'string' || 
                    answer.length === 0 || 
                    answer.length > rules.maxAnswerLength) {
                    console.warn(`Question validation failed: invalid answer`, question.id);
                    return false;
                }
            }
            
            // Validate correct answer index
            if (typeof question.correctAnswer !== 'number' || 
                question.correctAnswer < 0 || 
                question.correctAnswer >= question.answers.length) {
                console.warn(`Question validation failed: invalid correctAnswer`, question.id);
                return false;
            }
            
            // Validate category
            const validCategories = ['quran', 'hadith', 'fiqh', 'history', 'aqidah'];
            if (!validCategories.includes(question.category.toLowerCase())) {
                console.warn(`Question validation failed: invalid category`, question.id);
                return false;
            }
            
            return true;
            
        } catch (error) {
            console.warn(`Question validation error:`, error, question.id);
            return false;
        }
    }

    // Question retrieval methods
    getQuestionsByCategory(category, count = 20, difficulty = null) {
        const questions = this.questionCache.get(category.toLowerCase()) || [];
        
        let filteredQuestions = questions;
        
        // Filter by difficulty if specified
        if (difficulty && difficulty !== 'mixed') {
            const difficultyLevel = this.parseDifficulty(difficulty);
            filteredQuestions = questions.filter(q => q.difficulty === difficultyLevel);
        }
        
        // Shuffle and return requested count
        return this.shuffleArray(filteredQuestions).slice(0, count);
    }

    getQuestionsByDifficulty(difficulty, count = 20, category = null) {
        const difficultyLevel = this.parseDifficulty(difficulty);
        let allQuestions = [];
        
        if (category) {
            const categoryQuestions = this.questionCache.get(category.toLowerCase()) || [];
            allQuestions = categoryQuestions.filter(q => q.difficulty === difficultyLevel);
        } else {
            // Get from all categories
            for (const questions of this.questionCache.values()) {
                allQuestions = allQuestions.concat(
                    questions.filter(q => q.difficulty === difficultyLevel)
                );
            }
        }
        
        return this.shuffleArray(allQuestions).slice(0, count);
    }

    getMixedQuestions(count = 20, categories = ['all'], difficulty = 'mixed') {
        let allQuestions = [];
        
        if (categories.includes('all') || categories.length === 0) {
            // Get from all categories
            for (const questions of this.questionCache.values()) {
                allQuestions = allQuestions.concat(questions);
            }
        } else {
            // Get from specified categories
            for (const category of categories) {
                const categoryQuestions = this.questionCache.get(category.toLowerCase()) || [];
                allQuestions = allQuestions.concat(categoryQuestions);
            }
        }
        
        // Filter by difficulty if not mixed
        if (difficulty !== 'mixed') {
            const difficultyLevel = this.parseDifficulty(difficulty);
            allQuestions = allQuestions.filter(q => q.difficulty === difficultyLevel);
        }
        
        return this.shuffleArray(allQuestions).slice(0, count);
    }

    getRandomQuestion(category = null, difficulty = null) {
        let questions = [];
        
        if (category) {
            questions = this.questionCache.get(category.toLowerCase()) || [];
        } else {
            // Get from all categories
            for (const categoryQuestions of this.questionCache.values()) {
                questions = questions.concat(categoryQuestions);
            }
        }
        
        // Filter by difficulty
        if (difficulty && difficulty !== 'mixed') {
            const difficultyLevel = this.parseDifficulty(difficulty);
            questions = questions.filter(q => q.difficulty === difficultyLevel);
        }
        
        if (questions.length === 0) {
            return null;
        }
        
        return questions[Math.floor(Math.random() * questions.length)];
    }

    getQuestionById(questionId) {
        for (const questions of this.questionCache.values()) {
            const question = questions.find(q => q.id === questionId);
            if (question) {
                return question;
            }
        }
        return null;
    }

    // Utility methods
    parseDifficulty(difficulty) {
        if (typeof difficulty === 'number') {
            return Math.max(1, Math.min(5, difficulty));
        }
        
        const difficultyMap = {
            'beginner': 1,
            'easy': 2,
            'medium': 3,
            'hard': 4,
            'expert': 5
        };
        
        return difficultyMap[difficulty.toLowerCase()] || 3;
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    generateStats() {
        this.categoryStats.clear();
        this.difficultyStats.clear();
        
        for (const [category, questions] of this.questionCache) {
            // Category stats
            this.categoryStats.set(category, {
                total: questions.length,
                difficulties: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
            });
            
            // Count by difficulty
            for (const question of questions) {
                const difficulty = question.difficulty || 3;
                this.categoryStats.get(category).difficulties[difficulty]++;
                
                // Overall difficulty stats
                if (!this.difficultyStats.has(difficulty)) {
                    this.difficultyStats.set(difficulty, 0);
                }
                this.difficultyStats.set(difficulty, this.difficultyStats.get(difficulty) + 1);
            }
        }
    }

    // Statistics methods
    getTotalQuestionsCount() {
        let total = 0;
        for (const questions of this.questionCache.values()) {
            total += questions.length;
        }
        return total;
    }

    getCategoryStats() {
        const stats = {};
        for (const [category, data] of this.categoryStats) {
            stats[category] = data;
        }
        return stats;
    }

    getDifficultyStats() {
        const stats = {};
        for (const [difficulty, count] of this.difficultyStats) {
            stats[difficulty] = count;
        }
        return stats;
    }

    getContentStats() {
        return {
            totalQuestions: this.getTotalQuestionsCount(),
            categories: this.getCategoryStats(),
            difficulties: this.getDifficultyStats(),
            lastUpdated: new Date().toISOString()
        };
    }

    logContentStats() {
        const stats = this.getContentStats();
        console.log('📊 Islamic Content Statistics:');
        console.log(`   Total Questions: ${stats.totalQuestions}`);
        console.log('   By Category:');
        for (const [category, data] of Object.entries(stats.categories)) {
            console.log(`     ${category}: ${data.total} questions`);
        }
        console.log('   By Difficulty:');
        for (const [difficulty, count] of Object.entries(stats.difficulties)) {
            const levels = ['', 'Beginner', 'Easy', 'Medium', 'Hard', 'Expert'];
            console.log(`     ${levels[difficulty] || difficulty}: ${count} questions`);
        }
    }

    // Content quality methods
    validateAllContent() {
        let totalQuestions = 0;
        let validQuestions = 0;
        const issues = [];
        
        for (const [category, questions] of this.questionCache) {
            for (const question of questions) {
                totalQuestions++;
                if (this.validateQuestion(question)) {
                    validQuestions++;
                } else {
                    issues.push({
                        category,
                        questionId: question.id,
                        issues: this.getValidationIssues(question)
                    });
                }
            }
        }
        
        return {
            totalQuestions,
            validQuestions,
            invalidQuestions: totalQuestions - validQuestions,
            validationRate: (validQuestions / totalQuestions) * 100,
            issues
        };
    }

    getValidationIssues(question) {
        const issues = [];
        const rules = this.validationRules;
        
        // Check each validation rule
        for (const field of rules.requiredFields) {
            if (!question[field]) {
                issues.push(`Missing required field: ${field}`);
            }
        }
        
        if (question.text && (question.text.length < rules.minQuestionLength || 
            question.text.length > rules.maxQuestionLength)) {
            issues.push(`Question text length out of bounds: ${question.text.length}`);
        }
        
        if (!Array.isArray(question.answers) || 
            question.answers.length < rules.minAnswers || 
            question.answers.length > rules.maxAnswers) {
            issues.push(`Invalid answers array length: ${question.answers?.length || 0}`);
        }
        
        return issues;
    }

    // Admin methods
    addQuestion(question) {
        if (!this.validateQuestion(question)) {
            throw new Error('Question validation failed');
        }
        
        const category = question.category.toLowerCase();
        let questions = this.questionCache.get(category) || [];
        
        // Check for duplicate ID
        if (questions.find(q => q.id === question.id)) {
            throw new Error('Question ID already exists');
        }
        
        questions.push(question);
        this.questionCache.set(category, questions);
        
        // Update stats
        this.generateStats();
        
        return true;
    }

    updateQuestion(questionId, updatedQuestion) {
        if (!this.validateQuestion(updatedQuestion)) {
            throw new Error('Question validation failed');
        }
        
        for (const [category, questions] of this.questionCache) {
            const index = questions.findIndex(q => q.id === questionId);
            if (index !== -1) {
                questions[index] = { ...updatedQuestion, id: questionId };
                this.generateStats();
                return true;
            }
        }
        
        throw new Error('Question not found');
    }

    deleteQuestion(questionId) {
        for (const [category, questions] of this.questionCache) {
            const index = questions.findIndex(q => q.id === questionId);
            if (index !== -1) {
                questions.splice(index, 1);
                this.generateStats();
                return true;
            }
        }
        
        throw new Error('Question not found');
    }

    // Search methods
    searchQuestions(query, category = null, limit = 50) {
        const results = [];
        const searchTerm = query.toLowerCase();
        
        const categoriesToSearch = category ? [category] : Array.from(this.questionCache.keys());
        
        for (const cat of categoriesToSearch) {
            const questions = this.questionCache.get(cat) || [];
            
            for (const question of questions) {
                // Search in question text, answers, and tags
                const searchableText = [
                    question.text,
                    ...question.answers,
                    question.explanation || '',
                    ...(question.tags || [])
                ].join(' ').toLowerCase();
                
                if (searchableText.includes(searchTerm)) {
                    results.push({
                        ...question,
                        category: cat,
                        relevance: this.calculateRelevance(searchableText, searchTerm)
                    });
                }
            }
        }
        
        // Sort by relevance and limit results
        return results
            .sort((a, b) => b.relevance - a.relevance)
            .slice(0, limit);
    }

    calculateRelevance(text, searchTerm) {
        const occurrences = (text.match(new RegExp(searchTerm, 'g')) || []).length;
        const wordCount = text.split(' ').length;
        return (occurrences / wordCount) * 100;
    }

    // Cache management
    clearCache() {
        this.questionCache.clear();
        this.categoryStats.clear();
        this.difficultyStats.clear();
    }

    refreshContent() {
        console.log('Refreshing Islamic content...');
        this.clearCache();
        return this.initializeContent();
    }

    getCacheInfo() {
        return {
            categories: Array.from(this.questionCache.keys()),
            totalCachedQuestions: this.getTotalQuestionsCount(),
            memoryUsage: process.memoryUsage(),
            lastRefresh: new Date().toISOString()
        };
    }
}

module.exports = IslamicContentManager;