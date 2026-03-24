/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  Unlock, 
  Flame, 
  Lightbulb, 
  MoveRight, 
  History, 
  Sun, 
  Moon, 
  Waves, 
  ScrollText,
  CheckCircle2,
  AlertCircle,
  Trophy,
  ArrowUp,
  ArrowDown,
  Compass,
  Sparkles,
  Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const App = () => {
  const [stage, setStage] = useState('intro'); // intro, stage1, stage_plagues, stage2, stage3, stage4, victory
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes default
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [inventory, setInventory] = useState<string[]>([]);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [flashlightPos, setFlashlightPos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && stage !== 'victory') {
      triggerFeedback('error', 'הזמן אזל! המצרים השיגו אתכם...');
      setStage('intro');
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft, stage]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Sound/Vibration simulation (Visual only)
  const triggerFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    if (type === 'success') setScore(prev => prev + 100);
    setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
  };

  const startGame = () => {
    setStage('stage1');
    setScore(0);
    setInventory([]);
    setIsTimerActive(true);
    setTimeLeft(600); // 10 minutes
    setSelectedPlagues([]);
    setFoundKey(false);
    setRiddleInput('');
    setPlaguesInput('');
    setFinalCode(['', '', '']);
  };

  // --- STAGE 1: Event Ordering ---
  const [order, setOrder] = useState([
    { id: 'sea', text: 'קריעת ים סוף' },
    { id: 'slavery', text: 'שעבוד מצרים' },
    { id: 'exodus', text: 'יציאת מצרים' }
  ]);
  const correctOrder = ['slavery', 'exodus', 'sea'];

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...order];
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex >= 0 && nextIndex < newOrder.length) {
      [newOrder[index], newOrder[nextIndex]] = [newOrder[nextIndex], newOrder[index]];
      setOrder(newOrder);
    }
  };

  const checkStage1 = () => {
    const currentOrderIds = order.map(item => item.id);
    if (JSON.stringify(currentOrderIds) === JSON.stringify(correctOrder)) {
      triggerFeedback('success', 'הסדר ההיסטורי שוחזר! הקוד שנחשף על קיר המערה: 231');
      setInventory(prev => [...prev, 'קוד 231']);
      setTimeout(() => setStage('stage_plagues'), 1500);
    } else {
      triggerFeedback('error', 'הסדר הכרונולוגי שגוי. חשבו: מה קרה קודם?');
    }
  };

  // --- NEW STAGE: The Ten Plagues (Matching/Sequence) ---
  const initialPlagues = [
    { id: 1, name: 'דם', icon: '🩸' },
    { id: 2, name: 'צפרדע', icon: '🐸' },
    { id: 3, name: 'כינים', icon: '🐜' },
    { id: 4, name: 'ערוב', icon: '🦁' },
    { id: 5, name: 'דבר', icon: '🐄' },
    { id: 6, name: 'שחין', icon: '🤒' },
    { id: 7, name: 'ברד', icon: '🧊' },
    { id: 8, name: 'ארבה', icon: '🦗' },
    { id: 9, name: 'חושך', icon: '🌑' },
    { id: 10, name: 'מכת בכורות', icon: '⚰️' }
  ];
  const [plaguesList, setPlaguesList] = useState(initialPlagues);
  const [selectedPlagues, setSelectedPlagues] = useState<number[]>([]);

  useEffect(() => {
    if (stage === 'stage_plagues') {
      setPlaguesList([...initialPlagues].sort(() => Math.random() - 0.5));
    }
  }, [stage]);
  
  const handlePlagueClick = (id: number) => {
    if (selectedPlagues.includes(id)) return;
    const nextExpected = selectedPlagues.length + 1;
    if (id === nextExpected) {
      const newSelection = [...selectedPlagues, id];
      setSelectedPlagues(newSelection);
      if (newSelection.length === 10) {
        triggerFeedback('success', 'כל המכות הונחתו! הדרך לכספת פתוחה.');
        setInventory(prev => [...prev, 'חותם המכות']);
        setTimeout(() => setStage('stage2'), 1500);
      }
    } else {
      triggerFeedback('error', 'זה לא הסדר הנכון של המכות!');
      setSelectedPlagues([]);
    }
  };

  // --- STAGE 2: Riddle & Plagues ---
  const [riddleInput, setRiddleInput] = useState('');
  const [plaguesInput, setPlaguesInput] = useState('');

  const handleStage2 = () => {
    if (riddleInput.trim() === 'חירות' && plaguesInput === '10') {
      triggerFeedback('success', 'המנעול של פרעה נפרץ! המשיכו למנהרת המילוט.');
      setInventory(prev => [...prev, 'קוד 10', 'מילת מפתח: חירות']);
      setTimeout(() => setStage('stage3'), 1500);
    } else {
      triggerFeedback('error', 'הקודים לא תואמים לכתבי החרטומים.');
    }
  };

  // --- STAGE 3: Flashlight Logic ---
  const [foundKey, setFoundKey] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (stage !== 'stage3' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setFlashlightPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (stage !== 'stage3' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    setFlashlightPos({
      x: ((touch.clientX - rect.left) / rect.width) * 100,
      y: ((touch.clientY - rect.top) / rect.height) * 100,
    });
  };

  // --- STAGE 4: Final Verification ---
  const [finalCode, setFinalCode] = useState(['', '', '']);
  const checkFinal = () => {
    const isCorrect = finalCode[0] === '10' && 
                      finalCode[1].trim() === 'חירות' && 
                      finalCode[2] === '231';
    
    if (isCorrect) {
      setStage('victory');
    } else {
      triggerFeedback('error', 'השער לא נפתח. בדקו שוב את כל הרמזים שאספתם.');
    }
  };

  const progress = stage === 'intro' ? 0 : stage === 'stage1' ? 20 : stage === 'stage_plagues' ? 40 : stage === 'stage2' ? 60 : stage === 'stage3' ? 80 : 100;

  return (
    <div 
      dir="rtl" 
      className="min-h-screen bg-[#0a0a0a] text-stone-100 font-sans selection:bg-amber-500/30 overflow-x-hidden"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* Dynamic Background */}
      <div className="fixed inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(circle at 2px 2px, #d97706 1px, transparent 0)`, backgroundSize: '40px 40px' }}></div>

      {/* Futuristic Header */}
      <header className="relative z-30 p-5 border-b border-amber-500/20 bg-black/80 backdrop-blur-xl flex justify-between items-center sticky top-0">
        <div className="flex items-center gap-4">
          <motion.div 
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="relative"
          >
            <div className="absolute inset-0 bg-amber-500 blur-md opacity-20"></div>
            <div className="relative p-2 bg-gradient-to-br from-amber-400 to-amber-700 rounded-lg border border-amber-300/50 shadow-inner">
              <Compass size={24} className="text-black" />
            </div>
          </motion.div>
          <div>
            <h1 className="text-xl font-black bg-gradient-to-l from-amber-100 to-amber-500 bg-clip-text text-transparent uppercase tracking-widest">
              EXODUS: PYRAMID
            </h1>
            <div className="h-1.5 w-full bg-amber-900/30 rounded-full mt-1 overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                ></motion.div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <div className="flex gap-2">
            <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/40 rounded-md text-[10px] font-bold text-blue-400">
              SCORE: {score}
            </div>
            {isTimerActive && (
              <div className={`px-3 py-1 border rounded-md text-[10px] font-bold ${timeLeft < 60 ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 animate-pulse' : 'bg-stone-500/10 border-stone-500/40 text-stone-400'}`}>
                TIME: {formatTime(timeLeft)}
              </div>
            )}
          </div>
          <div className="flex gap-2 max-w-[200px] overflow-x-auto pb-1 no-scrollbar">
            <AnimatePresence>
              {inventory.map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="whitespace-nowrap px-3 py-1 bg-amber-500/10 border border-amber-500/40 rounded-md text-[10px] font-bold text-amber-400 uppercase tracking-tighter"
                >
                  {item}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Feedback System */}
      <AnimatePresence>
        {feedback.message && (
          <motion.div 
            initial={{ y: -100, opacity: 0, x: '-50%' }}
            animate={{ y: 0, opacity: 1, x: '-50%' }}
            exit={{ y: -100, opacity: 0, x: '-50%' }}
            className={`fixed top-24 left-1/2 z-50 px-8 py-4 rounded-2xl border-2 flex items-center gap-4 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-md ${
              feedback.type === 'success' ? 'bg-emerald-950/90 border-emerald-500 text-emerald-100' : 'bg-rose-950/90 border-rose-500 text-rose-100'
            }`}
          >
            {feedback.type === 'success' ? <CheckCircle2 size={24} className="text-emerald-400" /> : <AlertCircle size={24} className="text-rose-400" />}
            <span className="font-black text-lg">{feedback.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="container mx-auto max-w-2xl px-6 py-10 relative z-10">
        
        <AnimatePresence mode="wait">
          {/* INTRO SCREEN */}
          {stage === 'intro' && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(217,119,6,0.3)] border-2 border-amber-500/40 group">
                  <img 
                      src="https://images.unsplash.com/photo-1539760503675-610199294a4b?auto=format&fit=crop&q=80&w=1200" 
                      className="w-full h-full object-cover grayscale transition-all duration-[3000ms] group-hover:grayscale-0 group-hover:scale-110"
                      alt="Ancient Egypt Interior"
                      referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/30 to-transparent"></div>
                  <div className="absolute bottom-12 right-12 left-12">
                      <p className="text-amber-500 font-black tracking-[0.4em] text-sm mb-4 uppercase">Ancient Egypt Survival</p>
                      <h2 className="text-6xl font-black text-white leading-tight drop-shadow-2xl italic tracking-tighter">המשימה: חירות</h2>
                  </div>
              </div>

            <div className="bg-stone-900/70 backdrop-blur-lg p-12 rounded-[3rem] border-2 border-amber-500/40 space-y-10 relative overflow-hidden shadow-2xl">
              <div className="absolute -top-10 -left-10 w-60 h-60 bg-amber-500/10 rounded-full blur-[80px]"></div>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center shadow-inner">
                    <Flame size={48} className="text-amber-500 animate-pulse" />
                </div>
                <div>
                    <h3 className="font-black text-3xl text-amber-200">הודעה מוצפנת ממשה</h3>
                    <p className="text-stone-500 text-lg">התקבלה לפני: דקה אחת</p>
                </div>
              </div>
              <p className="text-stone-100 leading-relaxed text-2xl font-medium italic">
                "בני ישראל! אתם כלואים בלב הפירמידה. פרעה בטוח שלא תמצאו את הדרך, אבל השארתי לכם סימנים. זכרו את הסיפור שלנו – זה המפתח היחיד."
              </p>
              <button 
                onClick={startGame}
                className="group relative w-full py-10 bg-amber-500 hover:bg-amber-400 text-black font-black text-4xl rounded-3xl transition-all shadow-[0_25px_60px_rgba(217,119,6,0.4)] active:scale-95 flex items-center justify-center gap-6 overflow-hidden cursor-pointer z-50"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                <span className="relative">התחילו בפריצה עכשיו</span>
                <MoveRight size={40} className="relative group-hover:translate-x-3 transition-transform" />
              </button>
            </div>
            </motion.div>
          )}

          {/* STAGE 1: The Timeline */}
          {stage === 'stage1' && (
            <motion.div 
              key="stage1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div className="text-center space-y-3">
                <div className="inline-block px-6 py-2 bg-amber-500/10 text-amber-500 text-xs font-black rounded-full border border-amber-500/20 uppercase tracking-widest">Sector 01: The Timeline</div>
                <h2 className="text-4xl font-black text-white">חידת הזיכרון</h2>
                <p className="text-stone-400 text-xl">גררו את הלבנים לסדר הנכון של סיפור היציאה.</p>
              </div>

              <div className="space-y-5">
                {order.map((item, idx) => (
                  <motion.div 
                    layout
                    key={item.id}
                    className="group flex items-center justify-between p-8 bg-stone-900/80 border-2 border-stone-800 rounded-[2.5rem] hover:border-amber-500/50 hover:bg-stone-900 transition-all shadow-2xl"
                  >
                    <div className="flex items-center gap-6">
                      <span className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center text-lg font-bold text-stone-400 border border-stone-700">{idx + 1}</span>
                      <span className="font-black text-2xl text-stone-100">{item.text}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => moveItem(idx, 'up')}
                        disabled={idx === 0}
                        className="p-3 hover:bg-amber-500 hover:text-black rounded-xl text-amber-500 transition-colors disabled:opacity-20 bg-stone-800/50"
                      >
                        <ArrowUp size={24} />
                      </button>
                      <button 
                        onClick={() => moveItem(idx, 'down')}
                        disabled={idx === order.length - 1}
                        className="p-3 hover:bg-amber-500 hover:text-black rounded-xl text-amber-500 transition-colors disabled:opacity-20 bg-stone-800/50"
                      >
                        <ArrowDown size={24} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button 
                onClick={checkStage1}
                className="w-full py-6 bg-stone-100 text-stone-900 font-black text-2xl rounded-2xl transition-all active:scale-95 shadow-2xl hover:bg-white"
              >
                אמת את סדר האירועים
              </button>
            </motion.div>
          )}

          {/* NEW STAGE: The Ten Plagues */}
          {stage === 'stage_plagues' && (
            <motion.div 
              key="stage_plagues"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="space-y-10"
            >
              <div className="text-center space-y-3">
                <div className="inline-block px-6 py-2 bg-rose-500/10 text-rose-400 text-xs font-black rounded-full border border-rose-500/20 uppercase tracking-widest">Sector 02: The Ten Plagues</div>
                <h2 className="text-4xl font-black text-white">עשר המכות</h2>
                <p className="text-stone-400 text-xl">לחצו על המכות לפי סדר הופעתן בסיפור.</p>
              </div>

              <div className="relative h-[400px] w-full bg-black/40 rounded-3xl border border-amber-500/20 overflow-hidden">
                {plaguesList.map((plague) => (
                  <motion.button
                    key={plague.id}
                    onClick={() => handlePlagueClick(plague.id)}
                    animate={{
                      x: selectedPlagues.includes(plague.id) ? 0 : [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
                      y: selectedPlagues.includes(plague.id) ? 0 : [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className={`absolute p-4 flex flex-col items-center justify-center rounded-2xl border-2 transition-all ${
                      selectedPlagues.includes(plague.id) 
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-100 relative !x-0 !y-0' 
                        : 'bg-stone-900 border-stone-800 hover:border-amber-500/50'
                    }`}
                    style={{
                      left: `${(plague.id - 1) * 10}%`,
                      top: `${Math.random() * 60 + 20}%`,
                      zIndex: selectedPlagues.includes(plague.id) ? 10 : 1
                    }}
                  >
                    <span className="text-3xl mb-1">{plague.icon}</span>
                    <span className="text-[10px] font-bold">{plague.name}</span>
                  </motion.button>
                ))}
              </div>

              <div className="flex justify-center gap-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-3 h-3 rounded-full border ${i < selectedPlagues.length ? 'bg-emerald-500 border-emerald-400' : 'bg-stone-800 border-stone-700'}`}
                  ></div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STAGE 2: Pharaoh's Vault */}
          {stage === 'stage2' && (
            <motion.div 
              key="stage2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="space-y-10"
            >
              <div className="text-center space-y-3">
                <div className="inline-block px-6 py-2 bg-amber-500/10 text-amber-500 text-xs font-black rounded-full border border-amber-500/20 uppercase tracking-widest">Sector 02: Pharaoh's Vault</div>
                <h2 className="text-4xl font-black text-white">כספת המכות</h2>
              </div>

              <div className="bg-stone-900/90 p-10 rounded-[2.5rem] border border-amber-500/30 space-y-10 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                  <Sun size={150} />
                </div>

                <div className="space-y-4 relative z-10">
                  <label className="text-sm font-black text-amber-500 uppercase tracking-widest block">כמות מכות מצרים</label>
                  <input 
                    type="number" 
                    value={plaguesInput}
                    onChange={(e) => setPlaguesInput(e.target.value)}
                    placeholder="?"
                    className="w-full bg-black border-2 border-stone-800 p-6 rounded-2xl text-center text-4xl font-black text-amber-500 focus:border-amber-500 outline-none transition-all placeholder:opacity-20"
                  />
                </div>

                <div className="space-y-4 relative z-10">
                  <label className="text-sm font-black text-amber-500 uppercase tracking-widest block">פענוח לבני העבדים (ח, ר, ו, ת)</label>
                  <input 
                    type="text" 
                    value={riddleInput}
                    onChange={(e) => setRiddleInput(e.target.value)}
                    placeholder="המילה המסתתרת..."
                    className="w-full bg-black border-2 border-stone-800 p-6 rounded-2xl text-center text-3xl font-black text-stone-100 focus:border-amber-500 outline-none transition-all placeholder:opacity-20"
                  />
                </div>

                <button 
                  onClick={handleStage2}
                  className="w-full py-6 bg-amber-600 text-white font-black text-2xl rounded-2xl shadow-[0_15px_40px_rgba(217,119,6,0.4)] hover:bg-amber-500 transition-all active:scale-95"
                >
                  שחרר את הנעילה
                </button>
              </div>
            </motion.div>
          )}

          {/* STAGE 3: The Dark Path */}
          {stage === 'stage3' && (
            <motion.div 
              key="stage3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-10 relative"
            >
              <div className="text-center space-y-3">
                <div className="inline-block px-6 py-2 bg-indigo-500/10 text-indigo-400 text-xs font-black rounded-full border border-indigo-500/20 uppercase tracking-widest">Sector 03: The Abyss</div>
                <h2 className="text-4xl font-black text-stone-100">מנהרת החשיכה</h2>
                <p className="text-stone-400 text-xl">השתמשו באלומת האור כדי לאתר את המפתח המוזהב.</p>
              </div>

              <div className="relative aspect-square w-full bg-black rounded-[3rem] overflow-hidden cursor-none border-8 border-stone-900 shadow-inner">
                {/* Flashlight Overlay */}
                <div 
                  className="absolute inset-0 pointer-events-none z-20"
                  style={{
                    background: `radial-gradient(circle 120px at ${flashlightPos.x}% ${flashlightPos.y}%, transparent 0%, rgba(0,0,0,0.99) 100%)`
                  }}
                ></div>
                
                {/* Hidden Clues in Darkness - Subtle hints */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                  <Flame size={200} className="text-amber-900 rotate-12" />
                </div>

                <div className="absolute left-[15%] top-[20%] text-[10px] text-stone-800 pointer-events-none italic uppercase tracking-widest">"The desert remembers..."</div>
                <div className="absolute right-[10%] bottom-[15%] text-[10px] text-stone-800 pointer-events-none italic uppercase tracking-widest">"Follow the light"</div>
                
                <button 
                  onClick={() => {
                    if (!foundKey) {
                      setFoundKey(true);
                      triggerFeedback('success', 'המפתח נמצא! השער הסופי מולכם.');
                    }
                  }}
                  className="absolute z-10 transition-all p-4 group"
                  style={{ left: '65%', top: '35%' }}
                >
                  <motion.div 
                    initial={{ opacity: 0.1 }}
                    animate={foundKey ? { scale: 1.5, opacity: 1 } : { scale: 1, opacity: 0.4 }}
                    whileHover={{ scale: 1.1 }}
                    className={`p-6 rounded-full transition-shadow duration-500 ${
                      foundKey ? 'bg-amber-500 shadow-[0_0_80px_rgba(245,158,11,1)]' : 'bg-amber-600/20 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                    }`}
                  >
                    <Key size={60} className={foundKey ? "text-black" : "text-amber-500/50"} />
                  </motion.div>
                </button>
              </div>

              {foundKey && (
                <motion.button 
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  onClick={() => setStage('stage4')}
                  className="w-full py-8 bg-indigo-600 text-white font-black text-3xl rounded-2xl shadow-[0_0_60px_rgba(79,70,229,0.5)] hover:bg-indigo-500 transition-all flex items-center justify-center gap-4"
                >
                  <span>אל שער היציאה</span>
                  <MoveRight size={32} />
                </motion.button>
              )}
            </motion.div>
          )}

          {/* STAGE 4: Final Gate */}
          {stage === 'stage4' && (
            <motion.div 
              key="stage4"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="space-y-10"
            >
              <div className="text-center space-y-3">
                <div className="inline-block px-6 py-2 bg-blue-500/10 text-blue-400 text-xs font-black rounded-full border border-blue-500/20 uppercase tracking-widest">Final Sector: Red Sea Gate</div>
                <h2 className="text-5xl font-black text-white italic tracking-tighter">ים סוף לפניכם!</h2>
                <p className="text-stone-400 text-xl">הזינו את שלושת חלקי הפאזל שאספתם לאורך הדרך.</p>
              </div>

              <div className="grid grid-cols-3 gap-6">
                  {['מכות', 'מילה', 'קוד'].map((label, i) => (
                      <div key={i} className="space-y-4">
                          <label className="text-xs text-amber-500 text-center block font-black uppercase tracking-[0.2em]">{label}</label>
                          <input 
                              type="text"
                              value={finalCode[i]}
                              onChange={(e) => {
                                  const newC = [...finalCode];
                                  newC[i] = e.target.value;
                                  setFinalCode(newC);
                              }}
                              placeholder="---"
                              className="w-full bg-stone-900 border-2 border-stone-800 p-6 rounded-2xl text-center text-amber-500 font-black text-2xl focus:border-amber-500 outline-none shadow-inner"
                          />
                      </div>
                  ))}
              </div>

              <button 
                onClick={checkFinal}
                className="group relative w-full py-10 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-700 text-white font-black text-3xl rounded-[2.5rem] shadow-[0_0_60px_rgba(37,99,235,0.4)] hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-6 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Waves className="group-hover:animate-bounce w-10 h-10" />
                בקעו את הים!
              </button>
            </motion.div>
          )}

          {/* VICTORY */}
          {stage === 'victory' && (
            <motion.div 
              key="victory"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-12 py-12 relative"
            >
              <div className="absolute inset-0 -z-10 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/20 blur-[120px] rounded-full animate-pulse"></div>
              </div>

              <div className="relative inline-block">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 bg-amber-500 blur-3xl"
                  ></motion.div>
                  <Trophy size={150} className="relative mx-auto text-amber-500 filter drop-shadow-[0_0_40px_rgba(245,158,11,0.8)]" />
              </div>
              
              <div className="space-y-6">
                  <h2 className="text-7xl font-black text-white italic tracking-tighter uppercase drop-shadow-2xl">חופשיים!</h2>
                  <div className="h-1.5 w-48 bg-amber-500 mx-auto rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                  <p className="text-amber-400 text-3xl font-black tracking-tight">מעבדות לחירות ב-100% הצלחה</p>
              </div>

              <div className="bg-stone-900/70 backdrop-blur-lg p-12 rounded-[3.5rem] border-4 border-amber-500/50 shadow-[0_0_100px_rgba(245,158,11,0.2)] relative overflow-hidden text-right">
                  <h3 className="text-4xl font-black mb-8 text-white border-b-2 border-amber-900/50 pb-4 inline-block">אישור יציאת מצרים</h3>
                  <div className="mb-6 flex justify-between items-center bg-black/40 p-4 rounded-xl border border-amber-500/20">
                    <div className="text-right">
                      <p className="text-xs text-amber-500 uppercase font-black">Final Score</p>
                      <p className="text-4xl font-black text-white">{score + (timeLeft * 10)}</p>
                    </div>
                  </div>
                  <p className="text-stone-100 text-2xl leading-relaxed font-medium italic">
                      "הרינו לאשר כי קבוצה זו גילתה תושייה של נביאים, אומץ של לוחמים וזיכרון של היסטוריונים. 
                      מעתה – אתם עם חופשי!"
                  </p>
                  <div className="mt-16 flex justify-start gap-16 opacity-60">
                      <div className="text-center border-t border-stone-700 pt-3 min-w-[120px]">
                          <span className="text-xs font-black uppercase tracking-widest text-amber-500">Seal of Moses</span>
                      </div>
                      <div className="text-center border-t border-stone-700 pt-3 min-w-[120px]">
                          <span className="text-xs font-black uppercase tracking-widest text-amber-500">Freedom Index</span>
                      </div>
                  </div>
              </div>

              <button 
                onClick={() => window.location.reload()}
                className="group text-stone-400 hover:text-white transition-all flex items-center gap-4 mx-auto font-black uppercase tracking-widest text-sm"
              >
                <History size={24} className="group-hover:rotate-180 transition-transform duration-700" />
                אתחל מערכת / חזור למצרים
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Futuristic Decor */}
      <div className="fixed bottom-10 left-10 opacity-10 pointer-events-none rotate-45">
          <Sun size={100} className="text-amber-600" />
      </div>
      <div className="fixed top-1/2 -right-20 opacity-5 pointer-events-none -rotate-90">
          <h4 className="text-[80px] font-black tracking-[1em] text-white">PHARAOH</h4>
      </div>
    </div>
  );
};

export default App;
