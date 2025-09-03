import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, momentLocalizer, type View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useQuery, gql } from '@apollo/client';
import { 
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Users,
  MapPin,
  AlertCircle,
  X,
  User,
  FileText,
  Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

import { Button } from '../components/ui/Button';
import { useLanguage } from '../i18n/useLanguage';
import { WeekdayView } from '../components/calendar';

// Configure moment localizer
const localizer = momentLocalizer(moment);

// Set Turkish locale
moment.locale('tr');

// GraphQL Query for Special Days
const GET_SPECIAL_DAYS = gql`
  query GetSpecialDays {
    special_days(order_by: { date: asc }) {
      id
      date
      name
    }
  }
`;

// GraphQL Query for Project Tasks with Time Summary
const GET_PROJECT_TASKS = gql`
  query GetProjectTasks {
    project_tasks(where: { due_date: { _is_null: false } }, order_by: { due_date: asc }) {
      id
      title
      description
      status
      priority
      due_date
      project_id
    }
    task_time_summary {
      task_id
      title
      estimated_hours
      actual_hours
      calculated_actual_hours
      time_efficiency_percentage
      total_time_entries
      active_timers
    }
  }
`;

export const CalendarPage: React.FC = () => {
  const { t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View | 'haftaici'>('month');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  // GraphQL queries
  const { data: specialDaysData } = useQuery(GET_SPECIAL_DAYS);
  const { data: projectTasksData } = useQuery(GET_PROJECT_TASKS);

  // Mock calendar data - converted to Big Calendar format
  const mockEvents = [
    {
      id: 1,
      title: 'Team Standup Meeting',
      start: moment('2024-01-15 09:00').toDate(),
      end: moment('2024-01-15 09:30').toDate(),
      resource: {
        type: 'meeting',
        participants: ['Ahmet Yılmaz', 'Fatma Demir', 'Mehmet Kaya'],
        location: 'Conference Room A',
        status: 'scheduled',
        description: 'Daily team standup meeting to discuss progress and blockers'
      }
    },
    {
      id: 2,
      title: 'Client Presentation - E-commerce Platform',
      start: moment('2024-01-16 14:00').toDate(),
      end: moment('2024-01-16 15:00').toDate(),
      resource: {
        type: 'presentation',
        participants: ['Fatma Demir', 'TechCorp Team'],
        location: 'Virtual Meeting',
        status: 'scheduled',
        description: 'Present project progress to TechCorp stakeholders'
      }
    },
    {
      id: 3,
      title: 'Code Review Session',
      start: moment('2024-01-17 10:30').toDate(),
      end: moment('2024-01-17 11:30').toDate(),
      resource: {
        type: 'review',
        participants: ['Ahmet Yılmaz', 'Can Yıldız'],
        location: 'Development Room',
        status: 'scheduled',
        description: 'Review recent code changes and discuss improvements'
      }
    },
    {
      id: 4,
      title: 'Project Planning Meeting',
      start: moment('2024-01-18 11:00').toDate(),
      end: moment('2024-01-18 12:00').toDate(),
      resource: {
        type: 'planning',
        participants: ['All Team Members'],
        location: 'Main Conference Room',
        status: 'scheduled',
        description: 'Q1 2024 project planning and resource allocation'
      }
    },
    {
      id: 5,
      title: 'Client Feedback Session',
      start: moment('2024-01-19 15:30').toDate(),
      end: moment('2024-01-19 17:00').toDate(),
      resource: {
        type: 'feedback',
        participants: ['Mehmet Kaya', 'MarketingPro Team'],
        location: 'Client Office',
        status: 'scheduled',
        description: 'Gather feedback on website redesign mockups'
      }
    },
    {
      id: 6,
      title: 'Technical Architecture Review',
      start: moment('2024-01-22 13:00').toDate(),
      end: moment('2024-01-22 14:00').toDate(),
      resource: {
        type: 'review',
        participants: ['Ayşe Özkan', 'Can Yıldız', 'Zeynep Arslan'],
        location: 'Engineering Room',
        status: 'scheduled',
        description: 'Review technical architecture for CRM integration'
      }
    },
    {
      id: 7,
      title: 'Team Building Event',
      start: moment('2024-01-25 16:00').toDate(),
      end: moment('2024-01-25 19:00').toDate(),
      resource: {
        type: 'event',
        participants: ['All Team Members'],
        location: 'Company Garden',
        status: 'scheduled',
        description: 'Monthly team building and networking event'
      }
    },
    {
      id: 8,
      title: 'Deadline: E-commerce Platform MVP',
      start: moment('2024-01-31 17:00').toDate(),
      end: moment('2024-01-31 17:00').toDate(),
      resource: {
        type: 'deadline',
        participants: ['Ahmet Yılmaz', 'Fatma Demir'],
        location: 'N/A',
        status: 'pending',
        description: 'MVP delivery deadline for TechCorp e-commerce platform'
      }
    }
  ];

  // Transform special days to events
  const specialDayEvents = React.useMemo(() => {
    if (!specialDaysData?.special_days) return [];
    
    return specialDaysData.special_days.map((day: any) => {
      const date = moment(day.date).toDate();
      
      return {
        id: `special_${day.id}`,
        title: day.name,
        start: date,
        end: date,
        resource: {
          type: 'holiday',
          participants: [],
          location: '',
          status: 'confirmed',
          description: 'Özel Gün',
          creator: 'System'
        }
      };
    });
  }, [specialDaysData]);

  // Transform project tasks to events
  const projectTaskEvents = React.useMemo(() => {
    if (!projectTasksData?.project_tasks || !projectTasksData?.task_time_summary) return [];
    
    // Create a map for quick lookup of time summary data
    const timeSummaryMap = new Map();
    projectTasksData.task_time_summary.forEach((summary: any) => {
      timeSummaryMap.set(summary.task_id, summary);
    });
    
    return projectTasksData.project_tasks.map((task: any) => {
      const dueDate = moment(task.due_date).toDate();
      const timeSummary = timeSummaryMap.get(task.id) || {};
      
      return {
        id: `task_${task.id}`,
        title: `Task: ${task.title}`,
        start: dueDate,
        end: dueDate,
        resource: {
          type: 'task',
          participants: ['Assigned User'],
          location: 'Project Task',
          status: task.status || 'pending',
          description: task.description || '',
          priority: task.priority || 'medium',
          estimated_hours: timeSummary.estimated_hours || 0,
          actual_hours: timeSummary.actual_hours || 0,
          calculated_actual_hours: timeSummary.calculated_actual_hours || 0,
          time_efficiency_percentage: timeSummary.time_efficiency_percentage || 0,
          total_time_entries: timeSummary.total_time_entries || 0,
          active_timers: timeSummary.active_timers || 0,
          creator: 'System'
        }
      };
    });
  }, [projectTasksData]);

  // Combine mock events with special days and project tasks
  const events = [...mockEvents, ...specialDayEvents, ...projectTaskEvents];

  // Modal handlers
  const openEventModal = (event: any) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeEventModal = () => {
    setSelectedEvent(null);
    setIsModalOpen(false);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'jira';
      case 'presentation': return 'jiraSuccess';
      case 'review': return 'jiraWarning';
      case 'planning': return 'jiraError';
      case 'feedback': return 'jiraSecondary';
      case 'event': return 'jiraSuccess';
      case 'deadline': return 'jiraError';
      case 'holiday': return 'jiraError';
      case 'task': return 'jiraWarning';
      default: return 'jiraGray';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return <Users className="h-4 w-4" />;
      case 'presentation': return <AlertCircle className="h-4 w-4" />;
      case 'review': return <AlertCircle className="h-4 w-4" />;
      case 'planning': return <Clock className="h-4 w-4" />;
      case 'feedback': return <MapPin className="h-4 w-4" />;
      case 'event': return <CalendarIcon className="h-4 w-4" />;
      case 'deadline': return <AlertCircle className="h-4 w-4" />;
      case 'holiday': return <CalendarIcon className="h-4 w-4" />;
      case 'task': return <Clock className="h-4 w-4" />;
      default: return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'jiraSuccess';
      case 'pending': return 'jiraWarning';
      case 'completed': return 'jiraSuccess';
      case 'cancelled': return 'jiraError';
      default: return 'jiraGray';
    }
  };

  const getCurrentMonthEvents = () => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    return events.filter((event: any) => {
      const eventDate = new Date(event.start);
      return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
    });
  };

  const currentMonthEvents = getCurrentMonthEvents();

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Page Header */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center space-x-4">
          <motion.div 
            className="p-3 bg-yellow-100 rounded-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <CalendarIcon className="h-8 w-8 text-yellow-600" />
          </motion.div>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold text-gray-900">{t('calendarTitle')}</h1>
            <p className="text-gray-600 mt-1">Schedule and manage team events</p>
          </motion.div>
        </div>
        <div className="flex items-center space-x-4">
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="jira" size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Add Event
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Calendar Events</h2>
        </CardHeader>
        <CardContent>
          {/* React Big Calendar */}
          <div style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              views={{
                month: true,
                week: true,
                day: true,
                haftaici: WeekdayView
              } as any}
              view={currentView as any}
              onView={setCurrentView}
              date={currentDate}
              onNavigate={setCurrentDate}
              onSelectEvent={openEventModal}
              step={1440} // 24 hours in minutes - removes hourly grid
              timeslots={1} // Number of timeslots per step
              showMultiDayTimes={false} // Hide time labels for multi-day events
              // Weekend visibility is controlled by the custom weekday view
              allDayAccessor={(event: any) => !event.start || !event.end || 
                moment(event.start).format('HH:mm') === '00:00' && 
                moment(event.end).format('HH:mm') === '00:00'} // Treat events as all-day
              eventPropGetter={(event: any) => ({
                style: {
                  backgroundColor: event.resource?.type === 'meeting' ? '#3b82f6' :
                                 event.resource?.type === 'presentation' ? '#10b981' :
                                 event.resource?.type === 'review' ? '#f59e0b' :
                                 event.resource?.type === 'planning' ? '#8b5cf6' :
                                 event.resource?.type === 'feedback' ? '#ef4444' :
                                 event.resource?.type === 'event' ? '#06b6d4' :
                                 event.resource?.type === 'holiday' ? '#dc2626' :
                                 event.resource?.type === 'task' ? '#f59e0b' :
                                 event.resource?.type === 'deadline' ? '#dc2626' : '#6b7280',
                  borderRadius: '4px',
                  opacity: 0.8,
                  color: 'white',
                  border: '0px',
                  display: 'block'
                }
              })}
              messages={{
                month: 'Ay',
                week: 'Hafta',
                day: 'Gün',
                haftaici: 'Haftaiçi',
                today: 'Bugün',
                previous: 'Önceki',
                next: 'Sonraki',
                showMore: (total: number) => `+${total} daha`
              } as any}
              formats={{
                monthHeaderFormat: 'MMMM YYYY',
                dayHeaderFormat: 'dddd',
                dayRangeHeaderFormat: ({ start, end }) => 
                  `${moment(start).format('DD MMM')} - ${moment(end).format('DD MMM YYYY')}`
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-gray-500" />
            <span>{t('upcomingEvents')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentMonthEvents
              .sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime())
              .slice(0, 5)
              .map((event: any) => (
                <div key={event.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      {getEventTypeIcon(event.resource.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
                      <Badge 
                        variant={getEventTypeColor(event.resource.type)}
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => openEventModal(event)}
                      >
                        {event.resource.type}
                      </Badge>
                      <Badge 
                        variant={getStatusColor(event.resource.status)}
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => openEventModal(event)}
                      >
                        {event.resource.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{event.resource.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="h-3 w-3" />
                        <span>{new Date(event.start).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{event.resource.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openEventModal(event)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{currentMonthEvents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Meetings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentMonthEvents.filter((e: any) => e.resource.type === 'meeting').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Events</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentMonthEvents.filter((e: any) => e.resource.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tasks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentMonthEvents.filter((e: any) => e.resource.type === 'task').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeEventModal}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 relative flex-shrink-0">
                <button
                  onClick={closeEventModal}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    {getEventTypeIcon(selectedEvent.resource.type)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedEvent.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge 
                        variant="secondary" 
                        className="bg-white/20 text-white border-white/30"
                      >
                        {selectedEvent.resource.type}
                      </Badge>
                      <Badge 
                        variant="secondary" 
                        className="bg-white/20 text-white border-white/30"
                      >
                        {selectedEvent.resource.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-6 space-y-6">
                {/* Event Info */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Tarih</p>
                      <p className="font-medium">{moment(selectedEvent.start).format('DD MMMM YYYY, dddd')}</p>
                    </div>
                  </div>

                  {selectedEvent.resource.location && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Konum</p>
                        <p className="font-medium">{selectedEvent.resource.location}</p>
                      </div>
                    </div>
                  )}

                  {selectedEvent.resource.participants && selectedEvent.resource.participants.length > 0 && (
                    <div className="flex items-start space-x-3">
                      <Users className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Katılımcılar</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedEvent.resource.participants.map((participant: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <User className="h-3 w-3 mr-1" />
                              {participant}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                {selectedEvent.resource.description && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <h4 className="font-medium">Açıklama</h4>
                    </div>
                    <p className="text-gray-600 leading-relaxed pl-7">
                      {selectedEvent.resource.description}
                    </p>
                  </div>
                )}

                {/* Task specific info */}
                {selectedEvent.resource.type === 'task' && (
                  <div className="border-t pt-4 space-y-4">
                    <h4 className="font-medium flex items-center space-x-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <span>Görev Detayları</span>
                    </h4>
                    
                    {/* Progress Bar */}
                    {(selectedEvent.resource.estimated_hours > 0 || selectedEvent.resource.calculated_actual_hours > 0) && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">İlerleme</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {selectedEvent.resource.time_efficiency_percentage 
                                ? `${Math.round(selectedEvent.resource.time_efficiency_percentage)}%`
                                : selectedEvent.resource.estimated_hours > 0 
                                  ? `${Math.round((selectedEvent.resource.calculated_actual_hours || 0) / selectedEvent.resource.estimated_hours * 100)}%`
                                  : '0%'
                              }
                            </span>
                            {selectedEvent.resource.active_timers > 0 && (
                              <Badge variant="jiraSuccess" className="text-xs">
                                Aktif Timer
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              selectedEvent.resource.active_timers > 0 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                                : 'bg-gradient-to-r from-blue-500 to-purple-600'
                            }`}
                            style={{ 
                              width: selectedEvent.resource.time_efficiency_percentage 
                                ? `${Math.min(100, selectedEvent.resource.time_efficiency_percentage)}%`
                                : selectedEvent.resource.estimated_hours > 0 
                                  ? `${Math.min(100, (selectedEvent.resource.calculated_actual_hours || 0) / selectedEvent.resource.estimated_hours * 100)}%`
                                  : '0%'
                            }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 gap-4 text-sm">
                      {selectedEvent.resource.priority && (
                        <div>
                          <p className="text-gray-500">Öncelik</p>
                          <Badge 
                            variant={
                              selectedEvent.resource.priority === 'high' ? 'destructive' :
                              selectedEvent.resource.priority === 'medium' ? 'jiraWarning' : 'secondary'
                            }
                            className="mt-1"
                          >
                            {selectedEvent.resource.priority === 'high' ? 'Yüksek' :
                             selectedEvent.resource.priority === 'medium' ? 'Orta' : 'Düşük'}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Time tracking section */}
                      <div className="grid grid-cols-2 gap-4">
                        {selectedEvent.resource.estimated_hours > 0 && (
                          <div>
                            <p className="text-gray-500">Tahmini Süre</p>
                            <div className="flex items-center space-x-1 mt-1">
                              <Clock className="h-4 w-4 text-blue-500" />
                              <p className="font-medium">{selectedEvent.resource.estimated_hours} saat</p>
                            </div>
                          </div>
                        )}
                        
                        {selectedEvent.resource.calculated_actual_hours > 0 && (
                          <div>
                            <p className="text-gray-500">Hesaplanan Süre</p>
                            <div className="flex items-center space-x-1 mt-1">
                              <Clock className="h-4 w-4 text-purple-500" />
                              <p className="font-medium">{selectedEvent.resource.calculated_actual_hours} saat</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Additional time info */}
                      {selectedEvent.resource.total_time_entries > 0 && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-xs text-blue-600 mb-1">Zaman Takibi İstatistikleri</p>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">Toplam Kayıt:</span>
                              <span className="font-medium ml-1">{selectedEvent.resource.total_time_entries}</span>
                            </div>
                            {selectedEvent.resource.active_timers > 0 && (
                              <div>
                                <span className="text-gray-600">Aktif Timer:</span>
                                <span className="font-medium ml-1 text-green-600">
                                  {selectedEvent.resource.active_timers} ⏱️
                                </span>
                              </div>
                            )}
                            {selectedEvent.resource.time_efficiency_percentage > 0 && (
                              <div className="col-span-2">
                                <span className="text-gray-600">Verimlilik:</span>
                                <span className={`font-medium ml-1 ${
                                  selectedEvent.resource.time_efficiency_percentage >= 100 
                                    ? 'text-green-600' 
                                    : selectedEvent.resource.time_efficiency_percentage >= 75 
                                      ? 'text-yellow-600' 
                                      : 'text-red-600'
                                }`}>
                                  {Math.round(selectedEvent.resource.time_efficiency_percentage)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Time comparison */}
                      {selectedEvent.resource.estimated_hours > 0 && selectedEvent.resource.calculated_actual_hours > 0 && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Süre Analizi</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">
                              {selectedEvent.resource.calculated_actual_hours <= selectedEvent.resource.estimated_hours 
                                ? '✅ Tahmin dahilinde'
                                : '⚠️ Tahmini aştı'
                              }
                            </span>
                            <span className="text-xs font-medium">
                              {selectedEvent.resource.calculated_actual_hours > selectedEvent.resource.estimated_hours
                                ? `+${(selectedEvent.resource.calculated_actual_hours - selectedEvent.resource.estimated_hours).toFixed(1)} saat`
                                : `${(selectedEvent.resource.estimated_hours - selectedEvent.resource.calculated_actual_hours).toFixed(1)} saat kaldı`
                              }
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button variant="outline" onClick={closeEventModal}>
                    Kapat
                  </Button>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
                    Düzenle
                  </Button>
                </div>
              </div>
            </div>
            {/* End of Scrollable Content and Modal */}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};
