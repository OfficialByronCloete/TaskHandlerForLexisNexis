# TaskHandler For LexisNexis

A full-stack task management system built with a **.NET Web API** backend and an **Angular** frontend.

---

## 📂 Project Structure

```text
/TaskHandlerForLexisNexis
├── /backend
│   └── /TaskHandlerAPI
│       └── /TaskHandlerAPI
│           └── TaskHandler.WebAPI.csproj  ← Backend Entry Point
├── /frontend
│   └── /LexisNexisFrontend
│       └── angular.json                   ← Frontend Entry Point
└── start-dev.bat						   ← Automation Script
```

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:

- **.NET SDK** (v10.0+)
- **Node.js** (LTS version recommended)
- **Angular CLI**: `npm install -g @angular/cli`

---

## 🚀 Quick Start (Automated)

If you are on Windows, you can launch the entire stack with a single command:

1. Open the root folder
2. Run the startup script:
   ```bash
   ./start_project.bat
   ```
3. Wait for the terminal to finish compiling
4. The browser will automatically open to `http://localhost:4200`

---

## 🔧 Manual Setup

### 1. Backend Configuration

Navigate to the API directory and restore dependencies:

```bash
cd backend/TaskHandlerAPI/TaskHandlerAPI
dotnet restore
dotnet run
```

The API should now be running. You can verify this by visiting the Swagger UI (usually at `https://localhost:7065/swagger`).

### 2. Frontend Configuration

Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd frontend/LexisNexisFrontend
npm install
npm start
```

The application will be served at `http://localhost:4200`.

---

## 📝 Development Notes

### API Endpoints

The frontend is configured to communicate with the .NET backend. Ensure that the `environment.ts` file in the Angular project matches the port assigned to the `dotnet run` command.

### Database Configuration

**Note:** The backend uses an **InMemory list** by default. However, it can be configured to use a **PostgreSQL database** by uncommenting the `Npgsql` provider in the `TaskHandler.WebAPI appsettings.Development.json` file.

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Node Modules** | If you encounter "command not found" for `ng` or `npm`, ensure Node.js is added to your System PATH. |
| **Port 4200 in use** | Run `taskkill /F /IM node.exe` in a terminal to clear existing Node processes. |
| **CORS errors** | Verify that CORS policies in the backend `Program.cs` allow requests from `localhost:4200`. |

---

## 🧪 Testing

- **Backend**: Run `dotnet test` within the backend folder
- **Frontend**: Run `ng test` within the frontend folder

---
