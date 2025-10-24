# CRM System Login Credentials

## 🚀 System Status
✅ **Server**: Running on http://localhost:3000  
✅ **Database**: SQLite with Prisma ORM  
✅ **Authentication**: NextAuth.js with credentials provider  
✅ **Code Quality**: No ESLint errors  

## 👤 Login Credentials (Admin & Employee Only)

### 🎯 Default Users

#### Admin User
- **Email**: `admin@crm.com`
- **Password**: `1234`
- **Role**: ADMIN
- **Redirect**: `/admin/dashboard`
- **Access**: Full system administration

#### Employee User
- **Email**: `john@crm.com`
- **Password**: `1234`
- **Role**: EMPLOYEE
- **Redirect**: `/employee/dashboard`
- **Access**: Employee dashboard and tasks

## 🔐 User Roles & Permissions

### ADMIN (admin@crm.com)
- Full system access
- Employee management
- Customer management
- Ticket management
- Visit tracking
- System configuration
- Reports and analytics

### EMPLOYEE (john@crm.com)
- Personal dashboard
- Task management
- Attendance tracking
- Customer visits
- Ticket assignments
- Profile management

## 📱 Access URLs
- **Main Application**: http://localhost:3000
- **Login Page**: http://localhost:3000/login
- **Admin Dashboard**: http://localhost:3000/admin/dashboard
- **Employee Dashboard**: http://localhost:3000/employee/dashboard

## 🔐 Authentication Features
- ✅ **Email & Password Login**
- ✅ **Remember Me** (Session persistence)
- ✅ **Forgot Password** (Coming soon)
- ✅ **Account Validation** (Active/inactive status)
- ✅ **Role-based Redirection**
- ✅ **Session Management** (24-hour timeout)
- ✅ **Input Validation** (Email format, password requirements)
- ✅ **Toast Notifications** (Success/error messages)
- ✅ **Secure Password Hashing** (bcryptjs)
- ✅ **Last Login Tracking**

## 🛠️ Technical Details
- **Framework**: Next.js 15 with App Router
- **Database**: SQLite + Prisma ORM
- **Authentication**: NextAuth.js v4
- **Styling**: Tailwind CSS + shadcn/ui
- **TypeScript**: Full type safety
- **Session Strategy**: JWT-based
- **Password Hashing**: bcryptjs

## 🔄 Login Flow
1. User enters credentials at `/login`
2. System validates email format and password
3. Backend authenticates against database
4. Checks account active status
5. Creates secure session (24-hour expiry)
6. Redirects based on user role:
   - ADMIN → `/admin/dashboard`
   - EMPLOYEE → `/employee/dashboard`
7. Shows success/error toast messages

## 📝 Security Features
- Password hashing with bcryptjs
- Session timeout after 24 hours
- Account active/inactive status
- Input validation and sanitization
- HTTPS-only communication (in production)
- Secure session management

## 🎯 System Restrictions
- **No public signup** - Only Admin can create employee accounts
- **Only two roles** - Admin and Employee
- **Email-based login** - No username login
- **Account activation** - Admin controls account status

---
*Last updated: $(date)*  
*System: CRM with Admin & Employee roles only*