# CoIDE - Collaborative Code Editor

A real-time collaborative code editor enabling seamless remote pair programming and team development.

## 🚀 Features

- **Real-time Code Collaboration**: Multiple users can edit code simultaneously
- **Code Execution**: Run code in 40+ programming languages via Judge0 API
- **Syntax Highlighting**: Monaco Editor with multiple themes and language support
- **Room-based Sessions**: Create or join coding rooms with unique IDs
- **Live User Presence**: See who's currently in your session
- **Shared Code Execution**: View compilation results from all team members

## 🛠️ Tech Stack

**Frontend:**
- React 19 + Vite
- Monaco Editor
- Socket.IO Client
- Tailwind CSS
- React Router
- Axios for API calls

**Backend:**
- Node.js + Express
- Socket.IO Server
- CORS enabled

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Judge0 RapidAPI account (for code execution)

## ⚡ Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/yash-gorasia/coide.git
cd coide
```

### 2. Install dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

### 3. Environment Setup

Create a `.env` file in the **backend** directory:
```bash
PORT=8000
NODE_ENV=development
```

Create a `.env` file in the **frontend** directory:
```bash
VITE_WS_URL=http://localhost:8000
VITE_RAPID_API_URL=https://judge0-ce.p.rapidapi.com/submissions
VITE_RAPID_API_HOST=judge0-ce.p.rapidapi.com
VITE_RAPID_API_KEY=your_rapidapi_key_here
```

### 4. Get Judge0 API Key
1. Sign up at [RapidAPI](https://rapidapi.com/)
2. Subscribe to [Judge0 CE API](https://rapidapi.com/judge0-official/api/judge0-ce)
3. Copy your API key to the frontend `.env` file

### 5. Run the application
```bash
# From the root directory, run both frontend and backend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000

## 🎯 Usage

1. **Create/Join Room**: Enter a username and room ID
2. **Code Together**: Start typing and see real-time collaboration
3. **Execute Code**: Select language and run your code
4. **Share Results**: Code execution results are shared with all participants

## 📁 Project Structure

```
coide/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── Components/       # Reusable UI components
│   │   ├── Context/          # React context providers
│   │   ├── Pages/           # Main pages (Home, Playground)
│   │   ├── Constants/       # Configuration and constants
│   │   └── Socket/          # Socket.IO client setup
│   └── public/              # Static assets and themes
├── backend/                 # Express backend
│   ├── index.js            # Server entry point
│   └── utils/              # Utilities and socket events
└── package.json            # Root package configuration
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Run both frontend and backend
npm run frontend     # Run only frontend
npm run backend      # Run only backend

# Frontend specific
cd frontend
npm run build        # Build for production
npm run preview      # Preview production build

# Backend specific
cd backend
npm start           # Production start
npm run dev         # Development with nodemon
```

## 🌐 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/Heroku)
1. Set environment variables in your platform
2. Ensure PORT is configured for dynamic port binding
3. Update frontend VITE_WS_URL to your backend URL

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Yash Gorasia**
- GitHub: [@yash-gorasia](https://github.com/yash-gorasia)

---

⭐ Star this repository if you find it helpful!
