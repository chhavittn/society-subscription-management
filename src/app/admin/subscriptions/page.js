"use client"

import { useEffect, useState } from "react"
import axios from "axios"

import SubscriptionTable from "./SubscriptionTable"
import PlanModal from "./EditSubscriptionModal"

export default function SubscriptionsPage() {

  const [plans, setPlans] = useState([])

  const handlePlanUpdated = (updatedPlan, isEdit = false) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7679d4fc-5c62-451d-837b-99db36761b42',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'post-fix',hypothesisId:'H1',location:'src/app/admin/subscriptions/page.js:handlePlanUpdated',message:'SubscriptionsPage handlePlanUpdated called',data:{isEdit,updatedPlanId:updatedPlan?.id??null,updatedPlanName:updatedPlan?.plan_name??null,prevPlansCount:plans.length},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    setPlans(prev => {
      const filtered = prev.filter(p => p.id !== updatedPlan?.id)
      return isEdit ? [...filtered, updatedPlan] : [updatedPlan, ...filtered]
    })
  }

  const fetchPlans = async () => {
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/7679d4fc-5c62-451d-837b-99db36761b42',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'pre-fix',hypothesisId:'H1',location:'src/app/admin/subscriptions/page.js:fetchPlans',message:'SubscriptionsPage fetchPlans start',data:{apiUrl:process.env.NEXT_PUBLIC_API_URL},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/plans`,
        { withCredentials: true }
      )
      setPlans(data.plans || [])
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/7679d4fc-5c62-451d-837b-99db36761b42',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'pre-fix',hypothesisId:'H1',location:'src/app/admin/subscriptions/page.js:fetchPlans',message:'SubscriptionsPage fetchPlans success',data:{plansCount:Array.isArray(data?.plans)?data.plans.length:null,keys:data?Object.keys(data):null},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
    } catch (error) {
      console.log(error)
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/7679d4fc-5c62-451d-837b-99db36761b42',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'pre-fix',hypothesisId:'H1',location:'src/app/admin/subscriptions/page.js:fetchPlans',message:'SubscriptionsPage fetchPlans error',data:{name:error?.name,message:error?.message,status:error?.response?.status},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">

        <h1 className="text-3xl font-bold">
          Subscription Plans
        </h1>

        {/* ✅ ADD PLAN BUTTON HERE */}
        <PlanModal onUpdated={handlePlanUpdated} />

      </div>

      <p className="text-gray-500">
        Manage monthly maintenance charges based on subscription plans.
      </p>

      {/* TABLE */}
      <SubscriptionTable
        plans={plans}
        fetchPlans={fetchPlans}
        onPlanUpdated={handlePlanUpdated}
      />

    </div>
  )
}