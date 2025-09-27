const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Capture console messages
  const logs = [];
  page.on('console', msg => {
    logs.push({
      type: msg.type(),
      text: msg.text()
    });
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    logs.push({
      type: 'error',
      text: error.message
    });
  });
  
  try {
    console.log('Testing http://localhost:8175...');
    await page.goto('http://localhost:8175', {
      waitUntil: 'networkidle2',
      timeout: 10000
    });
    
    // Wait a bit to see if errors occur
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check for React error
    const hasReactError = logs.some(log => 
      log.text.includes('Error #185') || 
      log.text.includes('Maximum update depth exceeded')
    );
    
    if (hasReactError) {
      console.log('\n❌ REACT ERROR #185 DETECTED!');
      console.log('Console logs:');
      logs.forEach(log => {
        if (log.type === 'error' || log.text.includes('Error')) {
          console.log(`[${log.type}] ${log.text}`);
        }
      });
    } else {
      console.log('\n✅ No React Error #185 detected');
      console.log(`Total console messages: ${logs.length}`);
    }
    
  } catch (error) {
    console.error('Error during test:', error.message);
  } finally {
    await browser.close();
  }
})();
