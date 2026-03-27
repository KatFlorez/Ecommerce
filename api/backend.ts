export type User = {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  created_at: string;
};

export type StatsResponse = {
  usersCount: number;
  createdSeries: { day: string; count: number }[];
};

export type ListUsersResponse = {
  users: User[];
};

export type UserForm = {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
};

export type LoginResponse = {
  ok: boolean;
  user: User;
};

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

async function requestJSON<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  return (await res.json()) as T;
}

export function getStats() {
  return requestJSON<StatsResponse>('/api/stats');
}

export function getUsers() {
  return requestJSON<ListUsersResponse>('/api/users');
}

export function createUser(form: UserForm) {
  return requestJSON<{ ok: boolean }>('/api/users', {
    method: 'POST',
    body: JSON.stringify(form),
  });
}

export function updateUser(id: number, form: UserForm) {
  return requestJSON<{ ok: boolean }>(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(form),
  });
}

export function deleteUser(id: number) {
  return requestJSON<{ ok: boolean }>(`/api/users/${id}`, {
    method: 'DELETE',
  });
}

export function loginUser(correo: string, password: string) {
  return requestJSON<LoginResponse>('/api/login', {
    method: 'POST',
    body: JSON.stringify({ correo, password }),
  });
}

