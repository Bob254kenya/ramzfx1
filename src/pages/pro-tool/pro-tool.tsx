// ProTool.tsx - Digit Circle Analysis Tool
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'framer-motion';
import { Activity, Wifi, WifiOff } from 'lucide-react';
import { generateDerivApiInstance, V2GetActiveToken } from '@/external/bot-skeleton/services/api/appId';
import { useStore } from '@/hooks/useStore';
import './pro-tool.scss';

// ==================== TYPES ====================
interface Symbol {
  symbol: string;
  display_name: string;
  market_type: 'volatility' | 'jump' | 'bearbull' | 'step' | 'range';
}

interface DigitHistory {
  digit: number;
  timestamp: number;
  price: number;
}

interface DigitStats {
  frequency: Record<number, number>;
  percentages: Record<number, number>;
  mostCommon: number;
  leastCommon: number;
  totalTicks: number;
  evenPercentage: number;
  oddPercentage: number;
  overPercentage: number;
  underPercentage: number;
}

// ==================== MARKET LISTS ====================
const VOLATILITY_1S_MARKETS = ['1HZ10V', '1HZ15V', '1HZ25V', '1HZ30V', '1HZ50V', '1HZ75V', '1HZ100V'];
const VOLATILITY_MARKETS = ['R_10', 'R_25', 'R_50', 'R_75', 'R_100'];
const JUMP_MARKETS = ['JD10', 'JD25', 'JD50', 'JD75', 'JD100'];
const BEAR_BULL_MARKETS = ['RDBEAR', 'RDBULL'];
const STEP_MARKETS = ['stpRNG'];
const RANGE_MARKETS = ['RBRK100', 'RBRK200'];

const ALL_MARKETS = [
  ...VOLATILITY_1S_MARKETS,
  ...VOLATILITY_MARKETS,
  ...JUMP_MARKETS,
  ...BEAR_BULL_MARKETS,
  ...STEP_MARKETS,
  ...RANGE_MARKETS,
];

// Market display names
const MARKET_NAMES: Record<string, string> = {
  '1HZ10V': 'Vol 10 (1s)', '1HZ15V': 'Vol 15 (1s)', '1HZ25V': 'Vol 25 (1s)',
  '1HZ30V': 'Vol 30 (1s)', '1HZ50V': 'Vol 50 (1s)', '1HZ75V': 'Vol 75 (1s)', '1HZ100V': 'Vol 100 (1s)',
  'R_10': 'Vol 10', 'R_25': 'Vol 25', 'R_50': 'Vol 50', 'R_75': 'Vol 75', 'R_100': 'Vol 100',
  'JD10': 'Jump 10', 'JD25': 'Jump 25', 'JD50': 'Jump 50', 'JD75': 'Jump 75', 'JD100': 'Jump 100',
  'RDBEAR': 'Bear', 'RDBULL': 'Bull', 'stpRNG': 'Step', 'RBRK100': 'Range 100', 'RBRK200': 'Range 200',
};

// ==================== DIGIT CIRCLE COMPONENT ====================
interface DigitCircleProps {
  lastDigit: number | null;
  onDigitSelect?: (digit: number) => void;
  selectedDigit?: number;
  frequencies: Record<number, number>;
}

const DigitCircle: React.FC<DigitCircleProps> = ({ 
  lastDigit, 
  onDigitSelect, 
  selectedDigit, 
  frequencies 
}) => {
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const radius = 140;
  const center = 160;
  
  const maxFreq = Math.max(...Object.values(frequencies), 1);
  
  const getPosition = (index: number, total: number) => {
    const angle = (index * 360 / total) - 90;
    const radian = (angle * Math.PI) / 180;
    const x = center + radius * Math.cos(radian);
    const y = center + radius * Math.sin(radian);
    return { x, y, angle };
  };

  return (
    <div className="digit-circle-container">
      <svg width="320" height="320" viewBox="0 0 320 320" className="digit-circle-svg">
        <defs>
          <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="pulseGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Outer decorative ring */}
        <circle
          cx={center}
          cy={center}
          r={radius + 15}
          fill="none"
          stroke="rgba(59,130,246,0.1)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />
        
        {/* Main circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="rgba(15,25,45,0.95)"
          stroke="url(#circleGradient)"
          strokeWidth="2.5"
        />
        
        {/* Inner decorative ring */}
        <circle
          cx={center}
          cy={center}
          r={radius - 25}
          fill="none"
          stroke="rgba(59,130,246,0.08)"
          strokeWidth="1"
        />
        
        {/* Center display */}
        <circle
          cx={center}
          cy={center}
          r="32"
          fill="rgba(59,130,246,0.12)"
          stroke="rgba(59,130,246,0.3)"
          strokeWidth="1.5"
        />
        <text
          x={center}
          y={center - 2}
          textAnchor="middle"
          fill="#60a5fa"
          fontSize="11"
          fontWeight="bold"
          letterSpacing="1"
        >
          DIGIT
        </text>
        <text
          x={center}
          y={center + 14}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="8"
        >
          ANALYSIS
        </text>
        
        {/* Digit nodes on circle */}
        {digits.map((digit, idx) => {
          const { x, y } = getPosition(idx, digits.length);
          const isLast = lastDigit === digit;
          const isSelected = selectedDigit === digit;
          const freq = frequencies[digit] || 0;
          const freqPercent = (freq / maxFreq) * 100;
          
          // Dynamic sizing based on frequency
          const nodeSize = 18 + (freqPercent / 100) * 8;
          
          return (
            <g
              key={digit}
              onClick={() => onDigitSelect?.(digit)}
              style={{ cursor: onDigitSelect ? 'pointer' : 'default' }}
            >
              {/* Frequency ring */}
              <circle
                cx={x}
                cy={y}
                r={nodeSize + 3}
                fill="none"
                stroke={`rgba(59,130,246,${0.2 + (freqPercent / 100) * 0.5})`}
                strokeWidth="1.5"
                strokeDasharray={`${freqPercent} 100`}
                transform={`rotate(${idx * 36}, ${x}, ${y})`}
                style={{ transition: 'all 0.3s ease' }}
              />
              
              {/* Glow for last digit */}
              {isLast && (
                <circle
                  cx={x}
                  cy={y}
                  r={nodeSize + 8}
                  fill="rgba(239,68,68,0.2)"
                  filter="url(#pulseGlow)"
                >
                  <animate
                    attributeName="r"
                    values={`${nodeSize + 4};${nodeSize + 12};${nodeSize + 4}`}
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.3;0.6;0.3"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              
              {/* Selected glow */}
              {isSelected && !isLast && (
                <circle
                  cx={x}
                  cy={y}
                  r={nodeSize + 5}
                  fill="rgba(59,130,246,0.15)"
                  filter="url(#glow)"
                />
              )}
              
              {/* Digit circle */}
              <circle
                cx={x}
                cy={y}
                r={nodeSize}
                fill={isSelected ? "rgba(59,130,246,0.25)" : (isLast ? "rgba(239,68,68,0.2)" : "rgba(30,45,65,0.9)")}
                stroke={isSelected ? "#3b82f6" : (isLast ? "#ef4444" : "rgba(59,130,246,0.5)")}
                strokeWidth={isLast || isSelected ? "2.5" : "1.5"}
                style={{ transition: 'all 0.2s ease' }}
              />
              
              {/* Digit text */}
              <text
                x={x}
                y={y + 5}
                textAnchor="middle"
                fill={isLast ? "#ef4444" : (isSelected ? "#60a5fa" : "#cbd5e1")}
                fontSize={isLast ? "18" : "15"}
                fontWeight={isLast ? "bold" : "600"}
                fontFamily="monospace"
              >
                {digit}
              </text>
            </g>
          );
        })}
        
        {/* Dynamic arrow pointing to last digit */}
        {lastDigit !== null && (() => {
          const idx = lastDigit;
          const { x, y, angle } = getPosition(idx, 10);
          const arrowAngle = angle + 180;
          const arrowX = center + (radius - 40) * Math.cos((arrowAngle * Math.PI) / 180);
          const arrowY = center + (radius - 40) * Math.sin((arrowAngle * Math.PI) / 180);
          
          return (
            <g transform={`translate(${arrowX}, ${arrowY}) rotate(${arrowAngle + 90})`}>
              <polygon
                points="0,-20 -10,10 0,4 10,10"
                fill="#ef4444"
                stroke="#dc2626"
                strokeWidth="1"
                filter="url(#glow)"
              >
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,-3;0,5;0,-3"
                  dur="0.8s"
                  repeatCount="indefinite"
                  additive="sum"
                />
              </polygon>
            </g>
          );
        })()}
        
        {/* Tick mark indicators */}
        {[0, 2, 4, 6, 8].map(i => {
          const angle = (i * 36 - 90) * Math.PI / 180;
          const x1 = center + (radius + 5) * Math.cos(angle);
          const y1 = center + (radius + 5) * Math.sin(angle);
          const x2 = center + (radius + 10) * Math.cos(angle);
          const y2 = center + (radius + 10) * Math.sin(angle);
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(59,130,246,0.3)"
              strokeWidth="1"
            />
          );
        })}
      </svg>
      
      {/* Last digit display */}
      <div className="last-digit-preview">
        <span className="label">Last Digit</span>
        <motion.span
          key={lastDigit}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`digit-value ${lastDigit !== null ? 'active' : ''}`}
        >
          {lastDigit !== null ? lastDigit : '—'}
        </motion.span>
      </div>
    </div>
  );
};

// ==================== MARKET SELECTOR ====================
interface MarketSelectorProps {
  symbols: Symbol[];
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
  disabled?: boolean;
}

const MarketSelector: React.FC<MarketSelectorProps> = ({ 
  symbols, 
  selectedSymbol, 
  onSymbolChange,
  disabled 
}) => {
  const groupedSymbols = {
    'Volatility 1s': symbols.filter(s => VOLATILITY_1S_MARKETS.includes(s.symbol)),
    'Volatility': symbols.filter(s => VOLATILITY_MARKETS.includes(s.symbol)),
    'Jump': symbols.filter(s => JUMP_MARKETS.includes(s.symbol)),
    'Bear/Bull': symbols.filter(s => BEAR_BULL_MARKETS.includes(s.symbol)),
    'Step & Range': symbols.filter(s => [...STEP_MARKETS, ...RANGE_MARKETS].includes(s.symbol)),
  };

  return (
    <div className="market-selector">
      <div className="selector-header">
        <Activity size={16} />
        <span>Market Selection</span>
      </div>
      <div className="market-groups">
        {Object.entries(groupedSymbols).map(([groupName, groupSymbols]) => (
          groupSymbols.length > 0 && (
            <div key={groupName} className="market-group">
              <div className="group-label">{groupName}</div>
              <div className="market-buttons">
                {groupSymbols.map(sym => (
                  <button
                    key={sym.symbol}
                    className={`market-btn ${selectedSymbol === sym.symbol ? 'active' : ''}`}
                    onClick={() => onSymbolChange(sym.symbol)}
                    disabled={disabled}
                  >
                    {sym.display_name}
                  </button>
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

// ==================== STATS PANEL ====================
interface StatsPanelProps {
  stats: DigitStats;
  lastDigit: number | null;
  ticksProcessed: number;
  recentDigits: number[];
}

const StatsPanel: React.FC<StatsPanelProps> = ({ 
  stats, 
  lastDigit, 
  ticksProcessed, 
  recentDigits 
}) => {
  const { 
    frequency, 
    percentages, 
    mostCommon, 
    leastCommon,
    evenPercentage,
    oddPercentage,
    overPercentage,
    underPercentage
  } = stats;
  
  const maxFreq = Math.max(...Object.values(frequency), 1);
  
  return (
    <div className="stats-panel">
      {/* Frequency Card */}
      <div className="stat-card">
        <div className="stat-title">
          <span>📊 Digit Frequency</span>
          <span className="stat-badge">{ticksProcessed} ticks</span>
        </div>
        <div className="frequency-bars">
          {Array.from({ length: 10 }, (_, i) => {
            const freq = frequency[i] || 0;
            const pct = percentages[i] || 0;
            const barWidth = (freq / maxFreq) * 100;
            
            return (
              <div key={i} className="freq-item">
                <span className={`digit-label ${lastDigit === i ? 'last' : ''}`}>{i}</span>
                <div className="bar-container">
                  <div 
                    className={`freq-bar ${lastDigit === i ? 'last' : ''} ${i === mostCommon ? 'most' : ''} ${i === leastCommon ? 'least' : ''}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <span className="freq-value">{freq}</span>
                <span className="freq-pct">{pct.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Summary Card */}
      <div className="stat-card">
        <div className="stat-title">📈 Summary</div>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Most Common</span>
            <span className="summary-value highlight">{mostCommon}</span>
            <span className="summary-sub">{percentages[mostCommon]?.toFixed(1)}%</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Least Common</span>
            <span className="summary-value">{leastCommon}</span>
            <span className="summary-sub">{percentages[leastCommon]?.toFixed(1)}%</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Even/Odd</span>
            <span className={`summary-value ${evenPercentage > 50 ? 'even' : 'odd'}`}>
              {evenPercentage > 50 ? 'EVEN' : 'ODD'}
            </span>
            <span className="summary-sub">
              {evenPercentage.toFixed(1)}% / {oddPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Over/Under 4</span>
            <span className={`summary-value ${overPercentage > 50 ? 'over' : 'under'}`}>
              {overPercentage > 50 ? 'OVER' : 'UNDER'}
            </span>
            <span className="summary-sub">
              {overPercentage.toFixed(1)}% / {underPercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
      
      {/* Recent Digits Card */}
      <div className="stat-card">
        <div className="stat-title">🔄 Recent Digits</div>
        <div className="recent-digits">
          {recentDigits.slice(-20).map((digit, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.02 }}
              className={`recent-digit ${digit === lastDigit ? 'last' : ''} ${
                digit % 2 === 0 ? 'even' : 'odd'
              }`}
            >
              {digit}
            </motion.div>
          ))}
          {recentDigits.length === 0 && (
            <span className="no-data">Waiting for ticks...</span>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
const TradeUiClone = observer(() => {
  const { run_panel } = useStore();
  const apiRef = useRef<any>(null);
  const tickStreamIdRef = useRef<string | null>(null);
  const tickCallbackRef = useRef<((data: any) => void) | null>(null);
  
  // State
  const [symbols, setSymbols] = useState<Symbol[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('R_100');
  const [lastDigit, setLastDigit] = useState<number | null>(null);
  const [ticksProcessed, setTicksProcessed] = useState(0);
  const [digitsHistory, setDigitsHistory] = useState<DigitHistory[]>([]);
  const [status, setStatus] = useState('Initializing...');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPredictionDigit, setSelectedPredictionDigit] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  
  // Calculate stats
  const calculateStats = useCallback((): DigitStats => {
    const history = digitsHistory;
    const frequency: Record<number, number> = {};
    for (let i = 0; i <= 9; i++) frequency[i] = 0;
    
    history.forEach(h => frequency[h.digit]++);
    
    const total = history.length || 1;
    const percentages: Record<number, number> = {};
    for (let i = 0; i <= 9; i++) {
      percentages[i] = (frequency[i] / total) * 100;
    }
    
    let mostCommon = 0;
    let leastCommon = 0;
    let maxFreq = 0;
    let minFreq = Infinity;
    
    for (let i = 0; i <= 9; i++) {
      if (frequency[i] > maxFreq) {
        maxFreq = frequency[i];
        mostCommon = i;
      }
      if (frequency[i] < minFreq) {
        minFreq = frequency[i];
        leastCommon = i;
      }
    }
    
    const evenCount = history.filter(h => h.digit % 2 === 0).length;
    const oddCount = history.length - evenCount;
    const overCount = history.filter(h => h.digit > 4).length;
    const underCount = history.length - overCount;
    
    return {
      frequency,
      percentages,
      mostCommon,
      leastCommon,
      totalTicks: history.length,
      evenPercentage: history.length > 0 ? (evenCount / history.length) * 100 : 50,
      oddPercentage: history.length > 0 ? (oddCount / history.length) * 100 : 50,
      overPercentage: history.length > 0 ? (overCount / history.length) * 100 : 50,
      underPercentage: history.length > 0 ? (underCount / history.length) * 100 : 50,
    };
  }, [digitsHistory]);
  
  const stats = calculateStats();
  const recentDigits = digitsHistory.slice(-20).map(h => h.digit);
  
  // Helper to get last digit from price
  const getLastDigitFromPrice = (price: number): number => {
    return Number(String(price).slice(-1));
  };
  
  // Get display name
  const getDisplayName = (sym: string): string => {
    return MARKET_NAMES[sym] || sym;
  };
  
  // Stop tick stream
  const stopTicks = useCallback(() => {
    if (tickStreamIdRef.current && apiRef.current) {
      try {
        apiRef.current.forget?.({ forget: tickStreamIdRef.current });
      } catch (e) {
        console.warn('Error forgetting subscription:', e);
      }
      tickStreamIdRef.current = null;
    }
    
    if (tickCallbackRef.current && apiRef.current?.connection) {
      apiRef.current.connection.removeEventListener('message', tickCallbackRef.current);
      tickCallbackRef.current = null;
    }
  }, []);
  
  // Start tick stream for a symbol
  const startTicks = useCallback(async (sym: string) => {
    stopTicks();
    setDigitsHistory([]);
    setLastDigit(null);
    setTicksProcessed(0);
    setError(null);
    setStatus(`Connecting to ${getDisplayName(sym)}...`);
    
    try {
      const api = apiRef.current;
      if (!api) {
        throw new Error('API not initialized');
      }
      
      // Ensure authorized
      const token = V2GetActiveToken();
      if (token) {
        try {
          await api.authorize(token);
        } catch (e) {
          // Continue without auth for ticks
        }
      }
      
      // Subscribe to ticks
      const { subscription, error: subError } = await api.send({ 
        ticks: sym, 
        subscribe: 1 
      });
      
      if (subError) throw new Error(subError.message || 'Subscription failed');
      if (subscription?.id) {
        tickStreamIdRef.current = subscription.id;
      }
      
      // Create message handler
      const onTickMessage = (evt: MessageEvent) => {
        try {
          const data = JSON.parse(evt.data);
          
          if (data?.msg_type === 'tick' && data?.tick?.symbol === sym) {
            const quote = data.tick.quote;
            const digit = getLastDigitFromPrice(quote);
            const timestamp = Date.now();
            
            setLastDigit(digit);
            setDigitsHistory(prev => {
              const newHistory = [...prev, { digit, timestamp, price: quote }];
              // Keep last 500 ticks
              return newHistory.slice(-500);
            });
            setTicksProcessed(prev => prev + 1);
            setStatus(`${getDisplayName(sym)} • ${quote.toFixed(4)} • Digit ${digit}`);
            setIsConnected(true);
            setError(null);
          }
        } catch (e) {
          // Ignore parse errors
        }
      };
      
      tickCallbackRef.current = onTickMessage;
      api.connection.addEventListener('message', onTickMessage);
      
      // Also get some historical ticks for immediate data
      try {
        const { ticks_history, error: histError } = await api.send({ 
          ticks_history: sym, 
          count: 100,
          end: 'latest'
        });
        
        if (!histError && ticks_history?.prices) {
          const prices = ticks_history.prices;
          const times = ticks_history.times || [];
          
          const historyData: DigitHistory[] = prices.map((price: number, i: number) => ({
            digit: getLastDigitFromPrice(price),
            timestamp: times[i] ? times[i] * 1000 : Date.now() - (prices.length - i) * 1000,
            price,
          }));
          
          setDigitsHistory(historyData);
          if (historyData.length > 0) {
            setLastDigit(historyData[historyData.length - 1].digit);
          }
          setTicksProcessed(historyData.length);
        }
      } catch (e) {
        console.warn('Could not fetch historical ticks:', e);
      }
      
      setStatus(`Streaming ${getDisplayName(sym)}...`);
      setIsLoading(false);
      
    } catch (e: any) {
      console.error('startTicks error:', e);
      setError(e?.message || 'Failed to connect');
      setStatus(`Error: ${e?.message || 'Connection failed'}`);
      setIsConnected(false);
      setIsLoading(false);
    }
  }, [stopTicks]);
  
  // Initialize API and load symbols
  useEffect(() => {
    const api = generateDerivApiInstance();
    apiRef.current = api;
    
    const init = async () => {
      try {
        setIsLoading(true);
        setStatus('Fetching available markets...');
        
        // Get active symbols
        const { active_symbols, error: asErr } = await api.send({ active_symbols: 'brief' });
        
        if (asErr) throw new Error(asErr.message);
        
        const availableSymbols = (active_symbols || [])
          .filter((s: any) => ALL_MARKETS.includes(s.symbol))
          .map((s: any) => ({
            symbol: s.symbol,
            display_name: getDisplayName(s.symbol),
            market_type: VOLATILITY_1S_MARKETS.includes(s.symbol) ? 'volatility' :
                        VOLATILITY_MARKETS.includes(s.symbol) ? 'volatility' :
                        JUMP_MARKETS.includes(s.symbol) ? 'jump' : 'bearbull'
          }));
        
        // Fill missing symbols
        const finalSymbols = [...availableSymbols];
        for (const sym of ALL_MARKETS) {
          if (!finalSymbols.find(s => s.symbol === sym)) {
            finalSymbols.push({
              symbol: sym,
              display_name: getDisplayName(sym),
              market_type: 'volatility'
            });
          }
        }
        
        setSymbols(finalSymbols);
        
        // Start with default symbol
        const defaultSymbol = finalSymbols.find(s => s.symbol === 'R_100')?.symbol || finalSymbols[0]?.symbol;
        if (defaultSymbol) {
          setSelectedSymbol(defaultSymbol);
          await startTicks(defaultSymbol);
        } else {
          setStatus('No markets available');
          setIsLoading(false);
        }
        
      } catch (e: any) {
        console.error('Init error:', e);
        setError(e?.message || 'Initialization failed');
        setStatus(`Init error: ${e?.message || 'Unknown'}`);
        setIsConnected(false);
        setIsLoading(false);
      }
    };
    
    init();
    
    return () => {
      stopTicks();
      if (apiRef.current) {
        apiRef.current.disconnect?.();
      }
    };
  }, [startTicks, stopTicks]);
  
  // Handle symbol change
  const handleSymbolChange = useCallback(async (symbol: string) => {
    setSelectedSymbol(symbol);
    setIsLoading(true);
    await startTicks(symbol);
  }, [startTicks]);
  
  // Handle digit selection
  const handleDigitSelect = (digit: number) => {
    setSelectedPredictionDigit(digit);
    setStatus(`Selected digit ${digit} for analysis`);
    setTimeout(() => {
      if (status.includes('Selected')) {
        setStatus(`Streaming ${getDisplayName(selectedSymbol)}...`);
      }
    }, 2000);
  };
  
  const currentSymbolDisplay = symbols.find(s => s.symbol === selectedSymbol)?.display_name || selectedSymbol;
  
  return (
    <div className="pro-trader pro-trader-analysis">
      {/* Header */}
      <div className="analysis-header">
        <h1>
          <span className="title-icon">🎯</span>
          Circle Digit Analysis Tool
        </h1>
        <div className={`connection-badge ${isConnected ? 'connected' : 'disconnected'}`}>
          <span className="dot" />
          {isConnected ? 'Live Data' : isLoading ? 'Connecting...' : 'Disconnected'}
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-info">
          <span className="status-label">Current Market:</span>
          <strong>{currentSymbolDisplay}</strong>
          <span className="status-divider">|</span>
          <span className="status-label">Status:</span>
          <span className={`status-text ${error ? 'error' : ''}`}>
            {status}
          </span>
          {error && (
            <>
              <span className="status-divider">|</span>
              <button 
                className="retry-btn"
                onClick={() => startTicks(selectedSymbol)}
              >
                Retry
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="analysis-layout">
        {/* Left Panel - Market Selector */}
        <div className="left-panel">
          <MarketSelector
            symbols={symbols}
            selectedSymbol={selectedSymbol}
            onSymbolChange={handleSymbolChange}
            disabled={isLoading}
          />
          
          {/* Info Card */}
          <div className="info-card">
            <div className="info-title">📊 How It Works</div>
            <div className="info-content">
              <p>The <strong>red arrow</strong> dynamically points to the last digit received.</p>
              <p>Digits are arranged in a circle. The size of each node reflects its frequency.</p>
              <p>Click any digit to select it for pattern analysis.</p>
              <p className="info-tip">💡 Tip: Watch for frequently occurring digits to identify patterns.</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="info-card">
            <div className="info-title">⚡ Quick Stats</div>
            <div className="quick-stats">
              <div className="quick-stat-item">
                <span>Total Ticks</span>
                <strong>{ticksProcessed}</strong>
              </div>
              <div className="quick-stat-item">
                <span>Most Common</span>
                <strong className="highlight">{stats.mostCommon}</strong>
              </div>
              <div className="quick-stat-item">
                <span>Even/Odd</span>
                <strong className={stats.evenPercentage > 50 ? 'even' : 'odd'}>
                  {stats.evenPercentage > 50 ? 'EVEN' : 'ODD'}
                </strong>
              </div>
            </div>
          </div>
        </div>
        
        {/* Center Panel - Digit Circle */}
        <div className="center-panel">
          <div className="circle-card">
            <div className="circle-header">
              <span className="badge">LIVE DIGIT ANALYSIS</span>
              <span className="tick-counter">{ticksProcessed} ticks</span>
            </div>
            
            {isLoading && digitsHistory.length === 0 ? (
              <div className="loading-placeholder">
                <div className="loading-spinner" />
                <span>Loading market data...</span>
              </div>
            ) : (
              <DigitCircle
                lastDigit={lastDigit}
                onDigitSelect={handleDigitSelect}
                selectedDigit={selectedPredictionDigit}
                frequencies={stats.frequency}
              />
            )}
            
            <div className="arrow-legend">
              <div className="legend-item">
                <div className="red-arrow-sample" />
                <span>Moving arrow → points to last digit</span>
              </div>
              <div className="legend-item">
                <div className="size-indicator">
                  <span className="size-dot small" />
                  <span className="size-dot medium" />
                  <span className="size-dot large" />
                </div>
                <span>Node size = frequency</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Stats */}
        <div className="right-panel">
          <StatsPanel
            stats={stats}
            lastDigit={lastDigit}
            ticksProcessed={ticksProcessed}
            recentDigits={recentDigits}
          />
        </div>
      </div>
      
      {/* Embedded Styles */}
      <style jsx>{`
        .pro-trader-analysis {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 1.5rem;
        }
        
        .analysis-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .analysis-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          background: linear-gradient(135deg, #60a5fa, #c084fc);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .title-icon {
          font-size: 2rem;
        }
        
        .connection-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-size: 0.75rem;
          font-weight: 600;
          background: #1e293b;
          border: 1px solid #334155;
        }
        
        .connection-badge.connected .dot {
          background: #22c55e;
          box-shadow: 0 0 6px #22c55e;
        }
        
        .connection-badge.disconnected .dot {
          background: #ef4444;
        }
        
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        
        .status-bar {
          background: #1e293b;
          border-radius: 1rem;
          padding: 0.75rem 1.5rem;
          margin-bottom: 2rem;
          border: 1px solid #334155;
        }
        
        .status-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          font-size: 0.875rem;
          color: #cbd5e1;
        }
        
        .status-label {
          color: #64748b;
        }
        
        .status-divider {
          color: #475569;
        }
        
        .status-text.error {
          color: #ef4444;
        }
        
        .retry-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .retry-btn:hover {
          background: #2563eb;
        }
        
        .analysis-layout {
          display: grid;
          grid-template-columns: 280px 1fr 340px;
          gap: 1.5rem;
        }
        
        @media (max-width: 1200px) {
          .analysis-layout {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
        
        .left-panel, .right-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .center-panel {
          display: flex;
          justify-content: center;
        }
        
        /* Market Selector Styles */
        .market-selector {
          background: #1e293b;
          border-radius: 1.5rem;
          padding: 1.25rem;
          border: 1px solid #334155;
        }
        
        .selector-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #94a3b8;
          font-size: 0.75rem;
          font-weight: 600;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #334155;
        }
        
        .market-group {
          margin-bottom: 1.25rem;
        }
        
        .group-label {
          font-size: 0.7rem;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 0.5rem;
          letter-spacing: 0.5px;
        }
        
        .market-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .market-btn {
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 2rem;
          padding: 0.375rem 0.875rem;
          font-size: 0.75rem;
          font-weight: 500;
          color: #cbd5e1;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .market-btn:hover:not(:disabled) {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        
        .market-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
          box-shadow: 0 0 8px rgba(59,130,246,0.5);
        }
        
        .market-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        /* Info Card */
        .info-card {
          background: #1e293b;
          border-radius: 1rem;
          padding: 1rem;
          border: 1px solid #334155;
        }
        
        .info-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: #94a3b8;
          margin-bottom: 0.75rem;
        }
        
        .info-content {
          font-size: 0.75rem;
          color: #94a3b8;
          line-height: 1.5;
        }
        
        .info-tip {
          margin-top: 0.5rem;
          color: #60a5fa;
        }
        
        .quick-stats {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.5rem;
        }
        
        .quick-stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
        }
        
        .quick-stat-item span {
          color: #64748b;
        }
        
        .quick-stat-item strong {
          color: #cbd5e1;
          font-family: monospace;
        }
        
        .quick-stat-item .highlight {
          color: #60a5fa;
        }
        
        .quick-stat-item .even {
          color: #34d399;
        }
        
        .quick-stat-item .odd {
          color: #fbbf24;
        }
        
        /* Circle Card */
        .circle-card {
          background: #1e293b;
          border-radius: 2rem;
          padding: 1.5rem;
          border: 1px solid #334155;
          box-shadow: 0 25px 40px rgba(0,0,0,0.3);
        }
        
        .circle-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        
        .badge {
          background: #3b82f6;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 2rem;
          font-size: 0.7rem;
          font-weight: 600;
        }
        
        .tick-counter {
          font-size: 0.7rem;
          color: #64748b;
          font-family: monospace;
        }
        
        .loading-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 320px;
          gap: 1rem;
          color: #64748b;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #334155;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .arrow-legend {
          margin-top: 1rem;
          display: flex;
          justify-content: center;
          gap: 1.5rem;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.7rem;
          color: #94a3b8;
        }
        
        .red-arrow-sample {
          width: 20px;
          height: 12px;
          background: #ef4444;
          clip-path: polygon(0% 0%, 100% 50%, 0% 100%);
        }
        
        .size-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .size-dot {
          border-radius: 50%;
          background: #3b82f6;
        }
        
        .size-dot.small {
          width: 8px;
          height: 8px;
          opacity: 0.5;
        }
        
        .size-dot.medium {
          width: 12px;
          height: 12px;
          opacity: 0.7;
        }
        
        .size-dot.large {
          width: 16px;
          height: 16px;
        }
        
        /* Digit Circle Container */
        .digit-circle-container {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .digit-circle-svg {
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.3));
        }
        
        .last-digit-preview {
          margin-top: 1rem;
          text-align: center;
        }
        
        .last-digit-preview .label {
          font-size: 0.7rem;
          color: #64748b;
          display: block;
        }
        
        .digit-value {
          font-size: 2.5rem;
          font-weight: 800;
          font-family: monospace;
          background: linear-gradient(135deg, #ef4444, #f97316);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          display: inline-block;
        }
        
        /* Stats Panel */
        .stats-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .stat-card {
          background: #1e293b;
          border-radius: 1.5rem;
          padding: 1.25rem;
          border: 1px solid #334155;
        }
        
        .stat-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          font-weight: 600;
          color: #94a3b8;
          margin-bottom: 1rem;
        }
        
        .stat-badge {
          font-size: 0.65rem;
          background: #0f172a;
          padding: 0.2rem 0.5rem;
          border-radius: 1rem;
          color: #64748b;
        }
        
        .frequency-bars {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        
        .freq-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.7rem;
        }
        
        .digit-label {
          width: 20px;
          font-weight: 600;
          color: #cbd5e1;
          text-align: center;
        }
        
        .digit-label.last {
          color: #ef4444;
        }
        
        .bar-container {
          flex: 1;
          height: 18px;
          background: #0f172a;
          border-radius: 9px;
          overflow: hidden;
        }
        
        .freq-bar {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #a855f7);
          border-radius: 9px;
          transition: width 0.3s;
        }
        
        .freq-bar.last {
          background: linear-gradient(90deg, #ef4444, #f97316);
        }
        
        .freq-bar.most {
          background: linear-gradient(90deg, #22c55e, #10b981);
        }
        
        .freq-bar.least {
          background: linear-gradient(90deg, #64748b, #475569);
        }
        
        .freq-value {
          width: 30px;
          font-size: 0.7rem;
          color: #cbd5e1;
          text-align: right;
        }
        
        .freq-pct {
          width: 40px;
          font-size: 0.65rem;
          color: #64748b;
          text-align: right;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        .summary-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .summary-label {
          font-size: 0.65rem;
          color: #64748b;
        }
        
        .summary-value {
          font-size: 1.25rem;
          font-weight: 700;
          font-family: monospace;
          color: #cbd5e1;
        }
        
        .summary-value.highlight {
          color: #60a5fa;
        }
        
        .summary-value.even {
          color: #34d399;
        }
        
        .summary-value.odd {
          color: #fbbf24;
        }
        
        .summary-value.over {
          color: #3b82f6;
        }
        
        .summary-value.under {
          color: #fbbf24;
        }
        
        .summary-sub {
          font-size: 0.6rem;
          color: #64748b;
        }
        
        .recent-digits {
          display: flex;
          gap: 0.3rem;
          flex-wrap: wrap;
        }
        
        .recent-digit {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f172a;
          border-radius: 0.5rem;
          font-weight: 700;
          font-family: monospace;
          font-size: 0.9rem;
          color: #cbd5e1;
          border: 1px solid #334155;
        }
        
        .recent-digit.last {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
          box-shadow: 0 0 8px #ef4444;
        }
        
        .recent-digit.even {
          border-bottom: 2px solid #34d399;
        }
        
        .recent-digit.odd {
          border-bottom: 2px solid #fbbf24;
        }
        
        .no-data {
          color: #64748b;
          font-size: 0.7rem;
          padding: 0.5rem;
        }
      `}</style>
    </div>
  );
});

export default TradeUiClone;
