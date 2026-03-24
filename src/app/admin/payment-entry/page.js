import PaymentEntryForm from "./PaymentEntryForm";

export default function PaymentEntryPage() {
  return (
    <div className="admin-page">
      <div>
        <h1 className="admin-title">
          Manual Payment Entry
        </h1>
      </div>

      <div className="admin-surface">
        <PaymentEntryForm />
      </div>
    </div>
  );
}
