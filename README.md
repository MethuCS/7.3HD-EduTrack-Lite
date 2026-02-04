# EduTrack Lite

EduTrack Lite is a web application for assignment submission and analytics, designed for DevOps pipeline demonstration.

## Features
- **Authentication**: JWT-based login and registration (Student/Tutor).
- **Assignments**: Tutors create assignments; Students upload submissions.
- **Feedback**: Tutors grade and comment on submissions.
- **Analytics**: Tutors view dashboard statistics.
- **Infrastructure**: Dockerized (Frontend, Backend, DB, SonarQube) + Jenkins CI/CD.

## Prerequisites
- Node.js & npm
- Docker & Docker Compose
- Jenkins (for Pipeline)
- See `JENKINS_CONFIGURATION.md` for plugin and credential setup.

## Quick Start (Local)

1. **Clone the repository**
   ```sh
   git clone <repo-url>
   cd edutrack-lite
   ```

2. **Start with Docker Compose**
   ```sh
   docker-compose up --build -d
   ```

3. **Access the Application**
   - Frontend: [http://localhost](http://localhost) (via Nginx proxy)
   - Backend API: [http://localhost:5001](http://localhost:5001)
   - Database Adminer: [http://localhost:8081](http://localhost:8081) (System: MySQL, Server: mysql, Username: user, Password: password, Database: edutrack_db)
   - SonarQube: [http://localhost:9000](http://localhost:9000)

## Project Structure
- `client/`: React Frontend (Vite + TailwindCSS)
- `server/`: Node.js Express Backend
- `docker-compose.yml`: Orchestration
- `Jenkinsfile`: CI/CD Pipeline definition

## API Endpoints
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/assignments` - List assignments
- `POST /api/assignments` - Create assignment (Tutor only)
- `POST /api/feedback` - Grade submission (Tutor only)
- `GET /api/analytics` - Get stats (Tutor only)
- `GET /metrics` - Prometheus metrics

## DevOps Pipeline (HD Requirements)
The Jenkins pipeline implements 7 stages:
1. **Build**: Docker images tagged with build number.
2. **Test**: Runs Unit tests inside container.
3. **Code Quality**: SonarQube analysis.
4. **Security**: `npm audit` for vulnerability scanning.
5. **Deploy**: Deploys via Docker Compose.
6. **Release**: Version tagging/simulation.
7. **Monitoring**: Health check of `/metrics` endpoint.
