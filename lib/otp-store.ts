// In-memory OTP store with expiry
// For production, consider using Redis or database

interface OTPEntry {
  otp: string
  email: string
  expiresAt: number
  attempts: number
}

class OTPStore {
  private store: Map<string, OTPEntry> = new Map()
  private readonly OTP_EXPIRY = 10 * 60 * 1000 // 10 minutes
  private readonly MAX_ATTEMPTS = 5

  // Generate 6-digit OTP
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Store OTP for email
  set(email: string, otp: string): void {
    this.store.set(email.toLowerCase(), {
      otp,
      email: email.toLowerCase(),
      expiresAt: Date.now() + this.OTP_EXPIRY,
      attempts: 0
    })
  }

  // Verify OTP for email
  verify(email: string, otp: string): { success: boolean; message: string } {
    const entry = this.store.get(email.toLowerCase())

    if (!entry) {
      return { success: false, message: 'OTP not found. Please request a new one.' }
    }

    // Check expiry
    if (Date.now() > entry.expiresAt) {
      this.store.delete(email.toLowerCase())
      return { success: false, message: 'OTP has expired. Please request a new one.' }
    }

    // Check attempts
    if (entry.attempts >= this.MAX_ATTEMPTS) {
      this.store.delete(email.toLowerCase())
      return { success: false, message: 'Too many failed attempts. Please request a new OTP.' }
    }

    // Verify OTP
    if (entry.otp === otp) {
      this.store.delete(email.toLowerCase())
      return { success: true, message: 'OTP verified successfully' }
    } else {
      entry.attempts++
      return { success: false, message: `Invalid OTP. ${this.MAX_ATTEMPTS - entry.attempts} attempts remaining.` }
    }
  }

  // Clear expired OTPs (run periodically)
  clearExpired(): void {
    const now = Date.now()
    const emailsToDelete: string[] = []
    
    this.store.forEach((entry, email) => {
      if (now > entry.expiresAt) {
        emailsToDelete.push(email)
      }
    })
    
    emailsToDelete.forEach(email => this.store.delete(email))
  }

  // Check if OTP exists and is valid
  has(email: string): boolean {
    const entry = this.store.get(email.toLowerCase())
    if (!entry) return false
    if (Date.now() > entry.expiresAt) {
      this.store.delete(email.toLowerCase())
      return false
    }
    return true
  }
}

// Singleton instance
export const otpStore = new OTPStore()

// Clear expired OTPs every 5 minutes
setInterval(() => {
  otpStore.clearExpired()
}, 5 * 60 * 1000)
