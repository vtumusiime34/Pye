// Pixie AI Assistant Engine - PYE Social Universe by APPIX
import { GoogleGenAI } from '@google/genai';
import { Storage } from './storage';

export interface PixieMessage {
  id: string;
  sender: 'user' | 'pixie';
  text: string;
  timestamp: string;
  suggestedActions?: { label: string; action: string }[];
}

const PIXIE_SYSTEM_PROMPT = `
You are Pixie, the friendly, creative, and brilliant AI companion built specifically for PYE Social Universe (an APPIX platform).
Your personality:
- Warm, enthusiastic, quick-witted, knowledgeable about social media, video creation, sound stems, gaming, and creative expression.
- You know all features of PYE Social Universe:
  * PYES: 24-hour high-fidelity vertical video and photo reels.
  * Universe Pulses: 24-hour community transmissions.
  * PYE Sounds: original audio stem library where creators upload files and attach them to videos.
  * PYE Games: multiplayer interactive classics like Chess, Checkers, Ludo, Tic-Tac-Toe, Snakes & Ladders, and Pye-Poly.
  * Virtual Coins: PYE Silver (SPC) and PYE Gold (GPC) for gifts (roses, crowns), tips, and post promotions.
  * Pye IDs: unique flipable digital identity cards with QR codes.
  * WebRTC Calls: real-time voice and video calls directly from profile or chat.
  * APPIX: The parent tech group behind PYE Social Universe, founded by Linus The Great (LTG), Trix, and team.
- You help users with:
  * Writing viral hooks and captions for their PYES.
  * Suggesting audio tracks and hashtags.
  * Explaining how coins, verification milestones (10K White, 50K Yellow, 100K Blue, 500K Silver, 1M Gold, 10M+ Gold Star), and Company Mode work.
  * Navigating the app and resolving questions.
- Keep answers concise, clear, formatting with bullet points or emojis when helpful. Never invent fake data about other private user accounts.
`;

class PixieService {
  private aiClient: GoogleGenAI | null = null;
  private conversationHistory: PixieMessage[] = [
    {
      id: 'pixie_intro',
      sender: 'pixie',
      text: "Hey there! ✨ I'm Pixie, your creative assistant in PYE Social Universe. Need ideas for your next PYES reel, sound recommendations, tips on earning Silver Coins, or help with your Pye ID? Just ask!",
      timestamp: new Date().toISOString(),
      suggestedActions: [
        { label: '💡 Video caption ideas', action: 'Give me 3 viral caption ideas for a creative tech video' },
        { label: '🏷️ Milestone badges guide', action: 'How do milestone ticks (10K, 50K, 100K, 1M) work in PYE?' },
        { label: '🪙 Coins & Gifts', action: 'How do virtual gifts like Roses and PYE Silver work?' },
        { label: '🚀 What is APPIX?', action: 'Tell me about APPIX and the founders of PYE' },
      ],
    },
  ];

  constructor() {
    this.initClient();
  }

  private initClient() {
    try {
      // In Vite client environment: check env variables
      const apiKey =
        (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
        (typeof process !== 'undefined' && process.env?.API_KEY) ||
        (import.meta as any)?.env?.VITE_GEMINI_API_KEY ||
        '';

      if (apiKey) {
        this.aiClient = new GoogleGenAI({ apiKey });
      }
    } catch (e) {
      console.warn('Pixie AI initialization note:', e);
    }
  }

  public getMessages(): PixieMessage[] {
    return this.conversationHistory;
  }

  public async sendMessage(userText: string): Promise<PixieMessage> {
    const userMsg: PixieMessage = {
      id: `msg_${Date.now()}_u`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toISOString(),
    };
    this.conversationHistory.push(userMsg);

    const currentUser = Storage.getCurrentUser();
    let replyText = '';

    // Attempt Gemini API call
    if (this.aiClient) {
      try {
        const response = await this.aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `${PIXIE_SYSTEM_PROMPT}\nCurrent user: @${currentUser?.username || 'guest'} (${currentUser?.fullName || 'Pye User'}).\nUser query: ${userText}`,
                },
              ],
            },
          ],
        });

        if (response.text) {
          replyText = response.text.trim();
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to smart local engine:', err);
      }
    }

    // Smart fallback engine if API key is not yet configured
    if (!replyText) {
      replyText = this.generateSmartFallback(userText);
    }

    const pixieMsg: PixieMessage = {
      id: `msg_${Date.now()}_p`,
      sender: 'pixie',
      text: replyText,
      timestamp: new Date().toISOString(),
    };
    this.conversationHistory.push(pixieMsg);

    return pixieMsg;
  }

  private generateSmartFallback(query: string): string {
    const q = query.toLowerCase();

    if (q.includes('badge') || q.includes('tick') || q.includes('milestone')) {
      return `Here is how the official PYE Milestone Badges work based on your follower achievements:

• **10K Followers**: ⚪ White Tick (Rising Creator)
• **50K Followers**: 🟡 Solar Yellow Tick (Community Leader)
• **100K Followers**: 🔵 Diamond Blue Tick (Major Influencer)
• **500K Followers**: 🥈 Shimmer Silver Tick (Superstar Pioneer)
• **1M Followers**: 🥇 Golden Tick (Universe Icon)
• **10M+ Followers**: ⭐ Golden Tick with Cosmic Radiant Star

Identity verification (Pink/Orange checkmark) is separately issued by administrators to confirmed individuals and organizations!`;
    }

    if (q.includes('appix') || q.includes('founder') || q.includes('ltg') || q.includes('linus')) {
      return `PYE Social Universe is an official platform built and operated by **APPIX**.

The leadership team includes:
• **LTG (Linus The Great)** — Chief Architect & Founder
• **Trix** — Core Platform & Security Lead
• **Timothy Ainomugisha** — Operations & Quality Assurance

APPIX designed PYE to offer a secure, high-performance social ecosystem with zero artificial inflation, real peer-to-peer WebRTC calls, original audio stems, and playable arcade multiplayer.`;
    }

    if (q.includes('gift') || q.includes('rose') || q.includes('coin') || q.includes('silver') || q.includes('gold')) {
      return `The PYE Virtual Economy uses real, verifiable balances:

• **PYE Silver (SPC)**: Everyday social currency earned through daily check-ins, winning games, and mission rewards. Used for virtual gifts like **Roses** (5 SPC) and **Sparkles** (20 SPC), plus **15 SPC Post Promotions**.
• **PYE Gold (GPC)**: Premium creator currency used for high-tier awards like the **Golden Trophy** and **Diamond Crown**.

You can send a Rose or gift directly under any post or on a creator's profile by clicking the **Gift / Tip** button!`;
    }

    if (q.includes('promote') || q.includes('promotion') || q.includes('15 spc') || q.includes('60 spc')) {
      return `Promoting your content in PYE Social Universe:

• **Starter Boost (15 SPC)**: Broadcasts your Pulse or PYES into high-priority recommendation discovery.
• **1,000+ Reach Target (60 SPC)**: Ensures targeted delivery across the Universe feed until 1,000 genuine views are registered.

Click the "..." options menu on any of your posted Pulses or Pyes to start a promotion!`;
    }

    if (q.includes('caption') || q.includes('hook') || q.includes('idea')) {
      return `Here are 3 high-impact hooks for your next PYE transmission:

1. **"The one setting inside PYE most people haven't explored yet... ⚡"**
2. **"Dropping a fresh uncompressed audio stem on PYE Sounds today. Grab your headphones. 🎧"**
3. **"From concept to real-time WebGL: how we designed spatial UI without lag. 🚀"**

Pro tip: Add 2-3 focused hashtags (e.g., #PYES, #SoundDesign, #Creator) for optimal algorithmic discovery!`;
    }

    return `I can definitely help with that! In PYE Social Universe, you can broadcast 24h PYES video reels, upload original audio stems from your device, flip your 3D digital Pye ID card, jump into multiplayer Chess or Ludo, and connect with other creators via WebRTC calls.

What specific area would you like to explore next?`;
  }

  public clearHistory() {
    this.conversationHistory = this.conversationHistory.slice(0, 1);
  }
}

export const Pixie = new PixieService();
