# Jenkins Configuration Guide

To run the provided `Jenkinsfile` successfully, you must configure your Jenkins environment.

## 1. Install Required Plugins
Go to **Manage Jenkins > Manage Plugins > Available** and install:
- **Docker Pipeline** (for building/running containers)
- **SonarQube Scanner** (for code quality analysis)
- **NodeJS** (if you want to run npm commands directly, though we use Docker)
- **Pipeline: Stage View** (for nice visualization)

## 2. Global Tool Configuration
Go to **Manage Jenkins > Global Tool Configuration**:

### SonarQube Scanner
1. Scroll to **SonarQube Scanner**.
2. Click **Add SonarQube Scanner**.
3. Name: `SonarScanner` (This must match the name used in Jenkinsfile if we used the tool directive, but we are using the environment wrapper).
   *Actually, for Docker-based flows, we often just need the Server connection.*

## 3. Configure System (SonarQube Server)
Go to **Manage Jenkins > Configure System**:
1. Scroll to **SonarQube servers**.
2. Click **Add SonarQube**.
3. **Name**: `SonarQube` (CRITICAL: Must match `withSonarQubeEnv('SonarQube')` in Jenkinsfile).
4. **Server URL**: `http://host.docker.internal:9000` (if Jenkins is in Docker) or `http://localhost:9000`.
   - *Note: If Jenkins is running in Docker, it cannot see `localhost`. Use `host.docker.internal`.*
5. **Server Authentication Token**:
   - Create a token in SonarQube (User > My Account > Security).
   - Add it as a **Secret Text** credential in Jenkins.
   - Select that credential here.

## 4. Credentials Setup
Go to **Manage Jenkins > Manage Credentials**:

### Git Credentials (for Release Stage)
1. Add a **Username with Password** credential.
2. **ID**: `git-credentials-id` (You must update the Jenkinsfile with this ID if you change it).
3. Username: Your GitHub username.
4. Password: Your GitHub Personal Access Token (with repo permissions).

## 5. Docker Permissions
If running Jenkins on Linux/Mac:
- Ensure the `jenkins` user has permission to run `docker`.
- `sudo usermod -aG docker jenkins`
- Restart Jenkins.

## 6. Accessing Localhost
If deployment fails because Jenkins can't see the running app:
- Ensure ports 5000 and 3000 are open and not blocked by firewall.
