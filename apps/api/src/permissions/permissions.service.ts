import { Injectable, Inject } from '@nestjs/common';
import type { DatabaseService } from '../database/database.service';

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isSystem?: boolean;
}

export interface PermissionMatrix {
  roleId: string;
  roleName: string;
  permissions: {
    resource: string;
    actions: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      execute?: boolean;
    };
  }[];
}

@Injectable()
export class PermissionsService {
  private roles: Map<string, Role> = new Map();
  private permissions: Map<string, Permission> = new Map();
  private userRoles: Map<string, string[]> = new Map();

  constructor(@Inject('DatabaseService') private database: DatabaseService) {
    this.initializeDefaultRoles();
  }

  private initializeDefaultRoles() {
    // 系统权限定义
    const systemPermissions = [
      // 审计日志权限
      { id: 'audit.read', name: '查看审计日志', resource: 'audit_logs', action: 'read' },
      { id: 'audit.export', name: '导出审计日志', resource: 'audit_logs', action: 'export' },
      { id: 'audit.delete', name: '删除审计日志', resource: 'audit_logs', action: 'delete' },
      { id: 'audit.config', name: '配置审计策略', resource: 'audit_logs', action: 'config' },
      
      // 用户管理权限
      { id: 'user.read', name: '查看用户', resource: 'users', action: 'read' },
      { id: 'user.create', name: '创建用户', resource: 'users', action: 'create' },
      { id: 'user.update', name: '更新用户', resource: 'users', action: 'update' },
      { id: 'user.delete', name: '删除用户', resource: 'users', action: 'delete' },
      { id: 'user.ban', name: '封禁用户', resource: 'users', action: 'ban' },
      
      // KYC权限
      { id: 'kyc.read', name: '查看KYC', resource: 'kyc', action: 'read' },
      { id: 'kyc.approve', name: '审核KYC', resource: 'kyc', action: 'approve' },
      { id: 'kyc.reject', name: '拒绝KYC', resource: 'kyc', action: 'reject' },
      
      // 提现权限
      { id: 'withdrawal.read', name: '查看提现', resource: 'withdrawals', action: 'read' },
      { id: 'withdrawal.approve', name: '审核提现', resource: 'withdrawals', action: 'approve' },
      { id: 'withdrawal.reject', name: '拒绝提现', resource: 'withdrawals', action: 'reject' },
      { id: 'withdrawal.process', name: '处理提现', resource: 'withdrawals', action: 'process' },
      
      // 订单权限
      { id: 'order.read', name: '查看订单', resource: 'orders', action: 'read' },
      { id: 'order.update', name: '更新订单', resource: 'orders', action: 'update' },
      { id: 'order.cancel', name: '取消订单', resource: 'orders', action: 'cancel' },
      { id: 'order.refund', name: '退款订单', resource: 'orders', action: 'refund' },
      
      // 产品权限
      { id: 'product.read', name: '查看产品', resource: 'products', action: 'read' },
      { id: 'product.create', name: '创建产品', resource: 'products', action: 'create' },
      { id: 'product.update', name: '更新产品', resource: 'products', action: 'update' },
      { id: 'product.delete', name: '删除产品', resource: 'products', action: 'delete' },
      
      // 报表权限
      { id: 'report.view', name: '查看报表', resource: 'reports', action: 'read' },
      { id: 'report.generate', name: '生成报表', resource: 'reports', action: 'generate' },
      { id: 'report.export', name: '导出报表', resource: 'reports', action: 'export' },
      
      // 系统配置权限
      { id: 'system.read', name: '查看系统配置', resource: 'system', action: 'read' },
      { id: 'system.update', name: '更新系统配置', resource: 'system', action: 'update' },
      { id: 'system.maintenance', name: '系统维护', resource: 'system', action: 'maintenance' },
      { id: 'system.backup', name: '系统备份', resource: 'system', action: 'backup' },
      
      // 告警权限
      { id: 'alert.read', name: '查看告警', resource: 'alerts', action: 'read' },
      { id: 'alert.create', name: '创建告警规则', resource: 'alerts', action: 'create' },
      { id: 'alert.update', name: '更新告警规则', resource: 'alerts', action: 'update' },
      { id: 'alert.delete', name: '删除告警规则', resource: 'alerts', action: 'delete' },
      { id: 'alert.acknowledge', name: '确认告警', resource: 'alerts', action: 'acknowledge' },
      
      // 权限管理权限
      { id: 'permission.read', name: '查看权限', resource: 'permissions', action: 'read' },
      { id: 'permission.grant', name: '授予权限', resource: 'permissions', action: 'grant' },
      { id: 'permission.revoke', name: '撤销权限', resource: 'permissions', action: 'revoke' },
      { id: 'role.manage', name: '管理角色', resource: 'roles', action: 'manage' },
    ];

    // 保存权限
    systemPermissions.forEach(perm => {
      this.permissions.set(perm.id, perm);
    });

    // 创建默认角色
    this.createDefaultRoles(systemPermissions);
  }

  private createDefaultRoles(permissions: Permission[]) {
    // 超级管理员 - 拥有所有权限
    const superAdmin: Role = {
      id: 'super_admin',
      name: '超级管理员',
      description: '拥有系统所有权限',
      permissions: [...permissions],
      isSystem: true
    };

    // 管理员 - 拥有大部分权限（除了系统配置和权限管理）
    const admin: Role = {
      id: 'admin',
      name: '管理员',
      description: '拥有管理权限',
      permissions: permissions.filter(p => 
        !p.id.startsWith('system.') && 
        !p.id.startsWith('permission.') && 
        !p.id.includes('role.')
      ),
      isSystem: true
    };

    // 运营人员 - 日常运营权限
    const operator: Role = {
      id: 'operator',
      name: '运营人员',
      description: '负责日常运营管理',
      permissions: permissions.filter(p => 
        p.action === 'read' || 
        p.id.includes('kyc') || 
        p.id.includes('withdrawal') ||
        p.id.includes('order') ||
        p.id.includes('report.view')
      ),
      isSystem: true
    };

    // 审计员 - 只有查看和导出权限
    const auditor: Role = {
      id: 'auditor',
      name: '审计员',
      description: '负责审计和合规检查',
      permissions: permissions.filter(p => 
        p.action === 'read' || 
        p.action === 'export' ||
        p.id.includes('audit') ||
        p.id.includes('report')
      ),
      isSystem: true
    };

    // 客服 - 基础查看权限
    const support: Role = {
      id: 'support',
      name: '客服',
      description: '客户支持人员',
      permissions: permissions.filter(p => 
        p.action === 'read' &&
        (p.resource === 'users' || 
         p.resource === 'orders' || 
         p.resource === 'products')
      ),
      isSystem: true
    };

    // 保存角色
    [superAdmin, admin, operator, auditor, support].forEach(role => {
      this.roles.set(role.id, role);
    });
  }

  // 检查用户权限
  async checkPermission(
    userId: string, 
    resource: string, 
    action: string
  ): Promise<boolean> {
    const userRoles = this.userRoles.get(userId) || [];
    
    for (const roleId of userRoles) {
      const role = this.roles.get(roleId);
      if (role) {
        const hasPermission = role.permissions.some(p => 
          p.resource === resource && p.action === action
        );
        if (hasPermission) return true;
      }
    }
    
    return false;
  }

  // 批量检查权限
  async checkPermissions(
    userId: string,
    checks: { resource: string; action: string }[]
  ): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};
    
    for (const check of checks) {
      const key = `${check.resource}:${check.action}`;
      results[key] = await this.checkPermission(userId, check.resource, check.action);
    }
    
    return results;
  }

  // 获取用户权限矩阵
  async getUserPermissionMatrix(userId: string): Promise<PermissionMatrix[]> {
    const userRoles = this.userRoles.get(userId) || [];
    const matrices: PermissionMatrix[] = [];
    
    for (const roleId of userRoles) {
      const role = this.roles.get(roleId);
      if (role) {
        const resourceMap = new Map<string, Set<string>>();
        
        // 按资源分组权限
        role.permissions.forEach(p => {
          if (!resourceMap.has(p.resource)) {
            resourceMap.set(p.resource, new Set());
          }
          resourceMap.get(p.resource)!.add(p.action);
        });
        
        // 构建权限矩阵
        const matrix: PermissionMatrix = {
          roleId: role.id,
          roleName: role.name,
          permissions: Array.from(resourceMap.entries()).map(([resource, actions]) => ({
            resource,
            actions: {
              create: actions.has('create'),
              read: actions.has('read'),
              update: actions.has('update'),
              delete: actions.has('delete'),
              execute: actions.has('execute') || actions.has('approve') || actions.has('process')
            }
          }))
        };
        
        matrices.push(matrix);
      }
    }
    
    return matrices;
  }

  // 分配角色给用户
  async assignRole(userId: string, roleId: string): Promise<void> {
    if (!this.roles.has(roleId)) {
      throw new Error('Role not found');
    }
    
    const userRoles = this.userRoles.get(userId) || [];
    if (!userRoles.includes(roleId)) {
      userRoles.push(roleId);
      this.userRoles.set(userId, userRoles);
    }
    
    // 持久化到数据库
    await this.saveUserRoleToDB(userId, roleId);
  }

  // 撤销用户角色
  async revokeRole(userId: string, roleId: string): Promise<void> {
    const userRoles = this.userRoles.get(userId) || [];
    const index = userRoles.indexOf(roleId);
    
    if (index > -1) {
      userRoles.splice(index, 1);
      this.userRoles.set(userId, userRoles);
    }
    
    // 从数据库删除
    await this.deleteUserRoleFromDB(userId, roleId);
  }

  // 获取用户角色
  async getUserRoles(userId: string): Promise<Role[]> {
    const userRoleIds = this.userRoles.get(userId) || [];
    return userRoleIds
      .map(roleId => this.roles.get(roleId))
      .filter(role => role !== undefined) as Role[];
  }

  // 创建自定义角色
  async createRole(role: Omit<Role, 'id'>): Promise<Role> {
    const newRole: Role = {
      ...role,
      id: this.generateRoleId(),
      isSystem: false
    };
    
    this.roles.set(newRole.id, newRole);
    await this.saveRoleToDB(newRole);
    
    return newRole;
  }

  // 更新角色
  async updateRole(roleId: string, updates: Partial<Role>): Promise<Role> {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error('Role not found');
    }
    
    if (role.isSystem) {
      throw new Error('Cannot modify system role');
    }
    
    const updatedRole = { ...role, ...updates };
    this.roles.set(roleId, updatedRole);
    await this.saveRoleToDB(updatedRole);
    
    return updatedRole;
  }

  // 删除角色
  async deleteRole(roleId: string): Promise<void> {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error('Role not found');
    }
    
    if (role.isSystem) {
      throw new Error('Cannot delete system role');
    }
    
    // 检查是否有用户使用该角色
    for (const [userId, userRoles] of this.userRoles.entries()) {
      if (userRoles.includes(roleId)) {
        throw new Error('Role is still assigned to users');
      }
    }
    
    this.roles.delete(roleId);
    await this.deleteRoleFromDB(roleId);
  }

  // 获取所有角色
  async getAllRoles(): Promise<Role[]> {
    return Array.from(this.roles.values());
  }

  // 获取所有权限
  async getAllPermissions(): Promise<Permission[]> {
    return Array.from(this.permissions.values());
  }

  // 按资源分组权限
  async getPermissionsByResource(): Promise<Map<string, Permission[]>> {
    const grouped = new Map<string, Permission[]>();
    
    this.permissions.forEach(permission => {
      if (!grouped.has(permission.resource)) {
        grouped.set(permission.resource, []);
      }
      grouped.get(permission.resource)!.push(permission);
    });
    
    return grouped;
  }

  // 数据库操作（需要实际实现）
  private async saveRoleToDB(role: Role) {
    console.log('Saving role to DB:', role);
  }

  private async deleteRoleFromDB(roleId: string) {
    console.log('Deleting role from DB:', roleId);
  }

  private async saveUserRoleToDB(userId: string, roleId: string) {
    console.log('Saving user role to DB:', { userId, roleId });
  }

  private async deleteUserRoleFromDB(userId: string, roleId: string) {
    console.log('Deleting user role from DB:', { userId, roleId });
  }

  private generateRoleId(): string {
    return `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}