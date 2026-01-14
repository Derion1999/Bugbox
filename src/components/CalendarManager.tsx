import React, { useState, useEffect } from 'react'
import { Plus, Phone, Users, Calendar as CalendarIcon, Clock, Trash2, Edit2, MapPin } from 'lucide-react'
import { supabase, type CalendarEvent } from '../lib/supabase'
import { useAuth } from './auth/AuthProvider'
import { Button } from './ui/Button'
import { Card, CardContent, CardHeader } from './ui/Card'
import { Input } from './ui/Input'

const eventTypeConfig = {
  call: { label: 'Call', icon: Phone, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  meeting: { label: 'Meeting', icon: Users, color: 'bg-green-100 text-green-800 border-green-200' },
  other: { label: 'Other', icon: CalendarIcon, color: 'bg-gray-100 text-gray-800 border-gray-200' },
}

export const CalendarManager: React.FC = () => {
  const { user } = useAuth()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'meeting' as 'call' | 'meeting' | 'other',
    start_time: '',
    end_time: '',
    location: '',
    attendees: '',
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('start_time', { ascending: true })

    if (!error && data) {
      setEvents(data)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.start_time || !formData.end_time) return

    if (new Date(formData.end_time) <= new Date(formData.start_time)) {
      alert('End time must be after start time')
      return
    }

    try {
      if (editingEvent) {
        const { error } = await supabase
          .from('calendar_events')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingEvent.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('calendar_events')
          .insert([{
            ...formData,
            user_id: user!.id,
          }])

        if (error) throw error
      }

      await fetchEvents()
      resetForm()
    } catch (error) {
      console.error('Error saving event:', error)
      alert('Failed to save event. Please try again.')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_type: 'meeting',
      start_time: '',
      end_time: '',
      location: '',
      attendees: '',
    })
    setShowForm(false)
    setEditingEvent(null)
  }

  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description || '',
      event_type: event.event_type,
      start_time: new Date(event.start_time).toISOString().slice(0, 16),
      end_time: new Date(event.end_time).toISOString().slice(0, 16),
      location: event.location || '',
      attendees: event.attendees || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id)

      if (!error) {
        await fetchEvents()
      }
    }
  }

  const now = new Date()
  const upcomingEvents = events.filter(e => new Date(e.start_time) >= now)
  const pastEvents = events.filter(e => new Date(e.start_time) < now)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Calendar & Meetings</h2>
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-1" />
              New Event
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
              <h3 className="font-semibold mb-4">{editingEvent ? 'Edit Event' : 'New Event'}</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter event title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.event_type}
                    onChange={(e) => setFormData({ ...formData, event_type: e.target.value as 'call' | 'meeting' | 'other' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  >
                    <option value="meeting">Meeting</option>
                    <option value="call">Call</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time *
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time *
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Meeting location or call link"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attendees
                  </label>
                  <Input
                    value={formData.attendees}
                    onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                    placeholder="Comma-separated list of attendees"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add event details"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" size="sm">
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-4">No events scheduled. Create your first event to get started.</p>
              {!showForm && (
                <Button size="sm" onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Create Event
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {upcomingEvents.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Upcoming Events ({upcomingEvents.length})
                  </h3>
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <EventItem
                        key={event.id}
                        event={event}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              )}

              {pastEvents.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Past Events ({pastEvents.length})
                  </h3>
                  <div className="space-y-3">
                    {pastEvents.map((event) => (
                      <EventItem
                        key={event.id}
                        event={event}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isPast
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface EventItemProps {
  event: CalendarEvent
  onEdit: (event: CalendarEvent) => void
  onDelete: (id: string) => void
  isPast?: boolean
}

const EventItem: React.FC<EventItemProps> = ({ event, onEdit, onDelete, isPast }) => {
  const config = eventTypeConfig[event.event_type]
  const Icon = config.icon

  const formatTime = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const getDuration = () => {
    const start = new Date(event.start_time)
    const end = new Date(event.end_time)
    const diff = end.getTime() - start.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h`
    return `${minutes}m`
  }

  return (
    <div className={`p-4 rounded-lg border-2 transition-all ${
      isPast
        ? 'bg-gray-50 border-gray-200 opacity-60'
        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${config.color}`}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className={`font-semibold ${isPast ? 'text-gray-500' : 'text-gray-900'}`}>
              {event.title}
            </h4>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${config.color}`}>
              {config.label}
            </span>
          </div>

          <div className={`space-y-1 text-sm ${isPast ? 'text-gray-400' : 'text-gray-600'}`}>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>{formatTime(event.start_time)}</span>
              <span className="text-gray-400">•</span>
              <span>{getDuration()}</span>
            </div>

            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            )}

            {event.attendees && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{event.attendees}</span>
              </div>
            )}

            {event.description && (
              <p className="mt-2 pt-2 border-t border-gray-200">
                {event.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(event)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit event"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(event.id)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete event"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
