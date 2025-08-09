import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { prescriptionsAPI } from '../../services/api'
import { toast } from 'react-hot-toast'
import { Plus, Edit, Search, RefreshCw } from 'lucide-react'

const DoctorPrescriptionsList = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [prescriptions, setPrescriptions] = useState([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  const fetchPrescriptions = async () => {
    if (!user?._id) return
    try {
      setLoading(true)
      const params = { page, limit }
      if (status) params.status = status
      const resp = await prescriptionsAPI.getDoctorPrescriptions(user._id, params)
      const list = resp?.data?.data?.prescriptions || resp?.data?.prescriptions || resp?.data || []
      setPrescriptions(Array.isArray(list) ? list : [])
    } catch (err) {
      console.error('Failed to load prescriptions:', err)
      toast.error('Failed to load prescriptions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrescriptions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, page, limit, status])

  const filtered = prescriptions.filter(p => {
    if (!query) return true
    const needle = query.toLowerCase()
    const patientName = (p.patient?.fullName || `${p.patient?.firstName || ''} ${p.patient?.lastName || ''}`.trim()).toLowerCase()
    const number = String(p.prescriptionNumber || '').toLowerCase()
    const diagnosis = String(p.diagnosis || '').toLowerCase()
    return patientName.includes(needle) || number.includes(needle) || diagnosis.includes(needle)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">My Prescriptions</h1>
        <div className="flex items-center gap-3">
          <button onClick={fetchPrescriptions} className="px-3 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <Link to="/doctor/prescriptions/new" className="px-4 py-2 rounded-lg bg-accent-600 hover:bg-accent-700 text-white flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Prescription
          </Link>
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-4 border border-primary-600">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex items-center gap-2 flex-1 bg-primary-700 rounded-lg px-3 py-2 border border-primary-600">
            <Search className="w-4 h-4 text-gray-300" />
            <input
              placeholder="Search by patient, number, diagnosis"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="bg-transparent outline-none text-white w-full placeholder:text-gray-400"
            />
          </div>
          <select value={status} onChange={e => setStatus(e.target.value)} className="px-3 py-2 bg-primary-700 border border-primary-600 rounded-lg text-white">
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="dispensed">Dispensed</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl border border-primary-600">
        <div className="divide-y divide-primary-600">
          {loading && (
            <div className="p-6 text-gray-300">Loading...</div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="p-6 text-gray-300">No prescriptions found.</div>
          )}
          {filtered.map(p => (
            <div key={p._id} className="p-4 hover:bg-primary-700/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">
                    {p.patient?.fullName || `${p.patient?.firstName || ''} ${p.patient?.lastName || ''}`.trim() || 'Unknown Patient'}
                  </div>
                  <div className="text-sm text-gray-300">
                    #{p.prescriptionNumber || p._id?.slice(-6)} • {new Date(p.createdAt).toLocaleDateString()} • {p.status || 'active'}
                  </div>
                  {p.diagnosis && (
                    <div className="text-sm text-gray-300 mt-1 line-clamp-1">{p.diagnosis}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/doctor/prescriptions/${p._id}`} className="px-3 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-2">
                    <Edit className="w-4 h-4" /> Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-gray-300">
        <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-2 bg-primary-700 rounded disabled:opacity-50 border border-primary-600">Previous</button>
        <div>Page {page}</div>
        <button onClick={() => setPage(p => p + 1)} className="px-3 py-2 bg-primary-700 rounded border border-primary-600">Next</button>
      </div>
    </div>
  )
}

export default DoctorPrescriptionsList
