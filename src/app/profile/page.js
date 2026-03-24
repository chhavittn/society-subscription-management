"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProfileForm from "../components/profile/ProfileForm";
import ChangePasswordForm from "../components/profile/ChangePasswordForm";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("profile");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/v1/me", {
          withCredentials: true,
        });
        setUser(data.user);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <p className="admin-page text-[#2d3436]">Loading profile...</p>;
  }

  if (view === "editProfile") {
    return (
      <ProfileForm
        user={user}
        onUpdated={(updatedUser) => {
          setUser(updatedUser);
          setView("profile");
        }}
        onCancel={() => setView("profile")}
      />
    );
  }

  if (view === "changePassword") {
    return (
      <ChangePasswordForm
        onSuccess={() => setView("profile")}
        onCancel={() => setView("profile")}
      />
    );
  }

  return (
    <div className="admin-page">
      <div className="max-w-4xl">
        <h1 className="admin-title mb-2">My Profile</h1>
      </div>

      <Card className="admin-card mx-auto w-full max-w-4xl">
        <CardHeader className="border-b border-[#dfe6e9]">
          <CardTitle className="text-2xl text-[#2d3436]">
            Account Overview
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-8 p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/70 p-5">
              <p className="stat-label">Name</p>
              <p className="mt-2 text-lg font-semibold text-[#2d3436]">{user?.name}</p>
            </div>
            <div className="rounded-2xl bg-white/70 p-5">
              <p className="stat-label">Email</p>
              <p className="mt-2 text-lg font-semibold text-[#2d3436] break-all">{user?.email}</p>
            </div>
            <div className="rounded-2xl bg-white/70 p-5">
              <p className="stat-label">Phone</p>
              <p className="mt-2 text-lg font-semibold text-[#2d3436]">{user?.phone || "Not added"}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button onClick={() => setView("editProfile")} className="admin-btn-primary rounded-xl px-5 py-2.5">
              Update Profile
            </Button>

            <Button
              variant="outline"
              onClick={() => setView("changePassword")}
              className="admin-btn-ghost rounded-xl px-5 py-2.5"
            >
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
