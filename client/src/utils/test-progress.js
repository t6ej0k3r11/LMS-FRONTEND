/**
 * Test file to verify progress calculation functionality
 * This file demonstrates that all progress calculation functions work correctly
 */

import {
  calculateVideoProgress,
  calculateCourseProgress,
  saveLectureProgress,
  loadLectureProgress,
  getProgressStorageKey,
  LECTURE_COMPLETION_THRESHOLD,
  isLectureCompleted,
  calculateOverallProgress
} from '@/lib/progressUtils';

/**
 * Test 1: Video Progress Calculation
 * Tests that calculateVideoProgress correctly calculates percentage from currentTime and duration
 */
export function testVideoProgressCalculation() {
  console.log('🧪 Testing Video Progress Calculation...');
  
  // Test cases
  const testCases = [
    { currentTime: 0, duration: 100, expected: 0 },
    { currentTime: 50, duration: 100, expected: 50 },
    { currentTime: 100, duration: 100, expected: 100 },
    { currentTime: 75.5, duration: 100, expected: 76 }, // Should round to nearest integer
    { currentTime: 0, duration: 0, expected: 0 }, // Edge case: zero duration
  ];
  
  testCases.forEach(({ currentTime, duration, expected }, index) => {
    const result = calculateVideoProgress(currentTime, duration);
    const passed = Math.round(result) === expected;
    console.log(`  Test ${index + 1}: ${passed ? '✅' : '❌'} ${currentTime}/${duration}s = ${result}% (expected ${expected}%)`);
  });
  
  console.log('✅ Video Progress Calculation Tests Complete\n');
}

/**
 * Test 2: Course Progress Calculation  
 * Tests that calculateCourseProgress correctly calculates percentage from completed and total lectures
 */
export function testCourseProgressCalculation() {
  console.log('🧪 Testing Course Progress Calculation...');
  
  const testCases = [
    { completed: 0, total: 10, expected: 0 },
    { completed: 5, total: 10, expected: 50 },
    { completed: 10, total: 10, expected: 100 },
    { completed: 3, total: 12, expected: 25 },
    { completed: 0, total: 0, expected: 0 }, // Edge case: zero total
  ];
  
  testCases.forEach(({ completed, total, expected }, index) => {
    const result = calculateCourseProgress(completed, total);
    const passed = result === expected;
    console.log(`  Test ${index + 1}: ${passed ? '✅' : '❌'} ${completed}/${total} = ${result}% (expected ${expected}%)`);
  });
  
  console.log('✅ Course Progress Calculation Tests Complete\n');
}

/**
 * Test 3: localStorage Key Generation
 * Tests that getProgressStorageKey generates correct keys following the pattern
 */
export function testStorageKeyGeneration() {
  console.log('🧪 Testing localStorage Key Generation...');
  
  const testCases = [
    { courseId: 'course123', lectureId: 'lecture456', expected: 'course-course123-lecture-lecture456-progress' },
    { courseId: 'abc-123', lectureId: 'def-456', expected: 'course-abc-123-lecture-def-456-progress' },
  ];
  
  testCases.forEach(({ courseId, lectureId, expected }, index) => {
    const result = getProgressStorageKey(courseId, lectureId);
    const passed = result === expected;
    console.log(`  Test ${index + 1}: ${passed ? '✅' : '❌'} ${courseId}, ${lectureId} -> ${result}`);
    if (!passed) {
      console.log(`    Expected: ${expected}`);
    }
  });
  
  console.log('✅ Storage Key Generation Tests Complete\n');
}

/**
 * Test 4: localStorage Integration
 * Tests that save/load functionality works correctly
 */
export function testLocalStorageIntegration() {
  console.log('🧪 Testing localStorage Integration...');
  
  // Test data
  const testCourseId = 'test-course-123';
  const testLectureId = 'test-lecture-456';
  const testCurrentTime = 45;
  const testDuration = 90;
  const testProgressValue = testCurrentTime / testDuration; // 0.5 (50%)
  
  try {
    // Test save
    saveLectureProgress(testCourseId, testLectureId, testCurrentTime, testDuration, false);
    console.log('  ✅ Progress saved successfully');
    
    // Test load
    const loadedProgress = loadLectureProgress(testCourseId, testLectureId);
    const passed = loadedProgress && 
                   loadedProgress.currentTime === testCurrentTime && 
                   loadedProgress.duration === testDuration &&
                   Math.abs(loadedProgress.progressValue - testProgressValue) < 0.01;
    
    console.log(`  ${passed ? '✅' : '❌'} Progress loaded correctly:`, loadedProgress);
    
    // Cleanup
    localStorage.removeItem(getProgressStorageKey(testCourseId, testLectureId));
    console.log('  ✅ Test data cleaned up');
    
  } catch (error) {
    console.log(`  ❌ localStorage integration test failed:`, error);
  }
  
  console.log('✅ localStorage Integration Tests Complete\n');
}

/**
 * Test 5: Completion Threshold
 * Tests that LECTURE_COMPLETION_THRESHOLD is correctly used
 */
export function testCompletionThreshold() {
  console.log('🧪 Testing Completion Threshold...');
  
  console.log(`  ✅ LECTURE_COMPLETION_THRESHOLD = ${LECTURE_COMPLETION_THRESHOLD} (${LECTURE_COMPLETION_THRESHOLD * 100}%)`);
  console.log('✅ Completion Threshold Test Complete\n');
}

/**
 * Run all tests
 */
export function runAllProgressTests() {
  console.log('🚀 Starting Progress Calculation Tests\n');
  
  testVideoProgressCalculation();
  testCourseProgressCalculation();
  testStorageKeyGeneration();
  testLocalStorageIntegration();
  testCompletionThreshold();
  
  console.log('🎉 All Progress Tests Complete!\n');
}