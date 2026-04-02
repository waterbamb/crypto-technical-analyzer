# Crypto Technical Analyzer

加密货币技术分析API - 支持RSI、MACD、布林带等技术指标

> 🔧 最新部署时间: 2026-04-02

## 功能

- 实时获取加密货币价格数据（通过Binance API）
- 计算多种技术指标：
  - RSI (相对强弱指标)
  - MACD (移动平均收敛散度)
  - Bollinger Bands (布林带)
  - SMA (简单移动平均)
  - EMA (指数移动平均)
- 生成买入/卖出信号
- SkillPay集成，按次收费

## API 使用

### 端点

```
GET /api/index?symbol=BTCUSDT&interval=1h
```

### 参数

| 参数 | 说明 | 默认值 | 示例 |
|------|------|--------|------|
| symbol | 交易对 | BTCUSDT | ETHUSDT, BTCUSDT |
| interval | 时间周期 | 1h | 1m, 5m, 15m, 1h, 4h, 1d |
| userId | 用户ID（付费） | demo | 用户唯一标识 |

### 返回示例

```json
{
  "success": true,
  "symbol": "BTCUSDT",
  "currentPrice": 43250.50,
  "indicators": {
    "rsi": {
      "value": 65.2,
      "signal": "neutral"
    },
    "macd": {
      "macd": 150.5,
      "signal": 120.3,
      "histogram": 30.2,
      "trend": "bullish"
    }
  },
  "signal": {
    "recommendation": "BUY",
    "confidence": "medium"
  }
}
```

## 部署到 Vercel

### 方式一：通过 Vercel CLI

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录 Vercel
vercel login

# 3. 部署
vercel --prod

# 4. 设置环境变量
vercel env add SKILLPAY_API_KEY
```

### 方式二：通过 GitHub + Vercel Dashboard

1. 将代码推送到 GitHub
2. 在 Vercel Dashboard 导入项目
3. 设置环境变量 `SKILLPAY_API_KEY`
4. 自动部署

## SkillPay 集成

### 获取 API Key

1. 登录 [SkillPay](https://skillpay.me)
2. 进入 Dashboard
3. 获取 API Key

### 设置定价

推荐定价：
- 单次分析：$0.05
- 批量分析（10次）：$0.40
- 高级分析（AI预测）：$0.15

## 本地开发

```bash
# 安装依赖
npm install

# 本地运行
vercel dev

# 测试
curl "http://localhost:3000/api/index?symbol=BTCUSDT"
```

## 收入预估

| 日均调用 | 单价 | 日收入 | 月收入 |
|----------|------|--------|--------|
| 100次 | $0.05 | $5 | $150 |
| 500次 | $0.05 | $25 | $750 |
| 1000次 | $0.05 | $50 | $1,500 |

## 许可证

MIT


## Deployed on Vercel
# Vercel Deployment
