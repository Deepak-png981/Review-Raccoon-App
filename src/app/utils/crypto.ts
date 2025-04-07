import crypto from 'crypto';

export const getDerivedEncryptionKey = (secret: string): Buffer => {
    return crypto.createHash('sha256').update(secret).digest();
}

export const encryptToken = (token: string) => {
  try {
    const iv = crypto.randomBytes(16);
    const secret = process.env.NEXTAUTH_SECRET || 'fallback_secret';
    const key = getDerivedEncryptionKey(secret);
    
    console.log(`Direct encryption with key length: ${key.length} bytes`);
    
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      accessTokenHash: encrypted,
      accessTokenIV: iv.toString('hex')
    };
  } catch (error) {
    console.error('Direct encryption error:', error);
    throw error;
  }
}

export const decryptToken = (hash: string, iv: string) => {
    try {
      if (!hash || !iv) {
        console.error('Cannot decrypt without hash and IV');
        throw new Error('Hash and IV are required for decryption');
      }
  
      const secret = process.env.NEXTAUTH_SECRET || 'fallback_secret';
      const key = getDerivedEncryptionKey(secret);
  
      console.log(`Direct decryption with key length: ${key.length} bytes`);
  
      const ivBuffer = Buffer.from(iv, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, ivBuffer);
  
      let decrypted = decipher.update(hash, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
  
      return decrypted;
    } catch (error) {
      console.error('Direct decryption error:', error);
      throw error;
    }
  }
  