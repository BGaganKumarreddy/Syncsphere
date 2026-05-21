# SyncSphere 🚀

A collaborative project management and team communication platform built with the MERN stack, fully containerized with Docker, and ready for cloud deployment.

## ✨ Features

- 👥 **User Authentication** - JWT-based secure authentication
- 📋 **Project Management** - Create, manage, and collaborate on projects
- ✅ **Task Tracking** - Organize tasks with different statuses
- 💬 **Real-time Messaging** - Team communication platform
- 🤝 **Team Collaboration** - Create teams and manage members
- 📧 **User Invitations** - Invite team members via email
- 📊 **Dashboards** - Beautiful analytics and project overviews
- 🎨 **Dark/Light Mode** - Theme switching
- 📱 **Responsive Design** - Works on all devices

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router v7** - Client-side routing
- **Context API** - State management

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Nodemailer** - Email service

### DevOps & Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Render** - Backend deployment
- **MongoDB Atlas** - Cloud database
- **Nginx** - Web server (frontend container)

## 🚀 Quick Start

### Prerequisites
- Docker Desktop v20.10+
- Node.js v18+ (for local development)
- MongoDB Atlas account
- Gmail account (for email features)

### Local Development with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd syncsphere
   ```

2. **Create environment file** (`server/.env`)
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0
   JWT_SECRET=your_super_secret_key_2026
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:3000
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_specific_password
   ```

3. **Start the application**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Local Development (Without Docker)

**Backend:**
```bash
cd server
npm install
npm run dev
# Runs on http://localhost:5000
```

**Frontend:**
```bash
cd client
npm install
npm run dev
# Runs on http://localhost:5173
```

## 📦 Docker Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild images
docker-compose up -d --build

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

## ☁️ Cloud Deployment

### Deploy Backend to Render

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Configure:
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
4. Add environment variables
5. Deploy

**Deployment URL:** [https://syncsphere-kjy6.onrender.com](https://syncsphere-kjy6.onrender.com)

### Deploy Frontend

- **Option 1:** Render Web Service
- **Option 2:** Vercel (Recommended)
  - Set Root Directory: `client`
  - Build Command: `npm run build`
  - Output Directory: `dist`

## 🏛️ System Architecture

SyncSphere follows a modern containerized microservices-like architecture designed for seamless scalability, local container parity, and easy cloud deployments.

### 🐳 Local Development Architecture (Docker Compose)
In local development, both services run within an isolated Docker virtual network (`syncsphere-network`). The frontend uses an Nginx reverse proxy to forward `/api/*` traffic to the backend, preventing CORS complications.

```mermaid
graph TD
    User([User Browser]) -->|Accesses Port 3000| Nginx[Frontend: Nginx Container]
    Nginx -->|Serves Static Files| User
    Nginx -->|Proxy Pass /api/*| Express[Backend: Node/Express Container]
    Express -->|Port 5000 / API Responses| Nginx
    Express -->|Mongoose Queries| MongoDB[(MongoDB Atlas Cloud)]
    
    subgraph Local Docker Compose Environment
        Nginx
        Express
    end
```

### ☁️ Production Cloud Deployment Architecture
In production, the backend is containerized/built on Render and connects to a MongoDB Atlas cluster. The frontend is built and deployed as a fast static site on Vercel, querying the public Render URL.

```mermaid
graph LR
    User([User Browser]) -->|Accesses static site| Vercel[Vercel Frontend Host]
    User -->|Direct HTTP API Calls| Render[Render Backend Service]
    Render -->|Queries| MongoDB[(MongoDB Atlas Cloud)]
```

## 📚 Documentation

For comprehensive documentation, see:
- [**DOCKER.md**](./DOCKER.md) - Docker commands reference guide for starting, stopping, and debugging containers.

## 📁 Project Structure

```
syncsphere/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── utils/
│   └── Dockerfile
│
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── middleware/
│   └── Dockerfile
│
├── docker-compose.yml      # Development setup
├── docker-compose.prod.yml # Production setup
├── DEPLOYMENT.md          # Detailed deployment guide
└── README.md              # This file
```

## 🔐 Environment Variables

### Backend (.env)

```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Frontend (.env.local)

```
VITE_API_URL=http://localhost:5000
```

## 🧪 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Teams
- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create team
- `GET /api/teams/:id` - Get team details
- `PUT /api/teams/:id` - Update team

### Messages
- `GET /api/messages` - Get all messages
- `POST /api/messages` - Send message
- `DELETE /api/messages/:id` - Delete message

### Invitations
- `GET /api/invites` - Get all invites
- `POST /api/invites` - Send invite
- `PUT /api/invites/:id` - Accept/Reject invite

## 🐛 Troubleshooting

### Port Already in Use
```bash
# macOS/Linux
lsof -i :5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### MongoDB Connection Error
- Verify MongoDB URI is correct
- Whitelist your IP in MongoDB Atlas
- Check network connectivity

### Frontend Can't Connect to Backend
- Verify `VITE_API_URL` environment variable
- Check backend is running
- Verify CORS is enabled in backend

### Docker Image Issues
```bash
docker-compose up -d --build --no-cache
docker-compose down -v
```

For more troubleshooting, see [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting)

## 📈 Performance

- ✅ Nginx gzip compression
- ✅ Static asset caching
- ✅ Multi-stage Docker builds
- ✅ Database indexing
- ✅ API response optimization

## 🔄 Continuous Deployment

The application supports CI/CD through:
- GitHub Actions (can be configured)
- Render Auto-Deploy
- Docker Hub integration (optional)

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Support

For issues or questions:
1. Check the [troubleshooting guide](./DEPLOYMENT.md#troubleshooting)
2. Review Docker logs
3. Consult the detailed deployment documentation

## 🎯 Roadmap

- [ ] Real-time notifications
- [ ] File upload & sharing
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] API versioning
- [ ] Rate limiting
- [ ] Advanced search
- [ ] Activity timeline

---

**Built with ❤️ using MERN Stack**

**Last Updated:** May 21, 2026
