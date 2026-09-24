export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  thumbnailLink?: string;
  webViewLink?: string;
  webContentLink?: string;
  createdTime?: string;
  modifiedTime?: string;
  iconLink?: string;
  parents?: string[];
}

export interface DriveAboutInfo {
  user: {
    displayName: string;
    emailAddress: string;
    photoLink?: string;
  };
  storageQuota?: {
    limit: string;
    usage: string;
    usageInDrive: string;
  };
}

/**
 * Fetch information about the authenticated user's Google Drive account
 */
export async function getDriveAbout(accessToken: string): Promise<DriveAboutInfo | null> {
  try {
    const res = await fetch(
      'https://www.googleapis.com/drive/v3/about?fields=user,storageQuota',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch Drive about info:', e);
    return null;
  }
}

/**
 * List files in Google Drive with optional search query or parent folder filtering
 */
export async function listDriveFiles(
  accessToken: string,
  options?: {
    folderId?: string;
    searchQuery?: string;
    mimeTypeFilter?: 'all' | 'video' | 'folder' | 'document';
    pageSize?: number;
  }
): Promise<DriveFile[]> {
  try {
    const { folderId, searchQuery, mimeTypeFilter = 'all', pageSize = 50 } = options || {};

    const queryParts: string[] = ['trashed = false'];

    if (folderId) {
      queryParts.push(`'${folderId}' in parents`);
    } else {
      queryParts.push(`'root' in parents`);
    }

    if (searchQuery && searchQuery.trim()) {
      const sanitized = searchQuery.replace(/'/g, "\\'");
      queryParts.push(`name contains '${sanitized}'`);
    }

    if (mimeTypeFilter === 'video') {
      queryParts.push(`mimeType contains 'video/'`);
    } else if (mimeTypeFilter === 'folder') {
      queryParts.push(`mimeType = 'application/vnd.google-apps.folder'`);
    } else if (mimeTypeFilter === 'document') {
      queryParts.push(`mimeType != 'application/vnd.google-apps.folder'`);
    }

    const q = encodeURIComponent(queryParts.join(' and '));
    const fields = encodeURIComponent(
      'files(id, name, mimeType, size, thumbnailLink, webViewLink, webContentLink, createdTime, modifiedTime, iconLink, parents)'
    );

    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&pageSize=${pageSize}&orderBy=folder,name`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Drive list error:', res.status, errText);
      throw new Error(`Google Drive API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return data.files || [];
  } catch (err: any) {
    console.error('Failed to list Google Drive files:', err);
    throw err;
  }
}

/**
 * Upload a file directly to Google Drive using multipart upload
 */
export async function uploadFileToDrive(
  accessToken: string,
  file: File,
  folderId?: string,
  onProgress?: (percentage: number) => void
): Promise<DriveFile> {
  const metadata = {
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    parents: folderId ? [folderId] : undefined,
  };

  const formData = new FormData();
  formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  formData.append('file', file);

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,webViewLink,webContentLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to upload to Google Drive: ${errText}`);
  }

  return await res.json();
}

/**
 * Create a new folder in Google Drive
 */
export async function createDriveFolder(
  accessToken: string,
  folderName: string,
  parentId?: string
): Promise<DriveFile> {
  const metadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: parentId ? [parentId] : undefined,
  };

  const res = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create Drive folder: ${errText}`);
  }

  return await res.json();
}

/**
 * Delete a file or folder in Google Drive.
 * MUST be preceded by explicit user confirmation in the UI!
 */
export async function deleteDriveFile(accessToken: string, fileId: string): Promise<boolean> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok && res.status !== 204) {
    const errText = await res.text();
    throw new Error(`Failed to delete file from Google Drive: ${errText}`);
  }

  return true;
}

/**
 * Export MovieGuard Audit Logs to Google Drive as a JSON report file
 */
export async function exportLogsToDrive(
  accessToken: string,
  logs: any[],
  folderId?: string
): Promise<DriveFile> {
  const reportContent = JSON.stringify(
    {
      app: 'MovieGuard Secure Media Vault',
      exportedAt: new Date().toISOString(),
      logCount: logs.length,
      auditLogs: logs,
    },
    null,
    2
  );

  const fileBlob = new Blob([reportContent], { type: 'application/json' });
  const fileName = `MovieGuard_Audit_Logs_${new Date().toISOString().slice(0, 10)}.json`;

  const file = new File([fileBlob], fileName, { type: 'application/json' });
  return uploadFileToDrive(accessToken, file, folderId);
}

/**
 * Backup Movie Catalog to Google Drive
 */
export async function exportCatalogToDrive(
  accessToken: string,
  mediaItems: any[],
  folderId?: string
): Promise<DriveFile> {
  const catalogContent = JSON.stringify(
    {
      app: 'MovieGuard Secure Media Vault',
      backupAt: new Date().toISOString(),
      itemCount: mediaItems.length,
      movies: mediaItems,
    },
    null,
    2
  );

  const fileBlob = new Blob([catalogContent], { type: 'application/json' });
  const fileName = `MovieGuard_Catalog_Backup_${new Date().toISOString().slice(0, 10)}.json`;

  const file = new File([fileBlob], fileName, { type: 'application/json' });
  return uploadFileToDrive(accessToken, file, folderId);
}
