const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Fixing admin password...')
  
  // Get the first settings record
  const settings = await prisma.sitesettings.findFirst()
  
  if (settings) {
    console.log('Found settings record:', settings.id)
    console.log('Current adminPasswordHash:', settings.adminPasswordHash || 'NULL')
    
    // If adminPasswordHash is null, set it to default "admin123" hash
    if (!settings.adminPasswordHash) {
      const defaultHash = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
      
      await prisma.sitesettings.update({
        where: { id: settings.id },
        data: { adminPasswordHash: defaultHash }
      })
      
      console.log('✅ Updated adminPasswordHash to default (admin123)')
    } else {
      console.log('✅ adminPasswordHash already set')
    }
  } else {
    console.log('No settings record found. Creating one...')
    await prisma.sitesettings.create({
      data: {}
    })
    console.log('✅ Created default settings with admin123 password')
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
