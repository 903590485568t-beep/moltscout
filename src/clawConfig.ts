// Configuration for the official $ClawScout token
// Once the token is launched, paste the Contract Address (CA) here.
// The app will prioritize this token above all others for the Feature Card.

export const CLAW_SCOUT_CONFIG = {
  // Set this to the real CA once launched, e.g., "7Ey..."
  // If empty, the app will continue to "Hunt" for tokens named "Moltseek" or "$Moltseek"
  officialMintAddress: '', 
  
  // Backup identifiers if CA is not yet known
  targetNames: ["Moltseek", "MoltSeek", "$Moltseek"], 
  targetSymbols: ["Moltseek", "MOLTSEEK"], 
  
  // Official override image (optional)
  image: "/moltseek_logo.jpg",
  
  // Social links to pre-fill or override
  socials: {
    twitter: "https://x.com/Moltseek",
    telegram: "",
    website: ""
  }
};