import assert from "node:assert/strict";
import {
  calculateInstancePoints,
  calculateDailyExecutionScore,
  calculateWeeklyCombinedScore,
  analyzeSundayRecovery,
  generateWeeklyAdjustmentSuggestions,
  getISOWeekKey,
  getWeekDates,
} from "../lib/goalCalculations.ts";

console.log("🧪 Running Goal & Execution System Test Suite...\n");

// Test 1: Points Formula
{
  const fullHigh = calculateInstancePoints(10, 10, "high");
  assert.equal(fullHigh.completionPercentage, 100);
  assert.equal(fullHigh.earnedPoints, 3);
  assert.equal(fullHigh.possiblePoints, 3);

  const halfCritical = calculateInstancePoints(5, 10, "critical");
  assert.equal(halfCritical.completionPercentage, 50);
  assert.equal(halfCritical.earnedPoints, 2.5);
  assert.equal(halfCritical.possiblePoints, 5);

  const overTarget = calculateInstancePoints(15, 10, "medium");
  assert.equal(overTarget.completionPercentage, 100); // capped at 100%
  assert.equal(overTarget.earnedPoints, 2);
  console.log("✅ Test 1 Passed: Points and completion percentage formula");
}

// Test 2: Edge Cases (Target <= 0, actual negative)
{
  const zeroTarget = calculateInstancePoints(0, 0, "low");
  assert.equal(zeroTarget.completionPercentage, 100);
  assert.equal(zeroTarget.earnedPoints, 1);

  const negativeActual = calculateInstancePoints(-5, 10, "medium");
  assert.equal(negativeActual.completionPercentage, 0);
  assert.equal(negativeActual.earnedPoints, 0);
  console.log("✅ Test 2 Passed: Zero targets and negative actual values handled gracefully");
}

// Test 3: Daily Execution Score
{
  const instances = [
    { earnedPoints: 3, possiblePoints: 3 }, // 100%
    { earnedPoints: 2.5, possiblePoints: 5 }, // 50%
    { earnedPoints: 1, possiblePoints: 2 }, // 50%
  ];
  // Earned = 6.5, Possible = 10 -> 65%
  const score = calculateDailyExecutionScore(instances);
  assert.equal(score.earnedPoints, 6.5);
  assert.equal(score.possiblePoints, 10);
  assert.equal(score.scorePercentage, 65);
  console.log("✅ Test 3 Passed: Daily execution score aggregation");
}

// Test 4: Weekly Combined Score (70% Daily + 30% Outcome)
{
  // Daily average: 80%
  // Outcome score: 100%
  // Combined: 80 * 0.70 + 100 * 0.30 = 56 + 30 = 86%
  const weeklyOutcome = [{ earnedPoints: 3, possiblePoints: 3 }];
  const weekly = calculateWeeklyCombinedScore([80, 80, 80], weeklyOutcome);
  assert.equal(weekly.dailyScore, 80);
  assert.equal(weekly.outcomeScore, 100);
  assert.equal(weekly.combinedScore, 86);
  console.log("✅ Test 4 Passed: 70/30 Weekly combined execution & outcome score");
}

// Test 5 & 6 & 7: Sunday Recovery Engine (Capacity Capping & Prioritization)
{
  const goalCritical = {
    id: "g1",
    name: "DSA Practice",
    importance: "critical",
    targetValue: 4,
    unit: "problems",
  };
  const goalMedium = {
    id: "g2",
    name: "Reading",
    importance: "medium",
    targetValue: 20,
    unit: "pages",
  };
  const goalLow = {
    id: "g3",
    name: "Optional Task",
    importance: "low",
    targetValue: 5,
    unit: "hours",
  };

  const weekDailyPairs = [
    {
      goal: goalCritical,
      instance: { id: "i1", periodKey: "2026-09-07", targetValue: 4, actualValue: 2 }, // shortfall: 2 problems (~50 mins)
    },
    {
      goal: goalMedium,
      instance: { id: "i2", periodKey: "2026-09-07", targetValue: 20, actualValue: 10 }, // shortfall: 10 pages (~20 mins)
    },
    {
      goal: goalLow,
      instance: { id: "i3", periodKey: "2026-09-07", targetValue: 5, actualValue: 0 }, // shortfall: 5 hours (~180 mins)
    },
  ];

  // Total estimated: 50 + 20 + 180 = 250 mins
  // Capacity: 100 mins
  const recovery = analyzeSundayRecovery(weekDailyPairs, 100);
  assert.equal(recovery.isOverCapacity, true);
  assert.equal(recovery.deficits.length, 3);
  // First item must be critical
  assert.equal(recovery.deficits[0].priority, "critical");
  // Second item should fit in remaining capacity
  assert.equal(recovery.deficits[1].priority, "recommended");
  // Third item overflows capacity -> optional
  assert.equal(recovery.deficits[2].priority, "optional");

  console.log("✅ Tests 5, 6, 7 Passed: Sunday recovery engine deficit prioritization and capacity cap");
}

// Test 8: Adjustment Suggestions
{
  const goalStruggling = { id: "g_fail", name: "High bar", targetValue: 10, unit: "problems" };
  const weekDailyPairs = [
    { goal: goalStruggling, instance: { completionPercentage: 20 } },
    { goal: goalStruggling, instance: { completionPercentage: 30 } },
    { goal: goalStruggling, instance: { completionPercentage: 10 } },
  ];
  const suggestions = generateWeeklyAdjustmentSuggestions(weekDailyPairs);
  assert.equal(suggestions.length, 1);
  assert.equal(suggestions[0].type, "decrease");
  assert.ok(suggestions[0].message.includes("Lower target"));
  console.log("✅ Test 8 Passed: Dynamic weekly adjustment recommendations");
}

// Test 9 & 10: Dates and ISO week key
{
  const d = new Date("2026-09-09T12:00:00Z");
  const weekKey = getISOWeekKey(d);
  assert.match(weekKey, /^2026-W\d{2}$/);

  const dates = getWeekDates(d);
  assert.equal(dates.length, 7);
  // Dates should be strictly increasing
  for (let i = 1; i < 7; i++) {
    assert.ok(dates[i] > dates[i - 1]);
  }
  console.log("✅ Tests 9, 10 Passed: ISO week key and 7-day week schedule generation");
}

console.log("\n🎉 All 10 Goal & Execution System test cases passed flawlessly!");
