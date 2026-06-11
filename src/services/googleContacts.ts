/**
 * Service for interacting with Google People API (Contacts).
 */

export interface GoogleContact {
  resourceName: string; // unique identifier
  etag: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  photoUrl?: string;
}

/**
 * List contacts from Google Contacts.
 */
export const fetchGoogleContacts = async (accessToken: string): Promise<GoogleContact[]> => {
  const url = 'https://people.googleapis.com/v1/people/me/connections?pageSize=100&personFields=names,emailAddresses,phoneNumbers,photos';
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const errorDetails = await res.json().catch(() => ({}));
    throw new Error(errorDetails?.error?.message || 'Failed to fetch Google Contacts');
  }

  const data = await res.json();
  const connections = data.connections || [];

  return connections.map((conn: any) => {
    // Extract primary or first name
    const nameObj = conn.names?.[0] || {};
    const name = nameObj.displayName || nameObj.unstructuredName || conn.organizations?.[0]?.name || 'جهة اتصال بلا اسم';

    // Extract first email
    const email = conn.emailAddresses?.[0]?.value || undefined;

    // Extract first phone number
    const phoneNumber = conn.phoneNumbers?.[0]?.value || undefined;

    // Extract photo URL (ignore default placeholders unless custom)
    const photoObj = conn.photos?.[0] || {};
    const photoUrl = photoObj.default ? undefined : photoObj.url;

    return {
      resourceName: conn.resourceName,
      etag: conn.etag,
      name,
      email,
      phoneNumber,
      photoUrl
    };
  });
};

/**
 * Create a new Google Contact.
 */
export const createGoogleContact = async (
  accessToken: string,
  contact: { name: string; email?: string; phoneNumber?: string }
): Promise<GoogleContact> => {
  const url = 'https://people.googleapis.com/v1/people:createContact';
  
  const body: any = {
    names: [
      {
        givenName: contact.name
      }
    ]
  };

  if (contact.email) {
    body.emailAddresses = [
      {
        value: contact.email,
        type: 'work'
      }
    ];
  }

  if (contact.phoneNumber) {
    body.phoneNumbers = [
      {
        value: contact.phoneNumber,
        type: 'mobile'
      }
    ];
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
    throw new Error(errorDetails?.error?.message || 'Failed to create contact in Google Contacts');
  }

  const conn = await res.json();
  const nameObj = conn.names?.[0] || {};
  const name = nameObj.displayName || nameObj.unstructuredName || 'جهة اتصال بلا اسم';
  const email = conn.emailAddresses?.[0]?.value || undefined;
  const phoneNumber = conn.phoneNumbers?.[0]?.value || undefined;
  const photoUrl = conn.photos?.[0]?.default ? undefined : conn.photos?.[0]?.url;

  return {
    resourceName: conn.resourceName,
    etag: conn.etag,
    name,
    email,
    phoneNumber,
    photoUrl
  };
};

/**
 * Delete a contact from Google Contacts.
 */
export const deleteGoogleContact = async (accessToken: string, resourceName: string): Promise<void> => {
  // resourceName is usually people/c123456
  const url = `https://people.googleapis.com/v1/${resourceName}:deleteContact`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const errorDetails = await res.json().catch(() => ({}));
    throw new Error(errorDetails?.error?.message || 'Failed to delete contact from Google Contacts');
  }
};
