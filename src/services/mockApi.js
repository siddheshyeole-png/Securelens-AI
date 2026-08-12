/**
 * SecureLens AI - Authentication API Service
 * 
 * Provides login and signup with deterministic user IDs.
 * No Math.random() — uses crypto for unique IDs.
 * No fabricated scan results — scans come from detectionService only.
 */

export const mockApi = {
  login: async (email, password) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (email && password) {
      // Deterministic user ID from email hash instead of Math.random()
      const encoder = new TextEncoder();
      const data = encoder.encode(email.toLowerCase().trim());
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const userId = "usr_" + hashArray.slice(0, 4).map(b => b.toString(16).padStart(2, "0")).join("");

      return {
        success: true,
        user: {
          id: userId,
          name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
          email: email,
          role: "Media Forensic Analyst",
          avatar: null,
          company: "SecureLens AI",
          tier: "Standard"
        }
      };
    }
    throw new Error("Invalid email or password");
  },

  signup: async (name, email, password) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (email && password) {
      const encoder = new TextEncoder();
      const data = encoder.encode(email.toLowerCase().trim());
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const userId = "usr_" + hashArray.slice(0, 4).map(b => b.toString(16).padStart(2, "0")).join("");

      return {
        success: true,
        user: {
          id: userId,
          name: name || email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
          email: email,
          role: "Media Forensic Analyst",
          avatar: null,
          company: "SecureLens AI",
          tier: "Standard"
        }
      };
    }
    throw new Error("Invalid signup details");
  }
};
