'use client'
import React, { useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { triggerFileInput } from '@/utils/fileInputTrigger'

interface AvatarProps {
  uid: string | null
  url: string | null
  size: number
  onUpload: (url: string) => void
}


export default function Avatar({ uid,url,size,onUpload }: AvatarProps) {
  const supabase = createClient()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(url)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const triggerFileInput = () => fileInputRef.current?.click()

  useEffect(() => {
    async function downloadImage(path: string) {
      try {
        const { data, error } = await supabase.storage.from('avatars').download(path)
        if (error) throw error
        const url = URL.createObjectURL(data)
        setAvatarUrl(url)
      } catch (error) {
        console.log('Error downloading image: ', error)
      }
    }
    if (url) downloadImage(url)
    else setAvatarUrl(null)
  }, [url, supabase])

  const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    try {
      setUploading(true)
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }
      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${uid}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)
      if (uploadError) throw uploadError
      
      onUpload(filePath) // this will update the parent form's avatar_url
      // Optionally, update local preview immediately:
      const url = URL.createObjectURL(file)
      setAvatarUrl(url)
    } catch (error) {
      alert('Error uploading avatar!')
    } finally {
      setUploading(false)
    }
  }

  // --- placeholder logic ---
  if (!avatarUrl) {
    return (
      <div className="flex flex-col items-center">
        <div
          className="rounded-full bg-gray-300 flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <span className="text-xl text-white">?</span>
        </div>
        <Button
          type="button"
          className="mt-4"
          onClick={triggerFileInput}
          disabled={uploading}
        >
          {uploading ? 'Uploading ...' : 'Upload a profile picture'}
        </Button>
        <input
          type="file"
          accept="image/*"
          onChange={uploadAvatar}
          className="hidden"
          ref={fileInputRef}
        />
      </div>
    )
  }

  // --- end of placeholder logic ---

  return (
    <div className="flex flex-col items-center">
        <Image
          width={size}
          height={size}
          src={avatarUrl}
          alt="Avatar"
          className="rounded-full object-cover"
        />
        <Button
          type="button"
          className="mt-4"
          onClick={triggerFileInput}
          disabled={uploading}
        >
          {uploading ? 'Uploading ...' : 'Upload a profile picture'}
        </Button>
        <input
          type="file"
          accept="image/*"
          onChange={uploadAvatar}
          className="hidden"
          ref={fileInputRef}
        />
      </div>
    )
  }