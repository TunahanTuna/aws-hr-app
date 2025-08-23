pipeline {
    agent any // Pipeline herhangi bir Jenkins ajanında çalışabilir
    environment {
        AWS_DEFAULT_REGION = 'us-east-1' // S3 bucket'ın bulunduğu AWS bölgesi
        S3_BUCKET = 'hr-ai-bucket' // Deploy edilecek S3 bucket adı
    }
    stages {
        stage('Checkout') { // Kodun repodan çekilmesi
            steps {
                // Kaynak kodunu SCM'den (ör. GitHub) çek
                checkout scm
            }
        }
        stage('Install Dependencies') { // Proje bağımlılıklarını yükle
            steps {
                // package-lock.json'a göre bağımlılıkları yükle (daha hızlı ve güvenli)
                sh 'npm ci'
            }
        }
        stage('Build') { // Projeyi derle
            steps {
                // Vite/React uygulamasını production için derle
                sh 'npm run build'
            }
        }
        stage('Deploy to S3') { // Build edilen dosyaları S3'e yükle
            steps {
                // AWS kimlik bilgilerini Jenkins Credentials'tan al
                withCredentials([
                    [$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-jenkins-creds']
                ]) {
                    // dist/ klasörünü S3 bucket'a senkronize et, eski dosyaları sil arn:aws:s3:::hr-ai-bucket
                    sh '''
                        aws s3 sync dist/ s3://hr-ai-bucket/ --delete
                    '''
                }
            }
        }
    }
    post {
        success {
            // Deploy başarılı olursa konsola mesaj yaz
            echo 'Deployment to S3 successful!'
        }
        failure {
            // Deploy başarısız olursa konsola mesaj yaz
            echo 'Deployment failed.'
        }
    }
}
