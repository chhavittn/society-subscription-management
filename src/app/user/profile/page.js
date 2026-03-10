import ProfileForm from "./ProfileForm"
import LogoutButton from "./LogoutButton"

export default function ProfilePage() {
  return (
    <div className="flex justify-center mt-10">
      <div className="w-full max-w-md space-y-6">

        <h1 className="text-3xl font-bold text-center">
          My Profile
        </h1>

        <ProfileForm />

        <LogoutButton />

      </div>
    </div>
  )
}