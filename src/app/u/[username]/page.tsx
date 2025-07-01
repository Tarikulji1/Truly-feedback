'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

function MessagePage() {
  const { username } = useParams()
  const [isAcceptingMessages, setIsAcceptingMessages] = useState<boolean | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`/api/check-username-unique?username=${username}`)
        setIsAcceptingMessages(true) // Or call a new endpoint for isAcceptingMessages
      } catch {
        setIsAcceptingMessages(false)
      }
    }

    if (username) fetchStatus()
  }, [username])

  const handleSubmit = async () => {
    try {
      const res = await axios.post('/api/send-message', {
        username,
        content: message,
      })
      toast.success(res.data.message)
      setMessage('')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send message')
    }
  }

  if (isAcceptingMessages === null) return <div>Loading...</div>
  if (!isAcceptingMessages) return <div>This user is not accepting messages.</div>

  return (
    <div className="max-w-md mx-auto p-6 mt-12">
      <h1 className="text-2xl font-bold mb-4 text-center">Send a message to @{username}</h1>
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your anonymous message..."
        className="mb-4"
      />
      <Button onClick={handleSubmit} className="w-full">Send</Button>
    </div>
  )
}

export default MessagePage
