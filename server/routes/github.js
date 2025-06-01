const express = require("express")
const router = express.Router()
const axios = require("axios")
const { protect } = require("../middleware/auth")
const Profile = require("../models/Profile")

/**
 * @swagger
 * /api/github/stats/{username}:
 *   get:
 *     summary: Get GitHub stats for a username
 *     tags: [GitHub]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: GitHub username
 *     responses:
 *       200:
 *         description: GitHub stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 */
router.get("/stats/:username", async (req, res) => {
  try {
    const username = req.params.username
    console.log(`Fetching GitHub stats for ${username}`)

    // Generate consistent mock data based on username
    const seed = username.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const random = (min, max) => Math.floor(((seed % 1000) / 1000) * (max - min + 1)) + min

    // Try to fetch real data first, but fall back to mock data
    let githubStats
    try {
      const headers = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "DevLink-App",
      }

      if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `token ${process.env.GITHUB_TOKEN}`
      }

      const userResponse = await axios.get(`https://api.github.com/users/${username}`, {
        headers,
        timeout: 5000,
      })

      const reposResponse = await axios.get(
        `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
        {
          headers,
          timeout: 5000,
        },
      )

      const userData = userResponse.data
      const repos = reposResponse.data

      // Calculate real stats
      const totalStars = repos.reduce((acc, repo) => acc + repo.stargazers_count, 0)
      const languages = {}
      repos.forEach((repo) => {
        if (repo.language) {
          languages[repo.language] = (languages[repo.language] || 0) + 1
        }
      })

      const languageStats = Object.entries(languages)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      githubStats = {
        username: userData.login,
        name: userData.name,
        avatarUrl: userData.avatar_url,
        bio: userData.bio,
        company: userData.company,
        blog: userData.blog,
        location: userData.location,
        followers: userData.followers,
        following: userData.following,
        publicRepos: userData.public_repos,
        publicGists: userData.public_gists,
        totalStars,
        languages: languageStats,
        topRepos: repos
          .sort((a, b) => b.stargazers_count - a.stargazers_count)
          .slice(0, 5)
          .map((repo) => ({
            name: repo.name,
            description: repo.description,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            url: repo.html_url,
            language: repo.language,
            updatedAt: repo.updated_at,
          })),
        dataSource: "GitHub API",
        lastUpdated: new Date().toISOString(),
      }
    } catch (apiError) {
      console.log("GitHub API failed, using mock data:", apiError.message)

      // Generate realistic mock data
      const languages = ["JavaScript", "Python", "Java", "TypeScript", "C++", "Go", "Rust", "PHP"]
      const selectedLanguages = languages.slice(0, random(3, 6)).map((lang) => ({
        name: lang,
        count: random(1, 15),
      }))

      const repoNames = [
        "awesome-project",
        "web-app",
        "api-server",
        "mobile-app",
        "data-analysis",
        "machine-learning",
        "portfolio-website",
        "chat-application",
        "e-commerce",
        "blog-platform",
        "task-manager",
        "weather-app",
        "social-media",
        "game-engine",
      ]

      const topRepos = repoNames.slice(0, random(3, 8)).map((name) => ({
        name: `${name}-${random(1, 99)}`,
        description: `A ${name.replace("-", " ")} built with modern technologies`,
        stars: random(0, 150),
        forks: random(0, 50),
        url: `https://github.com/${username}/${name}`,
        language: selectedLanguages[random(0, selectedLanguages.length - 1)]?.name || "JavaScript",
        updatedAt: new Date(Date.now() - random(1, 90) * 24 * 60 * 60 * 1000).toISOString(),
      }))

      githubStats = {
        username,
        name: username.charAt(0).toUpperCase() + username.slice(1),
        avatarUrl: `https://github.com/${username}.png`,
        bio: `Software developer passionate about coding and open source`,
        company: random(0, 1) ? "Tech Company" : null,
        blog: random(0, 1) ? `https://${username}.dev` : null,
        location: ["San Francisco", "New York", "London", "Berlin", "Tokyo"][random(0, 4)],
        followers: random(10, 500),
        following: random(20, 200),
        publicRepos: random(5, 50),
        publicGists: random(0, 20),
        totalStars: topRepos.reduce((acc, repo) => acc + repo.stars, 0),
        languages: selectedLanguages,
        topRepos,
        dataSource: "Mock Data (GitHub API unavailable)",
        lastUpdated: new Date().toISOString(),
      }
    }

    res.status(200).json({
      success: true,
      data: githubStats,
    })
  } catch (err) {
    console.error("GitHub API Error:", err.message)
    res.status(500).json({
      success: false,
      error: "Error fetching GitHub stats",
    })
  }
})

/**
 * @swagger
 * /api/github/stats:
 *   get:
 *     summary: Get GitHub stats for the current user's GitHub profile
 *     tags: [GitHub]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: GitHub stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 */
router.get("/stats", protect, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id })

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: "Profile not found",
      })
    }

    // Find GitHub platform
    const githubPlatform = profile.platforms.find((platform) => platform.name === "GitHub")

    if (!githubPlatform) {
      return res.status(404).json({
        success: false,
        error: "GitHub profile not found",
      })
    }

    // Extract username from GitHub URL or use the username directly
    let username = githubPlatform.username
    if (username.includes("github.com/")) {
      username = username.split("github.com/")[1].replace(/\/$/, "")
    }

    // Forward the request to the username-based endpoint
    const response = await axios.get(`${req.protocol}://${req.get("host")}/api/github/stats/${username}`)

    res.status(200).json(response.data)
  } catch (err) {
    console.error("GitHub API Error:", err.message)
    res.status(500).json({
      success: false,
      error: err.response?.data?.message || "Error fetching GitHub stats",
    })
  }
})

module.exports = router
