// Utility to check if a Lottie file exists for a given emoji
export async function lottieExistsForEmoji(emoji) {
  if (!emoji) return false;
  const codePoints = [];
  for (const symbol of [...emoji]) {
    const code = symbol.codePointAt(0).toString(16);
    codePoints.push(code);
  }
  const unicodeStr = codePoints.join('-');
  const lottieUrl = `https://fonts.gstatic.com/s/e/notoemoji/latest/${unicodeStr}/lottie.json`;
  try {
    const response = await fetch(lottieUrl, {method: 'HEAD'});
    return response.ok;
  } catch (e) {
    return false;
  }
}
