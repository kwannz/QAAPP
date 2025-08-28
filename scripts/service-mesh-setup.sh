#!/bin/bash

# QA App Service Mesh Setup Script
# 自动化部署Istio Service Mesh和相关组件

set -euo pipefail

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
ISTIO_VERSION="1.19.0"
NAMESPACE="qa-app"
ISTIO_DIR="./istio-${ISTIO_VERSION}"
DOMAIN="qa-app.com"

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查前置条件
check_prerequisites() {
    log_info "检查前置条件..."
    
    # 检查kubectl
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl 未安装，请先安装 kubectl"
        exit 1
    fi
    
    # 检查Kubernetes集群连接
    if ! kubectl cluster-info &> /dev/null; then
        log_error "无法连接到Kubernetes集群"
        exit 1
    fi
    
    # 检查Helm
    if ! command -v helm &> /dev/null; then
        log_warning "Helm 未安装，某些功能可能不可用"
    fi
    
    log_success "前置条件检查通过"
}

# 下载并安装Istio
install_istio() {
    log_info "下载并安装 Istio ${ISTIO_VERSION}..."
    
    if [ ! -d "${ISTIO_DIR}" ]; then
        curl -L https://istio.io/downloadIstio | ISTIO_VERSION=${ISTIO_VERSION} sh -
        log_success "Istio 下载完成"
    else
        log_info "Istio 目录已存在，跳过下载"
    fi
    
    # 添加istioctl到PATH
    export PATH=$PWD/${ISTIO_DIR}/bin:$PATH
    
    # 验证istioctl
    if ! command -v istioctl &> /dev/null; then
        log_error "istioctl 未找到，请检查安装"
        exit 1
    fi
    
    log_success "Istio CLI 准备就绪"
}

# 安装Istio到集群
deploy_istio() {
    log_info "部署 Istio 到 Kubernetes 集群..."
    
    # 创建istio-system命名空间
    kubectl create namespace istio-system --dry-run=client -o yaml | kubectl apply -f -
    
    # 安装Istio控制平面
    istioctl install -f k8s/service-mesh/istio-installation.yaml --skip-confirmation
    
    # 验证安装
    log_info "验证 Istio 安装..."
    kubectl wait --for=condition=available --timeout=600s deployment/istiod -n istio-system
    
    log_success "Istio 控制平面部署完成"
}

# 创建应用命名空间并启用sidecar注入
setup_namespace() {
    log_info "设置应用命名空间..."
    
    # 创建命名空间
    kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
    
    # 启用sidecar自动注入
    kubectl label namespace ${NAMESPACE} istio-injection=enabled --overwrite
    
    # 应用网络策略
    kubectl apply -f k8s/service-mesh/security-policies.yaml
    
    log_success "命名空间 ${NAMESPACE} 配置完成"
}

# 部署流量管理配置
deploy_traffic_management() {
    log_info "部署流量管理配置..."
    
    # 应用Gateway和VirtualService
    kubectl apply -f k8s/service-mesh/traffic-management.yaml
    
    # 等待Gateway就绪
    sleep 10
    
    log_success "流量管理配置部署完成"
}

# 部署可观测性组件
deploy_observability() {
    log_info "部署可观测性组件..."
    
    # 部署Jaeger
    kubectl apply -f k8s/service-mesh/observability.yaml
    
    # 等待组件启动
    log_info "等待可观测性组件启动..."
    kubectl wait --for=condition=available --timeout=300s deployment/jaeger -n istio-system || true
    kubectl wait --for=condition=available --timeout=300s deployment/kiali -n istio-system || true
    
    log_success "可观测性组件部署完成"
}

# 验证Service Mesh部署
verify_deployment() {
    log_info "验证 Service Mesh 部署..."
    
    # 检查Istio组件状态
    echo "=== Istio 组件状态 ==="
    kubectl get pods -n istio-system
    echo ""
    
    # 检查Gateway状态
    echo "=== Gateway 状态 ==="
    kubectl get gateway -n ${NAMESPACE}
    echo ""
    
    # 检查VirtualService状态
    echo "=== VirtualService 状态 ==="
    kubectl get virtualservice -n ${NAMESPACE}
    echo ""
    
    # 检查DestinationRule状态
    echo "=== DestinationRule 状态 ==="
    kubectl get destinationrule -n ${NAMESPACE}
    echo ""
    
    # 检查认证策略
    echo "=== 认证策略状态 ==="
    kubectl get peerauthentication,requestauthentication -n ${NAMESPACE}
    echo ""
    
    # 检查授权策略
    echo "=== 授权策略状态 ==="
    kubectl get authorizationpolicy -n ${NAMESPACE}
    echo ""
    
    log_success "Service Mesh 部署验证完成"
}

# 配置入口访问
setup_ingress() {
    log_info "配置入口访问..."
    
    # 获取入口网关外部IP
    INGRESS_IP=$(kubectl get svc istio-ingressgateway -n istio-system -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    INGRESS_HOST=$(kubectl get svc istio-ingressgateway -n istio-system -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
    
    if [[ -n "${INGRESS_IP}" ]]; then
        log_info "入口网关IP: ${INGRESS_IP}"
        echo "请将以下域名解析到 ${INGRESS_IP}:"
        echo "  api.${DOMAIN}"
        echo "  web.${DOMAIN}"
        echo "  kiali.${DOMAIN}"
        echo "  jaeger.${DOMAIN}"
    elif [[ -n "${INGRESS_HOST}" ]]; then
        log_info "入口网关主机名: ${INGRESS_HOST}"
        echo "请将以下域名CNAME到 ${INGRESS_HOST}:"
        echo "  api.${DOMAIN}"
        echo "  web.${DOMAIN}"
        echo "  kiali.${DOMAIN}"
        echo "  jaeger.${DOMAIN}"
    else
        log_warning "无法获取入口网关地址，请手动配置DNS解析"
    fi
    
    # 创建本地访问的端口转发脚本
    cat > port-forward-service-mesh.sh << 'EOF'
#!/bin/bash
echo "Starting port forwarding for Service Mesh components..."

# Kiali (服务拓扑)
kubectl port-forward -n istio-system svc/kiali 20001:20001 &
KIALI_PID=$!

# Jaeger (链路追踪)
kubectl port-forward -n istio-system svc/jaeger-query 16686:16686 &
JAEGER_PID=$!

# Prometheus (指标)
kubectl port-forward -n istio-system svc/prometheus 9090:9090 &
PROMETHEUS_PID=$!

# Grafana (仪表板)
kubectl port-forward -n istio-system svc/grafana 3000:3000 &
GRAFANA_PID=$!

echo "Service Mesh UI 访问地址:"
echo "  Kiali:      http://localhost:20001"
echo "  Jaeger:     http://localhost:16686"
echo "  Prometheus: http://localhost:9090"
echo "  Grafana:    http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop port forwarding"

# 等待中断信号
trap "kill $KIALI_PID $JAEGER_PID $PROMETHEUS_PID $GRAFANA_PID 2>/dev/null; exit" INT TERM
wait
EOF
    chmod +x port-forward-service-mesh.sh
    
    log_success "入口访问配置完成"
}

# 生成Service Mesh配置报告
generate_report() {
    log_info "生成 Service Mesh 配置报告..."
    
    REPORT_FILE="service-mesh-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > ${REPORT_FILE} << EOF
# QA App Service Mesh 部署报告

生成时间: $(date)
Istio版本: ${ISTIO_VERSION}
命名空间: ${NAMESPACE}

## 部署状态

### Istio 控制平面
\`\`\`
$(kubectl get pods -n istio-system)
\`\`\`

### 网关配置
\`\`\`
$(kubectl get gateway,virtualservice,destinationrule -n ${NAMESPACE})
\`\`\`

### 安全策略
\`\`\`
$(kubectl get peerauthentication,requestauthentication,authorizationpolicy -n ${NAMESPACE})
\`\`\`

### 可观测性组件
\`\`\`
$(kubectl get svc -n istio-system | grep -E "(kiali|jaeger|prometheus|grafana)")
\`\`\`

## 访问信息

### 外部访问
- API: https://api.${DOMAIN}
- Web: https://web.${DOMAIN}
- Kiali: https://kiali.${DOMAIN}
- Jaeger: https://jaeger.${DOMAIN}

### 本地访问 (端口转发)
运行 \`./port-forward-service-mesh.sh\` 启动端口转发:
- Kiali: http://localhost:20001
- Jaeger: http://localhost:16686
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000

## 验证命令

### 检查sidecar注入
\`\`\`bash
kubectl get pods -n ${NAMESPACE} -o custom-columns=NAME:.metadata.name,READY:.status.containerStatuses[*].ready,CONTAINERS:.spec.containers[*].name
\`\`\`

### 检查mTLS状态
\`\`\`bash
istioctl authn tls-check \$(kubectl get pods -n ${NAMESPACE} -l app=qa-app-api -o jsonpath='{.items[0].metadata.name}').${NAMESPACE} qa-app-api.${NAMESPACE}.svc.cluster.local
\`\`\`

### 查看配置状态
\`\`\`bash
istioctl analyze -n ${NAMESPACE}
\`\`\`

### 查看代理配置
\`\`\`bash
istioctl proxy-config cluster \$(kubectl get pods -n ${NAMESPACE} -l app=qa-app-api -o jsonpath='{.items[0].metadata.name}').${NAMESPACE}
\`\`\`

## 故障排查

### 查看Envoy日志
\`\`\`bash
kubectl logs -n ${NAMESPACE} \$(kubectl get pods -n ${NAMESPACE} -l app=qa-app-api -o jsonpath='{.items[0].metadata.name}') -c istio-proxy
\`\`\`

### 查看配置同步状态
\`\`\`bash
istioctl proxy-status
\`\`\`

### 检查证书
\`\`\`bash
istioctl proxy-config secret \$(kubectl get pods -n ${NAMESPACE} -l app=qa-app-api -o jsonpath='{.items[0].metadata.name}').${NAMESPACE}
\`\`\`
EOF
    
    log_success "报告已生成: ${REPORT_FILE}"
}

# 清理Service Mesh
cleanup() {
    log_warning "开始清理 Service Mesh 组件..."
    
    read -p "确认要删除Service Mesh吗? (y/N): " confirm
    if [[ ${confirm} != "y" && ${confirm} != "Y" ]]; then
        log_info "取消清理操作"
        return
    fi
    
    # 删除应用配置
    kubectl delete -f k8s/service-mesh/traffic-management.yaml --ignore-not-found=true
    kubectl delete -f k8s/service-mesh/security-policies.yaml --ignore-not-found=true
    kubectl delete -f k8s/service-mesh/observability.yaml --ignore-not-found=true
    
    # 删除Istio
    istioctl uninstall --purge -y
    
    # 删除命名空间标签
    kubectl label namespace ${NAMESPACE} istio-injection-
    
    # 删除CRD
    kubectl get crd -o name | grep --color=never 'istio.io' | xargs kubectl delete
    
    log_success "Service Mesh 清理完成"
}

# 主函数
main() {
    log_info "QA App Service Mesh 部署开始..."
    
    case "${1:-deploy}" in
        "deploy")
            check_prerequisites
            install_istio
            deploy_istio
            setup_namespace
            deploy_traffic_management
            deploy_observability
            verify_deployment
            setup_ingress
            generate_report
            log_success "🎉 Service Mesh 部署完成!"
            ;;
        "verify")
            verify_deployment
            ;;
        "cleanup")
            cleanup
            ;;
        "report")
            generate_report
            ;;
        *)
            echo "用法: $0 [deploy|verify|cleanup|report]"
            echo "  deploy  - 部署Service Mesh (默认)"
            echo "  verify  - 验证部署状态"
            echo "  cleanup - 清理Service Mesh"
            echo "  report  - 生成配置报告"
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"