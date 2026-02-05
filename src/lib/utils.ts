import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  // For numbers less than 1000, show exactly 1 decimal place
  return num.toFixed(1);
}

export const IPFS_GATEWAYS = [
  'https://pump.mypinata.cloud/ipfs/',
  'https://cf-ipfs.com/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/'
];

export function getIpfsUrl(url: string, gatewayIndex: number = 0) {
  if (!url) return url;
  
  // Clean up the URL
  let cleanUrl = url;
  
  // Handle various IPFS formats
  if (cleanUrl.startsWith('ipfs://')) {
    cleanUrl = cleanUrl.replace('ipfs://', '');
  } else if (cleanUrl.includes('/ipfs/')) {
    cleanUrl = cleanUrl.split('/ipfs/')[1];
  }

  // Check if it is a local path or data URL
  if (cleanUrl.startsWith('/') || cleanUrl.startsWith('data:') || cleanUrl.startsWith('blob:')) {
      return cleanUrl;
  }

  // If it's just a hash or cleaned path
  if (!cleanUrl.startsWith('http')) {
      // Use the specified gateway or default to the first one (Cloudflare)
      const gateway = IPFS_GATEWAYS[gatewayIndex] || IPFS_GATEWAYS[0];
      return `${gateway}${cleanUrl}`;
  }
  
  // If it's ipfs.io or pinata, redirect to Cloudflare (or specified gateway) for consistency
  if (cleanUrl.includes('ipfs.io') || cleanUrl.includes('pinata.cloud')) {
       const gateway = IPFS_GATEWAYS[gatewayIndex] || IPFS_GATEWAYS[0];
      return `${gateway}${cleanUrl.split('/ipfs/')[1]}`;
  }

  return cleanUrl;
}

export async function fetchIpfsJson(uri: string): Promise<any> {
    if (!uri) return null;

    // Race multiple gateways to get the metadata as fast as possible
    const promises = IPFS_GATEWAYS.map((_, index) => {
        const url = getIpfsUrl(uri, index);
        // Use a reasonable timeout for each request
        return fetch(url, { signal: AbortSignal.timeout(3000) })
            .then(res => {
                if (!res.ok) throw new Error(`Gateway ${index} failed`);
                return res.json();
            });
    });

    try {
        // Return the first successful result
        return await Promise.any(promises);
    } catch (e) {
        // All gateways failed
        return null;
    }
}

export function shortenAddress(address: string) {
  if (!address) return '';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}
