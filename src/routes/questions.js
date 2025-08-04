const express = require('express');
const router = express.Router();

// This would typically be injected or imported differently
// For now, we'll access it through the app context
let contentManager = null;

// Middleware to ensure content manager is available
router.use((req, res, next) => {
    if (!contentManager) {
        contentManager = req.app.get('contentManager');
    }
    
    if (!contentManager) {
        return res.status(503).json({
            error: 'Content service unavailable',
            message: 'Islamic content manager not initialized'
        });
    }
    
    next();
});

// GET /api/questions/categories
router.get('/categories', (req, res) => {
    try {
        const stats = contentManager.getCategoryStats();
        
        const categories = Object.keys(stats).map(category => ({
            id: category,
            name: category.charAt(0).toUpperCase() + category.slice(1),
            questionCount: stats[category].total,
            difficulties: stats[category].difficulties
        }));
        
        res.json({
            success: true,
            categories: categories,
            totalCategories: categories.length
        });
        
    } catch (error) {
        console.error('Error getting categories:', error);
        res.status(500).json({
            error: 'Failed to get categories',
            message: error.message
        });
    }
});

// GET /api/questions/category/:category
router.get('/category/:category', (req, res) => {
    try {
        const { category } = req.params;
        const { count = 20, difficulty = 'mixed' } = req.query;
        
        // Validate parameters
        const questionCount = Math.min(Math.max(parseInt(count) || 20, 1), 50);
        
        const questions = contentManager.getQuestionsByCategory(
            category, 
            questionCount, 
            difficulty
        );
        
        // Remove correct answers from response
        const questionsForClient = questions.map(q => ({
            id: q.id,
            text: q.text,
            arabicText: q.arabicText,
            answers: q.answers,
            category: q.category,
            source: q.source,
            reference: q.reference,
            difficulty: q.difficulty,
            timeLimit: q.timeLimit,
            points: q.points
        }));
        
        res.json({
            success: true,
            questions: questionsForClient,
            category: category,
            count: questionsForClient.length,
            requestedCount: questionCount
        });
        
    } catch (error) {
        console.error('Error getting questions by category:', error);
        res.status(500).json({
            error: 'Failed to get questions',
            message: error.message
        });
    }
});

// GET /api/questions/difficulty/:difficulty
router.get('/difficulty/:difficulty', (req, res) => {
    try {
        const { difficulty } = req.params;
        const { count = 20, category = null } = req.query;
        
        // Validate parameters
        const questionCount = Math.min(Math.max(parseInt(count) || 20, 1), 50);
        
        const questions = contentManager.getQuestionsByDifficulty(
            difficulty,
            questionCount,
            category
        );
        
        // Remove correct answers from response
        const questionsForClient = questions.map(q => ({
            id: q.id,
            text: q.text,
            arabicText: q.arabicText,
            answers: q.answers,
            category: q.category,
            source: q.source,
            reference: q.reference,
            difficulty: q.difficulty,
            timeLimit: q.timeLimit,
            points: q.points
        }));
        
        res.json({
            success: true,
            questions: questionsForClient,
            difficulty: difficulty,
            category: category,
            count: questionsForClient.length,
            requestedCount: questionCount
        });
        
    } catch (error) {
        console.error('Error getting questions by difficulty:', error);
        res.status(500).json({
            error: 'Failed to get questions',
            message: error.message
        });
    }
});

// GET /api/questions/random
router.get('/random', (req, res) => {
    try {
        const { category = null, difficulty = null } = req.query;
        
        const question = contentManager.getRandomQuestion(category, difficulty);
        
        if (!question) {
            return res.status(404).json({
                error: 'No questions found',
                message: 'No questions match the specified criteria'
            });
        }
        
        // Remove correct answer from response
        const questionForClient = {
            id: question.id,
            text: question.text,
            arabicText: question.arabicText,
            answers: question.answers,
            category: question.category,
            source: question.source,
            reference: question.reference,
            difficulty: question.difficulty,
            timeLimit: question.timeLimit,
            points: question.points
        };
        
        res.json({
            success: true,
            question: questionForClient
        });
        
    } catch (error) {
        console.error('Error getting random question:', error);
        res.status(500).json({
            error: 'Failed to get random question',
            message: error.message
        });
    }
});

// GET /api/questions/mixed
router.get('/mixed', (req, res) => {
    try {
        const { 
            count = 20, 
            categories = 'all',
            difficulty = 'mixed'
        } = req.query;
        
        // Parse categories
        let categoryList = ['all'];
        if (categories !== 'all') {
            categoryList = categories.split(',').map(c => c.trim().toLowerCase());
        }
        
        // Validate parameters
        const questionCount = Math.min(Math.max(parseInt(count) || 20, 1), 50);
        
        const questions = contentManager.getMixedQuestions(
            questionCount,
            categoryList,
            difficulty
        );
        
        // Remove correct answers from response
        const questionsForClient = questions.map(q => ({
            id: q.id,
            text: q.text,
            arabicText: q.arabicText,
            answers: q.answers,
            category: q.category,
            source: q.source,
            reference: q.reference,
            difficulty: q.difficulty,
            timeLimit: q.timeLimit,
            points: q.points
        }));
        
        res.json({
            success: true,
            questions: questionsForClient,
            categories: categoryList,
            difficulty: difficulty,
            count: questionsForClient.length,
            requestedCount: questionCount
        });
        
    } catch (error) {
        console.error('Error getting mixed questions:', error);
        res.status(500).json({
            error: 'Failed to get mixed questions',
            message: error.message
        });
    }
});

// GET /api/questions/search
router.get('/search', (req, res) => {
    try {
        const { 
            q: query, 
            category = null, 
            limit = 50 
        } = req.query;
        
        if (!query || query.trim().length < 2) {
            return res.status(400).json({
                error: 'Invalid query',
                message: 'Search query must be at least 2 characters long'
            });
        }
        
        // Validate limit
        const searchLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 100);
        
        const results = contentManager.searchQuestions(
            query.trim(),
            category,
            searchLimit
        );
        
        // Remove correct answers and relevance from response
        const resultsForClient = results.map(q => ({
            id: q.id,
            text: q.text,
            arabicText: q.arabicText,
            answers: q.answers,
            category: q.category,
            source: q.source,
            reference: q.reference,
            difficulty: q.difficulty,
            timeLimit: q.timeLimit,
            points: q.points
        }));
        
        res.json({
            success: true,
            results: resultsForClient,
            query: query,
            category: category,
            count: resultsForClient.length,
            limit: searchLimit
        });
        
    } catch (error) {
        console.error('Error searching questions:', error);
        res.status(500).json({
            error: 'Failed to search questions',
            message: error.message
        });
    }
});

// GET /api/questions/stats
router.get('/stats', (req, res) => {
    try {
        const stats = contentManager.getContentStats();
        
        res.json({
            success: true,
            stats: stats
        });
        
    } catch (error) {
        console.error('Error getting question stats:', error);
        res.status(500).json({
            error: 'Failed to get statistics',
            message: error.message
        });
    }
});

// POST /api/questions/validate (for admin use)
router.post('/validate', (req, res) => {
    try {
        // This endpoint would typically require admin authentication
        // For now, we'll allow it for development
        
        const validation = contentManager.validateAllContent();
        
        res.json({
            success: true,
            validation: validation
        });
        
    } catch (error) {
        console.error('Error validating content:', error);
        res.status(500).json({
            error: 'Failed to validate content',
            message: error.message
        });
    }
});

// GET /api/questions/health
router.get('/health', (req, res) => {
    try {
        const cacheInfo = contentManager.getCacheInfo();
        const stats = contentManager.getContentStats();
        
        res.json({
            success: true,
            status: 'healthy',
            cache: cacheInfo,
            contentStats: {
                totalQuestions: stats.totalQuestions,
                categories: Object.keys(stats.categories).length,
                lastUpdated: stats.lastUpdated
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error checking question service health:', error);
        res.status(500).json({
            error: 'Question service unhealthy',
            message: error.message
        });
    }
});

// Error handling middleware
router.use((error, req, res, next) => {
    console.error('Questions API error:', error);
    
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

module.exports = router;