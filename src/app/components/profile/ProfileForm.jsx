"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

export default function ProfileForm({ user, onUpdated, onCancel }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/v1/me", {
          withCredentials: true,
        });

        const user = data.user;
        setName(user.name || "");
        setEmail(user.email || "");
        setPhone(user.phone || "");
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.put(
        "http://localhost:5000/api/v1/me/update",
        { name, email, phone },
        { withCredentials: true }
      );

      toast.success("Profile updated successfully");
      onUpdated?.(data.user);
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  if (loading) {
    return <p className="admin-page text-[#2d3436]">Loading profile...</p>;
  }

  return (
    <div className="admin-page">
      <Card className="admin-card mx-auto w-full max-w-3xl">
        <CardHeader className="border-b border-[#dfe6e9]">
          <p className="summary-kicker mb-2">Edit Details</p>
          <CardTitle className="text-2xl text-[#2d3436]">Personal Information</CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[#636e72]">Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="admin-input" />
            </div>

            <div className="space-y-2">
              <Label className="text-[#636e72]">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="admin-input" />
            </div>

            <div className="space-y-2">
              <Label className="text-[#636e72]">Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="admin-input" />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button className="admin-btn-primary rounded-xl px-5 py-2.5">Update Profile</Button>
              <Button type="button" variant="outline" onClick={onCancel} className="admin-btn-ghost rounded-xl px-5 py-2.5">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
