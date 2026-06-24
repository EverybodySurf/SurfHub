'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { upsertProfile } from '@/services/profiles'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Avatar from './avatar'

interface AccountFormProps {
  mode: "signup" | "edit"
  onSuccess?: () => void
}

const safe = (val: string) => val === '' ? null : val;

export default function AccountForm({ mode, onSuccess }: AccountFormProps) {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [form, setForm] = useState({
    email: "",
    full_name: "",
    username: "",
    password: "",
    website: "",
    about: "",
    avatar_url: "",
    home_break: "",
    surf_level: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState('')

  // Fetch user and profile data for edit mode
  useEffect(() => {
    if (mode === "edit") {
      (async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        if (user) {
          setForm(f => ({
            ...f,
            email: user.email || "",
            full_name: user.user_metadata?.full_name || "",
            username: user.user_metadata?.username || "",
          }))
          // Fetch extended profile from Supabase
          const { data } = await supabase
            .from('profiles')
            .select('website, avatar_url, about, home_break, surf_level')
            .eq('id', user.id)
            .single()
          if (data) {
            setForm(f => ({
              ...f,
              website: data.website || "",
              avatar_url: data.avatar_url || "",
              about: data.about || "",
              home_break: data.home_break || "",
              surf_level: data.surf_level || "",
            }))
          }
        }
        setLoading(false)
      })()
    }
  }, [mode, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const validate = () => {
    if (!form.email) return "Email is required."
    if (!form.full_name) return "Name is required."
    if (!form.username) return "Username is required."
    if (mode === "signup" && !form.password) return "Password is required."
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess('')

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              full_name: form.full_name,
              username: form.username,
            },
          },
        })
        if (error) { setError(error.message); return }
        const user = data.user
        if (user) {
          const { error: profileError } = await supabase.from('profiles').insert({
            id: user.id,
            website: safe(form.website),
            avatar_url: safe(form.avatar_url),
            about: safe(form.about),
            home_break: safe(form.home_break),
            surf_level: safe(form.surf_level) as any,
            updated_at: new Date().toISOString(),
          })
          if (profileError) { setError(profileError.message); return }
          if (onSuccess) onSuccess()
        }
      } else {
        // Edit mode: update auth metadata + profile
        const { error: userError } = await supabase.auth.updateUser({
          data: { full_name: form.full_name, username: form.username },
        })
        if (userError) { setError(userError.message); return }

        const { error: profileError } = await upsertProfile(user?.id, {
          website: safe(form.website),
          avatar_url: safe(form.avatar_url),
          about: safe(form.about),
          home_break: safe(form.home_break),
          surf_level: safe(form.surf_level) as any,
        })
        if (profileError) { setError(profileError); return }
        setSuccess('Profile updated!')
        if (onSuccess) onSuccess()
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = (url: string) => {
    setForm(f => ({ ...f, avatar_url: url }))
    if (mode === "edit" && user?.id) {
      supabase.from('profiles').upsert({
        id: user.id,
        avatar_url: url,
        updated_at: new Date().toISOString(),
      })
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-2xl">{mode === "signup" ? "Sign Up" : "My Account"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {mode === "edit" && (
              <div className="flex flex-col items-center gap-2">
                <Avatar
                  uid={user?.id ?? null}
                  url={form.avatar_url}
                  size={100}
                  onUpload={handleAvatarUpload}
                />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
                disabled={mode === "edit"}
              />
            </div>
            <div>
              <Label htmlFor="full_name">Name</Label>
              <Input
                id="full_name"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
                required
              />
            </div>
            {mode === "signup" && (
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </div>
            )}
            {mode === "edit" && (
              <>
                <div>
                  <Label htmlFor="about">About Me</Label>
                  <Input
                    id="about"
                    name="about"
                    value={form.about}
                    onChange={handleChange}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    autoComplete="url"
                  />
                </div>
                <div>
                  <Label htmlFor="home_break">Home Break</Label>
                  <Input
                    id="home_break"
                    name="home_break"
                    value={form.home_break}
                    onChange={handleChange}
                    placeholder="e.g. La Gravière, Guadeloupe"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="surf_level">Surf Level</Label>
                  <Select
                    value={form.surf_level}
                    onValueChange={(val) => setForm(f => ({ ...f, surf_level: val }))}
                  >
                    <SelectTrigger id="surf_level">
                      <SelectValue placeholder="Select your level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            {error && <div className="text-red-500 text-center">{error}</div>}
            {success && <div className="text-foreground text-center">{success}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? (mode === "signup" ? "Signing Up..." : "Saving...")
                : (mode === "signup" ? "Sign Up" : "Save Changes")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
