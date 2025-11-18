import { Colors } from '@/constants/theme';
import { QuizQuestion } from '@/lib/mockData';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface QuizTabProps {
  quiz: {
    totalQuestions: number;
    passingScore: number;
    questions: QuizQuestion[];
  };
}

export default function QuizTab({ quiz }: QuizTabProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const hasAnswered = selectedAnswers[currentQuestionIndex] !== undefined;

  useEffect(() => {
    // Reset quiz state when component mounts
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setShowExplanation(false);
    setQuizCompleted(false);
    setScore(0);
  }, []);

  const handleSelectAnswer = (optionIndex: number) => {
    if (hasAnswered) return; // Can't change answer once selected

    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (!hasAnswered) {
      Alert.alert('Select an Answer', 'Please select an answer before continuing.');
      return;
    }

    setShowExplanation(false);

    if (isLastQuestion) {
      calculateScore();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowExplanation(selectedAnswers[currentQuestionIndex - 1] !== undefined);
    }
  };

  const calculateScore = () => {
    let correctCount = 0;
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setQuizCompleted(true);
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setShowExplanation(false);
    setQuizCompleted(false);
    setScore(0);
  };

  const reviewAnswers = () => {
    setQuizCompleted(false);
    setCurrentQuestionIndex(0);
    setShowExplanation(true);
  };

  if (quizCompleted) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const passed = percentage >= quiz.passingScore;
    const xpEarned = passed ? 50 : Math.floor((score / quiz.questions.length) * 30);

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.resultsContainer}>
          {/* Icon */}
          <View style={[styles.resultsIcon, passed ? styles.passedIcon : styles.failedIcon]}>
            <Ionicons
              name={passed ? 'checkmark-circle' : 'close-circle'}
              size={64}
              color={passed ? Colors.success : Colors.error}
            />
          </View>

          {/* Title */}
          <Text style={styles.resultsTitle}>
            {passed ? 'Quiz Passed!' : 'Keep Practicing!'}
          </Text>

          {/* Score */}
          <Text style={styles.resultsScore}>
            {score} / {quiz.questions.length}
          </Text>
          <Text style={styles.resultsPercentage}>{percentage}%</Text>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{score}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: Colors.error }]}>
                {quiz.questions.length - score}
              </Text>
              <Text style={styles.statLabel}>Incorrect</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: Colors.accent }]}>
                +{xpEarned}
              </Text>
              <Text style={styles.statLabel}>XP Earned</Text>
            </View>
          </View>

          {/* Pass/Fail Message */}
          <View style={styles.messageCard}>
            {passed ? (
              <>
                <Text style={styles.messageText}>
                  Great job! You've demonstrated a solid understanding of the material.
                </Text>
                <Text style={styles.messageSubtext}>
                  Passing score: {quiz.passingScore}% • You scored: {percentage}%
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.messageText}>
                  Don't worry! Review the material and try again. You're making progress!
                </Text>
                <Text style={styles.messageSubtext}>
                  Passing score: {quiz.passingScore}% • You scored: {percentage}%
                </Text>
              </>
            )}
          </View>

          {/* Action Buttons */}
          <TouchableOpacity style={styles.primaryButton} onPress={reviewAnswers}>
            <Ionicons name="eye" size={20} color={Colors.white} />
            <Text style={styles.primaryButtonText}>Review Answers</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={restartQuiz}>
            <Ionicons name="refresh" size={20} color={Colors.primary} />
            <Text style={styles.secondaryButtonText}>Retake Quiz</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </Text>
      </View>

      {/* Question Content */}
      <ScrollView style={styles.questionScrollView} contentContainerStyle={styles.scrollContent}>
        {/* Difficulty Badge */}
        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyText}>
            {currentQuestion.difficulty.toUpperCase()}
          </Text>
        </View>

        {/* Question */}
        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestionIndex] === index;
            const isCorrect = index === currentQuestion.correctAnswer;
            const showCorrectness = hasAnswered && showExplanation;

            let optionStyle = styles.option;
            if (showCorrectness) {
              if (isCorrect) {
                optionStyle = styles.correctOption;
              } else if (isSelected && !isCorrect) {
                optionStyle = styles.incorrectOption;
              }
            } else if (isSelected) {
              optionStyle = styles.selectedOption;
            }

            return (
              <TouchableOpacity
                key={index}
                style={optionStyle}
                onPress={() => handleSelectAnswer(index)}
                disabled={hasAnswered}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionLetter}>
                    <Text style={styles.optionLetterText}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text style={styles.optionText}>{option}</Text>
                  {showCorrectness && isCorrect && (
                    <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                  )}
                  {showCorrectness && isSelected && !isCorrect && (
                    <Ionicons name="close-circle" size={24} color={Colors.error} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explanation (shown after answering) */}
        {hasAnswered && showExplanation && (
          <View style={styles.explanationCard}>
            <View style={styles.explanationHeader}>
              <Ionicons name="information-circle" size={20} color={Colors.secondary} />
              <Text style={styles.explanationTitle}>Explanation</Text>
            </View>
            <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={currentQuestionIndex === 0 ? Colors.textSecondary : Colors.primary}
          />
          <Text
            style={[
              styles.navButtonText,
              currentQuestionIndex === 0 && styles.navButtonTextDisabled,
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.nextButton, !hasAnswered && styles.navButtonDisabled]}
          onPress={handleNext}
          disabled={!hasAnswered}
        >
          <Text
            style={[
              styles.navButtonText,
              styles.nextButtonText,
              !hasAnswered && styles.navButtonTextDisabled,
            ]}
          >
            {isLastQuestion ? 'Finish' : 'Next'}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={!hasAnswered ? Colors.textSecondary : Colors.white}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  progressContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  questionScrollView: {
    flex: 1,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.secondary + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  difficultyText: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
  questionText: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text,
    lineHeight: 30,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    padding: 16,
  },
  selectedOption: {
    backgroundColor: Colors.primary + '10',
    borderColor: Colors.primary,
  },
  correctOption: {
    backgroundColor: Colors.success + '10',
    borderColor: Colors.success,
  },
  incorrectOption: {
    backgroundColor: Colors.error + '10',
    borderColor: Colors.error,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLetterText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: Colors.text,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: Colors.text,
    lineHeight: 24,
  },
  explanationCard: {
    backgroundColor: Colors.secondary + '10',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  explanationTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text,
  },
  explanationText: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: Colors.text,
    lineHeight: 22,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.primary,
  },
  nextButtonText: {
    color: Colors.white,
  },
  navButtonTextDisabled: {
    color: Colors.textSecondary,
  },
  bottomSpacing: {
    height: 24,
  },
  resultsContainer: {
    alignItems: 'center',
  },
  resultsIcon: {
    marginBottom: 16,
  },
  passedIcon: {},
  failedIcon: {},
  resultsTitle: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: Colors.text,
    marginBottom: 8,
  },
  resultsScore: {
    fontSize: 48,
    fontFamily: 'Poppins-Bold',
    color: Colors.primary,
  },
  resultsPercentage: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: Colors.success,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: Colors.textSecondary,
  },
  messageCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    width: '100%',
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: Colors.text,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 8,
  },
  messageSubtext: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.white,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.primary,
  },
});
