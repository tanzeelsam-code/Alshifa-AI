# Alshifa AI Medical Platform

A comprehensive medical assistance platform with AI-powered intake, multi-language support, and intelligent triage.

## 🚀 Quick Start

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev
```

The application will be available at `http://localhost:5173`

## ✨ Key Features

### 🏥 Medical Intake System
- Interactive SVG body map with 30+ anatomical zones
- Context-aware clinical question trees
- Multi-language support (English, Urdu, Roman Urdu)
- Real-time emergency detection
- Progressive 6-phase intake flow

### 👤 User Management
- Role-based access (Patient, Doctor, Admin)
- Secure authentication with encryption
- Session management with timeout
- Multi-tab conflict detection

### 💊 Medication Management
- Medication tracking and logging
- Adherence monitoring
- Prescription management

### 📊 Dashboards
- Patient dashboard with appointment history
- Doctor dashboard with patient summaries
- Cost tracking and analytics

## 📁 Project Structure

```
Alshifa-Al-main/
├── src/
│   ├── intake/              # Medical intake system
│   │   ├── IntakeScreen.tsx
│   │   ├── UnifiedIntakeFlow.tsx
│   │   ├── orchestrator/
│   │   ├── steps/
│   │   ├── models/
│   │   └── trees/
│   ├── components/          # UI components
│   ├── context/            # React contexts
│   ├── services/           # Business logic
│   └── utils/              # Utilities
├── docs/                   # Documentation
│   ├── README.md
│   └── INTAKE_IMPROVEMENTS.md
└── App.tsx                 # Main application

```

## 📖 Documentation

See the [docs](./docs) folder for detailed documentation:
- [Intake System Improvements](./docs/INTAKE_IMPROVEMENTS.md) - Comprehensive overview of the medical intake enhancements

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite
- **Styling**: TailwindCSS
- **State Management**: React Context
- **Security**: Encryption utilities, password hashing
- **Mobile**: Capacitor (for Android/iOS)

## 🔒 Security Features

- End-to-end encryption for sensitive data
- Password hashing with bcrypt
- Session timeout (30 minutes)
- Multi-tab security
- User-specific encryption keys

## 🌐 Internationalization

Full support for:
- **English** (en)
- **Urdu** (ur) - RTL support ready
- **Roman Urdu** (roman)

## 🚑 Emergency Features

- Real-time emergency screening during intake
- Critical question detection
- Immediate alert system
- Emergency contact options

## 📱 Mobile Support

- Responsive design
- Touch-optimized interactions
- Mobile-first approach
- Capacitor integration for native features

## 🧪 Development

```bash
# Install dependencies
npm install --legacy-peer-deps

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 Current Status

✅ **Fully Functional**
- Complete authentication flow
- Medical intake system operational
- Dashboard navigation working
- Multi-language support active
- Emergency detection enabled

## 🤝 Contributing

This is a medical application. Please ensure:
- HIPAA compliance considerations
- Patient data security
- Clinical accuracy in medical logic
- Accessibility standards

## 📄 License

[Add your license information here]

## 🙏 Acknowledgments

Built with modern web technologies to provide accessible healthcare assistance.

---

**For detailed technical documentation, see the [docs](./docs) folder.**
# Force Vercel deployment
