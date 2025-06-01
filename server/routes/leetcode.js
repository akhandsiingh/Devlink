const express = require("express")
const router = express.Router()
const axios = require("axios")
const { protect } = require("../middleware/auth")
const Profile = require("../models/Profile")

/**
 * @swagger
 * /api/leetcode/stats/{username}:
 *   get:
 *     summary: Get LeetCode stats for a username
 *     tags: [LeetCode]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: LeetCode username
 *     responses:
 *       200:
 *         description: LeetCode stats
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

    // LeetCode GraphQL query to get user profile data
    const query = `
      query userProfile($username: String!) {
        matchedUser(username: $username) {
          username
          submitStats: submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
          }
          profile {
            ranking
            reputation
            starRating
            realName
          }
          badges {
            id
            displayName
            icon
          }
          tagProblemCounts {
            advanced {
              tagName
              problemsSolved
            }
            intermediate {
              tagName
              problemsSolved
            }
            fundamental {
              tagName
              problemsSolved
            }
          }
          problemsSolvedBeatsStats {
            difficulty
            percentage
          }
        }
        userContestRanking(username: $username) {
          attendedContestsCount
          rating
          globalRanking
          totalParticipants
          topPercentage
          badge {
            name
          }
        }
        recentSubmissionList(username: $username, limit: 15) {
          id
          title
          titleSlug
          timestamp
          statusDisplay
          lang
        }
      }
    `

    const response = await axios.post("https://leetcode.com/graphql", {
      query,
      variables: { username },
    })

    const userData = response.data.data

    // Format the response
    const leetcodeStats = {
      username: userData.matchedUser?.username,
      ranking: userData.matchedUser?.profile?.ranking,
      reputation: userData.matchedUser?.profile?.reputation,
      realName: userData.matchedUser?.profile?.realName,
      totalSolved:
        userData.matchedUser?.submitStats?.acSubmissionNum?.find((item) => item.difficulty === "All")?.count || 0,
      easySolved:
        userData.matchedUser?.submitStats?.acSubmissionNum?.find((item) => item.difficulty === "Easy")?.count || 0,
      mediumSolved:
        userData.matchedUser?.submitStats?.acSubmissionNum?.find((item) => item.difficulty === "Medium")?.count || 0,
      hardSolved:
        userData.matchedUser?.submitStats?.acSubmissionNum?.find((item) => item.difficulty === "Hard")?.count || 0,
      contestAttended: userData.userContestRanking?.attendedContestsCount || 0,
      contestRating: userData.userContestRanking?.rating || 0,
      contestGlobalRanking: userData.userContestRanking?.globalRanking || 0,
      contestBadge: userData.userContestRanking?.badge?.name || null,
      badges: userData.matchedUser?.badges || [],
      beatsPercentage: userData.matchedUser?.problemsSolvedBeatsStats || [],
      recentSubmissions: userData.recentSubmissionList || [],
      topTags: [
        ...(userData.matchedUser?.tagProblemCounts?.advanced || []),
        ...(userData.matchedUser?.tagProblemCounts?.intermediate || []),
        ...(userData.matchedUser?.tagProblemCounts?.fundamental || []),
      ]
        .sort((a, b) => b.problemsSolved - a.problemsSolved)
        .slice(0, 5),
    }

    res.status(200).json({
      success: true,
      data: leetcodeStats,
    })
  } catch (err) {
    console.error("LeetCode API Error:", err.message)
    res.status(500).json({
      success: false,
      error: "Error fetching LeetCode stats",
    })
  }
})

/**
 * @swagger
 * /api/leetcode/stats:
 *   get:
 *     summary: Get LeetCode stats for the current user's LeetCode profile
 *     tags: [LeetCode]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: LeetCode stats
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

    // Find LeetCode platform
    const leetcodePlatform = profile.platforms.find((platform) => platform.name === "LeetCode")

    if (!leetcodePlatform) {
      return res.status(404).json({
        success: false,
        error: "LeetCode profile not found",
      })
    }

    const username = leetcodePlatform.username

    // LeetCode GraphQL query to get user profile data
    const query = `
      query userProfile($username: String!) {
        matchedUser(username: $username) {
          username
          submitStats: submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
          }
          profile {
            ranking
            reputation
            starRating
            realName
          }
          badges {
            id
            displayName
            icon
          }
          tagProblemCounts {
            advanced {
              tagName
              problemsSolved
            }
            intermediate {
              tagName
              problemsSolved
            }
            fundamental {
              tagName
              problemsSolved
            }
          }
          problemsSolvedBeatsStats {
            difficulty
            percentage
          }
        }
        userContestRanking(username: $username) {
          attendedContestsCount
          rating
          globalRanking
          totalParticipants
          topPercentage
          badge {
            name
          }
        }
        recentSubmissionList(username: $username, limit: 15) {
          id
          title
          titleSlug
          timestamp
          statusDisplay
          lang
        }
      }
    `

    const response = await axios.post("https://leetcode.com/graphql", {
      query,
      variables: { username },
    })

    const userData = response.data.data

    // Format the response
    const leetcodeStats = {
      username: userData.matchedUser?.username,
      ranking: userData.matchedUser?.profile?.ranking,
      reputation: userData.matchedUser?.profile?.reputation,
      realName: userData.matchedUser?.profile?.realName,
      totalSolved:
        userData.matchedUser?.submitStats?.acSubmissionNum?.find((item) => item.difficulty === "All")?.count || 0,
      easySolved:
        userData.matchedUser?.submitStats?.acSubmissionNum?.find((item) => item.difficulty === "Easy")?.count || 0,
      mediumSolved:
        userData.matchedUser?.submitStats?.acSubmissionNum?.find((item) => item.difficulty === "Medium")?.count || 0,
      hardSolved:
        userData.matchedUser?.submitStats?.acSubmissionNum?.find((item) => item.difficulty === "Hard")?.count || 0,
      contestAttended: userData.userContestRanking?.attendedContestsCount || 0,
      contestRating: userData.userContestRanking?.rating || 0,
      contestGlobalRanking: userData.userContestRanking?.globalRanking || 0,
      contestBadge: userData.userContestRanking?.badge?.name || null,
      badges: userData.matchedUser?.badges || [],
      beatsPercentage: userData.matchedUser?.problemsSolvedBeatsStats || [],
      recentSubmissions: userData.recentSubmissionList || [],
      topTags: [
        ...(userData.matchedUser?.tagProblemCounts?.advanced || []),
        ...(userData.matchedUser?.tagProblemCounts?.intermediate || []),
        ...(userData.matchedUser?.tagProblemCounts?.fundamental || []),
      ]
        .sort((a, b) => b.problemsSolved - a.problemsSolved)
        .slice(0, 5),
    }

    res.status(200).json({
      success: true,
      data: leetcodeStats,
    })
  } catch (err) {
    console.error("LeetCode API Error:", err.message)
    res.status(500).json({
      success: false,
      error: "Error fetching LeetCode stats",
    })
  }
})

module.exports = router
