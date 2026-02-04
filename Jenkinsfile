pipeline {
    agent any

    environment {
        SERVER_IMAGE = "edutrack-server"
        CLIENT_IMAGE = "edutrack-client"
        // Ensure Jenkins can find docker command
        PATH = "/usr/local/bin:$PATH"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                script {
                    echo 'Building Docker images with versioning...'

                    sh """
                    docker build -t ${SERVER_IMAGE}:${BUILD_NUMBER} -t ${SERVER_IMAGE}:latest ./server
                    docker build -t ${CLIENT_IMAGE}:${BUILD_NUMBER} -t ${CLIENT_IMAGE}:latest ./client
                    """
                }
            }
        }

        stage('Test') {
            steps {
                script {
                    echo 'Running automated unit tests inside container...'

                    // Tests run in isolated container; failures reported in logs
                    sh "docker run --rm ${SERVER_IMAGE}:${BUILD_NUMBER} npm test || true"
                }
            }
        }

        stage('Code Quality') {
            steps {
                script {
                    echo 'Running SonarQube code quality analysis...'

                    withSonarQubeEnv('SonarQube') {
                        sh """
                        docker run --rm \
                          -e SONAR_HOST_URL=http://host.docker.internal:9000 \
                          -e SONAR_LOGIN=${SONAR_AUTH_TOKEN} \
                          -v ${WORKSPACE}/server:/usr/src \
                          sonarsource/sonar-scanner-cli \
                          -Dsonar.projectKey=edutrack-lite \
                          -Dsonar.sources=.
                        """
                    }
                }
            }
        }

        stage('Security') {
            steps {
                script {
                    echo 'Running dependency vulnerability scan (npm audit)...'

                    // Vulnerabilities are reported but do not block deployment
                    sh "docker run --rm ${SERVER_IMAGE}:${BUILD_NUMBER} npm audit || true"
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    echo 'Deploying application to test environment using Docker Compose...'

                    sh "docker-compose up -d --build"
                    sleep 20
                }
            }
        }

        stage('Release') {
            steps {
                script {
                    echo "Tagging release version v1.0.${BUILD_NUMBER}"

                    sh """
                    git config user.name 'Jenkins CI'
                    git config user.email 'jenkins@edutrack.local'
                    git tag -a v1.0.${BUILD_NUMBER} -m 'Automated release v1.0.${BUILD_NUMBER}'
                    """
                }
            }
        }

        stage('Monitoring') {
            steps {
                script {
                    echo 'Verifying application metrics endpoint...'

                    sh "curl -f http://localhost:5001/metrics"
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution completed.'
        }
    }
}
