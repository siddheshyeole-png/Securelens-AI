export const APP_NAME = "SecureLens AI";
export const APP_VERSION = "2.4.0-production";

export const SCAN_TYPES = [
  { id: "image", label: "Image Forensics", description: "Pixel compression ELA, GAN diffusion lattice, and face-swap boundary audit" },
  { id: "video", label: "Video Stream Audit", description: "Temporal keyframe consistency, facial landmark tracking, and lip-sync alignment" },
  { id: "audio", label: "Voice Spectral FFT", description: "Spectrogram frequency harmonics, voice cloning phase jumps, and vocoder traces" },
  { id: "metadata", label: "Metadata & Provenance", description: "EXIF camera hardware signature, software tags, and cryptographic hashing" }
];

export const SEVERITY_LEVELS = {
  CRITICAL: { label: "Critical Risk", color: "bg-rose-500/20 text-rose-400 border-rose-500/30", badge: "bg-rose-500" },
  HIGH: { label: "High Risk", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", badge: "bg-amber-500" },
  MEDIUM: { label: "Moderate Risk", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", badge: "bg-yellow-500" },
  LOW: { label: "Low Risk", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", badge: "bg-emerald-500" },
  INFO: { label: "Info", color: "bg-zinc-800 text-zinc-300 border-zinc-700", badge: "bg-zinc-400" }
};

export const DEFAULT_USER = {
  id: "usr_99841",
  name: "Alexander Vance",
  email: "vance@securelens.ai",
  role: "Lead Digital Media Forensic Analyst",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  company: "Media Integrity Alliance",
  tier: "Enterprise Tier"
};
