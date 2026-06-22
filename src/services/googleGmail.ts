/**
 * Service for interacting with Google Gmail API.
 */

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  subject?: string;
  from?: string;
  to?: string;
  date?: string;
  body?: string;
  isRead?: boolean;
}

/**
 * Utility to safe Base64Url encode unicode strings
 */
const base64UrlEncode = (str: string): string => {
  const binaryString = unescape(encodeURIComponent(str));
  const base64 = btoa(binaryString);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

/**
 * List messages from Gmail
 */
export const fetchGmailMessages = async (
  accessToken: string,
  query: string = '',
  maxResults: number = 30
): Promise<GmailMessage[]> => {
  let url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`;
  if (query) {
    url += `&q=${encodeURIComponent(query)}`;
  }

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const errorDetails = await res.json().catch(() => ({}));
    throw new Error(errorDetails?.error?.message || 'Failed to fetch Gmail messages');
  }

  const data = await res.json();
  if (!data.messages) return [];

  // Fetch details for each message in parallel
  const detailPromises = data.messages.map(async (msg: { id: string; threadId: string }) => {
    try {
      return await fetchGmailMessageDetails(accessToken, msg.id);
    } catch {
      return {
        id: msg.id,
        threadId: msg.threadId,
        snippet: 'Failed to load details',
        isRead: true
      };
    }
  });

  return Promise.all(detailPromises);
};

/**
 * Fetch detailed content of a single Gmail message
 */
export const fetchGmailMessageDetails = async (
  accessToken: string,
  messageId: string
): Promise<GmailMessage> => {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const errorDetails = await res.json().catch(() => ({}));
    throw new Error(errorDetails?.error?.message || 'Failed to fetch Gmail message details');
  }

  const data = await res.json();
  const headers = data.payload?.headers || [];

  const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || 'بدون موضوع';
  const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || '';
  const to = headers.find((h: any) => h.name.toLowerCase() === 'to')?.value || '';
  const date = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || '';
  
  // Extract body
  let body = '';
  if (data.payload?.parts) {
    const textPart = data.payload.parts.find(
      (part: any) => part.mimeType === 'text/plain' || part.mimeType === 'text/html'
    );
    if (textPart?.body?.data) {
      body = decodeBase64Url(textPart.body.data);
    } else {
      // Nested parts
      const nestedPart = data.payload.parts.find((part: any) => part.parts);
      const textNested = nestedPart?.parts?.find(
        (part: any) => part.mimeType === 'text/plain' || part.mimeType === 'text/html'
      );
      if (textNested?.body?.data) {
        body = decodeBase64Url(textNested.body.data);
      }
    }
  } else if (data.payload?.body?.data) {
    body = decodeBase64Url(data.payload.body.data);
  }

  const isRead = !data.labelIds?.includes('UNREAD');

  return {
    id: data.id,
    threadId: data.threadId,
    snippet: data.snippet || '',
    subject,
    from,
    to,
    date,
    body: body || data.snippet || '',
    isRead
  };
};

/**
 * Decode Base64Url to safe string
 */
function decodeBase64Url(base64UrlStr: string): string {
  try {
    let base64 = base64UrlStr.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch {
    return 'تعذر فك ترميز محتوى الرسالة';
  }
}

/**
 * Send an email via Google Gmail API
 */
export const sendGmailMessage = async (
  accessToken: string,
  emailData: {
    to: string;
    subject: string;
    body: string;
    isHtml?: boolean;
  }
): Promise<any> => {
  const url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';

  // Construct MIME email RFC 2822
  const utf8Subject = `=?utf-8?B?${base64UrlEncode(emailData.subject)}?=`;
  const emailLines = [
    `To: ${emailData.to}`,
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    `Content-Type: ${emailData.isHtml ? 'text/html' : 'text/plain'}; charset=utf-8`,
    'Content-Transfer-Encoding: base64',
    '',
    // Base64 encode the body lines
    btoa(unescape(encodeURIComponent(emailData.body)))
  ];

  const rawMime = emailLines.join('\r\n');
  const rawBase64UrlEncoded = base64UrlEncode(rawMime);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      raw: rawBase64UrlEncoded
    })
  });

  if (!res.ok) {
    const errorDetails = await res.json().catch(() => ({}));
    throw new Error(errorDetails?.error?.message || 'Failed to send email');
  }

  return await res.json();
};

/**
 * Delete or trash a Gmail message
 */
export const trashGmailMessage = async (accessToken: string, messageId: string): Promise<void> => {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/trash`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const errorDetails = await res.json().catch(() => ({}));
    throw new Error(errorDetails?.error?.message || 'Failed to trash email');
  }
};
