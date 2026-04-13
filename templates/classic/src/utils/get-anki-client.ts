export function getAnkiClient() {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('iPad')) {
    return 'iPad';
  } else if (userAgent.includes('iPhone')) {
    return 'iPhone';
  } else if (userAgent.includes('Android')) {
    return 'Android';
  }
  return 'Desktop';
}
