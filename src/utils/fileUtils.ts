export function getFileType(fileName: string): 'document' | 'image' | 'media' | 'other' {
  const extension = fileName.split('.').pop()?.toLowerCase();

  if (!extension) return 'other';  // Return 'other' if there is no extension

  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
  const documentExtensions = ['pdf', 'doc', 'docx', 'txt'];
  const mediaExtensions = ['mp4', 'mkv', 'mov'];

  if (imageExtensions.includes(extension)) return 'image';
  if (documentExtensions.includes(extension)) return 'document';
  if (mediaExtensions.includes(extension)) return 'media';
  
  return 'other'; // Default case if the extension doesn't match any category
}
