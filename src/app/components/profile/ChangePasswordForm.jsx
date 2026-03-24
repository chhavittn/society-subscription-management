"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

export default function ChangePasswordForm({ onSuccess, onCancel }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    toast.success("Password changed successfully");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    onSuccess?.();
  };

  return (
    <div className="admin-page">
      <Card className="admin-card mx-auto w-full max-w-2xl">
        <CardHeader className="border-b border-[#dfe6e9]">
          <p className="summary-kicker mb-2">Security</p>
          <CardTitle className="text-2xl text-[#2d3436]">Change Password</CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleChangePassword} className="space-y-5" autoComplete="off">
            <input type="text" style={{ display: "none" }} />
            <input type="password" style={{ display: "none" }} />

            <div className="space-y-2">
              <Label className="text-[#636e72]">Current Password</Label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="admin-input" />
            </div>

            <div className="space-y-2">
              <Label className="text-[#636e72]">New Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="admin-input" />
            </div>

            <div className="space-y-2">
              <Label className="text-[#636e72]">Confirm Password</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="admin-input" />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button className="admin-btn-primary rounded-xl px-5 py-2.5">Change Password</Button>
              <Button type="button" variant="outline" onClick={onCancel} className="admin-btn-ghost rounded-xl px-5 py-2.5">
                Back
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
