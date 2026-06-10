pipeline {
    agent any

    environment {
        // Çevresel değişkenleri tanımlıyoruz
        NODE_ENV = 'development'
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                // Kod deposundan (Git) en güncel kodu çekiyoruz
                checkout scm
                echo '✅ Kod başarıyla çekildi (Checkout başarılı).'
            }
        }

        stage('Install Dependencies - Backend') {
            steps {
                // Backend klasörüne girip bağımlılıkları yüklüyoruz
                dir('backend') {
                    sh 'npm install'
                    echo '✅ Backend paketleri başarıyla yüklendi.'
                }
            }
        }

        stage('Install Dependencies - Frontend') {
            steps {
                // Frontend klasörüne girip bağımlılıkları yüklüyoruz
                dir('frontend') {
                    sh 'npm install'
                    echo '✅ Frontend paketleri başarıyla yüklendi.'
                }
            }
        }

        stage('Build - Frontend') {
            steps {
                // React/Vite projesinin derlenebildiğini (çökmediğini) test ediyoruz
                dir('frontend') {
                    sh 'npm run build'
                    echo '✅ Frontend başarıyla derlendi (Build Check başarılı).'
                }
            }
        }

        stage('Test Docker Compose Configurations') {
            steps {
                // Docker imajlarının hata vermeden inşa edilip edilemediğini test ediyoruz
                sh 'docker-compose build'
                echo '✅ Docker imajları başarıyla test edildi.'
            }
        }
    }

    post {
        always {
            echo '🔄 Pipeline (Boru Hattı) çalışması tamamlandı.'
        }
        success {
            echo '🎉 HARİKA! Tüm testler ve derlemeler başarıyla geçti.'
        }
        failure {
            echo '❌ HATA: Pipeline adımlarından biri başarısız oldu. Lütfen logları inceleyin.'
        }
    }
}
