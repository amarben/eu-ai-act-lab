import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

/**
 * Convert DOCX buffer to PDF using LibreOffice
 * @param docxBuffer - DOCX file buffer
 * @param filename - Original filename (without extension)
 * @returns PDF buffer
 */
export async function convertDocxToPdf(
  docxBuffer: Buffer,
  filename: string
): Promise<Buffer> {
  // Check if LibreOffice is available
  const hasLibreOffice = await checkLibreOffice();

  if (!hasLibreOffice) {
    console.warn('LibreOffice not installed - returning DOCX instead of PDF');
    // Return DOCX buffer as fallback
    return docxBuffer;
  }

  // Create temporary directory
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdf-conversion-'));

  try {
    // Write DOCX to temp file
    const docxPath = path.join(tmpDir, `${filename}.docx`);
    await fs.writeFile(docxPath, docxBuffer);

    // Convert to PDF using LibreOffice (use soffice on macOS)
    const libreOfficeBin = process.platform === 'darwin'
      ? '/Applications/LibreOffice.app/Contents/MacOS/soffice'
      : 'libreoffice';
    const command = `"${libreOfficeBin}" --headless --convert-to pdf --outdir "${tmpDir}" "${docxPath}"`;

    await execAsync(command, {
      timeout: 30000, // 30 second timeout
    });

    // Read generated PDF
    const pdfPath = path.join(tmpDir, `${filename}.pdf`);
    const pdfBuffer = await fs.readFile(pdfPath);

    return pdfBuffer;
  } catch (error) {
    console.error('PDF conversion error:', error);
    throw new Error('Failed to convert DOCX to PDF');
  } finally {
    // Cleanup temp directory
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error('Failed to cleanup temp directory:', cleanupError);
    }
  }
}

/**
 * Check if LibreOffice is installed and available
 * @returns true if LibreOffice is available
 */
async function checkLibreOffice(): Promise<boolean> {
  try {
    const libreOfficeBin = process.platform === 'darwin'
      ? '/Applications/LibreOffice.app/Contents/MacOS/soffice'
      : 'libreoffice';
    await execAsync(`"${libreOfficeBin}" --version`, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get appropriate file extension and MIME type based on conversion availability
 * @returns File extension and MIME type
 */
export async function getExportFormat(): Promise<{
  extension: string;
  mimeType: string;
  canConvertPdf: boolean;
}> {
  const hasLibreOffice = await checkLibreOffice();

  if (hasLibreOffice) {
    return {
      extension: 'pdf',
      mimeType: 'application/pdf',
      canConvertPdf: true,
    };
  }

  return {
    extension: 'docx',
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    canConvertPdf: false,
  };
}

/**
 * Convert document buffer to requested format
 * @param docxBuffer - DOCX buffer
 * @param filename - Base filename
 * @param preferPdf - Try to convert to PDF if possible
 * @returns Buffer and file info
 */
export async function convertDocument(
  docxBuffer: Buffer,
  filename: string,
  preferPdf: boolean = true
): Promise<{
  buffer: Buffer;
  extension: string;
  mimeType: string;
}> {
  if (!preferPdf) {
    return {
      buffer: docxBuffer,
      extension: 'docx',
      mimeType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
  }

  const format = await getExportFormat();

  if (format.canConvertPdf) {
    try {
      const pdfBuffer = await convertDocxToPdf(docxBuffer, filename);
      return {
        buffer: pdfBuffer,
        extension: 'pdf',
        mimeType: 'application/pdf',
      };
    } catch (error) {
      console.error('PDF conversion failed, falling back to DOCX:', error);
      return {
        buffer: docxBuffer,
        extension: 'docx',
        mimeType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      };
    }
  }

  return {
    buffer: docxBuffer,
    extension: format.extension,
    mimeType: format.mimeType,
  };
}
