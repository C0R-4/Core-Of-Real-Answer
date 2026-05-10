import { calculateFourPillars } from 'manseryeok';

// Test: 2005-12-09 양력
console.log('=== month=12 (1-indexed) ===');
const r1 = calculateFourPillars({ year: 2005, month: 12, day: 9, hour: 0, minute: 0, isLunar: false });
console.log(r1.toObject());

console.log('=== month=11 (0-indexed) ===');
const r2 = calculateFourPillars({ year: 2005, month: 11, day: 9, hour: 0, minute: 0, isLunar: false });
console.log(r2.toObject());

// Test: 1992-10-24 (library docs example)
console.log('=== 1992-10-24 month=10 ===');
const r3 = calculateFourPillars({ year: 1992, month: 10, day: 24, hour: 5, minute: 30, isLunar: false });
console.log(r3.toObject());

console.log('=== 1992-10-24 month=9 ===');
const r4 = calculateFourPillars({ year: 1992, month: 9, day: 24, hour: 5, minute: 30, isLunar: false });
console.log(r4.toObject());
