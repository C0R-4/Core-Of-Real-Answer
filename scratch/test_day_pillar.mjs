function getDayPillar(year, month, day) {
  const HEAVENLY_STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
  const EARTHLY_BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
  
  // 기준일: 2000년 1월 1일 = 무오일 (55번째)
  // JS Date uses 0-indexed months
  const baseDate = new Date(2000, 0, 1);
  const targetDate = new Date(year, month - 1, day);
  
  const diffTime = targetDate.getTime() - baseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const ganjiIndex = (((54 + diffDays) % 60) + 60) % 60; // 0-indexed, so 54
  
  return {
    stem: HEAVENLY_STEMS[ganjiIndex % 10],
    branch: EARTHLY_BRANCHES[ganjiIndex % 12]
  };
}

console.log('2005-12-09:');
console.log(getDayPillar(2005, 12, 9));
