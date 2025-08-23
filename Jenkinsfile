pipeline {
    agent any
    environment {
        AWS_DEFAULT_REGION = 'us-east-1'
        S3_BUCKET = 'hr-ai-bucket'
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    docker.image('node:18').inside {
                        sh 'npm ci'
                    }
                }
            }
        }

        stage('Build') {
            steps {
                script {
                    docker.image('node:18').inside {
                        sh 'npm run build'
                    }
                }
            }
        }

        stage('Deploy to S3') {
            steps {
                script {
                    docker.image('node:18').inside {
                        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-jenkins-creds']]) {
                            sh '''
                                curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
                                unzip awscliv2.zip
                                sudo ./aws/install

                                aws s3 sync dist/ s3://$S3_BUCKET/ --delete
                            '''
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment to S3 successful!'
        }
        failure {
            echo 'Deployment failed.'
        }
    }
}
