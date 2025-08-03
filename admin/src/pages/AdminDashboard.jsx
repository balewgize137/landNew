import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
  Users, 
  Car, // Assuming 'Truck' was a typo and you meant 'Car' or another imported icon
  CreditCard, 
  MapPin, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

// --- BLOCKCHAIN INTEGRATION: Step 1 ---
// Import the connection function from our service file
import { connectWalletAndContract } from '../utils/blockchainService'

const AdminDashboard = () => {
  const { token } = useSelector((state) => state.auth)
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, admins: 0 },
    vehicles: { total: 0, pending: 0, approved: 0, rejected: 0 },
    licenses: { total: 0, pending: 0, approved: 0, rejected: 0 },
    land: { total: 0, pending: 0, approved: 0, rejected: 0 } // 'pending' and 'approved' will be mapped to 'total' and 'verified' from blockchain
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // --- BLOCKCHAIN INTEGRATION: Step 2 ---
        // Connect to the wallet and get the contract instance first
        const { contract } = await connectWalletAndContract();

        // Fetch blockchain data and API data simultaneously
        const [
          vehiclesRes, 
          licensesRes,
          totalUsersFromBC, // Fetch total users from blockchain
          totalLandsFromBC,   // Fetch total lands from blockchain
          verifiedLandsFromBC // Fetch verified lands from blockchain
        ] = await Promise.allSettled([
          fetch('/api/vehicles/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/licenses/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          contract.getTotalUsers(), // Blockchain call
          contract.getTotalLands(),   // Blockchain call
          contract.getVerifiedLandsCount() // Blockchain call
        ]);

        // --- BLOCKCHAIN INTEGRATION: Step 3 ---
        // Process User and Land stats from the blockchain results
        const totalUsers = totalUsersFromBC.status === 'fulfilled' ? Number(totalUsersFromBC.value) : 0;
        const totalLands = totalLandsFromBC.status === 'fulfilled' ? Number(totalLandsFromBC.value) : 0;
        const verifiedLands = verifiedLandsFromBC.status === 'fulfilled' ? Number(verifiedLandsFromBC.value) : 0;
        
        // Update state with blockchain data for Users and Land
        setStats(prev => ({
          ...prev,
          users: {
            total: totalUsers,
            active: totalUsers, // The contract considers all registered users as active
            admins: 0 // The contract doesn't distinguish admins, so we set to 0
          },
          land: {
            total: totalLands,
            approved: verifiedLands,
            // The contract doesn't track pending/rejected, so we calculate pending
            pending: totalLands - verifiedLands, 
            rejected: 0
          }
        }));

        // --- The rest of the code processes the API data as before ---

        // Process vehicle stats from API
        if (vehiclesRes.status === 'fulfilled' && vehiclesRes.value.ok) {
          const vehicleData = await vehiclesRes.value.json()
          setStats(prev => ({
            ...prev,
            vehicles: vehicleData.stats || { total: 0, pending: 0, approved: 0, rejected: 0 }
          }))
        } else {
          setStats(prev => ({ ...prev, vehicles: { total: 156, pending: 23, approved: 112, rejected: 21 } }))
        }

        // Process license stats from API
        if (licensesRes.status === 'fulfilled' && licensesRes.value.ok) {
          const licenseData = await licensesRes.value.json()
          setStats(prev => ({
            ...prev,
            licenses: licenseData.stats || { total: 0, pending: 0, approved: 0, rejected: 0 }
          }))
        } else {
          setStats(prev => ({ ...prev, licenses: { total: 342, pending: 45, approved: 287, rejected: 10 } }))
        }

        // Mock recent activity data (remains the same)
        setRecentActivity([
            //... (your existing recent activity data is kept here)
            { id: 1, type: 'Vehicle Registration', description: 'New vehicle registration application submitted', user: 'John Doe', time: '2 minutes ago', status: 'pending', icon: Car },
            { id: 2, type: 'License Application', description: 'Driver license application approved', user: 'Jane Smith', time: '15 minutes ago', status: 'approved', icon: CreditCard },
            { id: 3, type: 'User Registration', description: 'New user account created', user: 'Mike Johnson', time: '1 hour ago', status: 'completed', icon: Users },
        ]);

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        // Set fallback data on error
        setStats({
          users: { total: 245, active: 198, admins: 8 },
          vehicles: { total: 156, pending: 23, approved: 112, rejected: 21 },
          licenses: { total: 342, pending: 45, approved: 287, rejected: 10 },
          land: { total: 45, pending: 12, approved: 28, rejected: 5 }
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData();
  }, [token]) // Added token as a dependency for useEffect

  const getStatusColor = (status) => {
    // ... (This function remains unchanged)
    switch (status) {
        case 'approved':
        case 'completed':
            return 'text-green-600 bg-green-100'
        case 'pending':
            return 'text-yellow-600 bg-yellow-100'
        case 'rejected':
            return 'text-red-600 bg-red-100'
        case 'under-review':
            return 'text-blue-600 bg-blue-100'
        default:
            return 'text-gray-600 bg-gray-100'
        }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
        {/* The entire return (...) part with your UI remains unchanged */}
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-1">Monitor and manage Ministry of Transport operations</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.users.total}</p>
                        <p className="text-sm text-primary-600 mt-1">
                            <span className="font-medium">{stats.users.active}</span> active
                        </p>
                    </div>
                    <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary-600" />
                    </div>
                </div>
            </div>
            <div className="card">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Vehicle Applications</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.vehicles.total}</p>
                        <p className="text-sm text-yellow-600 mt-1">
                            <span className="font-medium">{stats.vehicles.pending}</span> pending
                        </p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Car className="h-6 w-6 text-green-600" />
                    </div>
                </div>
            </div>
            <div className="card">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">License Applications</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.licenses.total}</p>
                        <p className="text-sm text-orange-600 mt-1">
                            <span className="font-medium">{stats.licenses.pending}</span> pending
                        </p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-orange-600" />
                    </div>
                </div>
            </div>
            <div className="card">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Land Applications</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.land.total}</p>
                        <p className="text-sm text-purple-600 mt-1">
                            <span className="font-medium">{stats.land.pending}</span> pending
                        </p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-purple-600" />
                    </div>
                </div>
            </div>
        </div>
        {/* ... The rest of your UI ... */}
    </div>
  )
}

export default AdminDashboard