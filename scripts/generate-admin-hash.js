const bcrypt = require('bcryptjs')

async function main() {
  const password = 'admin123'
  
  console.log('Generating bcrypt hash for:', password)
  
  // Generate new hash
  const hash = await bcrypt.hash(password, 10)
  console.log('\nGenerated hash:')
  console.log(hash)
  
  // Test verification
  const isValid = await bcrypt.compare(password, hash)
  console.log('\nVerification test:', isValid ? '✅ PASS' : '❌ FAIL')
  
  // Test with the default hash we set
  const defaultHash = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
  const defaultValid = await bcrypt.compare(password, defaultHash)
  console.log('Default hash test:', defaultValid ? '✅ PASS' : '❌ FAIL')
  
  console.log('\nUse this hash in your database:')
  console.log(hash)
}

main()
