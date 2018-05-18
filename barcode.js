
const QRCode = require('qrcode');


/**
 * generates 3 QR codes from an encrypted private key. This private key can be decrypted
 * again with the password, and with 2 of the QR codes.
 * @param key array of data to put in QR Code
 * @param filename filename to store QR Code at
 */
function generateQrCode(str, filename, callback) {
    let options = {
        color: {
            dark: '#00F',  // Blue dots
            light: '#0000' // Transparent background
        },
        errorCorrectionLevel: 'M'
    };

    QRCode.toFile(filename, str, options, (err) => {
        if (err) throw err;
        if (callback) callback();
    });
}
