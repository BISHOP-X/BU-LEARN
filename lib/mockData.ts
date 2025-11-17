// Mock data for testing UI without backend
export const mockConversionResult = {
  notes: `# Key Points Summary

• AI-powered learning transforms traditional study methods
• Four distinct learning formats cater to different learning styles
• Gamification increases engagement and retention
• Personalized recommendations adapt to user preferences
• Community features enable collaborative learning`,

  audio: {
    url: 'https://example.com/audio.mp3', // Will be replaced with real audio
    duration: 180, // seconds
    script: 'This is a natural spoken script about the learning material...'
  },

  quiz: [
    {
      question: 'What is the main benefit of AI-powered learning?',
      options: [
        'Personalized adaptation to learning styles',
        'Faster content delivery',
        'Lower costs',
        'More entertainment'
      ],
      correct: 0,
      explanation: 'AI-powered learning adapts to individual learning styles and preferences, making education more effective.'
    },
    {
      question: 'How many learning formats does BU-Learn provide?',
      options: ['2', '3', '4', '5'],
      correct: 2,
      explanation: 'BU-Learn provides 4 formats: Notes, Audio, Quiz, and Story.'
    },
    {
      question: 'What is gamification in learning?',
      options: [
        'Playing video games while studying',
        'Using game elements to increase engagement',
        'Competitive testing only',
        'Virtual reality simulations'
      ],
      correct: 1,
      explanation: 'Gamification uses game elements like points, badges, and leaderboards to increase motivation and engagement.'
    }
  ],

  story: `# Chapter 1: The Learning Revolution

Once upon a time, in a world where traditional textbooks ruled supreme, there lived a student named Alex who struggled to stay focused while studying. Hours would pass, pages would blur together, and knowledge seemed to slip away like sand through fingers.

One day, Alex discovered a revolutionary approach to learning—one that transformed dry facts into engaging narratives, converted lengthy chapters into bite-sized audio lessons, and turned passive reading into active challenges.

## The Transformation

As Alex uploaded the first study material, something magical happened. The AI didn't just store the information—it understood it, reshaped it, and presented it in four unique ways, each designed for different moments and moods of learning.

The journey had just begun, and the path to knowledge had never been more exciting...`
}

// Mock user data
export const mockUser = {
  id: '123',
  username: 'student_alex',
  email: 'alex@example.com',
  learning_style: 'visual',
  points: 250,
  level: 3,
  streak: 7,
  badges: ['first_quiz', '7_day_streak']
}

// Mock uploaded content
export const mockContent = [
  {
    id: '1',
    title: 'Introduction to AI',
    file_type: 'pdf',
    status: 'completed',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Machine Learning Basics',
    file_type: 'txt',
    status: 'processing',
    created_at: new Date().toISOString(),
  }
]
