import { NextRequest, NextResponse } from 'next/server';
import { saveResult, getUserResults, getUserStats, getTests } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { userId, testId, userAnswer } = await request.json();
    
    if (!userId || !testId || userAnswer === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Преобразуем в числа
    const userIdNum = parseInt(userId);
    const testIdNum = parseInt(testId);
    const userAnswerNum = parseInt(userAnswer);

    if (isNaN(userIdNum) || isNaN(testIdNum) || isNaN(userAnswerNum)) {
      return NextResponse.json({ error: 'Invalid numeric values' }, { status: 400 });
    }

    // Получаем правильный ответ для проверки
    const tests = getTests();
    const test = tests.find((t: any) => t.id === testIdNum);
    
    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    const isCorrect = userAnswerNum === test.correct;
    const result = saveResult(userIdNum, testIdNum, userAnswerNum, isCorrect);
    
    return NextResponse.json({ 
      id: result.lastInsertRowid,
      isCorrect,
      correctAnswer: test.correct
    });
  } catch (error) {
    console.error('Error saving result:', error);
    return NextResponse.json({ error: 'Failed to save result', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // 'results' или 'stats'
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userIdNum = parseInt(userId);
    
    if (isNaN(userIdNum)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }
    
    if (type === 'stats') {
      const stats = getUserStats(userIdNum);
      return NextResponse.json(stats);
    } else {
      const results = getUserResults(userIdNum);
      return NextResponse.json(results);
    }
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json({ error: 'Failed to fetch results', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 