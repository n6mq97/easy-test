import { NextRequest, NextResponse } from "next/server";
import {
  getTests,
  getSections,
  addTest,
  getTestsBySection,
  getRandomTests,
} from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section");
    const random = searchParams.get("random");
    const limit = searchParams.get("limit");

    if (random === "true") {
      const limitNum = limit ? parseInt(limit) : 20;
      const tests = getRandomTests(limitNum);
      return NextResponse.json(tests);
    } else if (section) {
      const tests = getTestsBySection(section);
      return NextResponse.json(tests);
    } else {
      const tests = getTests();
      return NextResponse.json(tests);
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch tests" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Проверяем, что это массив тестов из буфера обмена
    if (Array.isArray(body)) {
      const results = [];

      for (const test of body) {
        if (
          test.section &&
          test.question &&
          Array.isArray(test.answers) &&
          typeof test.correct === "number"
        ) {
          const testId = addTest(
            test.section,
            test.question,
            test.answers,
            test.correct
          );
          results.push({ id: testId, ...test });
        }
      }

      return NextResponse.json({
        message: `Added ${results.length} tests successfully`,
        added: results.length,
        tests: results,
      });
    }

    // Или одиночный тест
    const { section, question, answers, correct } = body;

    if (
      !section ||
      !question ||
      !Array.isArray(answers) ||
      typeof correct !== "number"
    ) {
      return NextResponse.json({ error: "Invalid test data" }, { status: 400 });
    }

    const testId = addTest(section, question, answers, correct);
    return NextResponse.json({
      id: testId,
      section,
      question,
      answers,
      correct,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add test" }, { status: 500 });
  }
}
