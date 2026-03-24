import { createContext, useContext, useState, type ReactNode } from 'react';

type Lang = 'ko' | 'en';

const translations = {
  ko: {
    appTitle: "Foodie Blood",
    langToggle: "EN",
    overview: "대시보드",
    logFood: "식사 기록",
    rewards: "보상",
    history: "기록 목록",
    currentGlucose: "현재 혈당",
    trendGraph: "혈당 변동 추이",
    exportData: "데이터 내보내기 CSV",
    mgdl: "mg/dL",
    inRange: "정상 범위 내에 있습니다.",
    outOfRange: "정상 범위를 벗어났습니다.",
    updatedJustNow: "방금 업데이트 됨.",
    tirToday: "오늘 정상범위 (TIR)",
    calories: "섭취 칼로리",
    of2000: "2,000 kcal 중",
    logMealTitle: "식사 기록",
    voiceInput: "음성 입력",
    pointCamera: "카메라를 음식에 향하게 하세요.\n화면 안에 잘 들어오게 해주세요.",
    capturePhoto: "사진 촬영 선택",
    analyzingVolume: "부피 및 깊이 맵 분석 중...",
    queryingApi: "식약처 영양 정보 데이터베이스 조회 중",
    identifiedCroissant: "인식됨: 크루아상 🥐",
    nutritionalEstimate: "예상 영양 성분",
    carbs: "탄수화물",
    sugars: "당류",
    estimatedCalories: "예상 칼로리",
    retake: "다시 찍기",
    logMeal: "기록 완료하기",
    manualLog: "수동 기록 추가",
    enterGlucoseOrWeight: "측정 시기 선택 후 수치 입력 (엔터로 등록)",
    warningHighValue: "경고: 비정상적으로 높은 수치입니다. 의료 사고를 방지하기 위해 입력값을 확인해주세요.",
    level5Explorer: "레벨 5 탐험가",
    pointsToNext: "다음 레벨까지",
    dailyGoals: "일일 목표",
    inProgress: "진행 중",
    logAllMeals: "모든 식사 기록하기",
    logged2of3: "2/3 완료",
    yourBadges: "나의 배지",
    streak3Day: "3일 연속 달성!",
    perfectWeek: "완벽한 일주일",
    nightOwl: "야행성",
    coachName: "코치 그래비티",
    coachMessage: "오늘 정말 잘하고 계십니다! 식사를 한 번만 더 기록하면 연속 기록을 유지할 수 있어요.",
    spikePredicted: "혈당 스파이크 예상!",
    jitaiDesc: "과거 CGM 기록을 분석한 결과, 이 식사(탄수화물 45g)는 혈당을 160 mg/dL 이상으로 급상승시킬 확률이 높습니다.",
    jitaiSuggestionTitle: "JITAI (적시 맞춤형 알림)",
    jitaiSuggestionBody: "식후 **15분 걷기**를 하시면 혈당 급증을 방지할 수 있습니다. 또는 식사의 일부를 야채 샐러드로 대체하시기를 권장합니다.",
    takeWalkBtn: "네, 지금 걷겠습니다",
    delete: "삭제",
    categoryFasting: "공복",
    categoryBeforeBreakfast: "아침식전",
    categoryAfterBreakfast: "아침식후",
    categoryBeforeLunch: "점심식전",
    categoryAfterLunch: "점심식후",
    categoryBeforeDinner: "저녁식전",
    categoryAfterDinner: "저녁식후",
    categoryBeforeBed: "자기전",
    selectCategory: "분류 선택...",
    noLogs: "기록이 없습니다.",
    foodLog: "식사",
    glucoseLog: "혈당 기록",
  },
  en: {
    appTitle: "Foodie Blood",
    langToggle: "한국어",
    overview: "Overview",
    logFood: "Log Food",
    rewards: "Rewards",
    history: "History",
    currentGlucose: "Current Glucose",
    trendGraph: "Glucose Trend",
    exportData: "Export CSV",
    mgdl: "mg/dL",
    inRange: "in range.",
    outOfRange: "out of range.",
    updatedJustNow: "Updated just now.",
    tirToday: "TIR (Today)",
    calories: "Calories",
    of2000: "of 2,000 kcal",
    logMealTitle: "Log Meal",
    voiceInput: "Voice Input",
    pointCamera: "Point camera at your food.\nKeep it in the frame.",
    capturePhoto: "Upload or Capture",
    analyzingVolume: "Analyzing Depth & Volume...",
    queryingApi: "Querying nutrition database...",
    identifiedCroissant: "Identified: Croissant 🥐",
    nutritionalEstimate: "Nutritional Estimate",
    carbs: "Carbohydrates",
    sugars: "Sugars",
    estimatedCalories: "Estimated Calories",
    retake: "Retake",
    logMeal: "Submit Log",
    manualLog: "Add Manual Log",
    enterGlucoseOrWeight: "Select timing and enter value, then hit Enter",
    warningHighValue: "Warning: Unusually high value detected. Please verify your input to prevent medical errors.",
    level5Explorer: "Level 5 Explorer",
    pointsToNext: "points to next level",
    dailyGoals: "Daily Goals",
    inProgress: "In Progress",
    logAllMeals: "Log All Meals",
    logged2of3: "2/3 Logged",
    yourBadges: "Your Badges",
    streak3Day: "3 Day Streak",
    perfectWeek: "Perfect Week",
    nightOwl: "Night Owl",
    coachName: "Coach Gravity",
    coachMessage: "You're doing great today! Just log one more meal to maintain your streak.",
    spikePredicted: "Spike Predicted",
    jitaiDesc: "Based on your CGM history, this meal (45g carbs) is likely to push your glucose above 160 mg/dL.",
    jitaiSuggestionTitle: "Just-In-Time Suggestion",
    jitaiSuggestionBody: "A brisk **15-minute walk** right after eating will help blunt this spike. Alternatively, consider swapping half the portion for a side salad.",
    takeWalkBtn: "I'll take a walk",
    delete: "Delete",
    categoryFasting: "Fasting",
    categoryBeforeBreakfast: "Before Breakfast",
    categoryAfterBreakfast: "After Breakfast",
    categoryBeforeLunch: "Before Lunch",
    categoryAfterLunch: "After Lunch",
    categoryBeforeDinner: "Before Dinner",
    categoryAfterDinner: "After Dinner",
    categoryBeforeBed: "Before Bed",
    selectCategory: "Select timing...",
    noLogs: "No logs yet.",
    foodLog: "Food",
    glucoseLog: "Glucose",
  }
};

interface I18nContextProps {
  lang: Lang;
  toggleLang: () => void;
  t: (key: keyof typeof translations['en']) => string;
}

const I18nContext = createContext<I18nContextProps>({} as I18nContextProps);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>('ko');

  const toggleLang = () => {
    setLang(prev => prev === 'ko' ? 'en' : 'ko');
  };

  const t = (key: keyof typeof translations['en']): string => {
    return translations[lang][key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
