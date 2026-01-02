# 🛡️ LedgerShield

**Unified Supply Chain Platform for Hospitals, Public Distribution Systems & NGOs**

---

## 🎯 The Problem

Hospitals, public distribution systems (PSD), and NGOs struggle to keep medicines, food, and other essentials available in the right place at the right time. 

**Key Challenges**:
- Data on sales/usage, inventory, and purchase orders lives in **separate systems**
- Teams spot stock issues only when **shelves are already empty** or over-full
- **30-40% wastage** due to expiry and overstocking
- **20-25% stock-outs** causing critical shortages
- **Zero visibility** across departments and locations

## 💡 The Solution: LedgerShield

LedgerShield is a **unified supply chain platform** that brings all data together in one place:

✅ **Real-time Inventory Tracking** - See what's in stock across all locations  
✅ **Integrated Sales & Usage** - Track consumption patterns instantly  
✅ **Smart Procurement** - Auto-generate purchase orders before stock-outs  
✅ **AI-Powered Insights** - Predict demand and prevent wastage  
✅ **Role-Based Access** - Admins manage multiple stores, retailers see their own data  
✅ **Interactive Reports** - Visualize trends with charts and analytics  

---

## 🌟 Key Features

### For Section Admins (e.g., Hospital Director, PSD Admin)
- View reports for all sub-stores in your section
- Switch between individual stores or view aggregated data
- Monitor inventory levels across all locations
- Track procurement and sales for the entire section

### For Individual Stores (e.g., Central Store A, City General Hospital)
- Manage your own inventory
- Process sales and track transactions
- Create purchase orders
- Access your store's reports and analytics

### Unified Dashboard
- **Sales Analytics** - Revenue trends, payment methods, category breakdown
- **Inventory Management** - Stock levels, expiry tracking, category distribution
- **Procurement Tracking** - Purchase orders, vendor management, order status
- **Team Activity** - User actions, audit trails, activity logs

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Azure Cosmos DB account (for production)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/ledgershield.git
cd ledgershield

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Azure Cosmos DB credentials to .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Demo Accounts

**Section Admin (PSD)**:
- Email: admin@psd.gov
- Access: All PSD stores

**Retailer (Individual Store)**:
- Email: storeA@psd.gov
- Access: Central Store A only

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: TailwindCSS 4
- **Database**: Azure Cosmos DB
- **Charts**: Recharts (interactive visualizations)
- **Authentication**: Cookie-based session management
- **Deployment**: Vercel (recommended)

---

## 📊 Impact

### Before LedgerShield
❌ 30-40% wastage due to expiry  
❌ 20-25% stock-outs  
❌ Manual tracking and reconciliation  
❌ Data spread across Excel sheets and paper  
❌ No real-time visibility  

### After LedgerShield
✅ Reduce wastage to 10-15%  
✅ Reduce stock-outs to 5%  
✅ Real-time automated tracking  
✅ All data in one unified platform  
✅ AI-powered predictions and insights  

**Result**: Save thousands of rupees, prevent stock-outs, and ensure essentials reach those who need them.

---

## 👥 Team

**LedgerShield** is built by Team LedgerShield for Microsoft ImagineCup 2024:

- **Sourabh Singh** - Project Lead & Full Stack Developer
- **Sahil Sarode** - Frontend Developer & UI/UX Designer  
- **Sneha Darade** - Backend Developer & Data Analyst

---

## 📖 Documentation

- [Implementation Plan](./documents/implementation-plan.md)
- [User Guide](./documents/user-guide.md)
- [API Documentation](./documents/api-docs.md)

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

Built for **Microsoft ImagineCup 2024** to solve real-world supply chain challenges in healthcare and public distribution systems.

**Making supply chains transparent, efficient, and reliable for everyone.** 🛡️
