pipeline {
    agent { 
        docker { 
            image 'amazon/aws-cli:2.14.3-node18' // AWS CLI + Node 18 hazır
            args '-u root:root' // root ile çalıştır, dosya izin sorunlarını önler
        } 
    }
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
                sh 'npm ci'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy to S3') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-jenkins-creds']]) {
                    sh 'aws s3 sync dist/ s3://$S3_BUCKET/ --delete'
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
