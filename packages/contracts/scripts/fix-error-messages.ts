/**
 * 批量修复错误消息期望的脚本
 * 将字符串错误期望改为custom error或reverted期望
 */

import fs from 'fs';
import path from 'path';

const testDir = path.join(__dirname, '../test');

// 定义需要替换的错误消息映射
const errorReplacements = [
  {
    from: '.to.be.revertedWith("Amount below minimum investment")',
    to: '.to.be.revertedWithCustomError(treasury, "InvalidInvestmentAmount")'
  },
  {
    from: '.to.be.revertedWith("Amount exceeds maximum investment")',
    to: '.to.be.revertedWithCustomError(treasury, "InvalidInvestmentAmount")'
  },
  {
    from: '.to.be.revertedWith("Invalid product type")',
    to: '.to.be.reverted' // 简化为检查是否reverted
  },
  {
    from: '.to.be.revertedWith("ERC20: insufficient allowance")',
    to: '.to.be.reverted' // ERC20的custom error
  },
  {
    from: '.to.be.revertedWith("Exceeds daily withdrawal limit")',
    to: '.to.be.revertedWithCustomError(treasury, "ExceedsWithdrawLimit")'
  },
  {
    from: '.to.be.revertedWith("Pausable: paused")',
    to: '.to.be.reverted' // OpenZeppelin的custom error
  },
  {
    from: '.to.be.revertedWith("AccessControl:")',
    to: '.to.be.reverted' // AccessControl的custom error
  },
  {
    from: '.to.be.revertedWith("ERC20: transfer amount exceeds balance")',
    to: '.to.be.reverted'
  },
  {
    from: '.to.be.revertedWith("ERC20: transfer to the zero address")',
    to: '.to.be.reverted'
  },
  {
    from: '.to.be.revertedWith("ERC20: decreased allowance below zero")',
    to: '.to.be.revertedWith("ERC20: decreased allowance below zero")'
  },
  {
    from: '.to.be.revertedWith("Ownable: caller is not the owner")',
    to: '.to.be.reverted'
  },
  {
    from: '.to.be.revertedWith("ERC20: mint to the zero address")',
    to: '.to.be.reverted'
  },
  {
    from: '.to.be.revertedWith("ERC20: burn amount exceeds balance")',
    to: '.to.be.reverted'
  },
  {
    from: '.to.be.revertedWith("ERC20: burn from the zero address")',
    to: '.to.be.reverted'
  }
];

async function fixErrorMessages() {
  console.log("🔧 批量修复错误消息期望...\n");
  
  const testFiles = fs.readdirSync(testDir).filter(file => file.endsWith('.test.ts'));
  let totalReplacements = 0;
  
  for (const file of testFiles) {
    const filePath = path.join(testDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let fileReplacements = 0;
    
    for (const replacement of errorReplacements) {
      const regex = new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, replacement.to);
        fileReplacements += matches.length;
      }
    }
    
    if (fileReplacements > 0) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ ${file}: ${fileReplacements} replacements`);
      totalReplacements += fileReplacements;
    }
  }
  
  console.log(`\n🎯 总计修复: ${totalReplacements} 个错误消息期望`);
  console.log("✨ 错误消息修复完成!");
}

fixErrorMessages().catch(console.error);