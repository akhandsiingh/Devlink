"use client"

import { useContext, useEffect, useState } from "react"
import { ProfileContext } from "../../context/profile/ProfileContext"
import Spinner from "../layout/Spinner"
import axios from "axios"

const LeetcodeStats = () => {
  const { leetcodeStats, loading, profile } = useContext(ProfileContext)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const fetchLeetCodeStats = async () => {
      if (!profile) return

      const leetcodePlatform = profile.platforms.find((p) => p.name === "LeetCode")
      if (!leetcodePlatform) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await axios.get(`/api/leetcode/stats/${leetcodePlatform.username}`)
        if (response.data && response.data.success) {
          setStats(response.data.data)
        } else {
          setError("Failed to load LeetCode stats")
        }
      } catch (err) {
        console.error("Error fetching LeetCode stats:", err)
        setError("Error connecting to LeetCode API")
      } finally {
        setIsLoading(false)
      }
    }

    if (!leetcodeStats && profile) {
      fetchLeetCodeStats()
    } else if (leetcodeStats) {
      setStats(leetcodeStats)
    }
  }, [profile, leetcodeStats])

  if (loading || isLoading) {
    return <Spinner />
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-2">LeetCode Stats</h3>
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-2">LeetCode Stats</h3>
        <p>Add your LeetCode profile to see stats here.</p>
      </div>
    )
  }

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A"
    const date = new Date(timestamp * 1000)
    return date.toLocaleString()
  }

  // Safe formatting for percentages
  const formatPercentage = (value) => {
    if (value === null || value === undefined) return "N/A"
    return value.toFixed(1) + "%"
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">LeetCode Stats</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-100 p-3 rounded">
          <p className="text-sm text-gray-600">Total Solved</p>
          <p className="text-xl font-bold">{stats.totalSolved || 0}</p>
        </div>
        <div className="bg-gray-100 p-3 rounded">
          <p className="text-sm text-gray-600">Ranking</p>
          <p className="text-xl font-bold">{stats.ranking || "N/A"}</p>
        </div>
        <div className="bg-gray-100 p-3 rounded">
          <p className="text-sm text-gray-600">Contest Rating</p>
          <p className="text-xl font-bold">{stats.contestRating || "N/A"}</p>
        </div>
        <div className="bg-gray-100 p-3 rounded">
          <p className="text-sm text-gray-600">Contests Attended</p>
          <p className="text-xl font-bold">{stats.contestAttended || 0}</p>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold mb-2">Problem Solving</h4>
        <div className="flex items-center mb-2">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-green-500 h-4 rounded-full"
              style={{
                width: `${((stats.easySolved || 0) / (stats.totalSolved || 1)) * 100}%`,
              }}
            ></div>
          </div>
          <span className="ml-2 text-sm font-medium">Easy: {stats.easySolved || 0}</span>
        </div>
        <div className="flex items-center mb-2">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-yellow-500 h-4 rounded-full"
              style={{
                width: `${((stats.mediumSolved || 0) / (stats.totalSolved || 1)) * 100}%`,
              }}
            ></div>
          </div>
          <span className="ml-2 text-sm font-medium">Medium: {stats.mediumSolved || 0}</span>
        </div>
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-red-500 h-4 rounded-full"
              style={{
                width: `${((stats.hardSolved || 0) / (stats.totalSolved || 1)) * 100}%`,
              }}
            ></div>
          </div>
          <span className="ml-2 text-sm font-medium">Hard: {stats.hardSolved || 0}</span>
        </div>
      </div>

      {stats.beatsPercentage && stats.beatsPercentage.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Beats Percentage</h4>
          <div className="grid grid-cols-3 gap-2">
            {stats.beatsPercentage.map((item, index) => (
              <div key={index} className="bg-gray-100 p-2 rounded text-center">
                <p className="text-xs text-gray-600">{item.difficulty || "Unknown"}</p>
                <p className="text-lg font-bold">{formatPercentage(item.percentage)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.topTags && stats.topTags.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Top Tags</h4>
          <div className="grid grid-cols-2 gap-2">
            {stats.topTags.map((tag, index) => (
              <div key={index} className="bg-gray-100 p-2 rounded">
                <p className="text-sm font-medium">{tag.tagName || "Unknown"}</p>
                <p className="text-xs text-gray-600">Solved: {tag.problemsSolved || 0}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.recentSubmissions && stats.recentSubmissions.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Recent Submissions</h4>
          <div className="max-h-60 overflow-y-auto">
            <ul className="divide-y">
              {stats.recentSubmissions.map((submission, index) => (
                <li key={index} className="py-2">
                  <a
                    href={submission.titleSlug ? `https://leetcode.com/problems/${submission.titleSlug}` : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm font-medium"
                  >
                    {submission.title || "Unknown Problem"}
                  </a>
                  <div className="flex justify-between text-xs mt-1">
                    <span
                      className={`${
                        submission.statusDisplay === "Accepted"
                          ? "text-green-600"
                          : submission.statusDisplay === "Wrong Answer"
                            ? "text-red-600"
                            : "text-yellow-600"
                      }`}
                    >
                      {submission.statusDisplay || "Unknown Status"}
                    </span>
                    <span className="text-gray-500">{formatTimestamp(submission.timestamp)}</span>
                  </div>
                  <span className="text-xs bg-gray-100 px-1 rounded">{submission.lang || "Unknown Language"}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {stats.badges && stats.badges.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Badges</h4>
          <div className="flex flex-wrap gap-2">
            {stats.badges.map((badge, index) => (
              <div key={index} className="bg-gray-100 p-2 rounded text-center">
                <p className="text-xs">{badge.displayName || "Unknown Badge"}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default LeetcodeStats
