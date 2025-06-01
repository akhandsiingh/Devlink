"use client"

import { useContext, useEffect, useState } from "react"
import { ProfileContext } from "../../context/profile/ProfileContext"
import Spinner from "../layout/Spinner"
import axios from "axios"

const GithubStats = () => {
  const { githubStats, loading, profile } = useContext(ProfileContext)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const fetchGitHubStats = async () => {
      if (!profile) return

      const githubPlatform = profile.platforms.find((p) => p.name === "GitHub")
      if (!githubPlatform) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await axios.get(`/api/github/stats/${githubPlatform.username}`)
        if (response.data && response.data.success) {
          setStats(response.data.data)
        } else {
          setError("Failed to load GitHub stats")
        }
      } catch (err) {
        console.error("Error fetching GitHub stats:", err)
        setError("Error connecting to GitHub API")
      } finally {
        setIsLoading(false)
      }
    }

    if (!githubStats && profile) {
      fetchGitHubStats()
    } else if (githubStats) {
      setStats(githubStats)
    }
  }, [profile, githubStats])

  if (loading || isLoading) {
    return <Spinner />
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-2">GitHub Stats</h3>
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-2">GitHub Stats</h3>
        <p>Add your GitHub profile to see stats here.</p>
      </div>
    )
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">GitHub Stats</h3>

      {/* Profile Overview */}
      <div className="flex items-start mb-6">
        {stats.avatarUrl && (
          <img
            src={stats.avatarUrl || "/placeholder.svg"}
            alt={`${stats.username}'s avatar`}
            className="w-16 h-16 rounded-full mr-4"
          />
        )}
        <div>
          <h4 className="text-lg font-semibold">{stats.name || stats.username}</h4>
          {stats.bio && <p className="text-gray-600 text-sm">{stats.bio}</p>}
          <div className="flex items-center mt-1 text-sm text-gray-500">
            {stats.location && <span className="mr-3">{stats.location}</span>}
            {stats.company && <span className="mr-3">{stats.company}</span>}
            {stats.blog && (
              <a
                href={stats.blog.startsWith("http") ? stats.blog : `https://${stats.blog}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Website
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-100 p-3 rounded">
          <p className="text-sm text-gray-600">Followers</p>
          <p className="text-xl font-bold">{stats.followers || 0}</p>
        </div>
        <div className="bg-gray-100 p-3 rounded">
          <p className="text-sm text-gray-600">Following</p>
          <p className="text-xl font-bold">{stats.following || 0}</p>
        </div>
        <div className="bg-gray-100 p-3 rounded">
          <p className="text-sm text-gray-600">Public Repos</p>
          <p className="text-xl font-bold">{stats.publicRepos || 0}</p>
        </div>
        <div className="bg-gray-100 p-3 rounded">
          <p className="text-sm text-gray-600">Total Stars</p>
          <p className="text-xl font-bold">{stats.totalStars || 0}</p>
        </div>
      </div>

      {stats.contributionsLastYear > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Contributions This Year</h4>
          <p className="text-2xl font-bold text-green-600">{stats.contributionsLastYear}</p>

          {stats.contributionHistory && stats.contributionHistory.length > 0 && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-1 mt-2">
                {stats.contributionHistory.slice(-30).map((day, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-sm"
                    style={{
                      backgroundColor:
                        !day || day.count === 0
                          ? "#ebedf0"
                          : day.count < 5
                            ? "#9be9a8"
                            : day.count < 10
                              ? "#40c463"
                              : "#30a14e",
                    }}
                    title={`${day?.date || "Unknown date"}: ${day?.count || 0} contributions`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Last 30 days of activity</p>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity Section */}
      {stats.recentActivity && stats.recentActivity.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Recent Activity</h4>
          <div className="max-h-60 overflow-y-auto">
            <ul className="divide-y">
              {stats.recentActivity.map((activity, index) => (
                <li key={index} className="py-2">
                  <div className="flex items-start">
                    <div className="w-8 h-8 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                      {activity.type === "PushEvent" && <span>🔄</span>}
                      {activity.type === "PullRequestEvent" && <span>🔀</span>}
                      {activity.type === "IssuesEvent" && <span>❗</span>}
                      {activity.type === "CreateEvent" && <span>➕</span>}
                      {activity.type === "DeleteEvent" && <span>➖</span>}
                      {activity.type === "WatchEvent" && <span>⭐</span>}
                      {activity.type === "ForkEvent" && <span>🍴</span>}
                      {!activity.type && <span>📝</span>}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.description || "Unknown activity"}</p>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <a
                          href={activity.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {activity.repo || "Unknown repository"}
                        </a>
                        <span>{formatDate(activity.date)}</span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {stats.languages && stats.languages.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Top Languages</h4>
          <div className="flex flex-wrap gap-2">
            {stats.languages.map((lang, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                {lang.name || "Unknown"} ({lang.count || 0})
              </span>
            ))}
          </div>
        </div>
      )}

      <h4 className="font-semibold mb-2">Top Repositories</h4>
      {stats.topRepos && stats.topRepos.length > 0 ? (
        <ul className="divide-y">
          {stats.topRepos.map((repo, index) => (
            <li key={repo.name || index} className="py-2">
              <a
                href={repo.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium"
              >
                {repo.name || "Unknown repository"}
              </a>
              <p className="text-sm text-gray-600">{repo.description || "No description available"}</p>
              <div className="flex gap-4 mt-1 text-sm">
                <span>⭐ {repo.stars || 0}</span>
                <span>🍴 {repo.forks || 0}</span>
                {repo.language && <span>{repo.language}</span>}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-600">No repository data available</p>
      )}
    </div>
  )
}

export default GithubStats
