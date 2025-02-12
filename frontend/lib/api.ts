export async function loginUser(username: string, password: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error('Failed to login');
  }

  return response.json();  // Expected to return token and user info
}
