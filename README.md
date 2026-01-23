# The 3C Mall

A beta-gated grocery comparison and meal planning platform that helps users save money by comparing prices across multiple stores.

## 🎯 Overview

**The 3C Mall** provides intelligent grocery shopping optimization with:
- Multi-store price comparison
- Smart shopping route planning
- Meal planning assistance
- Beta-gated access control
- Email-based waitlist management

## 🚀 Quick Links

### For Users
- **Landing Page:** the3cmall.com
- **App Access:** the3cmall.app (requires beta code)
- **Waitlist:** Sign up on landing page

### For Developers
- **Setup Guide:** [STARTUP_CHECKLIST.md](STARTUP_CHECKLIST.md)
- **Deployment:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Project Status:** [PROJECT_STATUS.md](PROJECT_STATUS.md)
- **API Status:** [API_STATUS.md](API_STATUS.md) - Check Kroger API approval status here
- **Server Docs:** [SERVER_QUICK_REF.md](SERVER_QUICK_REF.md)

## 🏪 Store Integration Status

Currently using **demo pricing data** for:
- Costco
- Walmart
- ALDI
- Target
- **Kroger** (🟡 API approval pending)
- Safeway/Albertsons

**How to check Kroger API approval status:**
1. See [HOW_TO_CHECK_KROGER_APPROVAL.md](HOW_TO_CHECK_KROGER_APPROVAL.md) - **Quick answer to "when will I know?"**
2. See [API_STATUS.md](API_STATUS.md) for detailed current status
3. Log in to [Kroger Developer Portal](https://developer.kroger.com/)
4. Check email for approval notifications
5. Once approved, follow [KROGER_API_GUIDE.md](KROGER_API_GUIDE.md) for integration

## 🛠️ Tech Stack

### Frontend
- React + Vite
- CSS (custom styling)
- Fetch API for backend communication

### Backend
- Node.js + Express
- SQLite database
- Nodemailer (email service)
- OAuth 2.0 (for API integrations)

## 📦 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/EllVii/the3c-mall.git
cd the3c-mall

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

### Configuration

1. Configure backend (see [STARTUP_CHECKLIST.md](STARTUP_CHECKLIST.md)):
   ```bash
   # Edit server/.env with your SMTP credentials
   cp server/.env.example server/.env
   ```

2. Start development servers:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm start

   # Terminal 2 - Frontend
   cd ..
   npm run dev
   ```

3. Visit http://localhost:5173

## 📋 Project Structure

```
the3c-mall/
├── src/                          # Frontend React app
│   ├── pages/                    # Page components
│   ├── assets/components/        # Reusable components
│   ├── utils/                    # Utility functions
│   └── styles/                   # CSS files
├── server/                       # Backend Node.js server
│   ├── index.js                  # Main server file
│   ├── db.js                     # Database service
│   ├── email.js                  # Email service
│   └── services/                 # API integrations
├── API_STATUS.md                 # Third-party API status tracking
├── KROGER_API_GUIDE.md          # Kroger integration guide
├── PROJECT_STATUS.md            # Complete project overview
├── DEPLOYMENT_GUIDE.md          # Deployment instructions
└── STARTUP_CHECKLIST.md         # Setup checklist
```

## 🔑 Key Features

- ✅ Multi-store price comparison
- ✅ Smart shopping mode (single vs multi-store)
- ✅ Beta code access control
- ✅ Email waitlist management
- ✅ User profile customization
- ✅ Meal planning tools
- 🟡 Live API integration (Kroger pending approval)

## 📊 API Integration

The app is designed to integrate with store APIs for real-time pricing:

- **Kroger:** Pending approval (check [API_STATUS.md](API_STATUS.md))
- **Walmart:** Not yet applied
- **Target:** Not yet applied
- **Others:** See [API_STATUS.md](API_STATUS.md) for full status

To track API approvals or integrate once approved, see:
- [HOW_TO_CHECK_KROGER_APPROVAL.md](HOW_TO_CHECK_KROGER_APPROVAL.md) - **Answer: When will I know if approved?**
- [API_STATUS.md](API_STATUS.md) - Current status and tracking
- [KROGER_API_GUIDE.md](KROGER_API_GUIDE.md) - Integration guide after approval

## 🔒 Security

- Environment variables for sensitive data
- CORS protection
- Rate limiting
- Input validation
- Secure credential storage

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| [HOW_TO_CHECK_KROGER_APPROVAL.md](HOW_TO_CHECK_KROGER_APPROVAL.md) | **How to know when/if Kroger API is approved** |
| [API_STATUS.md](API_STATUS.md) | Track third-party API approvals (Kroger, etc.) |
| [KROGER_API_GUIDE.md](KROGER_API_GUIDE.md) | Kroger API integration implementation |
| [PROJECT_STATUS.md](PROJECT_STATUS.md) | Complete project overview |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Production deployment guide |
| [STARTUP_CHECKLIST.md](STARTUP_CHECKLIST.md) | Quick setup guide |
| [SERVER_QUICK_REF.md](SERVER_QUICK_REF.md) | Backend reference |
| [REPORTING_SETUP.md](REPORTING_SETUP.md) | Email reporting details |

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

## 📧 Contact

- **Project Lead:** ellviisauces@gmail.com
- **Support:** See documentation files for troubleshooting

## 📝 License

Private/Proprietary - All rights reserved

---

**Status:** ✅ Production Ready (using demo data)  
**Version:** 1.0.0  
**Last Updated:** January 2024

**Note:** Currently using mock pricing data. Real-time pricing will be available once Kroger API is approved. Check [API_STATUS.md](API_STATUS.md) for current status.

