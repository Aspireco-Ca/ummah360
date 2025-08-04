class IslamicQuestion {
    constructor(data) {
        this.id = data.id;
        this.text = data.text;
        this.answers = data.answers || [];
        this.correctAnswer = data.correctAnswer;
        this.category = data.category;
        this.source = data.source;
        this.explanation = data.explanation || '';
        this.difficulty = data.difficulty || 1;
        this.arabicText = data.arabicText || '';
        this.reference = data.reference || '';
        this.tags = data.tags || [];
        this.timeLimit = data.timeLimit || 30;
        this.points = data.points || 100;
    }

    // Static method to create questions from different Islamic categories
    static createQuranQuestion(data) {
        return new IslamicQuestion({
            ...data,
            category: 'quran',
            source: data.source || 'Holy Quran'
        });
    }

    static createHadithQuestion(data) {
        return new IslamicQuestion({
            ...data,
            category: 'hadith',
            source: data.source || 'Hadith Collection'
        });
    }

    static createFiqhQuestion(data) {
        return new IslamicQuestion({
            ...data,
            category: 'fiqh',
            source: data.source || 'Islamic Jurisprudence'
        });
    }

    static createHistoryQuestion(data) {
        return new IslamicQuestion({
            ...data,
            category: 'history',
            source: data.source || 'Islamic History'
        });
    }

    static createAqidahQuestion(data) {
        return new IslamicQuestion({
            ...data,
            category: 'aqidah',
            source: data.source || 'Islamic Theology'
        });
    }

    // Validation methods
    isValid() {
        return (
            this.text &&
            this.answers.length >= 2 &&
            this.correctAnswer >= 0 &&
            this.correctAnswer < this.answers.length &&
            this.category &&
            this.source
        );
    }

    hasArabicContent() {
        return this.arabicText && this.arabicText.length > 0;
    }

    // Utility methods
    getFormattedQuestion() {
        let formatted = {
            id: this.id,
            text: this.text,
            answers: this.answers,
            category: this.category,
            difficulty: this.difficulty,
            timeLimit: this.timeLimit,
            points: this.points
        };

        if (this.hasArabicContent()) {
            formatted.arabicText = this.arabicText;
        }

        if (this.reference) {
            formatted.reference = this.reference;
        }

        return formatted;
    }

    getCategoryInfo() {
        const categoryData = {
            quran: {
                name: 'Quran',
                nameArabic: 'القرآن الكريم',
                color: '#4CAF50',
                icon: '📖'
            },
            hadith: {
                name: 'Hadith',
                nameArabic: 'الحديث الشريف',
                color: '#2196F3',
                icon: '📜'
            },
            fiqh: {
                name: 'Fiqh',
                nameArabic: 'الفقه الإسلامي',
                color: '#FF9800',
                icon: '⚖️'
            },
            history: {
                name: 'Islamic History',
                nameArabic: 'التاريخ الإسلامي',
                color: '#9C27B0',
                icon: '🏛️'
            },
            aqidah: {
                name: 'Aqidah',
                nameArabic: 'العقيدة الإسلامية',
                color: '#607D8B',
                icon: '☪️'
            }
        };

        return categoryData[this.category] || categoryData.quran;
    }

    getDifficultyInfo() {
        const difficultyLevels = {
            1: { name: 'Beginner', nameArabic: 'مبتدئ', color: '#4CAF50' },
            2: { name: 'Easy', nameArabic: 'سهل', color: '#8BC34A' },
            3: { name: 'Medium', nameArabic: 'متوسط', color: '#FF9800' },
            4: { name: 'Hard', nameArabic: 'صعب', color: '#FF5722' },
            5: { name: 'Expert', nameArabic: 'خبير', color: '#F44336' }
        };

        return difficultyLevels[this.difficulty] || difficultyLevels[1];
    }

    // Scoring methods
    calculateScore(timeTaken, isCorrect, bonusMultiplier = 1) {
        if (!isCorrect) return 0;

        let baseScore = this.points;
        
        // Difficulty bonus
        baseScore += (this.difficulty - 1) * 20;
        
        // Time bonus (faster answers get more points)
        const timeBonus = Math.max(0, (this.timeLimit - timeTaken) * 2);
        
        // Apply bonus multiplier (from cards or special effects)
        const totalScore = Math.round((baseScore + timeBonus) * bonusMultiplier);
        
        return Math.max(totalScore, 10); // Minimum 10 points
    }

    // Question bank methods
    static getQuranQuestions() {
        return [
            new IslamicQuestion({
                id: 'q001',
                text: 'What is the first chapter (Surah) of the Quran?',
                arabicText: 'ما هي أول سورة في القرآن الكريم؟',
                answers: ['Al-Fatiha', 'Al-Baqarah', 'Al-Ikhlas', 'An-Nas'],
                correctAnswer: 0,
                category: 'quran',
                source: 'Quran Structure',
                reference: 'Surah Al-Fatiha',
                explanation: 'Al-Fatiha (The Opening) is the first chapter of the Quran and is recited in every unit of prayer.',
                difficulty: 1,
                tags: ['structure', 'prayer', 'basic']
            }),
            new IslamicQuestion({
                id: 'q002',
                text: 'How many verses (Ayahs) are in Surah Al-Fatiha?',
                arabicText: 'كم عدد الآيات في سورة الفاتحة؟',
                answers: ['6', '7', '8', '9'],
                correctAnswer: 1,
                category: 'quran',
                source: 'Quran Structure',
                reference: 'Surah Al-Fatiha 1:1-7',
                explanation: 'Surah Al-Fatiha contains 7 verses, known as "As-Sab\' al-Mathani" (The Seven Oft-Repeated).',
                difficulty: 2,
                tags: ['structure', 'fatiha', 'verses']
            }),
            new IslamicQuestion({
                id: 'q003',
                text: 'Which Surah is known as the "Heart of the Quran"?',
                arabicText: 'أي سورة تُعرف بـ "قلب القرآن"؟',
                answers: ['Yasin', 'Al-Baqarah', 'Al-Mulk', 'Ar-Rahman'],
                correctAnswer: 0,
                category: 'quran',
                source: 'Hadith Literature',
                reference: 'Surah Yasin 36:1-83',
                explanation: 'Surah Yasin is often called the "Heart of the Quran" due to its central themes and spiritual significance.',
                difficulty: 3,
                tags: ['surah', 'heart', 'yasin']
            })
        ];
    }

    static getHadithQuestions() {
        return [
            new IslamicQuestion({
                id: 'h001',
                text: 'Complete the hadith: "Actions are but by..."',
                arabicText: 'أكمل الحديث: "إنما الأعمال..."',
                answers: ['intention', 'results', 'effort', 'sincerity'],
                correctAnswer: 0,
                category: 'hadith',
                source: 'Sahih Bukhari',
                reference: 'Bukhari 1:1',
                explanation: 'This famous hadith emphasizes that the value of actions depends on the intention behind them.',
                difficulty: 2,
                tags: ['intention', 'niyyah', 'actions']
            }),
            new IslamicQuestion({
                id: 'h002',
                text: 'Who is known as the "Mother of the Believers" and was Prophet Muhammad\'s first wife?',
                arabicText: 'من هي "أم المؤمنين" وأول زوجة للنبي محمد صلى الله عليه وسلم؟',
                answers: ['Aisha (RA)', 'Khadijah (RA)', 'Hafsa (RA)', 'Zainab (RA)'],
                correctAnswer: 1,
                category: 'hadith',
                source: 'Seerah Literature',
                reference: 'Multiple authentic sources',
                explanation: 'Khadijah (RA) was the first wife of Prophet Muhammad (PBUH) and the first person to accept Islam.',
                difficulty: 1,
                tags: ['wives', 'khadijah', 'first', 'believers']
            })
        ];
    }

    static getFiqhQuestions() {
        return [
            new IslamicQuestion({
                id: 'f001',
                text: 'How many times a day do Muslims pray?',
                arabicText: 'كم مرة في اليوم يصلي المسلمون؟',
                answers: ['3', '4', '5', '6'],
                correctAnswer: 2,
                category: 'fiqh',
                source: 'Islamic Worship',
                reference: 'Five Daily Prayers',
                explanation: 'Muslims pray five times daily: Fajr, Dhuhr, Asr, Maghrib, and Isha.',
                difficulty: 1,
                tags: ['prayer', 'salah', 'daily', 'worship']
            }),
            new IslamicQuestion({
                id: 'f002',
                text: 'What percentage of wealth is typically given as Zakat?',
                arabicText: 'ما هي النسبة المئوية للثروة التي تُعطى عادة كزكاة؟',
                answers: ['1.5%', '2.5%', '5%', '10%'],
                correctAnswer: 1,
                category: 'fiqh',
                source: 'Islamic Finance',
                reference: 'Zakat Calculation',
                explanation: 'Zakat is typically 2.5% of eligible wealth held for one lunar year.',
                difficulty: 2,
                tags: ['zakat', 'charity', 'percentage', 'wealth']
            })
        ];
    }

    static getHistoryQuestions() {
        return [
            new IslamicQuestion({
                id: 'hist001',
                text: 'In which year did the Hijra (migration to Medina) take place?',
                arabicText: 'في أي عام حدثت الهجرة إلى المدينة؟',
                answers: ['620 CE', '622 CE', '624 CE', '630 CE'],
                correctAnswer: 1,
                category: 'history',
                source: 'Islamic History',
                reference: 'Year 1 AH',
                explanation: 'The Hijra occurred in 622 CE and marks the beginning of the Islamic calendar.',
                difficulty: 2,
                tags: ['hijra', 'migration', 'medina', 'calendar']
            }),
            new IslamicQuestion({
                id: 'hist002',
                text: 'Who was the first Caliph after Prophet Muhammad (PBUH)?',
                arabicText: 'من كان أول خليفة بعد النبي محمد صلى الله عليه وسلم؟',
                answers: ['Umar ibn Khattab (RA)', 'Uthman ibn Affan (RA)', 'Ali ibn Abi Talib (RA)', 'Abu Bakr (RA)'],
                correctAnswer: 3,
                category: 'history',
                source: 'Early Islamic History',
                reference: 'Rashidun Caliphate',
                explanation: 'Abu Bakr (RA) was chosen as the first Caliph and led the Muslim community after the Prophet\'s death.',
                difficulty: 1,
                tags: ['caliph', 'abu-bakr', 'succession', 'rashidun']
            })
        ];
    }

    static getAqidahQuestions() {
        return [
            new IslamicQuestion({
                id: 'aq001',
                text: 'What are the Six Articles of Faith in Islam?',
                arabicText: 'ما هي أركان الإيمان الستة في الإسلام؟',
                answers: [
                    'Belief in Allah, Angels, Books, Prophets, Last Day, Divine Decree',
                    'Prayer, Charity, Fasting, Pilgrimage, Shahada, Jihad',
                    'Quran, Sunnah, Ijma, Qiyas, Istihsan, Maslaha',
                    'Tawhid, Risalah, Akhirah, Malaikah, Kutub, Qadar'
                ],
                correctAnswer: 0,
                category: 'aqidah',
                source: 'Islamic Theology',
                reference: 'Hadith of Jibril',
                explanation: 'The Six Articles of Faith form the foundation of Islamic belief system.',
                difficulty: 3,
                tags: ['faith', 'articles', 'belief', 'iman']
            })
        ];
    }

    // Get questions by category
    static getQuestionsByCategory(category, count = 10) {
        let questions = [];
        
        switch (category.toLowerCase()) {
            case 'quran':
                questions = this.getQuranQuestions();
                break;
            case 'hadith':
                questions = this.getHadithQuestions();
                break;
            case 'fiqh':
                questions = this.getFiqhQuestions();
                break;
            case 'history':
                questions = this.getHistoryQuestions();
                break;
            case 'aqidah':
                questions = this.getAqidahQuestions();
                break;
            default:
                // Return mixed questions
                questions = [
                    ...this.getQuranQuestions(),
                    ...this.getHadithQuestions(),
                    ...this.getFiqhQuestions(),
                    ...this.getHistoryQuestions(),
                    ...this.getAqidahQuestions()
                ];
                break;
        }
        
        // Shuffle and return requested count
        return this.shuffleArray(questions).slice(0, count);
    }

    // Get questions by difficulty
    static getQuestionsByDifficulty(difficulty, count = 10) {
        const allQuestions = [
            ...this.getQuranQuestions(),
            ...this.getHadithQuestions(),
            ...this.getFiqhQuestions(),
            ...this.getHistoryQuestions(),
            ...this.getAqidahQuestions()
        ];
        
        const filteredQuestions = allQuestions.filter(q => q.difficulty === difficulty);
        return this.shuffleArray(filteredQuestions).slice(0, count);
    }

    // Utility method to shuffle array
    static shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Convert to JSON for storage/transmission
    toJSON() {
        return {
            id: this.id,
            text: this.text,
            arabicText: this.arabicText,
            answers: this.answers,
            correctAnswer: this.correctAnswer,
            category: this.category,
            source: this.source,
            reference: this.reference,
            explanation: this.explanation,
            difficulty: this.difficulty,
            tags: this.tags,
            timeLimit: this.timeLimit,
            points: this.points
        };
    }

    // Create from JSON
    static fromJSON(json) {
        return new IslamicQuestion(json);
    }
}

export default IslamicQuestion;