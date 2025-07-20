'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
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
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState('')

  // Fetch user and profile DATA for edit mode!
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
          // Fetch extended profile
          const { data } = await supabase
            .from('profiles')
            .select('website, avatar_url, about')
            .eq('id', user.id)
            .single()
          if (data) {
            setForm(f => ({
              ...f,
              website: data.website || "",
              avatar_url: data.avatar_url || "",
              about: data.about || "",
            }))
          }
        }
        setLoading(false)
      })()
    }
  }, [mode, supabase])
  
  //Handle input changes

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // ..."a comment" :P...i'll start using more  comments. feels clean,spacious, and organized.
  
  
  // Validation
  const validate = () => {
    if (!form.email) return "Email is required."
    if (!form.full_name) return "name is required, but any name works."
    if (!form.username) return "Username is required."
    if (mode === "signup" && !form.password) return "Password is required."
    // Add more custom validation here (e.g., username format)
    return null
  }

  //...creating is fresh.

  //...lets submit after validation...
  
  // Submit handler
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
        // signup logic
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
        if (error) {
          setError(error.message)
          return
        }
        // Insert extended profile
        const user = data.user
        if (user) {
          const { error: profileError } = await supabase.from('profiles').insert({
            id: user.id,
            website: safe(form.website),
            avatar_url: safe(form.avatar_url),
            about: safe(form.about),
            updated_at: new Date().toISOString(),
          })
          if (profileError) {
            setError(profileError.message)
            return
          }
          if (onSuccess) onSuccess()
        }
      } else {
        // Edit mode: update auth and profile
        const { error: userError } = await supabase.auth.updateUser({
          data: {
            full_name: form.full_name,
            username: form.username,
          },
        })
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: user?.id,
          website: safe(form.website),
          avatar_url: safe(form.avatar_url),
          about: safe(form.about),
          updated_at: new Date().toISOString(),
        })
        if (userError || profileError) {
          setError(userError?.message || profileError?.message || 'Unknown error occurred')
          return
        }
        setSuccess('Profile updated!')
        if (onSuccess) onSuccess()
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // avatar upload handler/logic
  const handleAvatarUpload = (url: string) => {
    setForm(f => ({ ...f, avatar_url: url}))
    if (mode === "edit") {
      // Immediately update the profile in the database
      supabase.from('profiles').upsert({
        id: user?.id,
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
                    autoComplete="lay the deets"
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
              </>
            )}
            {error && <div className="text-red-500 text-center">{error}</div>}
            {success && <div className="text-foreground text-center">{success}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (mode === "signup" ? "Signing Up..." : "Saving...") : (mode === "signup" ? "Sign Up" : "Save Changes")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}