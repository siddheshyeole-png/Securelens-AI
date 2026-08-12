import React, { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { Card } from "../../components/Common/Card";
import { Button } from "../../components/Common/Button";
import { Badge } from "../../components/Common/Badge";
import { PageTransition } from "../../components/Common/PageTransition";

export const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Deepfake Detection",
    message: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PageTransition className="max-w-4xl mx-auto py-12 px-4 space-y-10 text-zinc-100 bg-[#09090B]">
      <div className="text-center space-y-3">
        <Badge variant="cyan">GET IN TOUCH</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Talk to the SecureLens AI Team
        </h1>
        <p className="text-sm text-zinc-400 max-w-xl mx-auto">
          Have questions about digital media verification, deepfake detection, or our platform? Get in touch.
        </p>
      </div>

      <Card hover={false} className="border-zinc-800 bg-[#18181B]/80 p-8">
        {submitted ? (
          <div className="text-center py-10 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
            <h3 className="text-xl font-bold text-white">Message Sent</h3>
            <p className="text-xs text-zinc-400 font-mono">
              Thank you for contacting us! Our team will respond to <strong className="text-white">{formData.email}</strong> shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your Name"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@example.com"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">Subject</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-sans"
              >
                <option value="Deepfake Detection">Deepfake Detection</option>
                <option value="Media Verification">Media Verification</option>
                <option value="Partnership">Partnership</option>
                <option value="Technical Support">Technical Support</option>
                <option value="General Inquiry">General Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">Message</label>
              <textarea
                rows={5}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="How can we help you verify digital media authenticity?"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <Button type="submit" variant="primary" size="lg" icon={Send} className="w-full">
              Send Message
            </Button>
          </form>
        )}
      </Card>
    </PageTransition>
  );
};
