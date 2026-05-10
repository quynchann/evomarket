import bcrypt from 'bcryptjs'

const saltRounds = 10

/**
 * Hash a plain text password.
 */
export const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(saltRounds)
    const hashedPassword = await bcrypt.hash(password, salt)
    return hashedPassword
  } catch (error) {
    throw new Error(`Hashing password failed: ${error.message}`)
  }
}

/**
 * Compare a plain text password with a hashed password.
 */
export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    throw new Error(`Comparing password failed: ${error.message}`)
  }
}
