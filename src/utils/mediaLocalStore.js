import RNFS from 'react-native-fs';

/**
 * Save a media file (image/video) to local storage and return the local file path.
 * @param {string} sourceUri - The original URI of the media file (content://, file://, or remote URL)
 * @param {string} fileName - The desired file name for local storage
 * @returns {Promise<string>} - The local file path (file://...)
 */
export async function saveMediaToLocal(sourceUri, fileName) {
  try {
    const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
    if (sourceUri.startsWith('file://')) {
      // Already a local file, just return
      return sourceUri;
    } else if (sourceUri.startsWith('content://')) {
      // Copy from content URI to local file
      await RNFS.copyFile(sourceUri, destPath);
      return `file://${destPath}`;
    } else if (
      sourceUri.startsWith('http://') ||
      sourceUri.startsWith('https://')
    ) {
      // Download remote file
      await RNFS.downloadFile({fromUrl: sourceUri, toFile: destPath}).promise;
      return `file://${destPath}`;
    } else {
      throw new Error('Unsupported URI scheme for media file');
    }
  } catch (err) {
    console.log('Error saving media to local:', err);
    return null;
  }
}
