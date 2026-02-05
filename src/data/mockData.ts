export interface Token {
  id: string;
  name: string;
  symbol: string;
  price: number;
  marketCap: number;
  volume24h: number;
  change24h: number;
  imageUrl: string;
  description: string;
  created: number; // timestamp
  vSolInBondingCurve?: number; // Optional property for bonding curve
}

export interface TrendGroup {
  id: string;
  name: string;
  description: string;
  tokens: Token[];
  trendScore: number; // 0-100
}

export const analyzeTrends = (): TrendGroup[] => {
  const groups: TrendGroup[] = [
    {
      id: 'claw-meta',
      name: 'Claw & Sea Creatures',
      description: 'Tokens related to crabs, lobsters, and sea themes. Hype is real!',
      tokens: [],
      trendScore: 95
    },
    {
      id: 'dog-meta',
      name: 'Dog Kingdom',
      description: 'Man\'s best friend and crypto\'s favorite meme.',
      tokens: [],
      trendScore: 92
    },
    {
      id: 'frog-meta',
      name: 'Frog Pond',
      description: 'Pepe, Apu, and all things green and amphibian.',
      tokens: [],
      trendScore: 90
    },
    {
      id: 'ai-meta',
      name: 'AI Revolution',
      description: 'Artificial Intelligence and autonomous agents.',
      tokens: [],
      trendScore: 88
    },
    {
      id: 'politifi',
      name: 'PolitiFi',
      description: 'Political memes and satire.',
      tokens: [],
      trendScore: 75
    },
    {
      id: 'cats',
      name: 'Cat Season',
      description: 'Cats are taking over the blockchain.',
      tokens: [],
      trendScore: 82
    },
    {
      id: 'gaming',
      name: 'GameFi & Retro',
      description: 'Pixels, games, and play-to-earn vibes.',
      tokens: [],
      trendScore: 70
    },
    {
      id: 'food',
      name: 'Food & Drink',
      description: 'Delicious tokens for the hungry degens.',
      tokens: [],
      trendScore: 65
    },
    {
      id: 'recent',
      name: 'Fresh Mints',
      description: 'The absolute latest tokens hitting the chain.',
      tokens: [],
      trendScore: 100
    }
  ];

  // Start empty - waiting for live data
  return groups;
};
