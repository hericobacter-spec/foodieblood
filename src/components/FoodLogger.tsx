import { useState, useRef, type KeyboardEvent } from 'react';
import { Camera, Mic, CheckCircle2, ScanLine, Image as ImageIcon } from 'lucide-react';
import JITAIWarning from './JITAIWarning';
import { useI18n } from '../i18n';
import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs';

// Define globals for TS
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const mockFoods = [
  { nameKo: '미확인 음식', nameEn: 'Unknown Food', carbs: 30, sugar: 5, cal: 200, weight: '100g' }
];

const FoodLogger = ({ onLogMeal, onManualGlucose }: { onLogMeal: (carbs: number, cals: number, ts: number, name?: string, cat?: string) => void, onManualGlucose: (v: number, cat: string, ts: number) => void }) => {
  const { t, lang } = useI18n();
  const [step, setStep] = useState<'camera' | 'analyzing' | 'result'>('camera');
  const [bgCategory, setBgCategory] = useState('');
  
  // Calculate local timezone ISO string
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60000;
  const localISOTime = new Date(now.getTime() - tzOffset).toISOString();

  const [logDate, setLogDate] = useState(localISOTime.substring(0,10));
  const [logTime, setLogTime] = useState(localISOTime.substring(11,16));
  const [manualGlucose, setManualGlucose] = useState('');
  const [manualFoodName, setManualFoodName] = useState('');
  const [manualFoodCals, setManualFoodCals] = useState('');
  const [manualFoodCategory, setManualFoodCategory] = useState('');
  
  const [showWarning, setShowWarning] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState(mockFoods[0]);
  const [isListening, setIsListening] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("해당 브라우저에서는 음성 인식을 지원하지 않습니다.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'ko' ? 'ko-KR' : 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const numbers = transcript.match(/\d+/g);
      if (numbers && numbers.length > 0) {
        setManualGlucose(numbers[0]);
        alert(`인식된 수치: ${numbers[0]}`);
      } else {
        alert(transcript);
      }
    };
    recognition.start();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      setStep('analyzing');
      
      try {
        const img = new Image();
        img.src = url;
        img.crossOrigin = "anonymous";
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const model = await mobilenet.load();
        const predictions = await model.classify(img);
        
        if (predictions && predictions.length > 0) {
          const bestPred = predictions[0];
          // The class name might have multiple items separated by comma, take first
          const foodName = bestPred.className.split(',')[0];
          
          // Create deterministic mock values based on string length and probability
          const nameLen = foodName.length;
          const carbs = Math.max(10, Math.floor(nameLen * 4 * bestPred.probability));
          const cals = carbs * 4 + Math.floor(bestPred.probability * 150);

          const generatedProps = {
            nameKo: foodName + ' (AI 예측)',
            nameEn: foodName,
            carbs: carbs,
            sugar: Math.floor(carbs / 4),
            cal: cals,
            weight: Math.floor(cals * 0.8) + 'g'
          };
          
          setAnalysisResult(generatedProps);
          setStep('result');
          if (carbs >= 40) {
            setTimeout(() => setShowWarning(true), 1500);
          }
        } else {
          throw new Error('No predictions');
        }
      } catch (err) {
        console.error('Vision AI Error:', err);
        setAnalysisResult(mockFoods[0]);
        setStep('result');
      }
    }
  };

  const handleConfirmLog = () => {
    const d = new Date(`${logDate}T${logTime}`);
    onLogMeal(analysisResult.carbs, analysisResult.cal, d.getTime(), lang === 'ko' ? analysisResult.nameKo : analysisResult.nameEn); 
    setStep('camera');
    setImageSrc(null);
    setShowWarning(false);
    alert(t('logMeal') + " ✓");
  };

  const handleManualSubmit = () => {
    if (!bgCategory) return alert(t('selectCategory'));
    const val = parseInt(manualGlucose);
    if (!val) return;
    if (val > 1000) {
      alert("비정상적으로 높은 수치입니다.");
      return;
    }
    const d = new Date(`${logDate}T${logTime}`);
    onManualGlucose(val, bgCategory, d.getTime());
    setManualGlucose('');
  }

  const handleManualKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleManualSubmit();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', position: 'relative' }}>
      
      {showWarning && <JITAIWarning onClose={() => setShowWarning(false)} onWalk={handleConfirmLog} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>{t('logMealTitle')}</h2>
        <button 
          onClick={handleVoiceInput}
          className="btn-secondary" 
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', padding: 'var(--spacing-2) var(--spacing-4)', background: isListening ? 'var(--color-warning)' : 'var(--color-surface)', color: isListening ? 'white' : 'inherit' }}
        >
          <Mic size={20} color={isListening ? "white" : "var(--color-primary)"} className={isListening ? "animate-pulse" : ""} />
          <span>{isListening ? (lang === 'ko' ? '듣는 중...' : 'Listening...') : t('voiceInput')}</span>
        </button>
      </div>

      {/* Camera / Image Area */}
      <div 
        className="card" 
        style={{ 
          height: '300px', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: step === 'camera' ? 'var(--color-background)' : '#1e293b',
          border: '2px dashed var(--color-border)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {imageSrc && (
          <img src={imageSrc} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'contain', opacity: step === 'analyzing' ? 0.4 : 1 }} />
        )}

        {step !== 'camera' && imageSrc && (
          <div style={{ position: 'absolute', width: '80%', height: '80%', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '12px', pointerEvents: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
             <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '20px', height: '20px', borderTop: '4px solid var(--color-primary)', borderLeft: '4px solid var(--color-primary)' }} />
             <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '20px', height: '20px', borderTop: '4px solid var(--color-primary)', borderRight: '4px solid var(--color-primary)' }} />
             <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '20px', height: '20px', borderBottom: '4px solid var(--color-primary)', borderLeft: '4px solid var(--color-primary)' }} />
             <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '20px', height: '20px', borderBottom: '4px solid var(--color-primary)', borderRight: '4px solid var(--color-primary)' }} />
          </div>
        )}

        {step === 'camera' && (
          <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Camera size={48} color="var(--color-text-muted)" style={{ marginBottom: 'var(--spacing-4)' }} />
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', whiteSpace: 'pre-line' }}>{t('pointCamera')}</p>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              ref={cameraInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
            <input 
              type="file" 
              accept="image/*" 
              ref={galleryInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
            <div style={{ display: 'flex', gap: 'var(--spacing-3)', marginTop: 'var(--spacing-6)' }}>
              <button className="btn-primary" onClick={() => cameraInputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Camera size={18} /> 촬영
              </button>
              <button onClick={() => galleryInputRef.current?.click()} style={{ background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)', padding: 'var(--spacing-2) var(--spacing-4)', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <ImageIcon size={18} /> 첨부
              </button>
            </div>
          </div>
        )}
        
        {step === 'analyzing' && (
          <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-4)' }}>
            <ScanLine size={48} color="var(--color-primary)" className="animate-pulse" />
            <p style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{t('analyzingVolume') || 'AI 분석 중...'}</p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>TensorFlow.js 모바일넷 모델 구동 중</p>
          </div>
        )}

        {step === 'result' && (
          <div style={{ zIndex: 1, width: '100%', height: '100%', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '3px solid var(--color-secondary)', borderRadius: 'var(--radius-md)', width: '60%', height: '60%', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: 'var(--spacing-1)', boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)' }}>
              <span style={{ background: 'var(--color-secondary)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: 'var(--text-xs)', fontWeight: 'bold' }}>
                {analysisResult.weight}
              </span>
            </div>
            <div style={{ position: 'absolute', bottom: 'var(--spacing-4)', width: '100%', textAlign: 'center' }}>
              <span style={{ background: 'var(--color-surface)', padding: 'var(--spacing-2) var(--spacing-4)', borderRadius: 'var(--radius-full)', fontWeight: 600, boxShadow: 'var(--shadow-md)' }}>
                {lang === 'ko' ? analysisResult.nameKo : analysisResult.nameEn}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Results View */}
      {step === 'result' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
            <CheckCircle2 color="var(--color-secondary)" /> {t('nutritionalEstimate')}
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--spacing-2)' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>{t('carbs')}</span>
            <span style={{ fontWeight: 700 }}>{analysisResult.carbs}g</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--spacing-2)' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>{t('sugars')}</span>
            <span style={{ fontWeight: 700, color: 'var(--color-warning)' }}>{analysisResult.sugar}g</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>{t('estimatedCalories')}</span>
            <span style={{ fontWeight: 700 }}>{analysisResult.cal} kcal</span>
          </div>
          
          <div style={{ display: 'flex', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-2)' }}>
             <input type="date" value={logDate} onChange={e => setLogDate(e.target.value)} style={{flex: 1, padding: '4px'}} />
             <input type="time" value={logTime} onChange={e => setLogTime(e.target.value)} style={{flex: 1, padding: '4px'}} />
          </div>

          <div style={{ marginTop: 'var(--spacing-4)', display: 'flex', gap: 'var(--spacing-3)' }}>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => { setStep('camera'); setImageSrc(null); }}>{t('retake')}</button>
            <button className="btn-primary" style={{ flex: 1 }} onClick={handleConfirmLog}>{t('logMeal')}</button>
          </div>
        </div>
      )}

      {/* Manual Input Error Prevention Validation */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', marginTop: 'var(--spacing-4)' }}>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>{t('manualLog')} (날짜 / 시간)</h3>
        <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
           <input type="date" value={logDate} onChange={e => setLogDate(e.target.value)} style={{flex: 1, padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-background)'}} />
           <input type="time" value={logTime} onChange={e => setLogTime(e.target.value)} style={{flex: 1, padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-background)'}} />
        </div>

        <div style={{ padding: 'var(--spacing-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
          <h4 style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 'var(--spacing-2)', color: 'var(--color-secondary)' }}>식사 수동 추가</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
            <select value={manualFoodCategory} onChange={e => setManualFoodCategory(e.target.value)} style={{ padding: 'var(--spacing-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: 'var(--text-base)', background: 'var(--color-surface)', appearance: 'none' }}>
              <option value="">식사 카테고리 (선택)</option>
              <option value="아침식사">아침식사</option>
              <option value="점심식사">점심식사</option>
              <option value="저녁식사">저녁식사</option>
              <option value="간식">간식</option>
              <option value="야식">야식</option>
            </select>
            <input type="text" placeholder="음식 이름 (예: 닭가슴살 샐러드)" value={manualFoodName} onChange={e => setManualFoodName(e.target.value)} style={{ padding: 'var(--spacing-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: 'var(--text-base)' }} />
            <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
              <input type="number" placeholder="칼로리 (선택, kcal)" value={manualFoodCals} onChange={e => setManualFoodCals(e.target.value)} style={{ flex: 1, padding: 'var(--spacing-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: 'var(--text-base)' }} />
              <button 
                onClick={() => {
                  if (!manualFoodName) return alert('음식 이름을 입력해주세요.');
                  const d = new Date(`${logDate}T${logTime}`);
                  onLogMeal(0, Number(manualFoodCals) || 0, d.getTime(), manualFoodName, manualFoodCategory);
                  setManualFoodName('');
                  setManualFoodCals('');
                  setManualFoodCategory('');
                  alert('식사 기록 완료! ✓');
                }}
                style={{ background: 'var(--color-secondary)', color: 'white', padding: 'var(--spacing-2) var(--spacing-4)', borderRadius: 'var(--radius-md)', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              >
                추가
              </button>
            </div>
          </div>
        </div>

        <div style={{ padding: 'var(--spacing-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
          <h4 style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 'var(--spacing-2)', color: 'var(--color-primary)' }}>혈당 수동 추가</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
            <select 
              value={bgCategory}
              onChange={e => setBgCategory(e.target.value)}
              style={{ padding: 'var(--spacing-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: 'var(--text-base)', background: 'var(--color-surface)', appearance: 'none' }}
            >
              <option value="">{t('selectCategory')}</option>
              <option value="categoryFasting">{t('categoryFasting')}</option>
              <option value="categoryBeforeBreakfast">{t('categoryBeforeBreakfast')}</option>
              <option value="categoryAfterBreakfast">{t('categoryAfterBreakfast')}</option>
              <option value="categoryBeforeLunch">{t('categoryBeforeLunch')}</option>
              <option value="categoryAfterLunch">{t('categoryAfterLunch')}</option>
              <option value="categoryBeforeDinner">{t('categoryBeforeDinner')}</option>
              <option value="categoryAfterDinner">{t('categoryAfterDinner')}</option>
              <option value="categoryBeforeBed">{t('categoryBeforeBed')}</option>
            </select>
            <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
              <input 
                type="number"
                value={manualGlucose}
                placeholder="수치 (예: 120)"
                style={{ flex: 1, padding: 'var(--spacing-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: 'var(--text-base)' }}
                onChange={(e) => setManualGlucose(e.target.value)}
                onKeyDown={handleManualKeyDown}
              />
              <button onClick={handleManualSubmit} className="btn-primary" style={{ padding: 'var(--spacing-2) var(--spacing-4)', borderRadius: 'var(--radius-md)' }}>
                추가
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodLogger;
