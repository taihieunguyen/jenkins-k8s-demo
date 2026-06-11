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
  - name: docker
    image: docker:latest
    command: ["cat"]
    tty: true
    volumeMounts:
    - mountPath: /var/run/docker.sock
      name: docker-sock
  - name: kubectl
    image: bitnami/kubectl:latest
    command: ["cat"]
    tty: true
  volumes:
  - name: docker-sock
    hostPath:
      path: /var/run/docker.sock
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
                container('docker') {
                    // ID 'dockerhub-creds-id' phải trùng khớp với ID bạn tạo trên giao diện Jenkins Credentials
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-creds-id', passwordVariable: 'DOCKER_PWD', usernameVariable: 'DOCKER_USER')]) {
                        
                        echo 'Đang đăng nhập vào Docker Hub...'
                        sh "docker login -u ${DOCKER_USER} -p ${DOCKER_PWD}"
                        
                        echo 'Đang tiến hành build Docker Image...'
                        sh "docker build -t ${DOCKER_USER}/nodejs-demo:latest ."
                        
                        echo 'Đang tiến hành push Image lên Private Repository...'
                        sh "docker push ${DOCKER_USER}/nodejs-demo:latest"
                    }
                }
            }
        }
        
        stage('4. Triển Khai Vào Kubernetes') {
            steps {
                container('kubectl') {
                    echo 'Đang cập nhật ứng dụng vào K8s...'
                    sh 'kubectl apply -f k8s-deploy.yaml'
                    
                    echo 'Ép Kubernetes cập nhật và bốc Image mới từ Registry...'
                    sh 'kubectl rollout restart deployment/nodejs-private-app'
                }
            }
        }
    }
}