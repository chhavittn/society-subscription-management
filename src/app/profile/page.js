"use client"

import { useState, useEffect } from "react"
import axios from "axios"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import ProfileForm from "../components/profile/ProfileForm"
import ChangePasswordForm from "../components/profile/ChangePasswordForm"

export default function ProfilePage() {

  const [user,setUser] = useState(null)
  const [loading,setLoading] = useState(true)

  const [view,setView] = useState("profile")

  useEffect(()=>{

    const fetchProfile = async ()=>{

      try{

        const { data } = await axios.get(
          "http://localhost:5000/api/v1/me",
          { withCredentials:true }
        )

        setUser(data.user)

      }catch(error){
        console.log(error)
      }
      finally{
        setLoading(false)
      }

    }

    fetchProfile()

  },[])

  if(loading){
    return <p className="text-sm text-gray-500">Loading profile...</p>
  }

  if(view === "editProfile"){
    return <ProfileForm/>
  }

  if(view === "changePassword"){
    return <ChangePasswordForm/>
  }

  return(

    <div className="max-w-xl mx-auto mt-10">

      <Card>

        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{user?.name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{user?.email}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium">{user?.phone || "Not added"}</p>
          </div>

          <div className="flex gap-4 pt-4">

            <Button
              onClick={()=>setView("editProfile")}
            >
              Update Profile
            </Button>

            <Button
              variant="outline"
              onClick={()=>setView("changePassword")}
            >
              Change Password
            </Button>

          </div>

        </CardContent>

      </Card>

    </div>

  )

}