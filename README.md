# Auction Platform

A real-time auction platform built with React, Node.js, and Socket.IO for conducting live auctions.

## 🚀 Features

- **Real-time bidding** with Socket.IO
- **Admin dashboard** for managing auctions
- **Bidder interface** for participating in auctions
- **Timer-based auctions** with automatic ending
- **User authentication** with JWT
- **Responsive design** with Tailwind CSS

## 🏗️ Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- Socket.IO Client

### Backend
- Node.js
- Express.js
- Socket.IO
- Sequelize ORM
- SQLite (development) / PostgreSQL (production)

### Database
- SQLite (local development)
- Supabase PostgreSQL (production deployment)

### Deployment
- Frontend: Vercel
- Backend: Vercel
- Database: Supabase

## 🚀 Quick Start

### Development Setup

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd auction-platform
```

2. **Install dependencies:**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Start development servers:**
```bash
# From root directory
npm run dev
```

This will start both frontend (port 5173) and backend (port 5000) simultaneously.

### Environment Variables

**Backend (.env):**
```
PORT=5000
JWT_SECRET=your-jwt-secret
BASE_PRICE=50
MAX_WALLET=10000
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:5000
```

## ☁️ Deployment

### Deploy to Vercel with Supabase

Follow the detailed deployment guide in [DEPLOYMENT_STEPS.md](DEPLOYMENT_STEPS.md)

### Automated Deployment Script

For Windows:
```powershell
# Run from project root
.\deploy.ps1
```

For macOS/Linux:
```bash
# Run from project root
./deploy.sh
```

### Manual Deployment Steps

1. **Create Supabase Database**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Get your DATABASE_URL

2. **Deploy Backend to Vercel**
   - Connect GitHub repository
   - Set root directory to `backend`
   - Add environment variables:
     - `DATABASE_URL` (from Supabase)
     - `JWT_SECRET` (random string)
     - `NODE_ENV=production`
     - `ALLOWED_ORIGINS` (your frontend URL)

3. **Deploy Frontend to Vercel**
   - Connect same GitHub repository
   - Set root directory to `frontend`
   - Add environment variable:
     - `VITE_API_URL` (your backend URL)

## 🔧 Development

### Project Structure
```
auction-platform/
├── backend/
│   ├── config/          # Database configuration
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── sockets/         # Socket.IO handlers
│   └── migrations/      # Database migrations
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   └── services/    # API services
│   └── public/          # Static assets
```

### API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `GET /api/bids/items` - Get all items
- `POST /api/bids/:id/bid` - Place bid on item
- `GET /api/admin/logs` - Get admin logs

### WebSockets Events

- `auction-item` - Receive current item and time left
- `user-list` - Receive online user list
- `updated-winners` - Winner notification to bidders
- `bid-placed` - New bid notification
- `item-ended` - Item auction ended

## 🛠️ Customization

### Adding New Items
Modify `backend/utils/itemData.js` to add new auction items.

### Changing Auction Rules
Update constants in `backend/server.js`:
- `BASE_PRICE` - Starting bid amount
- `MAX_WALLET` - Maximum user wallet balance

### Styling
Customize Tailwind classes in React components or modify `frontend/src/index.css`.

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation
- Rate limiting (can be added)

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile devices

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the [DEPLOYMENT_STEPS.md](DEPLOYMENT_STEPS.md) guide
2. Review the troubleshooting section
3. Open an issue on GitHub

## 🎯 Demo Credentials

**Admin:**
- Username: `admin`
- Password: `admin123`

**Bidder:**
- Create your own account or use existing credentials