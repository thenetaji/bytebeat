/**
 * Function to return filename from title and MIME type
 * @params {String} filename - The name of the file to be set
 * @params {String} type - The MIME type of the file
 * @returns {String} fullFilename - The name of the file with extension along with site name appended "TuneVault"
 */
export const getFilename = (filename, type) => {
  const MIME_TYPES_WITH_EXT = {
    "audio/mpeg": "mp3",
    "audio/ogg": "ogg",
    "audio/webm": "webm",
    "audio/wav": "wav",
    "audio/flac": "flac",
  };

  const extension = MIME_TYPES_WITH_EXT[type];
  const encodedFilename = encodeURIComponent(filename);
  const fullFilename = `TuneVault-${encodedFilename}.${extension}`;

  return fullFilename;
};