import React, { useState, useMemo } from 'react';
import { CheckCircle2, Circle, TrendingUp, Target, Clock, Calendar, ExternalLink, AlertTriangle, TrendingDown, Calculator } from 'lucide-react';

const TradingChecklist = () => {
  const [showNews, setShowNews] = useState(false);
  const [showWeights, setShowWeights] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [newsData, setNewsData] = useState(null);
  const [loadingNews, setLoadingNews] = useState(false);
  const [checkedItems, setCheckedItems] = useState(new Set());
  const [checkedIndicators, setCheckedIndicators] = useState(new Set());
  const [history, setHistory] = useState(JSON.parse(localStorage.getItem('tradingHistory')) || []);
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', '9-17'

  // Získání aktuálního týdne
  const getCurrentWeek = () => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 7));
    
    const formatDate = (date) => {
      return date.toLocaleDateString('cs-CZ', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    };
    
    return `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
  };

  // Simulace dat z více zdrojů
  const mockForexFactoryData = useMemo(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const formatDate = (date) => {
      return date.toLocaleDateString('cs-CZ', { 
        day: '2-digit', 
        month: '2-digit'
      });
    };

    return [
      {
        id: 1,
        time: '15:30',
        date: formatDate(today),
        currency: 'USD',
        impact: 'High',
        event: 'Non-Farm Payrolls',
        actual: '165K',
        forecast: '150K',
        previous: '142K',
        sentiment: 'bullish',
        result: 'bullish',
        affectedPairs: ['EUR/USD', 'GBP/USD', 'USD/JPY'],
        description: 'Klíčový ukazatel trhu práce',
        hasOccurred: true,
        sources: {
          forexFactory: { sentiment: 'bullish', confidence: 85 },
          tradingEconomics: { sentiment: 'bullish', confidence: 90 },
          investing: { sentiment: 'bullish', confidence: 88 },
          myfxbook: { sentiment: 'bullish', confidence: 82 }
        }
      },
      {
        id: 2,
        time: '14:45',
        date: formatDate(today),
        currency: 'EUR',
        impact: 'Medium',
        event: 'ECB Interest Rate Decision',
        actual: '4.25%',
        forecast: '4.50%',
        previous: '4.50%',
        sentiment: 'neutral',
        result: 'bearish',
        affectedPairs: ['EUR/USD'],
        description: 'Rozhodnutí o úrokových sazbách ECB',
        hasOccurred: true,
        sources: {
          forexFactory: { sentiment: 'bearish', confidence: 78 },
          tradingEconomics: { sentiment: 'bearish', confidence: 85 },
          investing: { sentiment: 'neutral', confidence: 65 },
          myfxbook: { sentiment: 'bearish', confidence: 80 }
        }
      },
      {
        id: 3,
        time: '19:30',
        date: formatDate(today),
        currency: 'USD',
        impact: 'High',
        event: 'Federal Reserve Speech',
        actual: null,
        forecast: null,
        previous: null,
        sentiment: 'neutral',
        result: null,
        affectedPairs: ['EUR/USD', 'GBP/USD', 'USD/JPY'],
        description: 'Projev předsedy Fed Jerome Powell',
        hasOccurred: false,
        sources: {
          forexFactory: { sentiment: 'neutral', confidence: 70 },
          tradingEconomics: { sentiment: 'bullish', confidence: 75 },
          investing: { sentiment: 'neutral', confidence: 68 },
          myfxbook: { sentiment: 'bullish', confidence: 72 }
        }
      },
      {
        id: 4,
        time: '04:50',
        date: formatDate(tomorrow),
        currency: 'JPY',
        impact: 'Medium',
        event: 'Bank of Japan Policy Rate',
        actual: null,
        forecast: '-0.10%',
        previous: '-0.10%',
        sentiment: 'bearish',
        result: null,
        affectedPairs: ['USD/JPY'],
        description: 'Politika BoJ ohledně úrokových sazeb',
        hasOccurred: false,
        sources: {
          forexFactory: { sentiment: 'bearish', confidence: 65 },
          tradingEconomics: { sentiment: 'bearish', confidence: 70 },
          investing: { sentiment: 'neutral', confidence: 60 },
          myfxbook: { sentiment: 'bearish', confidence: 68 }
        }
      },
      {
        id: 5,
        time: '16:00',
        date: formatDate(tomorrow),
        currency: 'USD',
        impact: 'High',
        event: 'FOMC Interest Rate Decision',
        actual: null,
        forecast: '5.25%',
        previous: '5.50%',
        sentiment: 'bullish',
        result: null,
        affectedPairs: ['EUR/USD', 'GBP/USD', 'USD/JPY'],
        description: 'Rozhodnutí Fed o úrokových sazbách',
        hasOccurred: false,
        sources: {
          forexFactory: { sentiment: 'bullish', confidence: 80 },
          tradingEconomics: { sentiment: 'bullish', confidence: 85 },
          investing: { sentiment: 'bullish', confidence: 78 },
          myfxbook: { sentiment: 'neutral', confidence: 70 }
        }
      }
    ].filter(news => {
      return news.date === formatDate(today) || news.date === formatDate(tomorrow);
    }).sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.time.localeCompare(b.time);
    });
  }, []);

  // Výpočet konsenzu ze zdrojů
  const calculateSourceConsensus = (sources) => {
    const sentiments = Object.values(sources);
    let bullishScore = 0;
    let bearishScore = 0;
    let totalConfidence = 0;

    sentiments.forEach(source => {
      const weight = source.confidence / 100;
      totalConfidence += source.confidence;
      
      if (source.sentiment === 'bullish') {
        bullishScore += weight;
      } else if (source.sentiment === 'bearish') {
        bearishScore += weight;
      }
    });

    const avgConfidence = totalConfidence / sentiments.length;
    
    let consensus = 'neutral';
    if (bullishScore > bearishScore * 1.2) consensus = 'bullish';
    else if (bearishScore > bullishScore * 1.2) consensus = 'bearish';

    return {
      sentiment: consensus,
      confidence: Math.round(avgConfidence),
      agreement: Math.round((Math.max(bullishScore, bearishScore) / (bullishScore + bearishScore || 1)) * 100)
    };
  };

  const fetchNewsData = async () => {
    setLoadingNews(true);
    setTimeout(() => {
      setNewsData(mockForexFactoryData);
      setLoadingNews(false);
    }, 1500);
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'High': return '#dc2626';
      case 'Medium': return '#d97706';
      default: return '#16a34a';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'bullish': return <TrendingUp style={{ width: '14px', height: '14px', color: '#16a34a' }} />;
      case 'bearish': return <TrendingDown style={{ width: '14px', height: '14px', color: '#dc2626' }} />;
      default: return <Circle style={{ width: '14px', height: '14px', color: '#6b7280' }} />;
    }
  };

  const getResultIcon = (result) => {
    if (!result) return <Clock style={{ width: '14px', height: '14px', color: '#9ca3af' }} />;
    switch (result) {
      case 'bullish': return <TrendingUp style={{ width: '14px', height: '14px', color: '#16a34a' }} />;
      case 'bearish': return <TrendingDown style={{ width: '14px', height: '14px', color: '#dc2626' }} />;
      default: return <Circle style={{ width: '14px', height: '14px', color: '#6b7280' }} />;
    }
  };

  const getResultColor = (result) => {
    if (!result) return '#6b7280';
    switch (result) {
      case 'bullish': return '#16a34a';
      case 'bearish': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'bullish': return '#16a34a';
      case 'bearish': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getPairAnalysis = () => {
    if (!newsData) return {};
    
    const analysis = {};
    const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY'];
    
    pairs.forEach(pair => {
      const relevantNews = newsData.filter(news => 
        news.affectedPairs.includes(pair) && 
        (news.impact === 'High' || news.impact === 'Medium')
      );
      
      let bullishScore = 0;
      let bearishScore = 0;
      
      relevantNews.forEach(news => {
        const weight = news.impact === 'High' ? 2 : 1;
        let effectiveSentiment;
        if (news.hasOccurred && news.result) {
          effectiveSentiment = news.result;
        } else {
          const consensus = calculateSourceConsensus(news.sources);
          effectiveSentiment = consensus.sentiment;
        }
        if (effectiveSentiment === 'bullish') bullishScore += weight;
        if (effectiveSentiment === 'bearish') bearishScore += weight;
      });

      indicators.forEach(indicator => {
        if (checkedIndicators.has(indicator.id) && indicator.affectedPairs.includes(pair)) {
          const weight = indicator.weight / 10;
          if (indicator.sentiment === 'bullish') {
            bullishScore += weight;
          } else if (indicator.sentiment === 'bearish') {
            bearishScore += weight;
          }
        }
      });

      let overallSentiment = 'neutral';
      let tradeRecommendation = 'Hold';
      if (bullishScore > bearishScore + 0.5) {
        overallSentiment = 'bullish';
        tradeRecommendation = 'Buy';
      } else if (bearishScore > bullishScore + 0.5) {
        overallSentiment = 'bearish';
        tradeRecommendation = 'Sell';
      }
      
      analysis[pair] = {
        sentiment: overallSentiment,
        score: Math.abs(bullishScore - bearishScore),
        newsCount: relevantNews.length,
        tradeRecommendation,
        confidence: Math.round(Math.min((Math.max(bullishScore, bearishScore) * 20), 95))
      };
    });
    
    return analysis;
  };

  const strategies = [
    { id: 1, name: "Daily Target", weight: 12, description: "Denní cíl a směr trhu" },
    { id: 2, name: "dOPEN (6:00)", weight: 10, description: "Otevření denní session" },
    { id: 3, name: "Order Block 4h", weight: 15, description: "4H institucionální bloky" },
    { id: 4, name: "Order Block 1h", weight: 12, description: "1H institucionální bloky" },
    { id: 5, name: "Order Block 15m", weight: 10, description: "15m institucionální bloky" },
    { id: 6, name: "FVG", weight: 11, description: "Fair Value Gap" },
    { id: 7, name: "iFVG", weight: 13, description: "Inverse Fair Value Gap" },
    { id: 8, name: "BPR", weight: 11, description: "Breaker Point Retest" },
    { id: 9, name: "ASIA High", weight: 9, description: "Asijské maximum" },
    { id: 10, name: "ASIA Low", weight: 9, description: "Asijské minimum" },
    { id: 11, name: "Fibonacci retracement", weight: 8, description: "Fibonacci úrovně" },
    { id: 12, name: "VWAP", weight: 7, description: "Volume Weighted Average Price" },
    { id: 13, name: "Likvidita (1H,15m)", weight: 14, description: "Zóny likvidity" },
    { id: 14, name: "News", weight: 6, description: "Fundamentální události" },
    { id: 15, name: "Market Structure Shift (MSS)", weight: 16, description: "Změna tržní struktury" },
    { id: 16, name: "London Kill Zone", weight: 22, description: "9:00-11:00 Praha čas - Nejvyšší objem" },
    { id: 17, name: "New York Kill Zone", weight: 20, description: "14:00-17:00 Praha čas - Nejvyšší likvidita" },
    { id: 18, name: "RSI Divergence", weight: 18, description: "RSI překoupený/přeprodaný + divergence" }
  ];

  const indicators = [
    { id: 1, name: "EMA Crossover", weight: 10, description: "Překřížení 50 a 200 EMA", sentiment: 'bullish', affectedPairs: ['EUR/USD', 'GBP/USD', 'USD/JPY'] },
    { id: 2, name: "RSI Overbought/Oversold", weight: 8, description: "RSI nad 70 nebo pod 30", sentiment: 'bearish', affectedPairs: ['EUR/USD'] },
    { id: 5, name: "Volume", weight: 8, description: "Objem obchodů", sentiment: 'neutral', affectedPairs: ['EUR/USD', 'GBP/USD', 'USD/JPY'] },
    { id: 6, name: "Fixed Range Volume Profile", weight: 9, description: "Profil objemu v pevném rozsahu", sentiment: 'neutral', affectedPairs: ['EUR/USD', 'GBP/USD', 'USD/JPY'] },
    { id: 7, name: "Pivot Points Standard", weight: 7, description: "Standardní pivotní body", sentiment: 'neutral', affectedPairs: ['EUR/USD', 'GBP/USD', 'USD/JPY'] }
  ];

  const toggleItem = (id) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(id)) {
      newCheckedItems.delete(id);
    } else {
      newCheckedItems.add(id);
    }
    setCheckedItems(newCheckedItems);
  };

  const toggleIndicator = (id) => {
    const newCheckedIndicators = new Set(checkedIndicators);
    if (newCheckedIndicators.has(id)) {
      newCheckedIndicators.delete(id);
    } else {
      newCheckedIndicators.add(id);
    }
    setCheckedIndicators(newCheckedIndicators);
  };

  const resetChecklist = () => {
    setCheckedItems(new Set());
    setCheckedIndicators(new Set());
  };

  const saveAnalysis = () => {
    const timestamp = new Date().toLocaleString('cs-CZ');
    const analysis = {
      timestamp,
      checkedItems: Array.from(checkedItems),
      checkedIndicators: Array.from(checkedIndicators),
      pairAnalysis: getPairAnalysis(),
      newsData
    };
    const updatedHistory = [...history, analysis];
    setHistory(updatedHistory);
    localStorage.setItem('tradingHistory', JSON.stringify(updatedHistory));
  };

  const deleteHistoryItem = (index) => {
    const updatedHistory = history.filter((_, i) => i !== index);
    setHistory(updatedHistory);
    localStorage.setItem('tradingHistory', JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.setItem('tradingHistory', JSON.stringify([]));
  };

  const successProbability = useMemo(() => {
    const totalStrategyWeight = strategies.reduce((sum, strategy) => sum + strategy.weight, 0);
    const checkedStrategyWeight = strategies
      .filter(strategy => checkedItems.has(strategy.id))
      .reduce((sum, strategy) => sum + strategy.weight, 0);
    
    const totalIndicatorWeight = indicators.reduce((sum, indicator) => sum + indicator.weight, 0);
    const checkedIndicatorWeight = indicators
      .filter(indicator => checkedIndicators.has(indicator.id))
      .reduce((sum, indicator) => sum + indicator.weight, 0);
    
    const baseProb = 20;
    const strategyBonus = (checkedStrategyWeight / (totalStrategyWeight || 1)) * 50;
    const indicatorBonus = (checkedIndicatorWeight / (totalIndicatorWeight || 1)) * 20;
    
    return Math.round(baseProb + strategyBonus + indicatorBonus);
  }, [checkedItems, checkedIndicators, strategies, indicators]);

  const getSuccessColor = (probability) => {
    if (probability >= 80) return '#16a34a';
    if (probability >= 60) return '#ca8a04';
    if (probability >= 40) return '#ea580c';
    return '#dc2626';
  };

  const getSuccessLabel = (probability) => {
    if (probability >= 80) return 'Vysoká šance';
    if (probability >= 60) return 'Dobrá šance';
    if (probability >= 40) return 'Střední šance';
    return 'Nízká šance';
  };

  const checkedCount = checkedItems.size + checkedIndicators.size;
  const totalCount = strategies.length + indicators.length;

  // Filtrování událostí podle času
  const filteredNews = useMemo(() => {
    if (!newsData) return [];
    if (timeFilter === 'all') return newsData;
    
    return newsData.filter(news => {
      const [hours, minutes] = news.time.split(':').map(Number);
      return hours >= 9 && hours < 17;
    });
  }, [newsData, timeFilter]);

  return (
    <div style={{
      maxWidth: '896px',
      margin: '0 auto',
      padding: '16px',
      background: 'linear-gradient(to bottom right, #f8fafc, #e0f2fe)',
      minHeight: '100vh'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '16px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <TrendingUp style={{ width: '24px', height: '24px', color: '#2563eb' }} />
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              Trading Checklist
            </h1>
          </div>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Kalkulátor úspěšnosti obchodních strategií
          </p>
          
          {/* Control Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            marginTop: '16px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={resetChecklist}
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
            >
              Resetovat vše
            </button>
            
            <button
              onClick={() => {
                setShowNews(!showNews);
                if (!showNews && !newsData) {
                  fetchNewsData();
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                backgroundColor: showNews ? '#16a34a' : '#2563eb',
                color: '#ffffff'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = showNews ? '#15803d' : '#1e40af'}
              onMouseOut={(e) => e.target.style.backgroundColor = showNews ? '#16a34a' : '#2563eb'}
            >
              <Calendar style={{ width: '14px', height: '14px' }} />
              {showNews ? 'Skrýt News' : 'Zobrazit News'}
            </button>

            <button
              onClick={() => setShowWeights(!showWeights)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                backgroundColor: showWeights ? '#7c3aed' : '#4b5563',
                color: '#ffffff'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = showWeights ? '#6d28d9' : '#374151'}
              onMouseOut={(e) => e.target.style.backgroundColor = showWeights ? '#7c3aed' : '#4b5563'}
            >
              <Target style={{ width: '14px', height: '14px' }} />
              {showWeights ? 'Skrýt váhy' : 'Zobrazit váhy'}
            </button>

            <button
              onClick={saveAnalysis}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                backgroundColor: '#eab308',
                color: '#ffffff'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#ca8a04'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#eab308'}
            >
              <Calendar style={{ width: '14px', height: '14px' }} />
              Uložit analýzu
            </button>

            <button
              onClick={() => setShowHistory(!showHistory)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                backgroundColor: showHistory ? '#d97706' : '#6b7280',
                color: '#ffffff'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = showHistory ? '#b45309' : '#4b5563'}
              onMouseOut={(e) => e.target.style.backgroundColor = showHistory ? '#d97706' : '#6b7280'}
            >
              <Calendar style={{ width: '14px', height: '14px' }} />
              {showHistory ? 'Skrýt historii' : 'Zobrazit historii'}
            </button>

            {showHistory && (
              <button
                onClick={clearHistory}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  backgroundColor: '#9ca3af',
                  color: '#ffffff'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#6b7280'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#9ca3af'}
              >
                <Circle style={{ width: '14px', height: '14px' }} />
                Smazat historii
              </button>
            )}

            <a
              href="https://www.notion.so/Obchodn-pl-n-221583a54667807e8307cb17bf26dacb"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                backgroundColor: '#4b5563',
                color: '#ffffff',
                textDecoration: 'none'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#374151'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#4b5563'}
            >
              <ExternalLink style={{ width: '14px', height: '14px' }} />
              Notion
            </a>

            <a
              href="https://fxverify.com/tools/position-size-calculator"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                backgroundColor: '#4b5563',
                color: '#ffffff',
                textDecoration: 'none'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#374151'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#4b5563'}
            >
              <Calculator style={{ width: '14px', height: '14px' }} />
              LotSize
            </a>

            <a
              href="https://www.fundedmind.cz/platform"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                backgroundColor: '#4b5563',
                color: '#ffffff',
                textDecoration: 'none'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#374151'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#4b5563'}
            >
              <ExternalLink style={{ width: '14px', height: '14px' }} />
              FundedMind
            </a>

            <a
              href="https://www.forexfactory.com/calendar"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                backgroundColor: '#4b5563',
                color: '#ffffff',
                textDecoration: 'none'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#374151'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#4b5563'}
            >
              <ExternalLink style={{ width: '14px', height: '14px' }} />
              ForexFactory
            </a>

            <a
              href="https://www.tradingview.com/chart/6fs6xieJ/?symbol=OANDA%3AEURUSD"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                backgroundColor: '#4b5563',
                color: '#ffffff',
                textDecoration: 'none'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#374151'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#4b5563'}
            >
              <ExternalLink style={{ width: '14px', height: '14px' }} />
              TradingView
            </a>
          </div>
        </div>

        {/* Success Probability Display */}
        <div style={{
          background: 'linear-gradient(to right, #2563eb, #7c3aed)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          color: '#ffffff',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <Target style={{ width: '36px', height: '36px' }} />
            <div>
              <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                marginBottom: '6px',
                color: getSuccessColor(successProbability)
              }}>
                {successProbability}%
              </div>
              <div style={{ fontSize: '16px', opacity: 0.9 }}>
                {getSuccessLabel(successProbability)}
              </div>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            fontSize: '12px',
            opacity: 0.8
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock style={{ width: '14px', height: '14px' }} />
              <span>Splněno: {checkedCount}/{totalCount}</span>
            </div>
            <div style={{ width: '1px', height: '12px', backgroundColor: '#ffffff', opacity: 0.3 }}></div>
            <div>Pokrytí: {Math.round((checkedCount / totalCount) * 100)}%</div>
          </div>
        </div>

        {/* News Section */}
        {showNews && (
          <div style={{
            backgroundColor: '#111827',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            color: '#ffffff'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Calendar style={{ width: '20px', height: '20px', color: '#60a5fa' }} />
                Multi-Source News Analysis - Týden {getCurrentWeek()}
              </h2>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  color: '#9ca3af'
                }}>
                  <span>Zdroje:</span>
                  <a href="https://www.forexfactory.com/calendar" target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'none' }} onMouseOver={(e) => e.target.style.color = '#93c5fd'} onMouseOut={(e) => e.target.style.color = '#60a5fa'}>FF</a>
                  <span>•</span>
                  <a href="https://tradingeconomics.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'none' }} onMouseOver={(e) => e.target.style.color = '#93c5fd'} onMouseOut={(e) => e.target.style.color = '#60a5fa'}>TE</a>
                  <span>•</span>
                  <a href="https://www.investing.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'none' }} onMouseOver={(e) => e.target.style.color = '#93c5fd'} onMouseOut={(e) => e.target.style.color = '#60a5fa'}>INV</a>
                  <span>•</span>
                  <a href="https://www.myfxbook.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'none' }} onMouseOver={(e) => e.target.style.color = '#93c5fd'} onMouseOut={(e) => e.target.style.color = '#60a5fa'}>MFX</a>
                </div>
                <a
                  href="https://www.forexfactory.com/calendar"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#60a5fa',
                    textDecoration: 'none',
                    fontSize: '11px'
                  }}
                  onMouseOver={(e) => e.target.style.color = '#93c5fd'}
                  onMouseOut={(e) => e.target.style.color = '#60a5fa'}
                >
                  <ExternalLink style={{ width: '14px', height: '14px' }} />
                  Hlavní zdroj
                </a>
              </div>
            </div>

            {/* Time Filter */}
            <div style={{
              marginBottom: '16px',
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => setTimeFilter('all')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '12px',
                  cursor: 'pointer',
                  backgroundColor: timeFilter === 'all' ? '#2563eb' : '#4b5563',
                  color: '#ffffff'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = timeFilter === 'all' ? '#1e40af' : '#374151'}
                onMouseOut={(e) => e.target.style.backgroundColor = timeFilter === 'all' ? '#2563eb' : '#4b5563'}
              >
                Všechny časy
              </button>
              <button
                onClick={() => setTimeFilter('9-17')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '12px',
                  cursor: 'pointer',
                  backgroundColor: timeFilter === '9-17' ? '#2563eb' : '#4b5563',
                  color: '#ffffff'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = timeFilter === '9-17' ? '#1e40af' : '#374151'}
                onMouseOut={(e) => e.target.style.backgroundColor = timeFilter === '9-17' ? '#2563eb' : '#4b5563'}
              >
                9:00–17:00
              </button>
            </div>

            {/* Timeline */}
            <div style={{
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#d1d5db'
              }}>
                Časová osa událostí
              </h3>
              <div style={{
                display: 'flex',
                overflowX: 'auto',
                gap: '12px',
                padding: '12px',
                backgroundColor: '#1f2937',
                borderRadius: '6px'
              }}>
                {filteredNews.map(news => (
                  <div key={news.id} style={{
                    flexShrink: 0,
                    padding: '8px',
                    borderRadius: '4px',
                    backgroundColor: news.hasOccurred ? '#374151' : getImpactColor(news.impact),
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#ffffff' }}>
                      {news.time}
                    </div>
                    <div style={{ fontSize: '11px', color: '#d1d5db' }}>
                      {news.event}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                      {news.hasOccurred ? 'Proběhlo' : 'Čeká se'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {loadingNews ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ fontSize: '16px', color: '#9ca3af' }}>
                  Načítání news dat...
                </div>
              </div>
            ) : newsData ? (
              <>
                {/* News Events */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    marginBottom: '12px',
                    color: '#d1d5db'
                  }}>
                    Důležité události - Pouze aktuální den (Medium & High Impact)
                  </h3>
                  
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {filteredNews.map(news => (
                      <div
                        key={news.id}
                        style={{
                          backgroundColor: '#1f2937',
                          borderRadius: '6px',
                          padding: '12px',
                          borderLeft: `4px solid ${getImpactColor(news.impact)}`
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '8px'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span 
                              style={{
                                fontSize: '11px',
                                fontWeight: 'bold',
                                padding: '3px 6px',
                                borderRadius: '4px',
                                color: '#ffffff',
                                backgroundColor: getImpactColor(news.impact)
                              }}
                            >
                              {news.impact}
                            </span>
                            <span style={{
                              backgroundColor: '#4b5563',
                              color: '#ffffff',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              padding: '3px 6px',
                              borderRadius: '4px'
                            }}>
                              {news.currency}
                            </span>
                            <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                              {news.date} {news.time}
                            </span>
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}>
                              <span style={{ fontSize: '11px', color: '#9ca3af' }}>Očekávání:</span>
                              {getSentimentIcon(news.sentiment)}
                              <span 
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  textTransform: 'uppercase',
                                  color: getSentimentColor(news.sentiment)
                                }}
                              >
                                {news.sentiment}
                              </span>
                            </div>
                            {news.hasOccurred ? (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}>
                                <span style={{ fontSize: '11px', color: '#9ca3af' }}>Výsledek:</span>
                                {getResultIcon(news.result)}
                                <span 
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    color: getResultColor(news.result)
                                  }}
                                >
                                  {news.result}
                                </span>
                              </div>
                            ) : (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}>
                                <span style={{ fontSize: '11px', color: '#9ca3af' }}>Status:</span>
                                <Clock style={{ width: '14px', height: '14px', color: '#eab308' }} />
                                <span style={{
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  textTransform: 'uppercase',
                                  color: '#eab308'
                                }}>
                                  Čeká se
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <h4 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          marginBottom: '6px',
                          color: '#ffffff'
                        }}>
                          {news.event}
                        </h4>
                        
                        <p style={{
                          fontSize: '12px',
                          color: '#d1d5db',
                          marginBottom: '8px'
                        }}>
                          {news.description}
                        </p>
                        
                        <div style={{
                          display: 'flex',
                          gap: '12px',
                          fontSize: '11px',
                          color: '#9ca3af',
                          marginBottom: '6px'
                        }}>
                          <span>Prognóza: {news.forecast}</span>
                          <span>Předchozí: {news.previous}</span>
                          {news.hasOccurred && news.actual && (
                            <span style={{ color: '#eab308', fontWeight: '600' }}>
                              Skutečnost: {news.actual}
                            </span>
                          )}
                        </div>
                        
                        <div style={{
                          fontSize: '11px',
                          color: '#60a5fa',
                          marginBottom: '6px'
                        }}>
                          Ovlivněné páry: {news.affectedPairs.join(', ')}
                        </div>

                        <div style={{
                          marginTop: '8px',
                          padding: '8px',
                          backgroundColor: '#374151',
                          borderRadius: '4px'
                        }}>
                          <h5 style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#d1d5db',
                            marginBottom: '6px'
                          }}>
                            Konsenzus ze zdrojů:
                          </h5>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '6px',
                            fontSize: '11px'
                          }}>
                            {Object.entries(news.sources).map(([source, data]) => {
                              const sourceNames = {
                                forexFactory: 'Forex Factory',
                                tradingEconomics: 'Trading Economics', 
                                investing: 'Investing.com',
                                myfxbook: 'MyFxBook'
                              };
                              
                              return (
                                <div key={source} style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between'
                                }}>
                                  <span style={{ color: '#9ca3af' }}>{sourceNames[source]}:</span>
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px'
                                  }}>
                                    <span 
                                      style={{
                                        fontWeight: '600',
                                        color: getSentimentColor(data.sentiment)
                                      }}
                                    >
                                      {data.sentiment.toUpperCase()}
                                    </span>
                                    <span style={{ color: '#9ca3af' }}>({data.confidence}%)</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          {(() => {
                            const consensus = calculateSourceConsensus(news.sources);
                            return (
                              <div style={{
                                marginTop: '6px',
                                paddingTop: '6px',
                                borderTop: '1px solid #4b5563'
                              }}>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between'
                                }}>
                                  <span style={{ fontWeight: '600', color: '#d1d5db' }}>
                                    Celkový konsenzus:
                                  </span>
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}>
                                    <span 
                                      style={{
                                        fontWeight: 'bold',
                                        fontSize: '12px',
                                        color: getSentimentColor(consensus.sentiment)
                                      }}
                                    >
                                      {consensus.sentiment.toUpperCase()}
                                    </span>
                                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                                      ({consensus.confidence}% conf, {consensus.agreement}% agree)
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pair Analysis */}
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    marginBottom: '12px',
                    color: '#d1d5db'
                  }}>
                    Analýza dopadů na měnové páry
                  </h3>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '12px'
                  }}>
                    {Object.entries(getPairAnalysis()).map(([pair, analysis]) => (
                      <div
                        key={pair}
                        style={{
                          backgroundColor: '#1f2937',
                          borderRadius: '6px',
                          padding: '12px',
                          textAlign: 'center',
                          border: `2px solid ${getSentimentColor(analysis.sentiment)}`
                        }}
                      >
                        <h4 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          marginBottom: '6px',
                          color: '#ffffff'
                        }}>
                          {pair}
                        </h4>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          marginBottom: '4px'
                        }}>
                          {getSentimentIcon(analysis.sentiment)}
                          <span 
                            style={{
                              fontSize: '12px',
                              fontWeight: '600',
                              color: getSentimentColor(analysis.sentiment)
                            }}
                          >
                            {analysis.sentiment.toUpperCase()}
                          </span>
                        </div>
                        
                        <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                          Síla signálu: {analysis.score.toFixed(1)}/4
                        </div>
                        <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                          Založeno na {analysis.newsCount} událostech
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: getSentimentColor(analysis.sentiment), marginBottom: '4px' }}>
                          Doporučení: {analysis.tradeRecommendation}
                        </div>
                        <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                          Confidence: {analysis.confidence}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#064e3b',
                  borderRadius: '6px',
                  padding: '12px',
                  borderLeft: '4px solid #16a34a'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '6px'
                  }}>
                    <AlertTriangle style={{ width: '16px', height: '16px', color: '#4ade80' }} />
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#86efac'
                    }}>
                      Multi-Source Trading Strategy
                    </h4>
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#86efac',
                    lineHeight: '1.4'
                  }}>
                    <p>
                      <strong>Konfluence zdrojů:</strong> Kombinujeme data z 4 hlavních zdrojů pro přesnější bias.
                    </p>
                    <p>
                      <strong>Síla signálu:</strong> Čím vyšší shoda mezi zdroji, tím silnější trading signál.
                    </p>
                    <p>
                      <strong>Best Practice:</strong> Tradte pouze při 80%+ shodě a vysoké confidence (85%+).
                    </p>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* History Section */}
        {showHistory && (
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '6px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '12px'
            }}>
              Historie analýz
            </h3>
            {history.length === 0 ? (
              <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
                Žádné uložené analýzy
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {history.map((entry, index) => (
                  <div key={index} style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '6px',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                        {entry.timestamp}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                        Strategie: {entry.checkedItems.map(id => strategies.find(s => s.id === id)?.name).join(', ') || 'Žádné'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                        Indikátory: {entry.checkedIndicators.map(id => indicators.find(i => i.id === id)?.name).join(', ') || 'Žádné'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        Doporučení: {Object.entries(entry.pairAnalysis).map(([pair, analysis]) => 
                          `${pair}: ${analysis.tradeRecommendation} (${analysis.confidence}%)`
                        ).join('; ')}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteHistoryItem(index)}
                      style={{
                        backgroundColor: '#dc2626',
                        color: '#ffffff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        fontWeight: '600',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
                    >
                      Smazat
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Strategies Grid */}
        <div style={{
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px',
            color: '#1f2937'
          }}>
            Trading Strategie
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '12px'
          }}>
            {strategies.map((strategy) => {
              const isChecked = checkedItems.has(strategy.id);
              const isLondonKillZone = strategy.name === "London Kill Zone";
              const isNewYorkKillZone = strategy.name === "New York Kill Zone";
              const isAsiaHigh = strategy.name === "ASIA High";
              const isAsiaLow = strategy.name === "ASIA Low";
              const backgroundColor = isChecked
                ? isLondonKillZone ? '#bbf7d0' : isNewYorkKillZone ? '#fed7aa' : isAsiaHigh || isAsiaLow ? '#bfdbfe' : '#f0fdf4'
                : isLondonKillZone ? '#dcfce7' : isNewYorkKillZone ? '#ffedd5' : isAsiaHigh || isAsiaLow ? '#dbeafe' : '#ffffff';
              return (
                <div
                  key={strategy.id}
                  onClick={() => toggleItem(strategy.id)}
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    border: `2px solid ${isChecked ? '#16a34a' : '#e5e7eb'}`,
                    backgroundColor,
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    boxShadow: isChecked ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ flexShrink: 0, marginTop: '3px' }}>
                      {isChecked ? (
                        <CheckCircle2 style={{ width: '20px', height: '20px', color: '#16a34a' }} />
                      ) : (
                        <Circle style={{ width: '20px', height: '20px', color: '#9ca3af' }} />
                      )}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '3px'
                      }}>
                        <h3 style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: isChecked ? '#14532d' : '#1f2937'
                        }}>
                          {strategy.name}
                        </h3>
                        <span style={{
                          fontSize: '12px',
                          padding: '3px 6px',
                          borderRadius: '4px',
                          backgroundColor: isChecked ? '#bbf7d0' : '#f3f4f6',
                          color: isChecked ? '#14532d' : '#4b5563'
                        }}>
                          {strategy.weight}%
                        </span>
                      </div>
                      <p style={{
                        fontSize: '12px',
                        color: isChecked ? '#16a34a' : '#6b7280'
                      }}>
                        {strategy.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Indicators Grid */}
        <div style={{
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px',
            color: '#1f2937'
          }}>
            Technické indikátory
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '12px'
          }}>
            {indicators.map((indicator) => {
              const isChecked = checkedIndicators.has(indicator.id);
              return (
                <div
                  key={indicator.id}
                  onClick={() => toggleIndicator(indicator.id)}
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    border: `2px solid ${isChecked ? '#16a34a' : '#e5e7eb'}`,
                    backgroundColor: isChecked ? '#f0fdf4' : '#ffffff',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    boxShadow: isChecked ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ flexShrink: 0, marginTop: '3px' }}>
                      {isChecked ? (
                        <CheckCircle2 style={{ width: '20px', height: '20px', color: '#16a34a' }} />
                      ) : (
                        <Circle style={{ width: '20px', height: '20px', color: '#9ca3af' }} />
                      )}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '3px'
                      }}>
                        <h3 style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: isChecked ? '#14532d' : '#1f2937'
                        }}>
                          {indicator.name}
                        </h3>
                        <span style={{
                          fontSize: '12px',
                          padding: '3px 6px',
                          borderRadius: '4px',
                          backgroundColor: isChecked ? '#bbf7d0' : '#f3f4f6',
                          color: isChecked ? '#14532d' : '#4b5563'
                        }}>
                          {indicator.weight}%
                        </span>
                      </div>
                      <p style={{
                        fontSize: '12px',
                        color: isChecked ? '#16a34a' : '#6b7280'
                      }}>
                        {indicator.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strategy Weights Reference */}
        {showWeights && (
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '6px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '12px'
            }}>
              Váhy strategií a indikátorů (dle statistické úspěšnosti)
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '8px',
              fontSize: '12px'
            }}>
              {[...strategies, ...indicators]
                .sort((a, b) => b.weight - a.weight)
                .map((item) => (
                  <div key={item.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '6px' }}>
                      {item.name}
                    </span>
                    <span style={{ fontWeight: '500', color: '#1f2937' }}>
                      {item.weight}%
                    </span>
                  </div>
                ))}
            </div>
            
            <div style={{
              marginTop: '12px',
              padding: '8px',
              backgroundColor: '#e0f2fe',
              borderRadius: '4px',
              borderLeft: '4px solid #3b82f6'
            }}>
              <p style={{ fontSize: '12px', color: '#1e40af' }}>
                <strong>Metodika:</strong> Váhy jsou založeny na statistické úspěšnosti. 
                Kill Zones a technické struktury mají nejvyšší váhu, fundamentální analýza a některé indikátory nižší.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingChecklist;