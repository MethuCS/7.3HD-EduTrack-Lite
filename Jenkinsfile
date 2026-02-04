pipeline {
    agent any

    environment {
        DOCKER_IMAGE_SERVER = 'edutrack-server:latest'
        DOCKER_IMAGE_CLIENT = 'edutrack-client:latest'
    }

    stages {
        stage('Checkout') {
             steps {
                git branch: 'main',
                    url: 'https://github.com/MethuCS/7.3HD-EduTrack-Lite.git'
            }
        }

        stage('Build') {
            steps {
                script {
                    echo 'Building Docker Images...'
                    // Build images
                    sh "docker build -t $DOCKER_IMAGE_SERVER:${BUILD_NUMBER} ./server"
                    sh "docker build -t $DOCKER_IMAGE_SERVER:latest ./server"
                    sh "docker build -t $DOCKER_IMAGE_CLIENT:${BUILD_NUMBER} ./client"
                    sh "docker build -t $DOCKER_IMAGE_CLIENT:latest ./client"
                }
            }
        }

        stage('Test') {
            steps {
                script {
                    echo 'Running Backend Tests...'
                    // Run tests inside a temporary container
                    sh "docker run --rm $DOCKER_IMAGE_SERVER:${BUILD_NUMBER} npm test"
                }
            }
        }

        stage('Code Quality') {
            steps {
                script {
                    echo 'Running SonarQube Analysis...'
                    
                    withSonarQubeEnv('SonarQube') {
                        // Using a dockerized scanner to avoid installing it on the agent
                        sh "docker run --rm \
                            -e SONAR_HOST_URL=${SONAR_HOST_URL} \
                            -e SONAR_LOGIN=${SONAR_AUTH_TOKEN} \
                            -v ${WORKSPACE}:/usr/src \
                            sonarsource/sonar-scanner-cli \
                            -Dsonar.projectKey=edutrack-lite \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=${SONAR_HOST_URL}"
                    }
                }
            }
        }

        stage('Security') {
            steps {
                script {
                    echo 'Running Security Scan...'  
                    sh "docker run --rm --entrypoint npm $DOCKER_IMAGE_SERVER:${BUILD_NUMBER} audit --audit-level=high || true"
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    echo 'Deploying with Docker Compose...'
                    sh 'docker-compose up -d --build'
                    // Health check wait
                    sleep 20 
                }
            }
        }

        stage('Release') {
            steps {
                script {
                    echo "Releasing version v1.0.${BUILD_NUMBER}..."
                    // Git Tagging
                    withCredentials([usernamePassword(credentialsId: 'git-credentials-id', passwordVariable: 'GIT_PASS', usernameVariable: 'GIT_USER')]) {
                        sh "git config user.email 'jenkins@edutrack.com'"
                        sh "git config user.name 'Jenkins CI'"
                        sh "git tag -a v1.0.${BUILD_NUMBER} -m 'Jenkins Release v1.0.${BUILD_NUMBER}'"
                       
                      
                    }
                }
            }
        }

        stage('Monitoring') {
            steps {
                script {
                    echo 'Verifying Application Health...'
                    // Check if Metrics endpoint is up
                    sh 'curl -f http://localhost:5000/metrics'
                    echo 'Metrics endpoint is accessible.'
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed.'
        }
    }
}
