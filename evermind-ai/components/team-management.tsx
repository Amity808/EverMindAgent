"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Users, Crown, Shield, User, Mail, MoreHorizontal, UserMinus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface TeamMember {
  id: string
  name: string
  email: string
  role: "owner" | "admin" | "member"
  avatar?: string
  joinedAt: string
  status: "active" | "pending"
}

interface Team {
  id: string
  name: string
  description: string
  members: TeamMember[]
  createdAt: string
}

export function TeamManagement() {
  const [teams, setTeams] = useState<Team[]>([
    {
      id: "1",
      name: "AI Research Team",
      description: "Collaborative AI research and development",
      createdAt: "2024-01-15",
      members: [
        {
          id: "1",
          name: "Alice Johnson",
          email: "alice@example.com",
          role: "owner",
          joinedAt: "2024-01-15",
          status: "active",
        },
        {
          id: "2",
          name: "Bob Smith",
          email: "bob@example.com",
          role: "admin",
          joinedAt: "2024-01-16",
          status: "active",
        },
        {
          id: "3",
          name: "Carol Davis",
          email: "carol@example.com",
          role: "member",
          joinedAt: "2024-01-17",
          status: "pending",
        },
      ],
    },
  ])

  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false)
  const [isInviteMemberOpen, setIsInviteMemberOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<string>("")

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-yellow-500" />
      case "admin":
        return <Shield className="h-4 w-4 text-blue-500" />
      default:
        return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default"
      case "admin":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Your Teams</h2>
          <p className="text-muted-foreground">Manage your collaboration teams</p>
        </div>
        <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>Create a new team to collaborate on AI projects</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="team-name">Team Name</Label>
                <Input id="team-name" placeholder="Enter team name" />
              </div>
              <div>
                <Label htmlFor="team-description">Description</Label>
                <Input id="team-description" placeholder="Brief description of the team" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateTeamOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsCreateTeamOpen(false)}>Create Team</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Teams List */}
      <div className="grid gap-6">
        {teams.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {team.name}
                  </CardTitle>
                  <CardDescription>{team.description}</CardDescription>
                </div>
                <Dialog open={isInviteMemberOpen} onOpenChange={setIsInviteMemberOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setSelectedTeam(team.id)}>
                      <Mail className="h-4 w-4 mr-2" />
                      Invite Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Team Member</DialogTitle>
                      <DialogDescription>Invite a new member to {team.name}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="member-email">Email Address</Label>
                        <Input id="member-email" type="email" placeholder="member@example.com" />
                      </div>
                      <div>
                        <Label htmlFor="member-role">Role</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsInviteMemberOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => setIsInviteMemberOpen(false)}>Send Invitation</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{team.members.length} members</span>
                  <span>Created {new Date(team.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Members List */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Team Members</h4>
                  <div className="space-y-2">
                    {team.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{member.name}</span>
                              {getRoleIcon(member.role)}
                              <Badge variant={getRoleBadgeVariant(member.role)} className="text-xs">
                                {member.role}
                              </Badge>
                              {member.status === "pending" && (
                                <Badge variant="outline" className="text-xs">
                                  Pending
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Change Role</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <UserMinus className="h-4 w-4 mr-2" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
