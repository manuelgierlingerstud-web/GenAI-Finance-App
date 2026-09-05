/**
 * Quantitative backtest engine adhering to lagged execution, transaction costs,
 * conservative stop-loss precedence, and 70/30 train/test split.
 */

export function runBacktest(priceData, initialCapital = 100000, options = {}) {
  if (!priceData || priceData.length < 30) {
    return {
      success: false,
      message: 'Insufficient historical data for backtest (minimum 30 sessions required).'
    };
  }

  const {
    stopLossPct = 0.05,
    takeProfitPct = 0.12,
    slippageRate = 0.001, // 0.1% transaction cost / slippage
    trainTestSplit = 0.70
  } = options;

  const splitIndex = Math.floor(priceData.length * trainTestSplit);
  const trainData = priceData.slice(0, splitIndex);
  const testData = priceData.slice(splitIndex);

  function executeRun(dataSegment, startCapital) {
    let cash = startCapital;
    let shares = 0;
    let position = 'OUT'; // 'OUT' or 'LONG'
    let entryPrice = 0;
    const trades = [];
    const equityCurve = [];

    for (let i = 0; i < dataSegment.length; i++) {
      const bar = dataSegment[i];
      const prevBar = i > 0 ? dataSegment[i - 1] : bar;

      // Calculate simple signal on prevBar (Day t close)
      // e.g. SMA20 on prevBar
      let sma20Val = prevBar.close;
      if (i >= 20) {
        let sum = 0;
        for (let j = i - 20; j < i; j++) sum += dataSegment[j].close;
        sma20Val = sum / 20;
      }

      const signalBuy = prevBar.close > sma20Val;

      // Execution happens on open of day t+1 (or current bar open if lagged)
      if (position === 'LONG') {
        // Check stop-loss and take-profit on current bar (high/low)
        const stopPrice = entryPrice * (1 - stopLossPct);
        const tpPrice = entryPrice * (1 + takeProfitPct);

        let exitPrice = bar.close;
        let exitReason = 'SIGNAL_EXIT';

        // Conservative assumption: if both crossed, process stop-loss first
        if (bar.low <= stopPrice) {
          exitPrice = stopPrice * (1 - slippageRate);
          exitReason = 'STOP_LOSS';
        } else if (bar.high >= tpPrice) {
          exitPrice = tpPrice * (1 - slippageRate);
          exitReason = 'TAKE_PROFIT';
        } else if (!signalBuy) {
          exitPrice = bar.open * (1 - slippageRate);
          exitReason = 'SIGNAL_REVERSAL';
        }

        if (exitReason !== 'SIGNAL_EXIT' || !signalBuy) {
          cash = shares * exitPrice;
          const pnl = cash - (shares * entryPrice);
          const pnlPct = ((exitPrice - entryPrice) / entryPrice) * 100;
          trades.push({
            entryDate: entryDate,
            exitDate: bar.date,
            entryPrice,
            exitPrice,
            pnl,
            pnlPct,
            reason: exitReason
          });
          shares = 0;
          position = 'OUT';
        }
      } else if (position === 'OUT' && signalBuy && i < dataSegment.length - 1) {
        // Enter long on open of next bar (lagged execution)
        const executionBar = dataSegment[i + 1];
        entryPrice = executionBar.open * (1 + slippageRate);
        shares = cash / entryPrice;
        cash = 0;
        position = 'LONG';
        var entryDate = executionBar.date;
        i++; // skip next bar for entry processing to prevent same-bar lookahead
      }

      const currentEquity = cash + (shares > 0 ? shares * bar.close : 0);
      equityCurve.push({ date: bar.date, equity: currentEquity });
    }

    // Final liquidation if still long
    if (position === 'LONG' && dataSegment.length > 0) {
      const lastBar = dataSegment[dataSegment.length - 1];
      const exitPrice = lastBar.close * (1 - slippageRate);
      cash = shares * exitPrice;
      const pnl = cash - (shares * entryPrice);
      const pnlPct = ((exitPrice - entryPrice) / entryPrice) * 100;
      trades.push({
        entryDate: entryDate || dataSegment[0].date,
        exitDate: lastBar.date,
        entryPrice,
        exitPrice,
        pnl,
        pnlPct,
        reason: 'PERIOD_END'
      });
      shares = 0;
    }

    const finalEquity = cash + (shares > 0 ? shares * dataSegment[dataSegment.length - 1].close : startCapital);
    const totalReturnPct = ((finalEquity - startCapital) / startCapital) * 100;

    const winningTrades = trades.filter(t => t.pnl > 0);
    const losingTrades = trades.filter(t => t.pnl <= 0);
    const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
    const grossProfit = winningTrades.reduce((acc, t) => acc + t.pnl, 0);
    const grossLoss = Math.abs(losingTrades.reduce((acc, t) => acc + t.pnl, 0));
    const profitFactor = grossLoss === 0 ? (grossProfit > 0 ? 'No losing trades' : 'N/A') : (grossProfit / grossLoss).toFixed(2);

    return {
      startCapital,
      finalEquity,
      totalReturnPct,
      tradesCount: trades.length,
      winRate,
      profitFactor,
      trades,
      equityCurve
    };
  }

  const trainResult = executeRun(trainData, 100000);
  const testResult = executeRun(testData, trainResult.finalEquity);

  return {
    success: true,
    disclaimer: 'Historical and illustrative backtest. Not a live forecast. Incorporates lagged execution and transaction slippage.',
    trainPeriod: {
      sessions: trainData.length,
      startDate: trainData[0]?.date,
      endDate: trainData[trainData.length - 1]?.date,
      ...trainResult
    },
    testPeriod: {
      sessions: testData.length,
      startDate: testData[0]?.date,
      endDate: testData[testData.length - 1]?.date,
      ...testResult
    }
  };
}
