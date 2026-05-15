import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "hackathon_secret_key_12345";

export async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // --- MIDDLEWARES ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Forbidden" });
      req.user = user;
      next();
    });
  };

  const requireRole = (roles: string[]) => {
    return (req: any, res: any, next: any) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ error: "Forbidden: insufficient permissions" });
      }
      next();
    };
  };

  // --- AUTH ROUTES ---
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return res.status(400).json({ error: "Email already exists" });

      const password_hash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { name, email, password_hash, role }
      });
      const token = jwt.sign({ userId: user.id, role: user.role, email: user.email }, JWT_SECRET);
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(400).json({ error: "Invalid credentials" });

      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) return res.status(400).json({ error: "Invalid credentials" });

      const token = jwt.sign({ userId: user.id, role: user.role, email: user.email }, JWT_SECRET);
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res: any) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/auth/me", authenticateToken, async (req: any, res: any) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
      if (!user) return res.status(404).json({ error: "User not found" });

      if (user.role === "ADMIN") {
        const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
        if (adminCount <= 1) return res.status(400).json({ error: "Cannot delete the only admin" });
      }

      if (user.role === "TEAM") {
        const captainMember = await prisma.teamMember.findFirst({
            where: { user_id: user.id, is_captain: true }
        });
        if (captainMember) {
            const otherMembers = await prisma.teamMember.count({
                where: { team_id: captainMember.team_id, user_id: { not: user.id } }
            });
            if (otherMembers > 0) {
                return res.status(400).json({ error: "You are the captain of a team with other members. Please delete your team in the Danger Zone first." });
            } else {
                await prisma.team.delete({ where: { id: captainMember.team_id } });
            }
        }
      }

      if (user.role === "JURY") {
        const pendingAssignments = await prisma.evaluationAssignment.findMany({
            where: { jury_id: user.id, status: "PENDING" }
        });
        if (pendingAssignments.length > 0) {
            const otherJurors = await prisma.user.findMany({ where: { role: "JURY", id: { not: user.id } } });
            for (const assignment of pendingAssignments) {
                let assigned = false;
                const shuffledJuries = [...otherJurors].sort(() => 0.5 - Math.random());
                for (const juror of shuffledJuries) {
                    const existing = await prisma.evaluationAssignment.findFirst({
                        where: { submission_id: assignment.submission_id, jury_id: juror.id }
                    });
                    if (!existing) {
                        await prisma.evaluationAssignment.update({
                            where: { id: assignment.id },
                            data: { jury_id: juror.id }
                        });
                        assigned = true;
                        break;
                    }
                }
                if (!assigned) {
                    await prisma.evaluationAssignment.delete({ where: { id: assignment.id } });
                }
            }
        }
      }

      await prisma.user.delete({ where: { id: user.id } });
      res.json({ message: "Account deleted" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Adding account deletion team routes for convenience
  app.delete("/api/teams/mine", authenticateToken, async (req: any, res: any) => {
      try {
          const captainMember = await prisma.teamMember.findFirst({
              where: { user_id: req.user.userId, is_captain: true }
          });
          if (!captainMember) return res.status(403).json({ error: "No team as captain found" });
          await prisma.team.delete({ where: { id: captainMember.team_id } });
          res.json({ message: "Team deleted" });
      } catch (error: any) {
          res.status(500).json({ error: error.message });
      }
  });

  const isValidDate = (d: any) => {
    if (!d) return false;
    const t = new Date(d);
    if (isNaN(t.getTime())) return false;
    return t.getFullYear() >= 2026 && t.getFullYear() <= 2099;
  };

  // --- TOURNAMENT ROUTES ---
  app.get("/api/tournaments", async (req, res) => {
    try {
      const tournaments = await prisma.tournament.findMany({
        orderBy: { createdAt: 'desc' }
      });
      res.json(tournaments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tournaments/:id", async (req, res) => {
    try {
      const tournament = await prisma.tournament.findUnique({
        where: { id: req.params.id },
        include: { rounds: true }
      });
      if (!tournament) return res.status(404).json({ error: "Tournament not found" });
      res.json(tournament);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tournaments", authenticateToken, requireRole(["ADMIN", "ORGANIZER"]), async (req: any, res: any) => {
    try {
      const data = req.body;
      
      if (data.start_date && !isValidDate(data.start_date)) return res.status(400).json({ error: "start_date must be between 2026 and 2099" });
      if (!isValidDate(data.reg_start)) return res.status(400).json({ error: "reg_start must be between 2026 and 2099" });
      if (!isValidDate(data.reg_end)) return res.status(400).json({ error: "reg_end must be between 2026 and 2099" });

      let max_teams = null;
      if (data.max_teams !== undefined && data.max_teams !== null && data.max_teams !== "") {
          max_teams = parseInt(data.max_teams);
          if (isNaN(max_teams) || max_teams < 1) return res.status(400).json({ error: "max_teams must be an integer >= 1" });
      }

      const tournament = await prisma.tournament.create({
        data: {
          title: data.title,
          description: data.description,
          rules: data.rules,
          start_date: data.start_date ? new Date(data.start_date) : null,
          reg_start: new Date(data.reg_start),
          reg_end: new Date(data.reg_end),
          max_teams: max_teams,
          status: "DRAFT"
        }
      });
      res.json(tournament);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/tournaments/:id/status", authenticateToken, requireRole(["ADMIN", "ORGANIZER"]), async (req: any, res: any) => {
    try {
      const { status } = req.body;
      const tournament = await prisma.tournament.update({
        where: { id: req.params.id },
        data: { status }
      });
      res.json(tournament);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- TEAM REGISTRATION ROUTES ---
  app.post("/api/tournaments/:id/register-team", authenticateToken, requireRole(["TEAM", "ADMIN"]), async (req: any, res: any) => {
    try {
      const tournament = await prisma.tournament.findUnique({ where: { id: req.params.id } });
      if (!tournament) return res.status(404).json({ error: "Tournament not found" });
      
      const now = new Date();
      if (tournament.status !== "REGISTRATION" && req.user.role !== "ADMIN") {
        return res.status(400).json({ error: "Registration is not open" });
      }

      if (now < new Date(tournament.reg_start) || now > new Date(tournament.reg_end)) {
        if (req.user.role !== "ADMIN") return res.status(400).json({ error: "Outside registration window" });
      }

      if (tournament.max_teams) {
         const currentTeams = await prisma.team.count({ where: { tournament_id: tournament.id } });
         if (currentTeams >= tournament.max_teams) {
            return res.status(400).json({ error: "Tournament Full: Max teams limit reached" });
         }
      }

      const { team_name, city_school, telegram_discord, members } = req.body;
      
      // Check duplicate team name in this tournament
      const existingTeam = await prisma.team.findUnique({
        where: { tournament_id_team_name: { tournament_id: tournament.id, team_name } }
      });
      if (existingTeam) return res.status(400).json({ error: "Team name already taken in this tournament" });

      // Unique emails check globally for this tournament logic
      const tournamentTeams = await prisma.team.findMany({
        where: { tournament_id: tournament.id },
        include: { members: true }
      });
      const allEmailsInTourney = new Set(tournamentTeams.flatMap(t => t.members.map(m => m.email)));

      for (const m of members) {
        if (allEmailsInTourney.has(m.email)) {
          return res.status(400).json({ error: `Email ${m.email} is already registered in this tournament` });
        }
      }

      const team = await prisma.team.create({
        data: {
          tournament_id: tournament.id,
          team_name,
          city_school,
          telegram_discord,
          members: {
            create: members.map((m: any, index: number) => ({
              full_name: m.full_name,
              email: m.email,
              is_captain: index === 0,
              user_id: index === 0 ? req.user.userId : null // Assume captain is the logged in user
            }))
          }
        },
        include: { members: true }
      });
      res.json(team);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tournaments/:id/teams", async (req, res) => {
    try {
      const teams = await prisma.team.findMany({
        where: { tournament_id: req.params.id },
        include: { members: true, submissions: true }
      });
      res.json(teams);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- ROUND / TASK ROUTES ---
  app.post("/api/tournaments/:id/rounds", authenticateToken, requireRole(["ADMIN", "ORGANIZER"]), async (req: any, res: any) => {
    try {
      const data = req.body;
      if (!isValidDate(data.start_time)) return res.status(400).json({ error: "start_time must be between 2026 and 2099" });
      if (!isValidDate(data.end_time)) return res.status(400).json({ error: "end_time must be between 2026 and 2099" });

      const round = await prisma.round.create({
        data: {
          tournament_id: req.params.id,
          title: data.title,
          description: data.description,
          tech_requirements: data.tech_requirements,
          must_have_criteria: JSON.stringify(data.must_have_criteria),
          start_time: new Date(data.start_time),
          end_time: new Date(data.end_time),
          status: "DRAFT"
        }
      });
      res.json(round);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/rounds/:id/status", authenticateToken, requireRole(["ADMIN", "ORGANIZER"]), async (req: any, res: any) => {
    try {
      const round = await prisma.round.update({
        where: { id: req.params.id },
        data: { status: req.body.status }
      });
      res.json(round);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- SUBMISSIONS ---
  app.post("/api/rounds/:round_id/submissions", authenticateToken, requireRole(["TEAM", "ADMIN"]), async (req: any, res: any) => {
    try {
      const round = await prisma.round.findUnique({ where: { id: req.params.round_id } });
      if (!round) return res.status(404).json({ error: "Round not found" });

      if (round.status !== "ACTIVE" && req.user.role !== "ADMIN") {
        return res.status(400).json({ error: "Submissions are closed" });
      }

      if (new Date() > new Date(round.end_time) && req.user.role !== "ADMIN") {
        return res.status(400).json({ error: "Deadline passed" });
      }

      const { team_id, github_url, video_url, live_demo_url, summary } = req.body;
      
      const isMember = await prisma.teamMember.findFirst({
        where: { team_id, user_id: req.user.userId }
      });

      if (!isMember && req.user.role !== "ADMIN") {
        return res.status(403).json({ error: "Not part of this team" });
      }

      // Upsert submission
      const existing = await prisma.submission.findFirst({
        where: { round_id: round.id, team_id }
      });

      let submission;
      if (existing) {
        submission = await prisma.submission.update({
          where: { id: existing.id },
          data: { github_url, video_url, live_demo_url, summary, submitted_at: new Date() }
        });
      } else {
        submission = await prisma.submission.create({
          data: { round_id: round.id, team_id, github_url, video_url, live_demo_url, summary }
        });
      }

      res.json(submission);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- JURY ASSIGNMENT ALGORITHM ---
  app.post("/api/rounds/:id/assign-jury", authenticateToken, requireRole(["ADMIN"]), async (req: any, res: any) => {
    try {
      const roundId = req.params.id;
      const { K } = req.body; // e.g., K=2 (jurors per submission)
      
      const submissions = await prisma.submission.findMany({ where: { round_id: roundId } });
      const juries = await prisma.user.findMany({ where: { role: "JURY" } });

      if (juries.length < K) {
        return res.status(400).json({ error: `Not enough jury members. Have ${juries.length}, need at least ${K}.` });
      }

      // Clear existing assignments for this round
      await prisma.evaluationAssignment.deleteMany({
        where: { submission: { round_id: roundId } }
      });

      const assignments = [];
      for (const sub of submissions) {
        // Randomly select K juries
        const shuffledJuries = [...juries].sort(() => 0.5 - Math.random());
        const selectedJuries = shuffledJuries.slice(0, K);

        for (const jury of selectedJuries) {
          assignments.push({
            submission_id: sub.id,
            jury_id: jury.id,
            status: "PENDING"
          });
        }
      }

      await prisma.evaluationAssignment.createMany({ data: assignments });
      res.json({ message: "Assignments completed successfully", count: assignments.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- JURY & SCORING ROUTES ---
  app.get("/api/jury/assignments", authenticateToken, requireRole(["JURY", "ADMIN"]), async (req: any, res: any) => {
    try {
      const assignments = await prisma.evaluationAssignment.findMany({
        where: { jury_id: req.user.role === "JURY" ? req.user.userId : undefined },
        include: {
          submission: { include: { team: true, round: true } },
          score: true
        }
      });
      res.json(assignments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/assignments/:id/score", authenticateToken, requireRole(["JURY", "ADMIN"]), async (req: any, res: any) => {
    try {
      const assignment = await prisma.evaluationAssignment.findUnique({ where: { id: req.params.id } });
      if (!assignment) return res.status(404).json({ error: "Assignment not found" });

      if (assignment.jury_id !== req.user.userId && req.user.role !== "ADMIN") {
        return res.status(403).json({ error: "Not your assignment" });
      }

      const { tech_backend, tech_database, tech_frontend, func_must_have, func_bugs, func_ux, comments } = req.body;

      const total = (tech_backend + tech_database + tech_frontend + func_must_have + func_bugs + func_ux) / 6.0;

      const score = await prisma.score.upsert({
        where: { assignment_id: assignment.id },
        update: { tech_backend, tech_database, tech_frontend, func_must_have, func_bugs, func_ux, comments, total_calculated_score: total },
        create: { assignment_id: assignment.id, tech_backend, tech_database, tech_frontend, func_must_have, func_bugs, func_ux, comments, total_calculated_score: total }
      });

      await prisma.evaluationAssignment.update({
        where: { id: assignment.id },
        data: { status: "COMPLETED" }
      });

      res.json(score);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- LEADERBOARD ---
  app.get("/api/rounds/:id/leaderboard", async (req: any, res: any) => {
    try {
      const roundId = req.params.id;
      const assignments = await prisma.evaluationAssignment.findMany({
        where: { submission: { round_id: roundId }, status: "COMPLETED" },
        include: {
          score: true,
          submission: { include: { team: true } }
        }
      });

      const teamStats: Record<string, any> = {};

      for (const a of assignments) {
        if (!a.score) continue;
        const teamId = a.submission.team_id;
        if (!teamStats[teamId]) {
          teamStats[teamId] = {
            team: a.submission.team,
            submission: a.submission,
            scores: [],
            totalAverage: 0
          };
        }
        teamStats[teamId].scores.push(a.score);
      }

      const leaderboard = Object.values(teamStats).map((stats: any) => {
        const sum = stats.scores.reduce((acc: number, s: any) => acc + s.total_calculated_score, 0);
        stats.totalAverage = sum / stats.scores.length;
        return stats;
      });

      leaderboard.sort((a: any, b: any) => b.totalAverage - a.totalAverage);

      res.json(leaderboard);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In Express v5, we must use *all, but the app uses v4.21.2 from package.json, so * works.
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
