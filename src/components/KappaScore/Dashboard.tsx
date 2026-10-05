import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart2, 
  Zap, 
  Star, 
  Tv, 
  Pin, 
  LayoutGrid,
  Search,
  ChevronRight,
  TrendingUp,
  Clock,
  Calendar,
  Filter,
  Bell,
  Globe,
  Activity,
  Menu,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';

const NAV_LINKS = [
  { name: 'SPORTS', active: true },
  { name: 'GAMES', active: false },
  { name: 'TOP LISTS', active: false },
];

const SPORTS_BAR = [
  { name: 'SOCCER', icon: '⚽', active: true },
  { name: 'ICE HOCKEY', icon: '🏒' },
  { name: 'BASKETBALL', icon: '🏀' },
  { name: 'TENNIS', icon: '🎾' },
  { name: 'VOLLEYBALL', icon: '🏐' },
  { name: 'TABLE TENNIS', icon: '🏓' },
  { name: 'BASEBALL', icon: '⚾' },
  { name: 'CRIQUET', icon: '🏏' },
  { name: 'HANDBALL', icon: '🤾' },
  { name: 'RUGBY', icon: '🏉' },
  { name: 'AMERICAN FOOTBALL', icon: '🏈' },
];

const FIXED_LEAGUES = [
  { name: 'La Liga', flag: '🇪🇸', color: 'from-orange-500/20 to-transparent' },
  { name: 'Serie A', flag: '🇮🇹', color: 'from-blue-500/20 to-transparent' },
  { name: 'Bundesliga', flag: '🇩🇪', color: 'from-red-500/20 to-transparent' },
];

const FEATURED_MATCHES = [
  {
    league: 'UEFA Champions League • Final',
    home: { name: 'Real Madrid', icon: '🏰' },
    away: { name: 'Man City', icon: '🦅' },
    score: '3 : 2',
    time: "74'",
    bg: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1920&h=1080'
  },
  {
    league: 'NBA • Regular Season',
    home: { name: 'LA Lakers', icon: '🏀' },
    away: { name: 'GS Warriors', icon: '🌉' },
    score: '102 : 98',
    time: "Q4 02:14",
    bg: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=1920&h=1080'
  },
  {
    league: 'Wimbledon • Semi-Final',
    home: { name: 'Alcaraz C.', icon: '🎾' },
    away: { name: 'Djokovic N.', icon: '🎾' },
    score: '2 : 1',
    time: "Set 4",
    bg: 'https://images.unsplash.com/photo-1622279457486-62dcc4a4bd13?auto=format&fit=crop&q=80&w=1920&h=1080'
  }
];

const RECOMMENDED_EVENTS = [
  {
    league: 'SPAIN: LA LIGA',
    flag: '🇪🇸',
    events: [
      { id: 1, date: '21/02/2026', time: '21:00', home: 'Atletico Madrid', away: 'Espanyol', live: true, score: '2 - 1' },
      { id: 2, date: '21/02/2026', time: '18:30', home: 'Osasuna', away: 'Real Madrid', live: false, score: 'vs' },
      { id: 3, date: '21/02/2026', time: '14:00', home: 'Real Sociedad', away: 'Real Oviedo', live: false, score: 'vs' },
    ]
  },
  {
    league: 'ITALY: SERIE A',
    flag: '🇮🇹',
    events: [
      { id: 4, date: '21/02/2026', time: '20:45', home: 'Cagliari Calcio', away: 'Lazio', live: true, score: '0 - 0' },
      { id: 5, date: '21/02/2026', time: '18:00', home: 'Lecce', away: 'Internazionale Milano', live: false, score: 'vs' },
    ]
  }
];

const LANGUAGES = [
  { code: 'ES', flag: '🇪🇸', name: 'Spanish' },
  { code: 'MX', flag: '🇲🇽', name: 'Mexican' },
  { code: 'US', flag: '🇺🇸', name: 'English' },
  { code: 'DE', flag: '🇩🇪', name: 'German' },
  { code: 'FR', flag: '🇫🇷', name: 'French' },
  { code: 'IT', flag: '🇮🇹', name: 'Italian' },
  { code: 'IN', flag: '🇮🇳', name: 'Hindi' },
];

export default function KappaScoreDashboard() {
  const [activeSport, setActiveSport] = useState('SOCCER');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(LANGUAGES[2]); // Default to US

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % FEATURED_MATCHES.length);
    }, 5000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  const currentHero = FEATURED_MATCHES[heroIndex];

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Ambient Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-[20%] w-[30%] h-[30%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Elegant Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-700 ${
        scrolled ? 'bg-black/80 backdrop-blur-2xl border-b border-white/5 py-4' : 'bg-transparent py-4'
      }`}>
        {/* Desktop & Mobile Top Row */}
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between relative">
          {/* Logo - Left */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-2xl md:text-3xl font-black tracking-tighter flex items-center group cursor-pointer z-10"
          >
            Kappa<span className="text-emerald-500 group-hover:text-emerald-400 transition-colors">score</span>
            <div className="ml-2 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </motion.div>
          
          {/* Centered Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-2 absolute left-1/2 -translate-x-1/2">
            {NAV_LINKS.map(link => (
              <button 
                key={link.name}
                className={`relative text-[11px] font-black tracking-[0.25em] px-8 py-2.5 rounded-full transition-all group ${
                  link.active ? 'text-white' : 'text-white/30 hover:text-white'
                }`}
              >
                {link.name}
                {link.active && (
                  <motion.div 
                    layoutId="nav-active"
                    className="absolute inset-0 bg-white/5 border border-white/10 rounded-full -z-10"
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-4 md:space-x-8 z-10">
            <div className="hidden xl:flex items-center space-x-3 bg-white/[0.03] border border-white/10 rounded-full px-6 py-2 group focus-within:border-emerald-500/50 transition-all">
              <Search size={14} className="text-white/20 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search matches..." 
                className="bg-transparent border-none text-[11px] font-bold focus:outline-none w-40 placeholder:text-white/10"
              />
            </div>

            <div className="flex items-center space-x-2 md:space-x-4 relative">
              <button className="hidden sm:flex p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] transition-all relative group">
                <Bell size={18} className="text-white/40 group-hover:text-white" />
                <span className="absolute top-3 right-3 w-2 h-2 bg-emerald-500 rounded-full border-2 border-black" />
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="flex items-center space-x-2 bg-[#0a0a0a] border border-white/60 px-3 md:px-4 py-1.5 md:py-2 rounded-xl hover:bg-white/5 transition-all"
                >
                  <span className="text-base md:text-lg">{currentLang.flag}</span>
                  <span className="text-[10px] md:text-[11px] font-black tracking-widest text-emerald-500">{currentLang.code}</span>
                </button>

                <AnimatePresence>
                  {langMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-32 bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50"
                    >
                      <div className="py-2">
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setCurrentLang(lang);
                              setLangMenuOpen(false);
                            }}
                            className="w-full flex items-center space-x-4 px-4 py-3 hover:bg-white/5 transition-all group"
                          >
                            <span className="text-lg">{lang.flag}</span>
                            <span className={`text-[11px] font-black tracking-widest ${currentLang.code === lang.code ? 'text-emerald-500' : 'text-white/40 group-hover:text-white'}`}>
                              {lang.code}
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-3 rounded-xl bg-white/5 border border-white/10"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Rows */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden px-4 pb-6 space-y-4 overflow-hidden"
            >
              {/* Row 2: Main Nav Centered */}
              <div className="grid grid-cols-3 gap-2">
                {NAV_LINKS.map(link => (
                  <button 
                    key={link.name}
                    className={`text-[10px] font-black tracking-widest py-3 rounded-full transition-all text-center ${
                      link.active ? 'bg-[#10b981] text-black shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-[#0a0a0a] border border-white/5 text-white/60'
                    }`}
                  >
                    {link.name}
                  </button>
                ))}
              </div>

              {/* Row 3: Secondary Nav */}
              <div className="grid grid-cols-3 gap-1 bg-[#0a0a0a] p-1 rounded-xl border border-white/5">
                <button className="flex flex-col items-center justify-center py-3 rounded-lg text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                  <LayoutGrid size={16} className="mb-1" />
                  <span>Results</span>
                </button>
                <button className="flex flex-col items-center justify-center py-3 rounded-lg text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                  <BarChart2 size={16} className="mb-1" />
                  <span>Statistics</span>
                </button>
                <button className="flex flex-col items-center justify-center py-3 rounded-lg text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                  <Tv size={16} className="mb-1" />
                  <span>Live Score</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="pt-32 lg:pt-40 pb-20 px-6 md:px-12 max-w-[1600px] mx-auto">
        {/* Featured Hero Carousel */}
        <section className="mb-20">
          <div className="relative h-[450px] md:h-[550px] rounded-[48px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={heroIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <img 
                  src={currentHero.bg} 
                  alt="Stadium" 
                  className="absolute inset-0 w-full h-full object-cover scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
                
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 md:p-12 text-center">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center space-x-4 mb-8"
                  >
                    <div className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500 text-black text-[10px] font-black tracking-[0.2em]">
                      <Activity size={12} className="animate-pulse" />
                      <span>LIVE NOW</span>
                    </div>
                    <span className="text-white/60 text-[10px] md:text-xs font-black tracking-[0.3em] uppercase">{currentHero.league}</span>
                  </motion.div>
                  
                  <div className="flex items-center justify-center space-x-8 md:space-x-32 mb-12">
                    <motion.div 
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-center space-y-4 md:space-y-6"
                    >
                      <div className="w-20 h-20 md:w-40 md:h-40 bg-white/5 backdrop-blur-3xl rounded-[32px] md:rounded-[40px] flex items-center justify-center border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                        <span className="text-4xl md:text-7xl">{currentHero.home.icon}</span>
                      </div>
                      <h3 className="text-lg md:text-3xl font-black tracking-tight">{currentHero.home.name}</h3>
                    </motion.div>

                    <div className="flex flex-col items-center">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-5xl md:text-9xl font-black tracking-tighter tabular-nums flex items-center space-x-3 md:space-x-6"
                      >
                        {currentHero.score}
                      </motion.div>
                      <div className="mt-4 md:mt-6 px-4 md:px-6 py-1.5 md:py-2 rounded-xl md:rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-emerald-500 font-mono text-sm md:text-lg font-black shadow-xl">
                        {currentHero.time}
                      </div>
                    </div>

                    <motion.div 
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-center space-y-4 md:space-y-6"
                    >
                      <div className="w-20 h-20 md:w-40 md:h-40 bg-white/5 backdrop-blur-3xl rounded-[32px] md:rounded-[40px] flex items-center justify-center border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                        <span className="text-4xl md:text-7xl">{currentHero.away.icon}</span>
                      </div>
                      <h3 className="text-lg md:text-3xl font-black tracking-tight">{currentHero.away.name}</h3>
                    </motion.div>
                  </div>

                  <div className="flex items-center space-x-4 md:space-x-6">
                    <button className="px-8 md:px-12 py-3 md:py-4 rounded-xl md:rounded-2xl bg-emerald-500 text-black text-[10px] md:text-xs font-black tracking-[0.2em] hover:bg-emerald-400 hover:scale-105 transition-all shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                      WATCH LIVE
                    </button>
                    <button className="px-8 md:px-12 py-3 md:py-4 rounded-xl md:rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-[10px] md:text-xs font-black tracking-[0.2em] hover:bg-white/10 transition-all">
                      ANALYTICS
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Carousel Indicators */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center space-x-3 z-20">
              {FEATURED_MATCHES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    heroIndex === i ? 'w-12 bg-emerald-500' : 'w-3 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16">
          <div className="space-y-20">
            {/* Elegant Sports Selector */}
            <section>
              <div className="flex items-center justify-between mb-10">
                <div className="space-y-1">
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight">Explore Sports</h2>
                  <p className="text-white/20 text-[10px] font-bold tracking-widest uppercase">Select your preferred discipline</p>
                </div>
                <button className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:text-emerald-500 transition-all">
                  <Filter size={18} />
                </button>
              </div>
              <div className="flex items-center space-x-4 overflow-x-auto no-scrollbar pb-6">
                {SPORTS_BAR.map(sport => (
                  <button
                    key={sport.name}
                    onClick={() => setActiveSport(sport.name)}
                    className={`flex items-center space-x-4 px-8 py-4.5 rounded-[24px] whitespace-nowrap text-[11px] font-black tracking-widest transition-all border ${
                      activeSport === sport.name 
                      ? 'bg-emerald-500 border-emerald-500 text-black shadow-[0_20px_40px_rgba(16,185,129,0.25)] scale-105' 
                      : 'bg-white/[0.03] border-white/5 text-white/30 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span className="text-xl">{sport.icon}</span>
                    <span>{sport.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Live Matches Bento */}
            <section className="space-y-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute inset-0" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500 relative" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight">Live Matches</h2>
                </div>
                <button className="group flex items-center space-x-3 text-[11px] font-black tracking-widest text-emerald-500">
                  <span>VIEW ALL</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {RECOMMENDED_EVENTS[0].events.filter(e => e.live).map(event => (
                  <motion.div 
                    key={event.id}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="bg-white/[0.03] border border-white/5 rounded-[40px] p-8 md:p-10 relative overflow-hidden group cursor-pointer shadow-2xl"
                  >
                    <div className="absolute top-0 right-0 p-6 md:p-8">
                      <Star size={20} className="text-white/5 group-hover:text-yellow-500 transition-all duration-500" />
                    </div>
                    
                    <div className="flex items-center space-x-3 mb-10">
                      <span className="text-lg">{RECOMMENDED_EVENTS[0].flag}</span>
                      <span className="text-[10px] font-black tracking-[0.25em] text-white/20 uppercase">
                        {RECOMMENDED_EVENTS[0].league}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-10">
                      <div className="flex flex-col items-center space-y-4 flex-1">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white/[0.03] rounded-[24px] md:rounded-[28px] flex items-center justify-center text-2xl md:text-3xl border border-white/10 group-hover:border-emerald-500/40 transition-all duration-500 shadow-xl">
                          {event.home[0]}
                        </div>
                        <span className="text-xs md:text-sm font-black text-center tracking-tight">{event.home}</span>
                      </div>

                      <div className="flex flex-col items-center px-4 md:px-8">
                        <div className="text-3xl md:text-4xl font-black tracking-tighter tabular-nums mb-3">
                          {event.score}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[11px] font-mono text-emerald-500 font-black">74'</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center space-y-4 flex-1">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white/[0.03] rounded-[24px] md:rounded-[28px] flex items-center justify-center text-2xl md:text-3xl border border-white/10 group-hover:border-emerald-500/40 transition-all duration-500 shadow-xl">
                          {event.away[0]}
                        </div>
                        <span className="text-xs md:text-sm font-black text-center tracking-tight">{event.away}</span>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                          <Tv size={16} className="text-white/30" />
                        </button>
                        <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                          <BarChart2 size={16} className="text-white/30" />
                        </button>
                      </div>
                      <span className="text-[9px] font-black tracking-[0.2em] text-white/10 uppercase">Match ID: #82910</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Upcoming Schedule Section */}
            <section className="space-y-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl md:text-3xl font-black tracking-tight">Upcoming Schedule</h2>
                <div className="flex bg-white/5 p-1 rounded-2xl">
                  <button className="px-4 md:px-6 py-2 rounded-xl bg-white/10 text-[10px] font-black tracking-widest">TODAY</button>
                  <button className="px-4 md:px-6 py-2 rounded-xl text-[10px] font-black tracking-widest text-white/20 hover:text-white transition-colors">TOMORROW</button>
                </div>
              </div>
              
              <div className="bg-white/[0.02] border border-white/5 rounded-[32px] md:rounded-[48px] overflow-hidden shadow-2xl">
                {RECOMMENDED_EVENTS.flatMap(g => g.events).filter(e => !e.live).map((event, i) => (
                  <motion.div 
                    key={event.id}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                    className={`flex flex-col md:flex-row items-center justify-between p-6 md:p-8 group cursor-pointer transition-all ${
                      i !== 0 ? 'border-t border-white/5' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-8 md:space-x-12 w-full md:w-auto mb-6 md:mb-0">
                      <div className="text-center w-20 md:w-24">
                        <div className="text-[10px] font-black text-white/10 mb-2 tracking-widest uppercase">{event.date}</div>
                        <div className="text-lg md:text-xl font-black tracking-tighter">{event.time}</div>
                      </div>
                      <div className="h-12 w-[1px] bg-white/5" />
                      <div className="flex items-center space-x-6 md:space-x-16 flex-1">
                        <div className="flex items-center space-x-4 md:space-x-6 w-full md:w-56">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-white/5 rounded-xl md:rounded-2xl flex items-center justify-center text-xs border border-white/10 group-hover:border-emerald-500/30 transition-colors">{event.home[0]}</div>
                          <span className="text-sm md:text-base font-black tracking-tight truncate">{event.home}</span>
                        </div>
                        <span className="text-[10px] font-black text-white/5 uppercase tracking-[0.3em] hidden md:block">VS</span>
                        <div className="flex items-center space-x-4 md:space-x-6 w-full md:w-56">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-white/5 rounded-xl md:rounded-2xl flex items-center justify-center text-xs border border-white/10 group-hover:border-emerald-500/30 transition-colors">{event.away[0]}</div>
                          <span className="text-sm md:text-base font-black tracking-tight truncate">{event.away}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between w-full md:w-auto space-x-10">
                      <div className="flex flex-col items-start md:items-end">
                        <span className="text-[9px] font-black text-white/10 uppercase tracking-widest mb-1">Win Prob.</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 md:w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="w-[64%] h-full bg-emerald-500" />
                          </div>
                          <span className="text-xs font-black text-emerald-500">64%</span>
                        </div>
                      </div>
                      <button className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 group-hover:border-white/20 transition-all">
                        <ChevronRight size={20} className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Sidebar - Premium Stats & News */}
          <aside className="space-y-12">
            {/* Premium Analytics Card */}
            <motion.section 
              whileHover={{ scale: 1.02 }}
              className="bg-emerald-500 rounded-[40px] md:rounded-[48px] p-8 md:p-10 text-black relative overflow-hidden group shadow-[0_30px_60px_rgba(16,185,129,0.3)]"
            >
              <div className="absolute -top-10 -right-10 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                <TrendingUp size={240} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center mb-8 shadow-xl">
                  <Zap size={24} className="text-emerald-500" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-4 leading-tight">Pro Analytics Access</h3>
                <p className="text-sm font-bold opacity-70 mb-10 leading-relaxed">Unlock deep player insights, heatmaps, and AI-powered match outcomes.</p>
                <div className="space-y-4 mb-10">
                  <div className="bg-black/10 rounded-2xl p-5 flex items-center justify-between border border-black/5">
                    <span className="text-xs font-black uppercase tracking-widest">AI Accuracy</span>
                    <span className="text-xl font-black">94.8%</span>
                  </div>
                </div>
                <button className="w-full bg-black text-white py-5 rounded-[24px] text-[11px] font-black uppercase tracking-[0.25em] hover:shadow-2xl transition-all">
                  UPGRADE TO PRO
                </button>
              </div>
            </motion.section>

            {/* Top Leagues Card */}
            <section className="bg-white/[0.02] border border-white/5 rounded-[32px] md:rounded-[40px] p-8 md:p-10 shadow-2xl">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-[11px] font-black tracking-[0.3em] text-white/20 uppercase">Top Leagues</h3>
                <Globe size={16} className="text-white/10" />
              </div>
              <div className="space-y-3">
                {FIXED_LEAGUES.map(league => (
                  <button 
                    key={league.name}
                    className={`w-full flex items-center justify-between p-4 md:p-5 rounded-[20px] md:rounded-[24px] hover:bg-white/[0.04] transition-all group relative overflow-hidden border border-transparent hover:border-white/5`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${league.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className="flex items-center space-x-5 relative z-10">
                      <span className="text-2xl grayscale group-hover:grayscale-0 transition-all duration-500">{league.flag}</span>
                      <span className="text-sm font-black text-white/40 group-hover:text-white transition-colors">{league.name}</span>
                    </div>
                    <ChevronRight size={18} className="text-white/5 group-hover:text-white transition-all relative z-10 group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </section>

            {/* Trending News Feed */}
            <section className="space-y-10">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black tracking-[0.3em] text-white/20 uppercase">Trending Feed</h3>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-8">
                {[
                  { title: "Transfer Market: Haaland's future remains uncertain", time: '45m ago', tag: 'TRANSFER', color: 'text-blue-400' },
                  { title: "NBA: Curry sets new record in 3-pointers", time: '2h ago', tag: 'BASKETBALL', color: 'text-orange-400' },
                  { title: "Wimbledon: Finalists confirmed for Sunday", time: '4h ago', tag: 'TENNIS', color: 'text-emerald-400' },
                ].map((news, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ x: 5 }}
                    className="group cursor-pointer space-y-4"
                  >
                    <div className="flex items-center space-x-4">
                      <span className={`text-[9px] font-black tracking-widest bg-white/5 px-3 py-1 rounded-full uppercase ${news.color}`}>{news.tag}</span>
                      <span className="text-[10px] font-bold text-white/10">{news.time}</span>
                    </div>
                    <h4 className="text-base font-black leading-tight group-hover:text-emerald-500 transition-colors tracking-tight">{news.title}</h4>
                    <div className="h-[1px] w-full bg-white/5 group-last:hidden" />
                  </motion.div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </main>

      {/* Premium Footer */}
      <footer className="bg-[#010101] border-t border-white/5 pt-20 lg:pt-40 pb-20">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-24 mb-20 md:mb-40">
            <div className="lg:col-span-2 space-y-8 md:space-y-12">
              <div className="text-4xl md:text-5xl font-black tracking-tighter">
                Kappa<span className="text-emerald-500">score</span>
              </div>
              <p className="text-white/30 text-lg md:text-xl leading-relaxed max-w-lg font-medium">
                The definitive platform for sports intelligence. Real-time precision, AI-driven insights, and the soul of the game.
              </p>
              <div className="flex items-center space-x-8 md:space-x-10">
                {['TWITTER', 'INSTAGRAM', 'LINKEDIN', 'DISCORD'].map(social => (
                  <a key={social} href="#" className="text-[11px] font-black tracking-[0.3em] text-white/20 hover:text-white transition-all hover:-translate-y-1">{social}</a>
                ))}
              </div>
            </div>

            <div className="space-y-8 md:space-y-10">
              <h4 className="text-[11px] font-black tracking-[0.4em] text-white/10 uppercase">Platform</h4>
              <ul className="space-y-4 md:space-y-5">
                {['Live Scores', 'Deep Statistics', 'AI Predictions', 'News Feed', 'API Access'].map(item => (
                  <li key={item}><a href="#" className="text-base font-black text-white/30 hover:text-emerald-500 transition-colors tracking-tight">{item}</a></li>
                ))}
              </ul>
            </div>

            <div className="space-y-8 md:space-y-10">
              <h4 className="text-[11px] font-black tracking-[0.4em] text-white/10 uppercase">Company</h4>
              <ul className="space-y-4 md:space-y-5">
                {['About Us', 'Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Contact Support'].map(item => (
                  <li key={item}><a href="#" className="text-base font-black text-white/30 hover:text-emerald-500 transition-colors tracking-tight">{item}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-12 md:pt-20 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
            <div className="flex items-center space-x-6">
              <p className="text-[10px] md:text-[11px] font-black text-white/10 uppercase tracking-[0.5em]">
                © 2026 KAPPASCORE
              </p>
              <div className="w-12 h-[1px] bg-white/5" />
              <span className="text-[10px] md:text-[11px] font-black text-white/10 uppercase tracking-widest">EST. 2012</span>
            </div>
            <div className="flex items-center space-x-8 md:space-x-12">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] md:text-[11px] font-black text-white/20 uppercase tracking-widest">SYSTEMS OPERATIONAL</span>
              </div>
              <span className="text-[10px] md:text-[11px] font-black text-white/10 uppercase tracking-widest">V 2.5.0 PRO</span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        .animate-float { animation: float 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
