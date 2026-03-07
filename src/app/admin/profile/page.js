import ProfileForm from "./ProfileForm"
import ChangePasswordForm from "./ChangePasswordForm"

export default function ProfilePage() {
  return (
    <div className="space-y-8">

      <h1 className="text-3xl font-bold">
        Admin Profile
      </h1>

      <ProfileForm />

      <ChangePasswordForm />

    </div>
  )
}