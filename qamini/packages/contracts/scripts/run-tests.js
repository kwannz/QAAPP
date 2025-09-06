const { exec } = require('child_process');
const path = require('path');

const testFiles = [
  'test/Treasury.test.ts',
  'test/QACard.test.ts', 
  'test/MockUSDT.test.ts',
  'test/Integration.test.ts',
  'test/Performance.test.ts'
];

console.log('🧪 QA App Smart Contract Test Suite Summary\n');
console.log('=' .repeat(60));

let totalPassed = 0;
let totalFailed = 0;
let completedTests = 0;

testFiles.forEach((testFile, index) => {
  const testName = path.basename(testFile, '.test.ts');
  
  exec(`npx hardhat test ${testFile}`, (error, stdout, stderr) => {
    completedTests++;
    
    if (error) {
      const failedMatch = stdout.match(/(\d+) failing/);
      const passedMatch = stdout.match(/(\d+) passing/);
      
      const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
      const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
      
      console.log(`❌ ${testName}: ${passed} passed, ${failed} failed`);
      totalPassed += passed;
      totalFailed += failed;
    } else {
      const passedMatch = stdout.match(/(\d+) passing/);
      const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
      
      console.log(`✅ ${testName}: ${passed} passed`);
      totalPassed += passed;
    }
    
    // If all tests completed, show summary
    if (completedTests === testFiles.length) {
      console.log('=' .repeat(60));
      console.log(`📊 Final Results:`);
      console.log(`   ✅ Total Passed: ${totalPassed}`);
      console.log(`   ❌ Total Failed: ${totalFailed}`);
      console.log(`   📈 Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
      
      if (totalFailed === 0) {
        console.log('\n🎉 All tests passed! Smart contract test suite is complete.');
        console.log('   ✨ 100% completion achieved for QA App blockchain integration!');
      } else {
        console.log(`\n⚠️  Some tests need attention. ${totalFailed} tests are failing.`);
      }
    }
  });
});