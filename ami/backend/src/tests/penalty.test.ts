/**
 * Standalone Unit Tests for Backend Penalty Calculation.
 * Runs assertions on the time penalty formula:
 * -1/100 (-0.01) marks for every 10 seconds exceeded over average.
 */

export function calculatePenalty(timeTaken: number, avgTime: number, baseMarks: number): { timePenalty: number; finalScore: number } {
  const timeExceeded = Math.max(0, timeTaken - avgTime);
  const penaltyCount = Math.floor(timeExceeded / 10);
  const timePenalty = penaltyCount * 0.01;
  const finalMarks = Math.max(0, baseMarks - timePenalty);
  return {
    timePenalty,
    finalScore: Number(finalMarks.toFixed(2))
  };
}

interface TestCase {
  name: string;
  timeTaken: number;
  avgTime: number;
  baseMarks: number;
  expectedPenalty: number;
  expectedFinalScore: number;
}

const testCases: TestCase[] = [
  {
    name: "Case 1: Time taken is less than average (No Penalty)",
    timeTaken: 25,
    avgTime: 40,
    baseMarks: 5.0,
    expectedPenalty: 0.0,
    expectedFinalScore: 5.0
  },
  {
    name: "Case 2: Time taken is exactly average (No Penalty)",
    timeTaken: 40,
    avgTime: 40,
    baseMarks: 5.0,
    expectedPenalty: 0.0,
    expectedFinalScore: 5.0
  },
  {
    name: "Case 3: Time taken is 9 seconds over average (No Penalty)",
    timeTaken: 49,
    avgTime: 40,
    baseMarks: 5.0,
    expectedPenalty: 0.0,
    expectedFinalScore: 5.0
  },
  {
    name: "Case 4: Time taken is exactly 10 seconds over average (-0.01)",
    timeTaken: 50,
    avgTime: 40,
    baseMarks: 5.0,
    expectedPenalty: 0.01,
    expectedFinalScore: 4.99
  },
  {
    name: "Case 5: Time taken is 25 seconds over average (-0.02)",
    timeTaken: 65,
    avgTime: 40,
    baseMarks: 5.0,
    expectedPenalty: 0.02,
    expectedFinalScore: 4.98
  },
  {
    name: "Case 6: Extreme overrun where penalty exceeds base marks (Floors to 0.0)",
    timeTaken: 6000,
    avgTime: 40,
    baseMarks: 2.0,
    expectedPenalty: 5.96,
    expectedFinalScore: 0.0
  }
];

function runTests() {
  console.log("=== Running Penalty Calculation Unit Tests ===");
  let passedCount = 0;

  for (const tc of testCases) {
    const result = calculatePenalty(tc.timeTaken, tc.avgTime, tc.baseMarks);
    const penaltyPassed = Math.abs(result.timePenalty - tc.expectedPenalty) < 0.0001;
    const scorePassed = Math.abs(result.finalScore - tc.expectedFinalScore) < 0.0001;

    if (penaltyPassed && scorePassed) {
      console.log(`✅ [PASS] ${tc.name}`);
      passedCount++;
    } else {
      console.error(`❌ [FAIL] ${tc.name}`);
      console.error(`   Expected: Penalty = ${tc.expectedPenalty}, Score = ${tc.expectedFinalScore}`);
      console.error(`   Actual:   Penalty = ${result.timePenalty}, Score = ${result.finalScore}`);
    }
  }

  console.log(`\nResults: ${passedCount}/${testCases.length} tests passed.\n`);
  if (passedCount !== testCases.length) {
    process.exit(1);
  }
}

runTests();
