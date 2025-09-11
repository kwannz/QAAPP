#!/bin/bash
# 配置SSH密钥到VPS服务器
# 服务器: root@45.76.207.177

set -e

echo "🔐 配置SSH密钥到VPS服务器..."

SERVER_IP="45.76.207.177"
SERVER_USER="root" 
SERVER_PASS="7jG_!3i+amx}]yFB"
SSH_KEY_NAME="id_ed25519_zijunzhao"
SSH_KEY_PATH="$HOME/.ssh/$SSH_KEY_NAME"
SSH_PUB_KEY="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFCQUEKG3yugpnGZI1TA3TVN2yi2TEYfN+VrkrNa8S18 zijunzhao96@gmail.com"

print_status() {
    echo -e "\n\033[1;34m==== $1 ====\033[0m"
}

print_success() {
    echo -e "\033[1;32m✅ $1\033[0m"
}

print_error() {
    echo -e "\033[1;31m❌ $1\033[0m"
}

print_warning() {
    echo -e "\033[1;33m⚠️ $1\033[0m"
}

# 检查SSH目录
print_status "检查SSH配置"
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# 检查私钥是否存在
if [ ! -f "$SSH_KEY_PATH" ]; then
    print_warning "SSH私钥不存在: $SSH_KEY_PATH"
    echo "请确保你有对应的私钥文件，或创建新的密钥对："
    echo "ssh-keygen -t ed25519 -f $SSH_KEY_PATH -C 'zijunzhao96@gmail.com'"
    echo ""
    echo "如果你有私钥，请将其放置到: $SSH_KEY_PATH"
    echo "然后重新运行此脚本"
    exit 1
fi

chmod 600 "$SSH_KEY_PATH"
print_success "找到SSH私钥: $SSH_KEY_PATH"

# 检查公钥
if [ ! -f "${SSH_KEY_PATH}.pub" ]; then
    print_status "创建公钥文件"
    echo "$SSH_PUB_KEY" > "${SSH_KEY_PATH}.pub"
    chmod 644 "${SSH_KEY_PATH}.pub"
    print_success "公钥文件已创建"
fi

# 配置SSH客户端
print_status "配置SSH客户端"
SSH_CONFIG="$HOME/.ssh/config"

# 检查SSH配置是否已存在
if ! grep -q "Host qaapp-vps" "$SSH_CONFIG" 2>/dev/null; then
    cat >> "$SSH_CONFIG" << EOF

# QAapp VPS服务器配置
Host qaapp-vps
    HostName $SERVER_IP
    User $SERVER_USER
    IdentityFile $SSH_KEY_PATH
    IdentitiesOnly yes
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
EOF
    chmod 600 "$SSH_CONFIG"
    print_success "SSH配置已添加"
else
    print_success "SSH配置已存在"
fi

# 安装sshpass（如果需要）
if ! command -v sshpass >/dev/null 2>&1; then
    print_status "安装sshpass"
    if command -v brew >/dev/null 2>&1; then
        brew install sshpass
    elif command -v apt-get >/dev/null 2>&1; then
        sudo apt-get update && sudo apt-get install -y sshpass
    else
        print_error "无法自动安装sshpass，请手动安装"
        exit 1
    fi
    print_success "sshpass安装完成"
fi

# 将公钥复制到服务器
print_status "配置服务器SSH公钥认证"

# 使用sshpass上传公钥
echo "正在将公钥上传到服务器..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "
    # 创建.ssh目录
    mkdir -p ~/.ssh
    chmod 700 ~/.ssh
    
    # 添加公钥到authorized_keys
    echo '$SSH_PUB_KEY' >> ~/.ssh/authorized_keys
    
    # 去重并设置权限
    sort ~/.ssh/authorized_keys | uniq > ~/.ssh/authorized_keys.tmp
    mv ~/.ssh/authorized_keys.tmp ~/.ssh/authorized_keys
    chmod 600 ~/.ssh/authorized_keys
    
    # 确保SSH目录权限正确
    chown -R root:root ~/.ssh
    
    echo '公钥配置完成'
"

print_success "SSH公钥已配置到服务器"

# 测试SSH密钥认证
print_status "测试SSH密钥认证"
if ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "echo 'SSH密钥认证成功'" 2>/dev/null; then
    print_success "SSH密钥认证测试成功！"
    echo ""
    echo "🎉 现在你可以使用以下命令连接服务器："
    echo "ssh qaapp-vps"
    echo "或者："
    echo "ssh -i $SSH_KEY_PATH $SERVER_USER@$SERVER_IP"
else
    print_warning "SSH密钥认证测试失败，但可以使用密码认证继续部署"
fi

echo ""
echo "✅ SSH配置完成！现在可以运行部署脚本："
echo "   ./scripts/deployment/setup-ssh-and-deploy.sh"
echo ""