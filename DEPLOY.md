# 快速部署指南

## 方式一：Vercel 一键部署（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/waterbamb/crypto-technical-analyzer&env=SKILLPAY_API_KEY&project-name=crypto-technical-analyzer)

### 步骤：
1. 点击上方按钮
2. 登录 GitHub 授权
3. 在 Environment Variables 中填入：
   ```
   SKILLPAY_API_KEY=sk_6590171d5f452d21badff2469fe7999aa02908bf3768866ab46acf001d6fd052
   ```
4. 点击 Deploy
5. 等待部署完成，获得 API URL

## 方式二：手动导入

1. 访问 https://vercel.com/new
2. 选择 Import Git Repository
3. 选择 `waterbamb/crypto-technical-analyzer`
4. 在 Environment Variables 添加 `SKILLPAY_API_KEY`
5. 点击 Deploy

## 部署后测试

```bash
curl "https://your-app.vercel.app/api/index?symbol=BTCUSDT&interval=1h&demo=true"
```

## 注册到 SkillPay

部署成功后：
1. 登录 https://skillpay.me
2. 添加新 Skill
3. 填写 API URL 和定价（建议 $0.05/次）
4. 发布上线开始赚钱
