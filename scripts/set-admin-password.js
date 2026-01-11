const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Generate a fresh hash for "admin123"
  const password = 'admin123'
  const hash = await bcrypt.hash(password, 10)
  
  console.log('Setting admin password to:', password)
  console.log('Hash:', hash)
  
  const settings = await prisma.sitesettings.findFirst()
  
  if (settings) {
    await prisma.sitesettings.update({
      where: { id: settings.id },
      data: { adminPasswordHash: hash }
    })
    console.log('✅ Password updated successfully')
    
    // Verify it works
    const updatedSettings = await prisma.sitesettings.findFirst()
    const isValid = await bcrypt.compare(password, updatedSettings.adminPasswordHash)
    console.log('✅ Verification:', isValid ? 'PASS' : 'FAIL')
  } else {
    console.log('No settings found. Creating default settings...')
    await prisma.sitesettings.create({
      data: {
        adminPasswordHash: hash
      }
    })
    console.log('✅ Created settings with admin123 password')
  }
}

main()
  .catch(e => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
