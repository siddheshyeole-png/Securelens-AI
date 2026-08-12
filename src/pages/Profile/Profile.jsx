import React, { useState } from "react";
import { User, Mail, Shield, CheckCircle2, Building, Key } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Card } from "../../components/Common/Card";
import { Button } from "../../components/Common/Button";
import { Badge } from "../../components/Common/Badge";
import { PageTransition } from "../../components/Common/PageTransition";

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(user?.name || user?.email?.split("@")[0] || "Analyst");
  const [email, setEmail] = useState(user?.email || "");
  const [company, setCompany] = useState(user?.company || "SecureLens Security");

  const handleSave = (e) => {
    e.preventDefault();
    if (updateUser) {
      updateUser({ name, email, company });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <PageTransition className="max-w-4xl mx-auto space-y-8 py-8 text-zinc-100 bg-[#09090B]">
      <div className="flex items-center justify-between">
        <div>
          <Badge variant="cyan">ANALYST PROFILE</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            User Profile & Credentials
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Manage your account identity and analyst role settings.
          </p>
        </div>
      </div>

      <Card hover={false} className="border-zinc-800 bg-[#18181B]/80 backdrop-blur-xl p-8 space-y-6">
        <div className="flex items-center space-x-4 pb-6 border-b border-zinc-800">
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
            alt="User Avatar"
            className="w-16 h-16 rounded-full object-cover border-2 border-blue-500/40 shadow-lg"
          />
          <div>
            <h3 className="text-lg font-bold text-white">{name}</h3>
            <p className="text-xs font-mono text-blue-400 font-semibold">{user?.role || "Lead Digital Media Forensic Analyst"}</p>
            <p className="text-xs text-zinc-400 mt-0.5">{user?.tier || "Enterprise Tier"}</p>
          </div>
        </div>

        {saved && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Profile details updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">Organization / Company</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-4">
            <Button type="submit" variant="primary" size="md">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </PageTransition>
  );
};
