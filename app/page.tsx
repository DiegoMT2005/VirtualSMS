import Link from 'next/link'
import { Phone, MessageSquare, BarChart3 } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Voice AI & SMS Booking Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Manage your voice calls and SMS bookings in one place
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-card hover:shadow-card-hover transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Voice AI Calls</h3>
            <p className="text-gray-600">
              Track and manage all your AI-powered voice calls with detailed analytics
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-card hover:shadow-card-hover transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">SMS Bookings</h3>
            <p className="text-gray-600">
              Handle booking requests via SMS with automated responses
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-card hover:shadow-card-hover transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Analytics</h3>
            <p className="text-gray-600">
              Get insights into your call performance and booking trends
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
