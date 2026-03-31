const axios = require('axios');
const { RSI, MACD, BollingerBands, SMA, EMA } = require('technicalindicators');

// SkillPay Billing Integration
const BILLING_URL = 'https://skillpay.me/api/v1/billing';
const API_KEY = process.env.SKILLPAY_API_KEY;
const SKILL_ID = 'f6d44824-4926-4087-90a4-75bc5a26d85e';
const PRICE_PER_CALL = 0.05; // $0.05 per analysis

// SkillPay Charge Function
async function chargeUser(userId) {
  try {
    const { data } = await axios.post(BILLING_URL + '/charge', {
      user_id: userId,
      skill_id: SKILL_ID,
      amount: PRICE_PER_CALL,
    }, {
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (data.success) {
      return { ok: true, balance: data.balance };
    }
    return { ok: false, balance: data.balance, payment_url: data.payment_url };
  } catch (error) {
    console.error('Billing error:', error.message);
    return { ok: false, error: error.message };
  }
}

// Get User Balance
async function getBalance(userId) {
  try {
    const { data } = await axios.get(BILLING_URL + '/balance', {
      params: { user_id: userId },
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    return data.balance;
  } catch (error) {
    return null;
  }
}

// Generate Payment Link
async function getPaymentLink(userId, amount = 8) {
  try {
    const { data } = await axios.post(BILLING_URL + '/payment-link', {
      user_id: userId,
      amount,
    }, {
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    return data.payment_url;
  } catch (error) {
    return null;
  }
}

// 从 Binance 获取历史价格数据
async function getKlines(symbol, interval = '1h', limit = 100) {
  try {
    const response = await axios.get('https://api.binance.com/api/v3/klines', {
      params: { symbol, interval, limit }
    });
    
    return response.data.map(candle => ({
      time: candle[0],
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
      volume: parseFloat(candle[5])
    }));
  } catch (error) {
    throw new Error(`Failed to fetch price data: ${error.message}`);
  }
}

// 计算技术指标
function calculateIndicators(prices) {
  const closePrices = prices.map(p => p.close);
  
  // RSI
  const rsiInput = { values: closePrices, period: 14 };
  const rsiValues = RSI.calculate(rsiInput);
  const currentRSI = rsiValues[rsiValues.length - 1];
  
  // MACD
  const macdInput = {
    values: closePrices,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  };
  const macdValues = MACD.calculate(macdInput);
  const currentMACD = macdValues[macdValues.length - 1];
  
  // Bollinger Bands
  const bbInput = {
    values: closePrices,
    period: 20,
    stdDev: 2
  };
  const bbValues = BollingerBands.calculate(bbInput);
  const currentBB = bbValues[bbValues.length - 1];
  
  // SMA
  const sma20 = SMA.calculate({ values: closePrices, period: 20 });
  const sma50 = SMA.calculate({ values: closePrices, period: 50 });
  
  // EMA
  const ema12 = EMA.calculate({ values: closePrices, period: 12 });
  const ema26 = EMA.calculate({ values: closePrices, period: 26 });
  
  return {
    rsi: {
      value: currentRSI,
      signal: currentRSI > 70 ? 'overbought' : currentRSI < 30 ? 'oversold' : 'neutral'
    },
    macd: {
      macd: currentMACD?.MACD,
      signal: currentMACD?.signal,
      histogram: currentMACD?.histogram,
      trend: currentMACD?.histogram > 0 ? 'bullish' : 'bearish'
    },
    bollingerBands: {
      upper: currentBB?.upper,
      middle: currentBB?.middle,
      lower: currentBB?.lower,
      priceVsBB: closePrices[closePrices.length - 1] > currentBB?.upper ? 'above_upper' :
                 closePrices[closePrices.length - 1] < currentBB?.lower ? 'below_lower' : 'in_range'
    },
    sma: {
      sma20: sma20[sma20.length - 1],
      sma50: sma50[sma50.length - 1],
      crossover: sma20[sma20.length - 1] > sma50[sma50.length - 1] ? 'bullish' : 'bearish'
    },
    ema: {
      ema12: ema12[ema12.length - 1],
      ema26: ema26[ema26.length - 1]
    },
    currentPrice: closePrices[closePrices.length - 1]
  };
}

// 生成交易建议
function generateSignal(indicators) {
  let bullishSignals = 0;
  let bearishSignals = 0;
  
  // RSI 信号
  if (indicators.rsi.signal === 'oversold') bullishSignals++;
  if (indicators.rsi.signal === 'overbought') bearishSignals++;
  
  // MACD 信号
  if (indicators.macd.trend === 'bullish') bullishSignals++;
  if (indicators.macd.trend === 'bearish') bearishSignals++;
  
  // SMA 信号
  if (indicators.sma.crossover === 'bullish') bullishSignals++;
  if (indicators.sma.crossover === 'bearish') bearishSignals++;
  
  // Bollinger Bands 信号
  if (indicators.bollingerBands.priceVsBB === 'below_lower') bullishSignals++;
  if (indicators.bollingerBands.priceVsBB === 'above_upper') bearishSignals++;
  
  const netSignal = bullishSignals - bearishSignals;
  
  let recommendation, confidence;
  
  if (netSignal >= 3) {
    recommendation = 'STRONG BUY';
    confidence = 'high';
  } else if (netSignal >= 1) {
    recommendation = 'BUY';
    confidence = 'medium';
  } else if (netSignal <= -3) {
    recommendation = 'STRONG SELL';
    confidence = 'high';
  } else if (netSignal <= -1) {
    recommendation = 'SELL';
    confidence = 'medium';
  } else {
    recommendation = 'HOLD';
    confidence = 'low';
  }
  
  return {
    recommendation,
    confidence,
    bullishSignals,
    bearishSignals,
    reasoning: {
      rsi: `RSI at ${indicators.rsi.value.toFixed(2)} indicates ${indicators.rsi.signal}`,
      macd: `MACD histogram ${indicators.macd.histogram > 0 ? 'positive' : 'negative'}, suggesting ${indicators.macd.trend} momentum`,
      trend: `Price is ${indicators.bollingerBands.priceVsBB.replace('_', ' ')} Bollinger Bands`
    }
  };
}

// 主 API 处理函数
module.exports = async (req, res) => {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const { symbol = 'BTCUSDT', interval = '1h', userId, demo = 'false' } = req.query;
    
    // 如果不是demo模式且提供了userId，则进行计费
    if (demo !== 'true' && userId) {
      const charge = await chargeUser(userId);
      
      if (!charge.ok) {
        // 余额不足，返回充值链接
        return res.status(402).json({
          success: false,
          error: 'Insufficient balance',
          balance: charge.balance,
          paymentUrl: charge.payment_url,
          message: 'Please top up your balance to use this skill'
        });
      }
    }
    
    // 获取价格数据
    const prices = await getKlines(symbol.toUpperCase(), interval);
    
    // 计算指标
    const indicators = calculateIndicators(prices);
    
    // 生成信号
    const signal = generateSignal(indicators);
    
    // 返回结果
    res.json({
      success: true,
      symbol: symbol.toUpperCase(),
      interval,
      timestamp: Date.now(),
      currentPrice: indicators.currentPrice,
      indicators: {
        rsi: indicators.rsi,
        macd: indicators.macd,
        bollingerBands: indicators.bollingerBands,
        sma: indicators.sma,
        ema: indicators.ema
      },
      signal,
      priceData: prices.slice(-10).map(p => ({
        time: new Date(p.time).toISOString(),
        close: p.close
      }))
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
