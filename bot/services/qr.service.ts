import QRCode from 'qrcode'

/**
 * Genera un buffer de imagen PNG a partir de un token de QR
 */
export async function generateQRBuffer(token: string): Promise<Buffer> {
  try {
    const buffer = await QRCode.toBuffer(token, {
      width: 600,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    })
    return buffer
  } catch (error) {
    console.error('Error generando QR Buffer:', error)
    throw error
  }
}
