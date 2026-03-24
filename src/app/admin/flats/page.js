import FlatsTable from "./FlatsTable.jsx"

export default function Flats() {
  return (
    <div className="admin-page">
      <div>
        <h1 className="admin-title mb-2">
          Flats Management
        </h1>
      </div>
      <FlatsTable />
    </div>
  )
}
