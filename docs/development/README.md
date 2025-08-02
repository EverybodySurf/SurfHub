# 👨‍💻 Development Documentation

This directory contains technical implementation guides and development documentation for SurfHub.

## 📂 **Available Documentation**

### 🌊 **Swell Forecasting System**
- [`SWELL_FORECAST_DOCUMENTATION.md`](./SWELL_FORECAST_DOCUMENTATION.md) - Complete technical documentation for the swell forecast system implementation, including:
  - System architecture and component breakdown
  - API routes and data flow
  - Genkit AI integration
  - Frontend component structure
  - Database schema and types

## 🔧 **Development Guidelines**

### **Code Organization**
The swell forecasting system follows a clean architecture pattern:
```
Frontend (React/Next.js)
├── Swell Forecaster Page (/swell-forecaster)
├── Swell Forecast Client Component
└── Actions (API communication)

Backend API (/api/swell-forecast)
├── Route handlers
├── Data validation
└── AI integration

AI/ML Layer (Genkit)
├── AI flows and prompts
├── Weather data processing
└── Intelligent analysis
```

### **Key Technologies**
- **Next.js 14** - App router and server components
- **Genkit AI** - Google's AI development framework
- **TypeScript** - Type-safe development
- **Zod** - Schema validation
- **OpenWeatherMap API** - Weather data source

## 🚀 **Getting Started with Development**

1. **Review the main guide**: [`../COMPREHENSIVE_SURF_FORECAST_GUIDE.md`](../COMPREHENSIVE_SURF_FORECAST_GUIDE.md)
2. **Check setup guides**: [`../setup-guides/`](../setup-guides/)
3. **Study system architecture**: [`SWELL_FORECAST_DOCUMENTATION.md`](./SWELL_FORECAST_DOCUMENTATION.md)

## 🔗 **Related Resources**

- **Setup Guides**: [`../setup-guides/`](../setup-guides/) - Environment setup and configuration
- **Archived Docs**: [`../archived/`](../archived/) - Historical implementation notes
- **Project Blueprint**: [`../blueprint.md`](../blueprint.md) - Original project vision

---

*This documentation is maintained alongside code changes. Always refer to the latest version for current implementation details.*
