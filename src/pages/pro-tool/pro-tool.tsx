import React, { useEffect, useRef, useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, ArrowDown, Hash, Sigma, Dice5, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { localize } from '@deriv-com/translations';
import { generateDerivApiInstance, V2GetActiveClientId, V2GetActiveToken } from '@/external/bot-skeleton/services/api/appId';
import { useStore } from '@/hooks/useStore';
import './pro-tool.scss';

// ==================== TYPES ====================
interface Symbol {
  symbol: string;
  display_name: string;
  market_type: 'volatility' | 'jump' | 'bearbull';
}

interface DigitHistory {
  digit: number;
  timestamp: number;
}

// ==================== MARKET LISTS ====================
const VOLATILITY_MARKETS: string[] = ['10_R', '25_R', '50_R', '75_R', '100_R'];
const JUMP_MARKETS: string[] = ['10_1S', '15_1S', '25_1S', '30_1S', '50_1S', '75_1S', '100_1S'];
const BEAR_BULL_MARKETS: string[] = ['BEAR', 'BULL']; // Synthetic bear/bull indices

const ALL_MARKETS = [...VOLATILITY_MARKETS, ...JUMP_MARKETS, ...BEAR_BULL_MARKETS];

// ==================== DIGIT CIRCLE COMPONENT ====================
interface DigitCircleProps {
  lastDigit: number | null;
  onDigitSelect?: (digit: number) => void;
  selectedDigit?: number;
}

const DigitCircle: React.FC<DigitCircleProps> = ({ lastDigit, onDigitSelect, selectedDigit }) => {
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const radius = 140;
  const center = 160;
  
  // Calculate position for each digit on a circle
  const getPosition = (index: number, total: number) => {
    const angle = (index * 360 / total) - 90; // Start from top (-90 deg)
    const radian = (angle * Math.PI) / 180;
    const x = center + radius * Math.cos(radian);
    const y = center + radius * Math.sin(radian);
    return { x, y, angle };
  };

  return (
    <div className="digit-circle-container">
      <svg width="320" height="320" viewBox="0 0 320 320" className="digit-circle-svg">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius + 15}
          fill="none"
          stroke="rgba(59,130,246,0.15)"
          strokeWidth="2"
          strokeDasharray="4 6"
        />
        
        {/* Main circle border */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="rgba(15,25,45,0.95)"
          stroke="url(#circleGradient)"
          strokeWidth="3"
        />
        
        {/* Gradient definition */}
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
        </defs>
        
        {/* Center decorative circle */}
        <circle
          cx={center}
          cy={center}
          r="28"
          fill="rgba(59,130,246,0.15)"
          stroke="rgba(59,130,246,0.4)"
          strokeWidth="1.5"
        />
        <text
          x={center}
          y={center + 5}
          textAnchor="middle"
          fill="#60a5fa"
          fontSize="12"
          fontWeight="bold"
        >
          DIGIT
        </text>
        
        {/* Digit buttons on circle */}
        {digits.map((digit, idx) => {
          const { x, y, angle } = getPosition(idx, digits.length);
          const isLast = lastDigit === digit;
          const isSelected = selectedDigit === digit;
          
          return (
            <g
              key={digit}
              onClick={() => onDigitSelect?.(digit)}
              style={{ cursor: onDigitSelect ? 'pointer' : 'default' }}
            >
              {/* Glow effect for last digit */}
              {isLast && (
                <circle
                  cx={x}
                  cy={y}
                  r="24"
                  fill="rgba(239,68,68,0.25)"
                  filter="url(#glow)"
                >
                  <animate
                    attributeName="r"
                    values="20;28;20"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              
              {/* Digit circle background */}
              <circle
                cx={x}
                cy={y}
                r="20"
                fill={isSelected ? "rgba(59,130,246,0.3)" : (isLast ? "rgba(239,68,68,0.2)" : "rgba(30,45,65,0.9)")}
                stroke={isSelected ? "#3b82f6" : (isLast ? "#ef4444" : "rgba(59,130,246,0.5)")}
                strokeWidth={isLast || isSelected ? "2.5" : "1.5"}
              />
              
              {/* Digit text */}
              <text
                x={x}
                y={y + 5}
                textAnchor="middle"
                fill={isLast ? "#ef4444" : (isSelected ? "#60a5fa" : "#94a3b8")}
                fontSize="16"
                fontWeight={isLast ? "bold" : "normal"}
                fontFamily="monospace"
              >
                {digit}
              </text>
            </g>
          );
        })}
        
        {/* RED ARROW POINTING to the last digit - DYNAMIC MOVEMENT */}
        {lastDigit !== null && (() => {
          const idx = lastDigit;
          const { x, y, angle } = getPosition(idx, 10);
          // Arrow angle pointing toward the digit
          const arrowAngle = angle + 180;
          const arrowX = center + (radius - 35) * Math.cos((arrowAngle * Math.PI) / 180);
          const arrowY = center + (radius - 35) * Math.sin((arrowAngle * Math.PI) / 180);
          
          return (
            <g transform={`translate(${arrowX}, ${arrowY}) rotate(${arrowAngle + 90})`}>
              <polygon
                points="0,-18 -8,8 0,3 8,8"
                fill="#ef4444"
                stroke="#dc2626"
                strokeWidth="1"
              >
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,-2;0,4;0,-2"
                  dur="0.8s"
                  repeatCount="indefinite"
                  additive="sum"
                />
              </polygon>
            </g>
          );
        })()}
        
        {/* Center arrow indicator text */}
        {lastDigit !== null && (
          <text
            x={center}
            y={center + 28}
            textAnchor="middle"
            fill="#ef4444"
            fontSize="10"
            fontWeight="bold"
          >
            ▼ LAST
          </text>
        )}
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

// ==================== MARKET SELECTOR COMPONENT ====================
interface MarketSelectorProps {
  symbols: Symbol[];
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
}

const MarketSelector: React.FC<MarketSelectorProps> = ({ symbols, selectedSymbol, onSymbolChange }) => {
  const groupedSymbols = {
    'Volatility (R)': symbols.filter(s => VOLATILITY_MARKETS.includes(s.symbol)),
    'Jump (1S)': symbols.filter(s => JUMP_MARKETS.includes(s.symbol)),
    'Bear / Bull': symbols.filter(s => BEAR_BULL_MARKETS.includes(s.symbol)),
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
                  >
                    {sym.display_name || sym.symbol}
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
  digitsHistory: DigitHistory[];
  lastDigit: number | null;
  ticksProcessed: number;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ digitsHistory, lastDigit, ticksProcessed }) => {
  // Calculate digit frequencies
  const frequencies = Array(10).fill(0);
  digitsHistory.forEach(h => frequencies[h.digit]++);
  const total = digitsHistory.length || 1;
  
  // Last 10 digits
  const last10 = digitsHistory.slice(-10).map(h => h.digit);
  
  return (
    <div className="stats-panel">
      <div className="stat-card">
        <div className="stat-title">Digit Frequency</div>
        <div className="frequency-bars">
          {frequencies.map((freq, i) => (
            <div key={i} className="freq-item">
              <span className="digit-label">{i}</span>
              <div className="bar-container">
                <div 
                  className={`freq-bar ${lastDigit === i ? 'last' : ''}`}
                  style={{ width: `${(freq / total) * 100}%` }}
                />
              </div>
              <span className="freq-value">{freq}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-title">Recent Digits</div>
        <div className="recent-digits">
          {last10.map((digit, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`recent-digit ${digit === lastDigit ? 'last' : ''}`}
            >
              {digit}
            </motion.div>
          ))}
          {last10.length === 0 && <span className="no-data">No ticks yet</span>}
        </div>
        <div className="stat-info">
          <span>Total Ticks: {ticksProcessed}</span>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
const TradeUiClone = observer(() => {
  const { run_panel, transactions } = useStore();
  const apiRef = useRef<any>(null);
  const tickStreamIdRef = useRef<string | null>(null);
  
  // Trading state
  const [symbols, setSymbols] = useState<Symbol[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('25_R');
  const [account_currency, setAccountCurrency] = useState('USD');
  const [lastDigit, setLastDigit] = useState<number | null>(null);
  const [ticksProcessed, setTicksProcessed] = useState(0);
  const [digitsHistory, setDigitsHistory] = useState<DigitHistory[]>([]);
  const [status, setStatus] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  
  // Selected digit for prediction (optional, for future trading)
  const [selectedPredictionDigit, setSelectedPredictionDigit] = useState<number | undefined>(undefined);

  // Helper to get display name for symbol
  const getDisplayName = (sym: string): string => {
    if (VOLATILITY_MARKETS.includes(sym)) return `${sym} Volatility`;
    if (JUMP_MARKETS.includes(sym)) return `${sym} Jump`;
    if (sym === 'BEAR') return 'Bear Market';
    if (sym === 'BULL') return 'Bull Market';
    return sym;
  };

  // API initialization
  useEffect(() => {
    const api = generateDerivApiInstance();
    apiRef.current = api;
    
    const init = async () => {
      try {
        // Build symbol list from required markets
        const requiredSymbols = [...ALL_MARKETS];
        const { active_symbols, error: asErr } = await api.send({ active_symbols: 'brief' });
        if (asErr) throw asErr;
        
        const availableSymbols = (active_symbols || [])
          .filter((s: any) => requiredSymbols.includes(s.symbol))
          .map((s: any) => ({
            symbol: s.symbol,
            display_name: getDisplayName(s.symbol),
            market_type: VOLATILITY_MARKETS.includes(s.symbol) ? 'volatility' : 
                        JUMP_MARKETS.includes(s.symbol) ? 'jump' : 'bearbull'
          }));
        
        // If some symbols not found, create fallback entries
        const finalSymbols = [...availableSymbols];
        for (const sym of requiredSymbols) {
          if (!finalSymbols.find(s => s.symbol === sym)) {
            finalSymbols.push({
              symbol: sym,
              display_name: getDisplayName(sym),
              market_type: VOLATILITY_MARKETS.includes(sym) ? 'volatility' : 
                          JUMP_MARKETS.includes(sym) ? 'jump' : 'bearbull'
            });
          }
        }
        
        setSymbols(finalSymbols);
        if (finalSymbols.length > 0 && !selectedSymbol) {
          setSelectedSymbol(finalSymbols[0].symbol);
        }
        
        // Start ticks with first symbol
        if (finalSymbols[0]?.symbol) {
          await startTicks(finalSymbols[0].symbol);
        }
        
        setStatus('Ready - Connected');
        setIsConnected(true);
      } catch (e: any) {
        console.error('ProTrader init error', e);
        setStatus(`Init error: ${e?.message || 'Unknown'}`);
        setIsConnected(false);
      }
    };
    
    init();
    
    return () => {
      stopTicks();
      if (apiRef.current) {
        apiRef.current.disconnect?.();
      }
    };
  }, []);

  // Start tick stream
  const startTicks = async (sym: string) => {
    stopTicks();
    setDigitsHistory([]);
    setLastDigit(null);
    setTicksProcessed(0);
    
    try {
      // Authorize if needed for tick stream
      const token = V2GetActiveToken();
      if (token) {
        try {
          await apiRef.current.authorize(token);
        } catch (e) { /* not critical for ticks */ }
      }
      
      const { subscription, error } = await apiRef.current.send({ ticks: sym, subscribe: 1 });
      if (error) throw error;
      if (subscription?.id) tickStreamIdRef.current = subscription.id;
      
      const onMsg = (evt: MessageEvent) => {
        try {
          const data = JSON.parse(evt.data as any);
          if (data?.msg_type === 'tick' && data?.tick?.symbol === sym) {
            const quote = data.tick.quote;
            const digit = Number(String(quote).slice(-1));
            const timestamp = Date.now();
            
            setLastDigit(digit);
            setDigitsHistory(prev => [...prev.slice(-49), { digit, timestamp }]); // Keep last 50
            setTicksProcessed(prev => prev + 1);
            setStatus(`Last tick: ${quote} → digit ${digit}`);
          }
        } catch {}
      };
      
      apiRef.current?.connection?.addEventListener('message', onMsg);
      setStatus(`Streaming ${sym}...`);
    } catch (e: any) {
      console.error('startTicks error', e);
      setStatus(`Tick stream error: ${e?.message || 'Unknown'}`);
    }
  };

  // Stop tick stream
  const stopTicks = () => {
    if (tickStreamIdRef.current && apiRef.current) {
      apiRef.current.forget?.({ forget: tickStreamIdRef.current });
      tickStreamIdRef.current = null;
    }
  };

  // Handle symbol change
  const handleSymbolChange = useCallback(async (symbol: string) => {
    setSelectedSymbol(symbol);
    await startTicks(symbol);
  }, []);

  // Handle digit click for prediction (analysis mode - just for UI feedback)
  const handleDigitSelect = (digit: number) => {
    setSelectedPredictionDigit(digit);
    setStatus(`Selected digit ${digit} for analysis`);
    setTimeout(() => {
      if (status.includes('Selected')) setStatus(`Streaming ${selectedSymbol}...`);
    }, 2000);
  };

  const currentSymbolDisplay = symbols.find(s => s.symbol === selectedSymbol)?.display_name || selectedSymbol;

  return (
    <div className="pro-trader pro-trader-analysis">
      <div className="analysis-header">
        <h1>
          <span className="title-icon">🎯</span>
          Circle Digit Analysis Tool
        </h1>
        <div className={`connection-badge ${isConnected ? 'connected' : 'disconnected'}`}>
          <span className="dot" />
          {isConnected ? 'Live Data' : 'Reconnecting...'}
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-info">
          <span className="status-label">Current Market:</span>
          <strong>{currentSymbolDisplay}</strong>
          <span className="status-divider">|</span>
          <span className="status-label">Status:</span>
          <span className={`status-text ${status.includes('Error') ? 'error' : ''}`}>
            {status || 'Initializing...'}
          </span>
        </div>
      </div>
      
      <div className="analysis-layout">
        {/* Left Panel - Market Selector */}
        <div className="left-panel">
          <MarketSelector
            symbols={symbols}
            selectedSymbol={selectedSymbol}
            onSymbolChange={handleSymbolChange}
          />
          
          {/* Mini info */}
          <div className="info-card">
            <div className="info-title">📊 Analysis Info</div>
            <div className="info-content">
              <p>The red arrow dynamically points to the <strong>last digit</strong> received from the tick stream.</p>
              <p>Digits are arranged in a circular layout for easy visualization of digit patterns.</p>
              <p>Click any digit to select it for pattern analysis.</p>
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
            <DigitCircle
              lastDigit={lastDigit}
              onDigitSelect={handleDigitSelect}
              selectedDigit={selectedPredictionDigit}
            />
            <div className="arrow-legend">
              <div className="legend-item">
                <div className="red-arrow-sample" />
                <span>Moving arrow → points to last digit</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Stats */}
        <div className="right-panel">
          <StatsPanel
            digitsHistory={digitsHistory}
            lastDigit={lastDigit}
            ticksProcessed={ticksProcessed}
          />
        </div>
      </div>
      
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
        }
        
        .connection-badge.connected .dot {
          background: #22c55e;
          box-shadow: 0 0 6px #22c55e;
        }
        
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ef4444;
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
          gap: 1rem;
          flex-wrap: wrap;
          font-size: 0.875rem;
          color: #cbd5e1;
        }
        
        .status-divider {
          color: #475569;
        }
        
        .status-text.error {
          color: #ef4444;
        }
        
        .analysis-layout {
          display: grid;
          grid-template-columns: 280px 1fr 320px;
          gap: 1.5rem;
        }
        
        @media (max-width: 1100px) {
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
        
        .market-btn:hover {
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
        
        .center-panel {
          display: flex;
          justify-content: center;
        }
        
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
        
        .arrow-legend {
          margin-top: 1rem;
          text-align: center;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          justify-content: center;
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
        
        .digit-circle-container {
          display: flex;
          flex-direction: column;
          align-items: center;
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
          font-size: 0.8rem;
          font-weight: 600;
          color: #94a3b8;
          margin-bottom: 1rem;
        }
        
        .frequency-bars {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
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
        }
        
        .bar-container {
          flex: 1;
          height: 20px;
          background: #0f172a;
          border-radius: 10px;
          overflow: hidden;
        }
        
        .freq-bar {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #a855f7);
          border-radius: 10px;
          transition: width 0.3s;
        }
        
        .freq-bar.last {
          background: linear-gradient(90deg, #ef4444, #f97316);
        }
        
        .freq-value {
          width: 30px;
          font-size: 0.7rem;
          color: #64748b;
        }
        
        .recent-digits {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .recent-digit {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f172a;
          border-radius: 0.5rem;
          font-weight: 700;
          font-family: monospace;
          font-size: 1rem;
          color: #cbd5e1;
        }
        
        .recent-digit.last {
          background: #ef4444;
          color: white;
          box-shadow: 0 0 8px #ef4444;
        }
        
        .stat-info {
          margin-top: 1rem;
          font-size: 0.7rem;
          color: #64748b;
          text-align: center;
        }
        
        .no-data {
          color: #64748b;
          font-size: 0.7rem;
        }
      `}</style>
    </div>
  );
});

export default TradeUiClone;
