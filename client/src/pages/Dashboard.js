"use client"

import { useContext, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { AuthContext } from "../context/auth/AuthContext"
import { ProfileContext } from "../context/profile/ProfileContext"
import Spinner from "../components/layout/Spinner"
import DashboardActions from "../components/dashboard/DashboardActions"
import PlatformList from "../components/dashboard/PlatformList"
import GithubStats from "../components/dashboard/GithubStats"
import MediumArticles from "../components/dashboard/MediumArticles"
import LeetcodeStats from "../components/dashboard/LeetcodeStats"
import HackerrankStats from "../components/dashboard/HackerrankStats"
import LinkedInPosts from "../components/dashboard/LinkedInPosts"
import XFeed from "../components/dashboard/XFeed"
import EnhancedAnalyticsDashboard from "../components/dashboard/EnhancedAnalyticsDashboard"
import ExternalApiConfig from "../components/dashboard/ExternalApiConfig"
import DownloadAnalytics from "../components/dashboard/DownloadAnalytics"

const Dashboard = () => {
  const { user, loading: authLoading } = useContext(AuthContext)
  const {
    profile,
    loading: profileLoading,
    getCurrentProfile,
    getGithubStats,
    getMediumArticles,
    getLeetcodeStats,
    getHackerrankStats,
    getLinkedinProfile,
    getTwitterTweets,
  } = useContext(ProfileContext)
  const [apiStatus, setApiStatus] = useState({
    github: { available: false, message: "Checking GitHub API..." },
    linkedin: { available: true, message: "Using public profile data" },
    x: { available: false, message: "X API requires developer credentials" },
  })

  useEffect(() => {
    getCurrentProfile()

    // Check GitHub API status
    const checkGitHubApi = async () => {
      try {
        const response = await fetch("https://api.github.com/rate_limit")
        const data = await response.json()

        if (data.resources) {
          setApiStatus((prev) => ({
            ...prev,
            github: {
              available: true,
              message: `GitHub API available (${data.resources.core.remaining}/${data.resources.core.limit} requests remaining)`,
            },
          }))
        }
      } catch (error) {
        setApiStatus((prev) => ({
          ...prev,
          github: { available: false, message: "GitHub API unavailable" },
        }))
      }
    }

    checkGitHubApi()
  }, [])

  useEffect(() => {
    if (profile) {
      const hasGithub = profile.platforms.some((p) => p.name === "GitHub")
      const hasMedium = profile.platforms.some((p) => p.name === "Medium")
      const hasLeetcode = profile.platforms.some((p) => p.name === "LeetCode")
      const hasHackerrank = profile.platforms.some((p) => p.name === "HackerRank")
      const hasLinkedin = profile.platforms.some((p) => p.name === "LinkedIn")
      const hasX = profile.platforms.some((p) => p.name === "X" || p.name === "Twitter")

      if (hasGithub) {
        getGithubStats()
      }

      if (hasMedium) {
        getMediumArticles()
      }

      if (hasLeetcode) {
        getLeetcodeStats()
      }

      if (hasHackerrank) {
        getHackerrankStats()
      }

      if (hasLinkedin) {
        getLinkedinProfile()
      }

      if (hasX) {
        getTwitterTweets()
      }
    }
  }, [profile])

  if (authLoading || profileLoading) {
    return <Spinner />
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p className="text-xl mb-4">Welcome {user && user.name}</p>

      {/* API Status Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">API Integration Status</h2>
        <ul className="space-y-1">
          <li className="flex items-center">
            <span
              className={`w-3 h-3 rounded-full mr-2 ${apiStatus.github.available ? "bg-green-500" : "bg-yellow-500"}`}
            ></span>
            <span>GitHub: {apiStatus.github.message}</span>
          </li>
          <li className="flex items-center">
            <span className="w-3 h-3 rounded-full mr-2 bg-green-500"></span>
            <span>LinkedIn: {apiStatus.linkedin.message}</span>
          </li>
          <li className="flex items-center">
            <span className="w-3 h-3 rounded-full mr-2 bg-yellow-500"></span>
            <span>X: {apiStatus.x.message}</span>
          </li>
        </ul>
        <p className="text-sm text-blue-700 mt-2">
          Note: We use public data from GitHub and LinkedIn profiles. Some data may be generated if public access is
          limited.
        </p>
      </div>

      {profile ? (
        <>
          <DashboardActions />

          <div className="mt-6">
            <DownloadAnalytics />
          </div>

          <div className="mt-6">
            <h2 className="text-2xl font-semibold mb-4">Your Platforms</h2>
            <PlatformList platforms={profile.platforms} />
          </div>

          <div className="mt-8">
            <ExternalApiConfig />
          </div>

          <div className="mt-8">
            <EnhancedAnalyticsDashboard />
          </div>

          <div className="mt-6">
            <DownloadAnalytics />
          </div>

          {/* Social Media Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Social Media Activity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.platforms.some((p) => p.name === "LinkedIn") && <LinkedInPosts />}
              {profile.platforms.some((p) => p.name === "X" || p.name === "Twitter") && <XFeed />}
            </div>
          </div>

          {/* Developer Platforms Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Developer Platforms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.platforms.some((p) => p.name === "GitHub") && <GithubStats />}
              {profile.platforms.some((p) => p.name === "Medium") && <MediumArticles />}
              {profile.platforms.some((p) => p.name === "LeetCode") && <LeetcodeStats />}
              {profile.platforms.some((p) => p.name === "HackerRank") && <HackerrankStats />}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="mb-4">You haven't set up your profile yet</p>
          <Link to="/create-profile" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Create Profile
          </Link>
        </div>
      )}
    </div>
  )
}

export default Dashboard
