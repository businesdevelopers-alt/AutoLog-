/**
 * Service for interacting with Google Drive API.
 */

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  iconLink?: string;
  createdTime: string;
  size?: string;
  thumbnailLink?: string;
}

/**
 * List files from Google Drive.
 */
export const fetchGoogleDriveFiles = async (
  accessToken: string,
  searchQuery?: string,
  mimeTypeFilter?: string
): Promise<GoogleDriveFile[]> => {
  const qParts: string[] = ["trashed = false"];
  if (searchQuery) {
    // Escape single quotes to prevent injection errors in query parser
    const escapedQuery = searchQuery.replace(/'/g, "\\'");
    qParts.push(`name contains '${escapedQuery}'`);
  }
  if (mimeTypeFilter) {
    if (mimeTypeFilter === 'folders') {
      qParts.push("mimeType = 'application/vnd.google-apps.folder'");
    } else if (mimeTypeFilter === 'sheets') {
      qParts.push("mimeType = 'application/vnd.google-apps.spreadsheet'");
    } else if (mimeTypeFilter === 'docs') {
      qParts.push("mimeType = 'application/vnd.google-apps.document'");
    } else if (mimeTypeFilter === 'forms') {
      qParts.push("mimeType = 'application/vnd.google-apps.form'");
    } else if (mimeTypeFilter === 'files') {
      qParts.push("mimeType != 'application/vnd.google-apps.folder'");
    }
  }

  const q = encodeURIComponent(qParts.join(' and '));
  // Request files ordered by created time descending
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&pageSize=100&fields=files(id,name,mimeType,webViewLink,iconLink,createdTime,size,thumbnailLink)&orderBy=createdTime%20desc`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const errorDetails = await res.json().catch(() => ({}));
    throw new Error(errorDetails?.error?.message || 'Failed to fetch Google Drive files');
  }

  const data = await res.json();
  return data.files || [];
};

/**
 * Create a folder in Google Drive.
 */
export const createDriveFolder = async (
  accessToken: string,
  folderName: string,
  parentId?: string
): Promise<string> => {
  const url = 'https://www.googleapis.com/drive/v3/files';
  const body: any = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder'
  };
  if (parentId) {
    body.parents = [parentId];
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errorDetails = await res.json().catch(() => ({}));
    throw new Error(errorDetails?.error?.message || 'Failed to create folder in Google Drive');
  }

  const data = await res.json();
  return data.id;
};

/**
 * Upload a file to Google Drive.
 */
export const uploadFileToDrive = async (
  accessToken: string,
  file: File,
  folderId?: string
): Promise<GoogleDriveFile> => {
  // Step 1: Upload raw file contents
  const uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=media';
  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': file.type || 'application/octet-stream'
    },
    body: file
  });

  if (!uploadRes.ok) {
    const errorDetails = await uploadRes.json().catch(() => ({}));
    throw new Error(errorDetails?.error?.message || 'Failed to upload media content to Google Drive');
  }

  const result = await uploadRes.json();
  const fileId = result.id;

  // Step 2: Update file metadata: Name and Parents (if folderId provided)
  const metadataUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,webViewLink,iconLink,createdTime,size`;
  const metadataBody: any = {
    name: file.name
  };
  if (folderId) {
    metadataBody.addParents = folderId;
  }

  const patchRes = await fetch(metadataUrl, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(metadataBody)
  });

  if (!patchRes.ok) {
    const errorDetails = await patchRes.json().catch(() => ({}));
    throw new Error(errorDetails?.error?.message || 'Failed to update file metadata in Google Drive');
  }

  return await patchRes.json();
};

/**
 * Delete a file or folder from Google Drive.
 */
export const deleteDriveFile = async (accessToken: string, fileId: string): Promise<void> => {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const errorDetails = await res.json().catch(() => ({}));
    throw new Error(errorDetails?.error?.message || 'Failed to delete file from Google Drive');
  }
};
