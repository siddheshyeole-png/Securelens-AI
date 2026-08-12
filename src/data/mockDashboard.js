// SecureLens AI - Marketing Content Data
// No fabricated analysis data — only FAQ and team information for public pages

export const MOCK_FAQ = [
  {
    question: "Does SecureLens AI require uploading sensitive media to external servers?",
    answer: "No. SecureLens AI features client-side media preprocessing and local sandboxed inspection options. Media files remain private and encrypted during forensic analysis."
  },
  {
    question: "What media file formats are supported?",
    answer: "SecureLens AI supports images (JPG, PNG, WEBP, TIFF), video streams (MP4, MOV, AVI, MKV up to 4K UHD), and uncompressed or compressed audio recordings (MP3, WAV, AAC, FLAC)."
  },
  {
    question: "How does SecureLens AI detect deepfakes and AI-generated media?",
    answer: "SecureLens AI uses a multi-layered verification approach: Error Level Analysis (ELA), frequency domain Fourier transforms for GAN grid detection, temporal frame consistency tracking, vocal formant FFT analysis, and EXIF metadata validation."
  },
  {
    question: "Can I export forensic diagnostic reports for compliance?",
    answer: "Yes. Reports can be exported as official Forensic Certificates containing timestamped evidence, metadata signatures, checksums, and authenticity confidence scores."
  }
];

export const MOCK_TEAM = [
  {
    name: "Dr. Elena Rostova",
    role: "Chief AI Media Forensics Lead",
    bio: "Former DARPA computer vision researcher with 12+ years experience in synthetic media detection and neural network forensics.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80"
  },
  {
    name: "Marcus Sterling",
    role: "Head of AI Detection Engineering",
    bio: "Specializes in GAN diffusion lattice detection, lip-sync temporal verification, and acoustic voice clone spectral analysis.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&auto=format&fit=crop&q=80"
  },
  {
    name: "Sophia Chen",
    role: "Principal Metadata & Provenance Auditor",
    bio: "Pioneer in camera hardware EXIF verification, cryptographic media hashing, and C2PA digital provenance standards.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80"
  }
];
