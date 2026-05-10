function getDayPillarUTC(year, month, day) {
  const HEAVENLY_STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
  const EARTHLY_BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
  
  const baseDate = new Date(Date.UTC(1992, 9, 24));
  const targetDate = new Date(Date.UTC(year, month - 1, day));
  
  const diffTime = targetDate.getTime() - baseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const ganjiIndex = (((9 + diffDays) % 60) + 60) % 60;
  
  return {
    string: HEAVENLY_STEMS[ganjiIndex % 10] + EARTHLY_BRANCHES[ganjiIndex % 12],
    index: ganjiIndex
  };
}

console.log('2005-12-09 UTC:');
console.log(getDayPillarUTC(2005, 12, 9));
