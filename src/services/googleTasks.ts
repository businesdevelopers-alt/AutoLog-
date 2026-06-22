/**
 * Service for interacting with Google Tasks API.
 */

export interface GoogleTaskList {
  id: string;
  title: string;
  updated: string;
  selfLink: string;
}

export interface GoogleTask {
  id: string;
  title: string;
  updated: string;
  selfLink: string;
  parent?: string;
  position?: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string; // RFC 3339 timestamp (YYYY-MM-DDTHH:mm:ss.sssZ)
  completed?: string;
}

export interface TaskMetadata {
  priority?: 'high' | 'medium' | 'low';
  vehicleId?: string;
  cleanNotes: string;
}

export function parseTaskNotes(notesString: string | undefined): TaskMetadata {
  if (!notesString) {
    return { cleanNotes: '' };
  }

  let priority: 'high' | 'medium' | 'low' | undefined;
  let vehicleId: string | undefined;
  let cleanNotes = notesString;

  const priorityMatch = cleanNotes.match(/\[Priority:\s*(high|medium|low)\]/i);
  if (priorityMatch) {
    priority = priorityMatch[1].toLowerCase() as 'high' | 'medium' | 'low';
    cleanNotes = cleanNotes.replace(priorityMatch[0], '');
  }

  const vehicleMatch = cleanNotes.match(/\[Vehicle:\s*([^\]]+)\]/i);
  if (vehicleMatch) {
    vehicleId = vehicleMatch[1].trim();
    cleanNotes = cleanNotes.replace(vehicleMatch[0], '');
  }

  return { priority, vehicleId, cleanNotes: cleanNotes.trim() };
}

export function formatTaskNotes(cleanNotes: string, priority?: 'high' | 'medium' | 'low', vehicleId?: string): string {
  let notes = '';
  if (priority) {
    notes += `[Priority: ${priority}] `;
  }
  if (vehicleId) {
    notes += `[Vehicle: ${vehicleId}] `;
  }
  if (priority || vehicleId) {
    notes += '\n';
  }
  notes += cleanNotes;
  return notes.trim();
}

/**
 * List all task lists for the user.
 */
export const fetchGoogleTaskLists = async (accessToken: string): Promise<GoogleTaskList[]> => {
  const url = 'https://tasks.googleapis.com/tasks/v1/users/@me/lists?pageSize=100';
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const errorDetails = await res.json().catch(() => ({}));
    throw new Error(errorDetails?.error?.message || 'Failed to fetch Google Task Lists');
  }

  const data = await res.json();
  return data.items || [];
};

/**
 * Create a new task list.
 */
export const createGoogleTaskList = async (accessToken: string, title: string): Promise<GoogleTaskList> => {
  const url = 'https://tasks.googleapis.com/tasks/v1/users/@me/lists';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title })
  });

  if (!res.ok) {
    const errorDetails = await res.json().catch(() => ({}));
    throw new Error(errorDetails?.error?.message || 'Failed to create Google Task List');
  }

  return await res.json();
};

/**
 * List all tasks within a specific task list.
 */
export const fetchGoogleTasks = async (
  accessToken: string,
  taskListId: string,
  showCompleted: boolean = true
): Promise<GoogleTask[]> => {
  const url = `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks?pageSize=100&showCompleted=${showCompleted}&showHidden=true`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const errorDetails = await res.json().catch(() => ({}));
    throw new Error(errorDetails?.error?.message || 'Failed to fetch tasks');
  }

  const data = await res.json();
  return data.items || [];
};

/**
 * Create a new task in a specific task list.
 */
export const createGoogleTask = async (
  accessToken: string,
  taskListId: string,
  task: { title: string; notes?: string; due?: string }
): Promise<GoogleTask> => {
  const url = `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks`;
  
  // Clean up body fields
  const body: any = {
    title: task.title
  };
  if (task.notes) body.notes = task.notes;
  if (task.due) {
    // Standardize due date to ISO string (RFC 3339)
    try {
      const date = new Date(task.due);
      body.due = date.toISOString();
    } catch (e) {
      body.due = task.due;
    }
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
    throw new Error(errorDetails?.error?.message || 'Failed to create task');
  }

  return await res.json();
};

/**
 * Update/Patch an existing task.
 */
export const updateGoogleTask = async (
  accessToken: string,
  taskListId: string,
  taskId: string,
  updates: Partial<GoogleTask>
): Promise<GoogleTask> => {
  const url = `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}`;
  
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });

  if (!res.ok) {
    const errorDetails = await res.json().catch(() => ({}));
    throw new Error(errorDetails?.error?.message || 'Failed to update task');
  }

  return await res.json();
};

/**
 * Delete a task.
 */
export const deleteGoogleTask = async (
  accessToken: string,
  taskListId: string,
  taskId: string
): Promise<void> => {
  const url = `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    const errorDetails = await res.json().catch(() => ({}));
    throw new Error(errorDetails?.error?.message || 'Failed to delete task');
  }
};
