const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Define paths for certificates
const certsDir = path.join(__dirname, '../certs');
const keyPath = path.join(certsDir, 'localhost-key.pem');
const certPath = path.join(certsDir, 'localhost.pem');

// Create certs directory if it doesn't exist
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
  console.log('Created certs directory');
}

// Check if certificates already exist
if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  console.log('Certificates already exist. Skipping generation.');
  process.exit(0);
}

try {
  // Generate self-signed certificate using OpenSSL
  console.log('Generating self-signed certificates...');
  
  // Create OpenSSL configuration
  const opensslConfig = `
[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_req
prompt = no

[req_distinguished_name]
CN = localhost

[v3_req]
subjectAltName = @alt_names
basicConstraints = critical, CA:false
keyUsage = keyCertSign, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth

[alt_names]
DNS.1 = localhost
DNS.2 = 10.104.202.21
IP.1 = 127.0.0.1
IP.2 = 10.104.202.21
`;
  
  const configPath = path.join(certsDir, 'openssl.cnf');
  fs.writeFileSync(configPath, opensslConfig);
  
  // Generate private key and certificate
  execSync(`openssl req -x509 -newkey rsa:2048 -nodes -keyout "${keyPath}" -out "${certPath}" -days 365 -config "${configPath}"`);
  
  // Clean up config file
  fs.unlinkSync(configPath);
  
  console.log('Self-signed certificates generated successfully!');
  console.log(`Key: ${keyPath}`);
  console.log(`Certificate: ${certPath}`);
} catch (error) {
  console.error('Error generating certificates:', error);
  process.exit(1);
}