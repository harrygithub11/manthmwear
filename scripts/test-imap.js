// Test IMAP connection
const Imap = require('imap')

const config = {
  host: 'mail.connectharish.online',
  port: 993,
  user: 'noreply@connectharish.online',
  password: 'Mail123!',
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
  connTimeout: 10000,
  authTimeout: 10000,
}

console.log('Testing IMAP connection to:', config.host)
console.log('User:', config.user)

const imap = new Imap(config)

imap.once('ready', () => {
  console.log('✅ IMAP connection successful!')
  
  imap.openBox('INBOX', true, (err, box) => {
    if (err) {
      console.error('❌ Failed to open INBOX:', err.message)
      imap.end()
      return
    }
    
    console.log('✅ INBOX opened successfully')
    console.log('📧 Total messages:', box.messages.total)
    imap.end()
  })
})

imap.once('error', (err) => {
  console.error('❌ IMAP error:', err.message)
  process.exit(1)
})

imap.once('end', () => {
  console.log('Connection closed')
  process.exit(0)
})

console.log('Connecting...')
imap.connect()

// Timeout after 15 seconds
setTimeout(() => {
  console.error('❌ Connection timeout after 15s')
  process.exit(1)
}, 15000)
