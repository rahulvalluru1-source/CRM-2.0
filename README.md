# CRM & Field Tracking System

A comprehensive CRM and Employee Field Tracking Management System built with Next.js 15, TypeScript, and modern web technologies.

## 🚀 Features

### Core Modules

1. **🔐 Authentication System**
   - Role-based access control (Admin, Employee, Support, Sales)
   - Secure login/logout with JWT
   - Session management
   - Role-based redirection

2. **👥 User Profile Management**
   - Complete user profiles with personal and professional information
   - Profile picture upload
   - Digital signature support
   - Edit capabilities for users and admins

3. **🎫 CRM & Ticketing System**
   - Create and manage support tickets
   - Customer management (existing/new)
   - Ticket categorization and priority
   - Transfer tickets between users
   - Resolution tracking

4. **📍 Employee Field Tracking**
   - Check-in/Check-out functionality
   - Location tracking with GPS
   - Visit management with photo proof
   - Digital signatures for visits
   - Attendance tracking

5. **📊 Dashboards**
   - **Admin Dashboard**: System overview, analytics, live map
   - **Employee Dashboard**: Personal stats, quick actions
   - **CRM Dashboard**: Support and sales metrics

6. **🔔 Notifications**
   - Real-time notifications
   - Alert system for various events
   - In-app notification center

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript 5
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js v4
- **State Management**: Zustand, React Context
- **UI Components**: shadcn/ui, Lucide icons
- **Real-time**: Socket.io
- **AI Integration**: z-ai-web-dev-sdk

## 📦 Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
4. Set up the database:
   ```bash
   npm run db:push
   npm run db:generate
   ```

5. Seed the database with sample users:
   ```bash
   curl -X POST http://localhost:3000/api/seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## 👤 Default Users

After seeding, you can use these credentials:

- **Admin**: admin@crm.com / admin123
- **Employee**: john@crm.com / emp123
- **Support**: support@crm.com / support123
- **Sales**: sales@crm.com / sales123

## 🏗 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── employee/          # Employee dashboard
│   ├── crm/               # CRM dashboard
│   ├── tickets/           # Ticket management
│   ├── profile/           # User profiles
│   └── login/             # Authentication
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── contexts/             # React contexts
├── hooks/                # Custom hooks
├── lib/                  # Utilities and configurations
└── prisma/               # Database schema
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema to database
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations

## 🌟 Key Features in Detail

### Authentication & Authorization
- Secure login with password hashing
- Role-based access control
- Automatic redirection based on user role
- Session persistence

### Dashboard Systems
- **Admin**: System overview, user management, analytics
- **Employee**: Personal stats, attendance, visits
- **CRM**: Ticket management, customer relations, sales metrics

### Ticket Management
- Create tickets with unique IDs
- Customer association (existing/new)
- Priority levels and status tracking
- Transfer capabilities between users

### User Profiles
- Comprehensive profile management
- Profile pictures and digital signatures
- Professional information tracking
- Edit permissions based on role

## 🚀 Getting Started

1. **Login**: Use any of the default user credentials
2. **Navigate**: Based on your role, you'll be redirected to the appropriate dashboard
3. **Explore**: Check out different features like ticket creation, profile management, etc.

## 📱 Responsive Design

The system is fully responsive and works on:
- Desktop browsers (Admin portal)
- Mobile devices (Employee PWA)
- Tablets (Support and Sales interfaces)

## 🔔 Notification System

Real-time notifications for:
- Ticket assignments
- Location alerts
- Check-in reminders
- System updates

## 🗺 Location Tracking

- GPS-based location tracking
- Check-in/out with location verification
- Visit management with photo proof
- Fake GPS detection

## 📊 Analytics & Reporting

- Performance metrics
- Attendance reports
- Ticket statistics
- Customer insights

## 🛡 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control
- Input validation and sanitization

## 🔄 Future Enhancements

- [ ] Mobile app development
- [ ] Advanced analytics
- [ ] Email/SMS integration
- [ ] Advanced reporting
- [ ] API integrations

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📞 Support

For support and questions, please open an issue in the repository.