import React, { useState, useEffect, useCallback, useRef } from 'react';

// ==================== STYLES (CSS-in-JS) ====================
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0B0F1C 0%, #0F172A 100%)',
    padding: '24px',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #60A5FA, #C084FC)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    letterSpacing: '-0.3px',
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '40px',
    background: '#1E293B',
    fontSize: '13px',
    fontWeight: '500',
    color: '#CBD5E1',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#22C55E',
    boxShadow: '0 0 6px #22C55E',
  },
  statusBar: {
    background: '#1E293B',
    borderRadius: '20px',
    padding: '12px 20px',
    marginBottom: '28px',
    border: '1px solid #334155',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  statusText: {
    fontSize: '14px',
    color: '#94A3B8',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '300px 1fr 340px',
    gap: '24px',
  },
  gridMobile: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '24px',
  },
  card: {
    background: '#1E293B',
    borderRadius: '28px',
    border: '1px solid #334155',
    padding: '20px',
    backdropFilter: 'blur(2px)',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '1px solid #334155',
    paddingBottom: '12px',
  },
  marketGroup: {
    marginBottom: '20px',
  },
  groupLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: '0.5px',
    marginBottom: '10px',
  },
  buttonGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  marketBtn: {
    background: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '40px',
    padding: '6px 14px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#CBD5E1',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  activeMarketBtn: {
    background: '#3B82F6',
    borderColor: '#3B82F6',
    color: 'white',
    boxShadow: '0 0 8px rgba(59,130,246,0.5)',
  },
  digitCircleWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  svgContainer: {
    width: '100%',
    maxWidth: '360px',
    margin: '0 auto',
  },
  lastDigitBox: {
    marginTop: '20px',
    textAlign: 'center',
  },
  lastDigitLabel: {
    fontSize: '12px',
    color: '#64748B',
  },
  lastDigitValue: {
    fontSize: '48px',
    fontWeight: '800',
    fontFamily: 'monospace',
    background: 'linear-gradient(135deg, #EF4444, #F97316)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  },
  statsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  statBox: {
    background: '#0F172A',
    borderRadius: '20px',
    padding: '16px',
  },
  statTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: '14px',
  },
  freqBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
    fontSize: '13px',
  },
  barBg: {
    flex: 1,
    height: '24px',
    background: '#1E293B',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '12px',
    transition: 'width 0.3s ease',
  },
  digitCircles: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '12px',
  },
  miniCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '16px',
    fontFamily: 'monospace',
    background: '#0F172A',
    border: '1px solid #334155',
  },
  controlRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
    flexWrap: 'wrap',
  },
  input: {
    background: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '40px',
    padding: '8px 16px',
    color: '#F1F5F9',
    fontSize: '14px',
    flex: 1,
  },
  button: {
    background: '#3B82F6',
    border: 'none',
    borderRadius: '40px',
    padding: '8px 20px',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    transition: '0.2s',
  },
  stopBtn: {
    background: '#EF4444',
  },
  connectionInfo: {
    fontSize: '12px',
    color: '#22C55E',
  },
};

// ==================== DIGIT CIRCLE SVG COMPONENT ====================
const DigitCircle = ({ lastDigit, selectedDigit, onSelectDigit, percentages }) => {
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const radius = 130;
  const center = 160;
  
  const getPosition = (index, total) => {
    const angle = (index * 360 / total) - 90;
    const rad = (angle * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad),
    };
  };

  // Find highest and lowest digit percentages
  let maxDigit = -1, minDigit = -1;
  if (percentages) {
    let maxP = -1, minP = 101;
    digits.forEach(d => {
      const p = percentages[d] || 0;
      if (p > maxP) { maxP = p; maxDigit = d; }
      if (p < minP) { minP = p; minDigit = d; }
    });
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="320" height="320" viewBox="0 0 320 320">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx={center} cy={center} r={radius + 8} fill="none" stroke="#2D3A5E" strokeWidth="1.5" strokeDasharray="4 6" />
        <circle cx={center} cy={center} r={radius} fill="#0F172A" stroke="url(#ringGrad)" strokeWidth="2.5" />
        <circle cx={center} cy={center} r="28" fill="rgba(59,130,246,0.15)" stroke="#3B82F6" strokeWidth="1" />
        <text x={center} y={center + 5} textAnchor="middle" fill="#60A5FA" fontSize="11" fontWeight="bold">DIGIT</text>

        {digits.map((digit, idx) => {
          const { x, y } = getPosition(idx, digits.length);
          const isLast = lastDigit === digit;
          const isSelected = selectedDigit === digit;
          const isHighest = maxDigit === digit && percentages;
          const isLowest = minDigit === digit && percentages;
          
          let bgColor = '#1E293B';
          let strokeColor = '#475569';
          if (isSelected) { bgColor = 'rgba(59,130,246,0.4)'; strokeColor = '#3B82F6'; }
          else if (isHighest) { bgColor = 'rgba(34,197,94,0.3)'; strokeColor = '#22C55E'; }
          else if (isLowest) { bgColor = 'rgba(239,68,68,0.3)'; strokeColor = '#EF4444'; }
          else if (isLast) { bgColor = 'rgba(239,68,68,0.2)'; strokeColor = '#EF4444'; }

          return (
            <g key={digit} onClick={() => onSelectDigit?.(digit)} style={{ cursor: 'pointer' }}>
              <circle cx={x} cy={y} r="22" fill={bgColor} stroke={strokeColor} strokeWidth="2" />
              <text x={x} y={y + 5} textAnchor="middle" fill={isLast ? '#EF4444' : '#CBD5E1'} fontSize="15" fontWeight={isLast ? 'bold' : '600'}>{digit}</text>
              {percentages && (
                <text x={x} y={y + 20} textAnchor="middle" fill="#64748B" fontSize="8">{percentages[digit]?.toFixed(0) || 0}%</text>
              )}
            </g>
          );
        })}

        {/* Animated arrow pointing to last digit */}
        {lastDigit !== null && (
          (() => {
            const idx = lastDigit;
            const { x, y } = getPosition(idx, 10);
            const angle = (idx * 36) - 90;
            const rad = (angle * Math.PI) / 180;
            const arrowX = center + (radius - 38) * Math.cos(rad);
            const arrowY = center + (radius - 38) * Math.sin(rad);
            return (
              <g transform={`translate(${arrowX}, ${arrowY}) rotate(${angle + 90})`}>
                <polygon points="0,-14 -6,6 0,2 6,6" fill="#EF4444" stroke="#DC2626" strokeWidth="1">
                  <animateTransform attributeName="transform" type="translate" values="0,-3;0,4;0,-3" dur="0.8s" repeatCount="indefinite" additive="sum" />
                </polygon>
              </g>
            );
          })()
        )}
      </svg>
      <div style={styles.lastDigitBox}>
        <div style={styles.lastDigitLabel}>LAST DIGIT</div>
        <div style={styles.lastDigitValue}>{lastDigit !== null ? lastDigit : '—'}</div>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
const TradeUiClone = () => {
  const [symbol, setSymbol] = useState('R_10');      // Volatility 10 (1s) index
  const [ticks, setTicks] = useState([]);
  const [maxTicks, setMaxTicks] = useState(1000);
  const [isRunning, setIsRunning] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [lastDigit, setLastDigit] = useState(null);
  const [selectedDigit, setSelectedDigit] = useState(null);
  const [digitStats, setDigitStats] = useState(Array(10).fill(0));
  const [evenOdd, setEvenOdd] = useState({ even: 0, odd: 0 });
  const [riseFall, setRiseFall] = useState({ rise: 0, fall: 0, unchanged: 0 });
  const [underOver5, setUnderOver5] = useState({ under: 0, over: 0 });
  const [percentages, setPercentages] = useState(Array(10).fill(0));
  const [isMobile, setIsMobile] = useState(false);
  
  const wsRef = useRef(null);
  const tickBufferRef = useRef([]);

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1000);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper: get symbol code for Deriv API
  const getSymbolCode = (sym) => {
    const map = {
      'R_10': '1HZ10V',
      'R_25': '1HZ25V',
      'R_50': '1HZ50V',
      'R_75': '1HZ75V',
      'R_100': '1HZ100V',
      '1S_10': '1S10V',
      '1S_25': '1S25V',
      '1S_50': '1S50V',
    };
    return map[sym] || '1HZ10V';
  };

  // Analyze ticks array
  const analyzeTicks = useCallback((tickList) => {
    if (tickList.length === 0) return;
    
    // Extract last digit from each tick price
    const lastDigits = tickList.map(tick => {
      const price = tick.quote;
      const digit = Math.abs(Math.floor(price) % 10);
      return digit;
    });
    
    // Frequency 0-9
    const freq = Array(10).fill(0);
    lastDigits.forEach(d => freq[d]++);
    const total = lastDigits.length;
    const percent = freq.map(f => (f / total) * 100);
    setPercentages(percent);
    setDigitStats(freq);
    
    // Even vs Odd
    let evenCount = 0, oddCount = 0;
    lastDigits.forEach(d => {
      if (d % 2 === 0) evenCount++;
      else oddCount++;
    });
    setEvenOdd({ even: (evenCount/total)*100, odd: (oddCount/total)*100 });
    
    // Rise vs Fall (compare consecutive ticks)
    let rise = 0, fall = 0, unchanged = 0;
    for (let i = 1; i < tickList.length; i++) {
      const prev = tickList[i-1].quote;
      const curr = tickList[i].quote;
      if (curr > prev) rise++;
      else if (curr < prev) fall++;
      else unchanged++;
    }
    const totalComp = rise + fall + unchanged;
    setRiseFall({
      rise: totalComp ? (rise/totalComp)*100 : 0,
      fall: totalComp ? (fall/totalComp)*100 : 0,
      unchanged: totalComp ? (unchanged/totalComp)*100 : 0
    });
    
    // Under 5 vs Over 5 (digit 0-4 vs 5-9)
    let under = 0, over = 0;
    lastDigits.forEach(d => {
      if (d < 5) under++;
      else over++;
    });
    setUnderOver5({ under: (under/total)*100, over: (over/total)*100 });
  }, []);

  // Update stats when ticks change
  useEffect(() => {
    if (ticks.length > 0) {
      analyzeTicks(ticks);
      // update last digit
      const latest = ticks[ticks.length-1];
      if (latest) {
        const digit = Math.abs(Math.floor(latest.quote) % 10);
        setLastDigit(digit);
      }
    }
  }, [ticks, analyzeTicks]);

  // WebSocket connection and tick subscription
  useEffect(() => {
    if (!isRunning) {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        // unsubscribe
        wsRef.current.close();
      }
      setConnectionStatus('Stopped');
      return;
    }

    const wsUrl = 'wss://ws.binaryws.com/websockets/v3?app_id=1089';
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    
    ws.onopen = () => {
      setConnectionStatus('Connected');
      const symbolCode = getSymbolCode(symbol);
      const subscribeMsg = {
        ticks: symbolCode,
        subscribe: 1
      };
      ws.send(JSON.stringify(subscribeMsg));
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.msg_type === 'tick' && data.tick) {
          const newTick = {
            quote: data.tick.quote,
            epoch: data.tick.epoch,
            symbol: data.tick.symbol
          };
          tickBufferRef.current = [newTick, ...tickBufferRef.current];
          // Keep only maxTicks latest
          if (tickBufferRef.current.length > maxTicks) {
            tickBufferRef.current = tickBufferRef.current.slice(0, maxTicks);
          }
          setTicks([...tickBufferRef.current]);
        }
        if (data.error) {
          console.error('API error:', data.error);
          setConnectionStatus(`Error: ${data.error.message}`);
        }
      } catch (err) {
        console.warn('Parse error', err);
      }
    };
    
    ws.onerror = (err) => {
      console.error('WebSocket error', err);
      setConnectionStatus('Disconnected');
    };
    
    ws.onclose = () => {
      setConnectionStatus('Disconnected');
    };
    
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [isRunning, symbol, maxTicks]);

  // Change symbol -> reset ticks
  const handleSymbolChange = (newSym) => {
    setSymbol(newSym);
    tickBufferRef.current = [];
    setTicks([]);
    setLastDigit(null);
    setDigitStats(Array(10).fill(0));
    setPercentages(Array(10).fill(0));
    // reconnect will happen via effect
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
    setTimeout(() => {
      if (isRunning) {
        const ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=1089');
        wsRef.current = ws;
        // re-trigger subscription logic (simplified: effect will re-run)
      }
    }, 100);
  };

  const toggleRunning = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      // restart: reset buffer
      tickBufferRef.current = [];
      setTicks([]);
    }
  };

  const handleMaxTicksChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0 && val <= 5000) {
      setMaxTicks(val);
      // Trim current ticks
      if (tickBufferRef.current.length > val) {
        tickBufferRef.current = tickBufferRef.current.slice(0, val);
        setTicks([...tickBufferRef.current]);
      }
    }
  };

  // Get display symbol name
  const getDisplayName = (sym) => {
    const names = {
      'R_10': 'Volatility 10 (1s) Index',
      'R_25': 'Volatility 25 (1s) Index',
      'R_50': 'Volatility 50 (1s) Index',
      'R_75': 'Volatility 75 (1s) Index',
      'R_100': 'Volatility 100 (1s) Index',
      '1S_10': 'Jump 10 Index',
      '1S_25': 'Jump 25 Index',
      '1S_50': 'Jump 50 Index',
    };
    return names[sym] || sym;
  };

  const currentMarketName = getDisplayName(symbol);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📈 Deriv Synth Analyzer</h1>
        <div style={styles.badge}>
          <span style={styles.dot}></span>
          <span>{connectionStatus === 'Connected' ? 'LIVE DATA' : connectionStatus}</span>
        </div>
      </div>

      <div style={styles.statusBar}>
        <div style={styles.statusText}>
          <strong>Market:</strong> {currentMarketName} &nbsp;|&nbsp;
          <strong>Ticks stored:</strong> {ticks.length}/{maxTicks} &nbsp;|&nbsp;
          <strong>Last tick digit:</strong> {lastDigit !== null ? lastDigit : '—'}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input 
            type="number" 
            value={maxTicks} 
            onChange={handleMaxTicksChange}
            min="100"
            max="5000"
            step="100"
            style={{ width: '100px', background: '#0F172A', border: '1px solid #334155', borderRadius: '20px', padding: '6px 12px', color: 'white' }}
          />
          <button onClick={toggleRunning} style={{ ...styles.button, ...(!isRunning ? {} : styles.stopBtn), background: isRunning ? '#EF4444' : '#22C55E' }}>
            {isRunning ? '⏸ Stop' : '▶ Start'}
          </button>
        </div>
      </div>

      <div style={isMobile ? styles.gridMobile : styles.grid}>
        {/* LEFT PANEL - MARKET SELECTOR & CONTROLS */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>🎯 Volatility Indices</div>
          <div style={styles.marketGroup}>
            <div style={styles.groupLabel}>VOLATILITY (1s)</div>
            <div style={styles.buttonGroup}>
              {['R_10', 'R_25', 'R_50', 'R_75', 'R_100'].map(s => (
                <button
                  key={s}
                  onClick={() => handleSymbolChange(s)}
                  style={{ ...styles.marketBtn, ...(symbol === s ? styles.activeMarketBtn : {}) }}
                >
                  {s.replace('R_', 'Vol ')} 
                </button>
              ))}
            </div>
          </div>
          <div style={styles.marketGroup}>
            <div style={styles.groupLabel}>JUMP INDICES</div>
            <div style={styles.buttonGroup}>
              {['1S_10', '1S_25', '1S_50'].map(s => (
                <button
                  key={s}
                  onClick={() => handleSymbolChange(s)}
                  style={{ ...styles.marketBtn, ...(symbol === s ? styles.activeMarketBtn : {}) }}
                >
                  {s.replace('1S_', 'Jump ')}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginTop: '20px', fontSize: '12px', color: '#64748B', borderTop: '1px solid #334155', paddingTop: '16px' }}>
            <div>📊 <strong>Analysis Info</strong></div>
            <div style={{ marginTop: '8px' }}>• Highest digit → <span style={{ color: '#22C55E' }}>Green</span></div>
            <div>• Lowest digit → <span style={{ color: '#EF4444' }}>Red</span></div>
            <div>• Selected digit → <span style={{ color: '#3B82F6' }}>Blue</span></div>
            <div>• Red arrow → points to last digit</div>
          </div>
        </div>

        {/* CENTER PANEL - DIGIT CIRCLE */}
        <div style={{ ...styles.card, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ background: '#3B82F6', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>LIVE DIGIT MAP</span>
            <span style={{ fontSize: '11px', color: '#64748B' }}>1000 ticks rolling</span>
          </div>
          <DigitCircle 
            lastDigit={lastDigit}
            selectedDigit={selectedDigit}
            onSelectDigit={(d) => setSelectedDigit(d)}
            percentages={percentages}
          />
          <div style={{ marginTop: '12px', fontSize: '12px', color: '#94A3B8', textAlign: 'center' }}>
            💡 Click any digit to highlight (blue)
          </div>
        </div>

        {/* RIGHT PANEL - STATISTICS SECTION */}
        <div style={styles.statsGrid}>
          {/* Digit frequency bars */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>🔢 Digit Frequency (0-9)</div>
            <div>
              {digitStats.map((freq, i) => {
                const total = ticks.length || 1;
                const pct = (freq / total) * 100;
                let barColor = '#3B82F6';
                if (percentages[i] === Math.max(...percentages) && percentages[i] > 0) barColor = '#22C55E';
                if (percentages[i] === Math.min(...percentages.filter(p => p > 0)) && percentages[i] > 0 && Math.min(...percentages) !== Math.max(...percentages)) barColor = '#EF4444';
                if (selectedDigit === i) barColor = '#3B82F6';
                return (
                  <div key={i} style={styles.freqBar}>
                    <span style={{ width: '24px', fontWeight: 'bold', color: lastDigit === i ? '#EF4444' : '#CBD5E1' }}>{i}</span>
                    <div style={styles.barBg}>
                      <div style={{ ...styles.barFill, width: `${pct}%`, background: barColor }} />
                    </div>
                    <span style={{ width: '45px', fontSize: '12px' }}>{freq} ({pct.toFixed(1)}%)</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Even/Odd, Rise/Fall, Under/Over */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>📈 Probability Stats</div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Even vs Odd</span>
                <div><span style={{ color: evenOdd.even > evenOdd.odd ? '#22C55E' : '#EF4444' }}>Even {evenOdd.even.toFixed(1)}%</span>  |  <span style={{ color: evenOdd.odd > evenOdd.even ? '#22C55E' : '#EF4444' }}>Odd {evenOdd.odd.toFixed(1)}%</span></div>
              </div>
              <div style={{ background: '#0F172A', height: '8px', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${evenOdd.even}%`, background: '#3B82F6' }} />
                <div style={{ width: `${evenOdd.odd}%`, background: '#A855F7' }} />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Rise vs Fall</span>
                <div><span style={{ color: riseFall.rise > riseFall.fall ? '#22C55E' : '#EF4444' }}>Rise {riseFall.rise.toFixed(1)}%</span>  |  <span style={{ color: riseFall.fall > riseFall.rise ? '#22C55E' : '#EF4444' }}>Fall {riseFall.fall.toFixed(1)}%</span></div>
              </div>
              <div style={{ background: '#0F172A', height: '8px', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${riseFall.rise}%`, background: '#22C55E' }} />
                <div style={{ width: `${riseFall.fall}%`, background: '#EF4444' }} />
                <div style={{ width: `${riseFall.unchanged}%`, background: '#64748B' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Under 5 vs Over 5</span>
                <div><span style={{ color: underOver5.under > underOver5.over ? '#22C55E' : '#EF4444' }}>&lt;5 {underOver5.under.toFixed(1)}%</span>  |  <span style={{ color: underOver5.over > underOver5.under ? '#22C55E' : '#EF4444' }}>&gt;=5 {underOver5.over.toFixed(1)}%</span></div>
              </div>
              <div style={{ background: '#0F172A', height: '8px', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${underOver5.under}%`, background: '#F59E0B' }} />
                <div style={{ width: `${underOver5.over}%`, background: '#8B5CF6' }} />
              </div>
            </div>
          </div>

          {/* Recent digits preview */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>⏱ Recent 10 Digits</div>
            <div style={styles.digitCircles}>
              {ticks.slice(-10).reverse().map((tick, idx) => {
                const dig = Math.abs(Math.floor(tick.quote) % 10);
                return (
                  <div key={idx} style={{ ...styles.miniCircle, background: dig === lastDigit ? '#EF4444' : '#0F172A', color: dig === lastDigit ? 'white' : '#CBD5E1', border: dig === lastDigit ? '1px solid #EF4444' : '1px solid #334155' }}>
                    {dig}
                  </div>
                );
              })}
              {ticks.length === 0 && <span style={{ color: '#64748B', fontSize: '13px' }}>No ticks yet. Start stream.</span>}
            </div>
            <div style={{ marginTop: '12px', fontSize: '11px', color: '#475569', textAlign: 'center' }}>
              Total ticks analyzed: {ticks.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeUiClone;
