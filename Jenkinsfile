pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: nodejs
    image: node:18-alpine
    command: ["cat"]
    tty: true
  - name: kaniko
    image: gcr.io/kaniko-project/executor:v1.20.0-debug
    command: ["cat"]
    tty: true
  - name: kubectl
    image: alpine:3.19
    command: ["cat"]
    tty: true
'''
        }
    }
    stages {
        stage('1. Tải Mã Nguồn') {
            steps {
                checkout scm
            }
        }
        
        stage('2. Kiểm Thử Mã Nguồn') {
            steps {
                container('nodejs') {
                    sh 'npm install'
                    sh 'npm test'
                }
            }
        }
        
        stage('3. Build & Đẩy Lên Private Registry') {
            steps {
                container('kaniko') {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-creds-id', passwordVariable: 'DOCKER_PWD', usernameVariable: 'DOCKER_USER')]) {
                        echo 'Đang tiến hành tạo file cấu hình xác thực cho Kaniko...'
                        sh """
                        mkdir -p /kaniko/.docker
                        echo "{\\"auths\\":{\\"https://index.docker.io/v1/\\":{\\"username\\":\\"\${DOCKER_USER}\\",\\"password\\":\\"\${DOCKER_PWD}\\"}}}" > /kaniko/.docker/config.json
                        """
                        
                        echo 'Kaniko bắt đầu tiến hành đóng gói và push Image lên Docker Hub...'
                        sh "/kaniko/executor --context=dir://. --dockerfile=Dockerfile --destination=docker.io/\${DOCKER_USER}/nodejs-demo:latest"
                    }
                }
            }
        }
        
        stage('4. Triển Khai Vào Kubernetes') {
            steps {
                container('kubectl') {
                    echo 'Đang chuẩn bị môi trường kubectl trên nền Alpine...'
                    sh '''
                    # Tải công cụ curl nội bộ của Alpine để lấy file
                    apk add --no-cache curl
                    
                    # Tải bản thực thi kubectl chính thức từ Kubernetes Storage (v1.30.1 tương thích với Rancher cũ của bạn)
                    curl -LO "https://dl.k8s.io/release/v1.30.1/bin/linux/amd64/kubectl"
                    
                    # Cấp quyền chạy cho file và chuyển vào thư mục hệ thống PATH
                    chmod +x ./kubectl
                    mv ./kubectl /usr/local/bin/kubectl
                    '''
                    
                    echo 'Đang cập nhật ứng dụng vào K8s...'
                    sh 'kubectl apply -f k8s-deploy.yaml'
                    
                    echo 'Ép Kubernetes cập nhật và bốc Image mới từ Registry...'
                    sh 'kubectl rollout restart deployment/nodejs-private-app'
                }
            }
        }
    }
}