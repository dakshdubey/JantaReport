# JantaReport - Civic Issue Reporting Platform

A production-ready, end-to-end civic issue reporting system for India. Built with a focus on trust, transparency, and geo-accountability.

##  Features

- **Citizen Transparency**: Report issues with GPS location, track progress on a timeline.
- **Geo-Routing**: Automatic city detection using Google Geocoding API.
- **Admin Isolation**: City Admins only see and manage issues within their jurisdiction.
- **Live Maps**: Google Maps integration for real-time visualization of civic problems.
- **Super Admin Oversight**: Nationwide analytics and management of city-level operations.

##  Tech Stack

- **Frontend**: HTML5, Tailwind CSS (via CDN), Vanilla JavaScript.
- **Backend**: Node.js, Express, JWT, BcryptJS.
- **Database**: MySQL (using `mysql2/promise` connection pool).
- **APIs**: Google Maps JavaScript API, Google Geocoding API.

##  Installation & Setup

### 1. Database Configuration
Ensure MySQL is running on your system. 
The system will automatically create the database `civic_issue_platform` and all required tables on first run.

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=civic_issue_platform
JWT_SECRET=your_jwt_secret_key
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Replace Google Maps API Key
Open the following files and replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual Google Maps API Key:
- `frontend/citizen/dashboard.html`
- `frontend/admin/city-dashboard.html`

### 5. Start the Server
```bash
npm start
```

##  User Roles & Flow

1. **Citizen**:
   - Register at `register.html`.
   - Login at `login.html`.
   - Report issues using the map.
   - Track status on the dashboard.

2. **City Admin**:
   - Created by Super Admin.
   - Manages issues assigned to their city.
   - Updates status (Submitted -> In Progress -> Resolved).

3. **Super Admin**:
   - Oversees the entire platform.
   - (Manual Step) Set role = `SUPER_ADMIN` in the `users` table for the first admin user.

##  Project Structure

```text
/backend
  /config      - DB pool and initialization
  /controllers - Business logic
  /middlewares - Auth & RBAC
  /routes      - API endpoints
  /services    - Geo & external integrations
  server.js    - Entry point
/frontend
  /citizen     - Citizen dashboard
  /admin       - Admin dashboards
  /css         - Tailwind & Custom styles
  /js          - API utilities
```

## Security
- **JWT Authentication**: All sensitive routes are protected.
- **RBAC**: Role-based access control prevents unauthorized data access.
- **SQL Injection**: Prepared statements used for all database queries.
- **Input Validation**: Essential checks on both client and server sides.
