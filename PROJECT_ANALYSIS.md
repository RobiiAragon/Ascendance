# ASCENDANCE HUB - Project Analysis

> **Last Updated:** January 2026
> **Version:** Production
> **Total Lines of Code:** ~69,000+ JavaScript

---

## Executive Summary

**Ascendance Hub** is a comprehensive enterprise web application for retail store management (Vape/Tobacco shops) featuring employee management, inventory tracking, sales analytics, AI assistance, and multi-store Shopify integration.

---

## 1. Project Structure

```
Ascendance/
├── index.html                    # Main application entry
├── login.html                    # Authentication page
├── 404.html                      # Error page
├── sales-report.html             # Sales reporting
├── joinus.html                   # Job application page
├── storage-test.html             # Storage testing utility
│
├── css/
│   ├── styles.css                # Main styles (Light/Dark theme)
│   └── abundance-styles.css      # Abundance Cloud specific styles
│
├── js/                           # JavaScript modules (~69,000 lines)
│   ├── script.js                 # Core module (46,397 lines)
│   ├── firebase-utils.js         # Firebase utilities (5,402 lines)
│   ├── celeste-ai.js             # AI Assistant (3,172 lines)
│   ├── api-client.js             # API client (2,968 lines)
│   ├── transfers.js              # Inventory transfers (3,835 lines)
│   ├── shopify-analytics.js      # Shopify analytics (2,584 lines)
│   ├── abundance-cloud.js        # Order management (1,781 lines)
│   ├── barcode-labels.js         # Barcode generation (1,083 lines)
│   ├── hr-applications.js        # HR management (999 lines)
│   ├── gconomics-firebase.js     # Personal finance (498 lines)
│   ├── firebase-sync.js          # Data synchronization (428 lines)
│   └── auth-manager.js           # Authentication (183 lines)
│
├── config/
│   ├── env.js                    # Environment configuration
│   ├── abundance-config.js       # Main configuration
│   └── abundance-config.template.js
│
├── kanban/                       # Kanban module
│   ├── index.html
│   └── config/
│
├── functions/                    # Firebase Cloud Functions
│   └── index.js
│
├── img/                          # Visual assets
│   ├── AH.png                    # Main logo
│   ├── AH.ico                    # Favicon
│   └── celeste-ai.svg            # Celeste AI avatar
│
├── firebase.json                 # Firebase configuration
├── firestore.indexes.json        # Firestore indexes
├── firestore.rules               # Security rules
├── netlify.toml                  # Netlify deployment
└── CNAME                         # Custom domain
```

---

## 2. Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| HTML5 | - | Semantic structure |
| CSS3 | - | Styling, animations, themes |
| JavaScript (Vanilla) | ES6+ | Application logic |
| Chart.js | 4.4.1 | Data visualization |
| ZXing Library | Latest | Barcode scanning |
| Font Awesome | 6.4.0 | Icons |
| Google Fonts | Outfit, Space Mono | Typography |

### Backend & Cloud Services
| Service | Provider | Purpose |
|---------|----------|---------|
| Authentication | Firebase Auth | User authentication |
| Database | Firestore | NoSQL data storage |
| File Storage | Firebase Storage | Images, documents |
| Serverless | Cloud Functions | Backend logic |
| E-commerce | Shopify API | Orders, products |
| AI | OpenAI GPT-4o | Celeste AI Assistant |

### Hosting & Deployment
- Firebase Hosting (Primary)
- Netlify (Alternative)
- GitHub Pages compatible

---

## 3. Core Features

### A. Authentication & Access Control
- **Role-based access**: Admin, Manager, Employee
- **42+ protected pages** with permission control
- **Session management**: 30-minute timeout
- **Persistent sessions** via SessionStorage

**Permission Matrix:**
| Role | Pages Access | Key Capabilities |
|------|-------------|------------------|
| Admin | 42 pages | Full system access, employee management, settings |
| Manager | 27 pages | Team management, reports, inventory |
| Employee | 20 pages | Clock in/out, schedules, basic operations |

### B. Employee Management
- Full CRUD operations
- Multi-store assignment (6 locations)
- Profile fields: name, role, email, phone, emergency contact, allergies, hire date
- Grid/List view toggle
- Real-time global search
- Firebase + localStorage sync

### C. Time & Attendance
- **Clock In/Out System**
  - GPS geofencing (100m radius)
  - Real-time photo capture
  - Location coordinates logging
  - Flexible mode for remote work
- **Schedule Management**: Shift calendar
- **Daily Checklist**: Shift-specific tasks
- **Attendance Reports**: Export to PDF/Excel

### D. Inventory Management
- **Transfers System**
  - Inter-store transfers with auto-generated folios (TR-0001)
  - Product tracking with flavors and quantities
  - **AI Photo Analysis**: Detects open/exposed boxes
  - **Smart Multipliers**: Auto-detects Geek Bar Pulse (5x multiplier for large boxes)
  - Box size classification (SMALL/LARGE)
- **Restock Requests**: Low stock alerts
- **Supplies Tracking**: Material inventory

### E. Shopify Integration (Abundance Cloud)
- **3 Connected Stores**: VSU, Loyal Vaper, Miramar Wine & Liquor
- **Order Management**
  - Real-time sync with Shopify
  - Status filtering: Shipping, Pickup, Delivery, Manual
  - Order search by ID
- **Barcode Scanner**
  - QR/barcode reading via webcam
  - Order validation
- **Multi-location Support**: Miramar, Chula Vista, Morena, North Park, Kearny Mesa

### F. Sales Analytics
- **Period Analysis**: Today, week, month, quarter, year
- **Store Breakdown**: Per-location metrics
- **Tax Calculations**: CECET, sales tax breakdown
- **Visualizations**: Chart.js graphs
- **Export Options**: PDF, Excel
- **Best Sellers (The Champs)**: Product ranking
- **Sales Performance**: Employee metrics

### G. Celeste AI Assistant
- **Powered by OpenAI GPT-4o**
- Natural language processing
- Context-aware responses
- System action integration
- Employee search assistance
- Order information queries
- **G-Force**: Daily motivational quotes and affirmations

### H. Security & Compliance
- **License Management**
  - Expiration tracking
  - Status: Valid, Expired, Expiring Soon
  - Document storage
- **Lease Management**: Rental agreements
- **Password Manager**
  - Secure storage (encrypted)
  - Random password generator
  - Copy to clipboard
- **Risk Notes**: Operational risk registry
- **Issues Registry**: Problem tracking

### I. Financial Operations
- **Invoices & Payments**: Invoice management
- **Cash Control**: Register reconciliation
- **Change Records**: Transaction audit
- **Treasury (Heady Pieces)**: Special item control

### J. Communication
- **Announcements**: Real-time notifications with badge counter
- **Customer Care**: Support ticket system

### K. HR & Training
- **Training Center**
  - Video training (YouTube, Vimeo)
  - Document library (PDFs)
  - Progress tracking (%)
  - Required vs optional trainings
- **HR Applications**: Job application review system

### L. Personal Finance (G-conomics)
- Expense tracking
- Category management
- Receipt OCR via AI
- Financial reports

---

## 4. Data Models (Firestore Collections)

```javascript
// 18 Core Collections
FIREBASE_COLLECTIONS = {
    employees,          // Employee records
    roles,              // Role definitions
    users,              // Authenticated users
    thieves,            // Theft incident database
    clockin,            // Attendance records
    products,           // Product inventory
    trainings,          // Training materials
    schedules,          // Work schedules
    dayOffRequests,     // Time-off requests
    treasury,           // Special items
    announcements,      // System announcements
    changeRecords,      // Change tracking
    cashOut,            // Cash register records
    gifts,              // Gift control
    issues,             // Issue tracking
    gconomics,          // Personal expenses
    licenses,           // Business licenses
    passwords,          // Secure password storage
    settings,           // App settings
    job_applications,   // Job applications
    transfers,          // Inventory transfers
    app_config          // Application configuration
}
```

### Key Document Schemas

**Employee:**
```javascript
{
    id: string,
    name: string,
    email: string,
    phone: string,
    role: "admin" | "manager" | "employee",
    store: string,
    status: "active" | "inactive",
    emergencyContact: string,
    allergies: string,
    hireDate: ISO string,
    createdAt: timestamp,
    updatedAt: timestamp
}
```

**Transfer:**
```javascript
{
    id: string,
    folio: "TR-0001",
    fromStore: string,
    toStore: string,
    items: [{
        productName: string,
        flavor: string,
        quantity: number,
        size: "SMALL" | "LARGE",
        hasBoxOpen: boolean,
        notes: string
    }],
    shipDate: ISO string,
    sentBy: string,
    photoUrl: string,
    createdAt: timestamp
}
```

**ClockIn:**
```javascript
{
    id: string,
    employeeId: string,
    date: ISO string,
    clockInTime: timestamp,
    clockOutTime: timestamp,
    latitude: number,
    longitude: number,
    store: string,
    photoUrl: string,
    duration: number,
    isOnGeofence: boolean
}
```

---

## 5. External Integrations

### Shopify API
```
Stores Connected: 3
├── VSU (Vape Smoke Universe)
│   └── Locations: Miramar, Chula Vista, Morena, North Park, Kearny Mesa
├── Loyal Vaper
│   └── Single location
└── Miramar Wine & Liquor
    └── Single location

API Version: 2024-01
Endpoints Used:
├── /admin/api/2024-01/orders.json
├── /admin/api/2024-01/locations.json
├── /admin/api/2024-01/products.json
└── GraphQL API (tax details)
```

### Firebase
```
Project: ascendance-b3e52
Services:
├── Authentication
├── Firestore (database)
├── Cloud Storage (images)
├── Cloud Functions (serverless)
└── Hosting
```

### OpenAI
```
Model: GPT-4o
Max Tokens: 1024
Usage: Celeste AI Assistant
Storage: Firebase (app_config/openai_settings)
```

---

## 6. UI/UX Features

### Theme System
- **Dark Mode** (Default): Purple/Indigo accents (#6366f1)
- **Light Mode**: White/gray backgrounds
- Toggle in header

### Components
- **Sidebar**: 50+ navigation options, categorized
- **Header**: Search (Ctrl+K), notifications, user info
- **Cards**: Stats, employees, products, licenses
- **Modals**: Confirmation, forms, details view
- **Tables**: Search, filters, pagination, export
- **Forms**: Real-time validation, protection against accidental close

### Responsive Design
- Mobile menu (hamburger)
- Touch-friendly (min 44px targets)
- Adaptive layouts (Grid/Flexbox)
- Tablet, desktop, mobile breakpoints

### Animations
- Fade-in/out (0.2-0.3s)
- Slide animations for modals
- Gradient loading states
- Hover effects
- Toast notifications

---

## 7. Advanced Features

### Offline Support
- localStorage fallback for all modules
- Auto-sync every 2 minutes
- Conflict resolution: Cloud wins

### AI Vision Analysis
- Photo analysis in transfers
- Open/exposed box detection
- Brand recognition (Geek Bar Pulse)
- OCR for receipts (G-conomics)

### Security Features
- Button lock manager (prevents double-clicks)
- Session timeout (30 min)
- Activity logging (audit trail)
- Encrypted password storage

### Geofencing
- 100m configurable radius
- Multi-store support
- Strict/flexible modes
- Location always logged

---

## 8. Store Locations

| Store | Address | Geofence |
|-------|---------|----------|
| Miramar | San Diego, CA | Enabled |
| Morena | San Diego, CA | Enabled |
| Kearny Mesa | San Diego, CA | Enabled |
| Chula Vista | Chula Vista, CA | Enabled |
| North Park | San Diego, CA | Enabled |

---

## 9. Project Statistics

| Metric | Value |
|--------|-------|
| Total JavaScript | ~69,000 lines |
| JavaScript Modules | 12 files |
| Total Functions | 1,191+ |
| CSS Lines | ~2,000+ |
| Firestore Collections | 18 |
| Connected Shopify Stores | 3 |
| User Roles | 3 |
| Pages/Views | 42+ |
| API Endpoints | 30+ |

---

## 10. Recent Updates (2025-2026)

### Latest Commits
1. **Open/Display Box Detection** - AI now warns about exposed boxes in transfer photos
2. **Photo Saving Fix** - Fixed issue with photos not saving in transfers
3. **Transfer Display Improvements** - Shows flavors, boxes, and vapes count
4. **Geek Bar Pulse Detection** - Force 5x multiplier for large boxes
5. **Box Terminology Update** - LARGE/SMALL box terminology based on dimensions

### Key Improvements
- Enhanced AI photo analysis for inventory transfers
- Better product categorization (Vapes, Boxes, Disposables)
- Improved transfer documentation with visual indicators
- Smarter quantity calculations based on product type

---

## 11. Development Notes

### Code Style
- Vanilla JavaScript (no frameworks)
- Modular architecture
- Firebase-first with localStorage fallback
- Real-time synchronization
- Event-driven UI updates

### Best Practices
- Role-based access control
- Input validation
- Error handling with user feedback
- Activity logging for audit
- Responsive design patterns

### Known Considerations
- CORS proxy required for Shopify API calls from frontend
- Firebase rules should be production-hardened
- API keys stored in config files (gitignored)

---

## 12. Future Roadmap Considerations

- [ ] Mobile native app (React Native/Flutter)
- [ ] Advanced reporting dashboard
- [ ] Customer loyalty program integration
- [ ] Automated inventory reordering
- [ ] Multi-language support
- [ ] Advanced AI analytics predictions

---

**Generated:** January 2026
**Maintained by:** Development Team
