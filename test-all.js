const http = require('http');
const server = require('./server');

// 创建测试服务器
const testServer = server.listen(3001, () => {
  console.log('Test server running on port 3001');
  
  // 测试根路径
  testEndpoint('/', 'GET', null, () => {
    // 测试回调路由 (GET方法)
    testEndpoint('/api/nanobananaapi-callback', 'GET', null, () => {
      // 测试回调路由 (POST方法，无密钥)
      testEndpoint('/api/nanobananaapi-callback', 'POST', {
        taskId: 'test-123',
        status: 'completed'
      }, () => {
        // 测试回调路由 (POST方法，带正确密钥)
        testEndpoint('/api/nanobananaapi-callback', 'POST', {
          taskId: 'test-456',
          status: 'completed',
          result: {
            url: 'https://example.com/image.jpg'
          },
          callbackSecret: 'your-callback-secret-here'
        }, () => {
          // 关闭测试服务器
          testServer.close(() => {
            console.log('All tests completed');
            process.exit(0);
          });
        });
      });
    });
  });
});

function testEndpoint(path, method, body, callback) {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: path,
    method: method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`\n--- Test: ${method} ${path} ---`);
      console.log(`Status: ${res.statusCode}`);
      try {
        const jsonData = JSON.parse(data);
        console.log(`Response: ${JSON.stringify(jsonData, null, 2)}`);
      } catch (e) {
        console.log(`Response: ${data}`);
      }
      callback();
    });
  });
  
  req.on('error', (e) => {
    console.error(`Test failed: ${e.message}`);
    callback();
  });
  
  if (body) {
    req.write(JSON.stringify(body));
  }
  req.end();
}