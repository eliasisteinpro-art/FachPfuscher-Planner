import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  CheckSquare, 
  Clock, 
  Plus, 
  Trash2, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Download, 
  Tag, 
  AlertCircle,
  X
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar', 'todos', 'timetable'
  
  // LocalStorage State
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('uni_planner_events');
    return saved ? JSON.parse(saved) : [];
  });

  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('uni_planner_todos');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Stundenplan einrichten', category: 'Schule', priority: 'hoch', completed: false, dueDate: new Date().toISOString().split('T')[0] }
    ];
  });

  const [timetable, setTimetable] = useState(() => {
    const saved = localStorage.getItem('uni_planner_timetable');
    return saved ? JSON.parse(saved) : [
      { id: '1', day: 'Montag', time: '08:00 - 09:30', subject: 'Anwendungsentwicklung', room: 'Raum 102', teacher: 'Herr Schmidt' },
      { id: '2', day: 'Dienstag', time: '09:45 - 11:15', subject: 'Datenbanken / SQL', room: 'EDV 3', teacher: 'Frau Weber' }
    ];
  });

  // Datum & Ansicht
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0]);

  // Formulare
  const [newEvent, setNewEvent] = useState({ title: '', date: selectedDateStr, time: '08:00', category: 'Termin', notes: '' });
  const [newTodo, setNewTodo] = useState({ title: '', category: 'Allgemein', priority: 'mittel', dueDate: selectedDateStr });
  const [newLesson, setNewLesson] = useState({ day: 'Montag', time: '08:00 - 09:30', subject: '', room: '', teacher: '' });

  const [showEventModal, setShowEventModal] = useState(false);

  // Speicher-Effekte
  useEffect(() => {
    localStorage.setItem('uni_planner_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('uni_planner_todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('uni_planner_timetable', JSON.stringify(timetable));
  }, [timetable]);

  // Kalender-Berechnungen
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = So, 1 = Mo...
    
    // Anpassung für Montag als ersten Tag (0 = Mo, 6 = So)
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    
    return { daysInMonth, firstDay: adjustedFirstDay };
  };

  const changeMonth = (delta) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  // Event Handlers
  const addEvent = (e) => {
    e.preventDefault();
    if (!newEvent.title) return;
    const item = { ...newEvent, id: Date.now().toString() };
    setEvents([...events, item]);
    setNewEvent({ title: '', date: selectedDateStr, time: '08:00', category: 'Termin', notes: '' });
    setShowEventModal(false);
  };

  const deleteEvent = (id) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const addTodo = (e) => {
    e.preventDefault();
    if (!newTodo.title) return;
    const item = { ...newTodo, id: Date.now().toString(), completed: false };
    setTodos([...todos, item]);
    setNewTodo({ title: '', category: 'Allgemein', priority: 'mittel', dueDate: selectedDateStr });
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const addLesson = (e) => {
    e.preventDefault();
    if (!newLesson.subject) return;
    const item = { ...newLesson, id: Date.now().toString() };
    setTimetable([...timetable, item]);
    setNewLesson({ day: 'Montag', time: '08:00 - 09:30', subject: '', room: '', teacher: '' });
  };

  const deleteLesson = (id) => {
    setTimetable(timetable.filter(l => l.id !== id));
  };

  // Import Stundenplan in den aktuellen Monatskalender
  const importTimetableToCalendar = () => {
    const daysMap = { 'Montag': 1, 'Dienstag': 2, 'Mittwoch': 3, 'Donnerstag': 4, 'Freitag': 5 };
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const newEventsFromTimetable = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay(); // 1 = Mo, ..., 5 = Fr
      
      const dayName = Object.keys(daysMap).find(key => daysMap[key] === dayOfWeek);
      if (dayName) {
        const lessonsForDay = timetable.filter(l => l.day === dayName);
        lessonsForDay.forEach(lesson => {
          const formattedDate = date.toISOString().split('T')[0];
          // Verhindern von Duplikaten
          const exists = events.some(e => e.date === formattedDate && e.title === lesson.subject);
          if (!exists) {
            newEventsFromTimetable.push({
              id: Date.now().toString() + Math.random(),
              title: lesson.subject,
              date: formattedDate,
              time: lesson.time.split('-')[0].trim(),
              category: 'Unterricht',
              notes: `Raum: ${lesson.room || 'k.A.'} | Lehrer: ${lesson.teacher || 'k.A.'}`
            });
          }
        });
      }
    }

    setEvents(prev => [...prev, ...newEventsFromTimetable]);
    alert(`${newEventsFromTimetable.length} Stundenplan-Termine für diesen Monat in den Kalender übernommen!`);
  };

  const { daysInMonth, firstDay } = getDaysInMonth(currentDate);
  const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  const weekDays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  const filteredEventsForSelectedDate = events.filter(e => e.date === selectedDateStr);
  const filteredTodosForSelectedDate = todos.filter(t => t.dueDate === selectedDateStr);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-20 md:pb-0 md:pl-64">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 p-6 z-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-indigo-600 rounded-xl text-white">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">UniPlanner</h1>
        </div>

        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab('calendar')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'calendar' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <CalendarIcon className="w-5 h-5" />
            <span className="font-medium">Kalender</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('todos')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'todos' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <CheckSquare className="w-5 h-5" />
            <span className="font-medium">To-Do Planer</span>
          </button>

          <button 
            onClick={() => setActiveTab('timetable')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'timetable' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="font-medium">Stundenplan</span>
          </button>
        </nav>

        <div className="pt-4 border-t border-slate-800 text-xs text-slate-500">
          Lokal & Schnell • Universal Mobile App
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-indigo-400" />
          <h1 className="font-bold text-lg text-white">UniPlanner</h1>
        </div>
        <span className="text-xs px-2.5 py-1 bg-indigo-950 text-indigo-300 border border-indigo-800/50 rounded-full">
          {activeTab === 'calendar' ? 'Kalender' : activeTab === 'todos' ? 'To-Dos' : 'Stundenplan'}
        </span>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">

        {/* ----------------- TAB: KALENDER ----------------- */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            {/* Kopfzeile Kalender */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-white">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
                  <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-700 rounded text-slate-300"><ChevronLeft className="w-5 h-5"/></button>
                  <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-700 rounded text-slate-300"><ChevronRight className="w-5 h-5"/></button>
                </div>
              </div>

              <button 
                onClick={() => { setNewEvent(prev => ({ ...prev, date: selectedDateStr })); setShowEventModal(true); }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-medium transition shadow-lg shadow-indigo-600/20"
              >
                <Plus className="w-5 h-5" />
                Neuer Termin
              </button>
            </div>

            {/* Kalender Raster */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
              <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-semibold text-slate-400">
                {weekDays.map(d => <div key={d} className="py-2">{d}</div>)}
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {/* Leere Felder vor dem 1. des Monats */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-16 sm:h-24 bg-slate-950/40 rounded-xl opacity-30 border border-slate-900" />
                ))}

                {/* Tage des Monats */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const isToday = dateString === new Date().toISOString().split('T')[0];
                  const isSelected = dateString === selectedDateStr;

                  const dayEvents = events.filter(e => e.date === dateString);
                  const dayTodos = todos.filter(t => t.dueDate === dateString && !t.completed);

                  return (
                    <div 
                      key={dayNum}
                      onClick={() => setSelectedDateStr(dateString)}
                      className={`h-16 sm:h-24 p-1.5 sm:p-2 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-950/30' 
                          : isToday 
                          ? 'border-cyan-500/50 bg-cyan-950/20' 
                          : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`text-xs sm:text-sm font-semibold rounded-full w-6 h-6 flex items-center justify-center ${
                          isToday ? 'bg-cyan-500 text-slate-950 font-bold' : isSelected ? 'bg-indigo-600 text-white' : 'text-slate-300'
                        }`}>
                          {dayNum}
                        </span>
                      </div>

                      {/* Event/Todo Dots auf Mobile, Text auf Desktop */}
                      <div className="space-y-1 overflow-hidden">
                        {dayEvents.slice(0, 2).map((e) => (
                          <div key={e.id} className="hidden sm:block text-[10px] truncate px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-200 border border-indigo-700/50">
                            {e.time} {e.title}
                          </div>
                        ))}
                        {dayTodos.slice(0, 1).map((t) => (
                          <div key={t.id} className="hidden sm:block text-[10px] truncate px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-200 border border-amber-700/50">
                            ✓ {t.title}
                          </div>
                        ))}

                        {/* Indikatoren für Mobile */}
                        <div className="flex sm:hidden gap-1 mt-auto">
                          {dayEvents.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                          {dayTodos.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tagesansicht Detail (für ausgewählten Tag) */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                Details für den {new Date(selectedDateStr).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Termine am Tag */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Termine ({filteredEventsForSelectedDate.length})</h4>
                  {filteredEventsForSelectedDate.length === 0 ? (
                    <p className="text-sm text-slate-500 italic bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">Keine Termine an diesem Tag.</p>
                  ) : (
                    filteredEventsForSelectedDate.map(e => (
                      <div key={e.id} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">{e.time}</span>
                            <span className="font-semibold text-white">{e.title}</span>
                          </div>
                          {e.notes && <p className="text-xs text-slate-400 mt-1">{e.notes}</p>}
                        </div>
                        <button onClick={() => deleteEvent(e.id)} className="text-slate-500 hover:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))
                  )}
                </div>

                {/* To-Dos am Tag */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Anstehende Aufgaben ({filteredTodosForSelectedDate.length})</h4>
                  {filteredTodosForSelectedDate.length === 0 ? (
                    <p className="text-sm text-slate-500 italic bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">Keine fälligen Aufgaben.</p>
                  ) : (
                    filteredTodosForSelectedDate.map(t => (
                      <div key={t.id} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-3">
                          <button onClick={() => toggleTodo(t.id)} className={`w-5 h-5 rounded border flex items-center justify-center ${t.completed ? 'bg-emerald-600 border-emerald-500' : 'border-slate-600'}`}>
                            {t.completed && <Check className="w-3.5 h-3.5 text-white" />}
                          </button>
                          <span className={`text-sm ${t.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>{t.title}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded border ${
                          t.priority === 'hoch' ? 'bg-red-950 text-red-300 border-red-800' : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>{t.priority}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB: TO-DO PLANNER ----------------- */}
        {activeTab === 'todos' && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <h2 className="text-xl font-bold text-white mb-4">Neue Aufgabe hinzufügen</h2>
              <form onSubmit={addTodo} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input 
                  type="text" 
                  placeholder="Aufgabenbezeichnung..."
                  value={newTodo.title}
                  onChange={e => setNewTodo({ ...newTodo, title: e.target.value })}
                  className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <select 
                  value={newTodo.priority}
                  onChange={e => setNewTodo({ ...newTodo, priority: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none"
                >
                  <option value="niedrig">Priorität: Niedrig</option>
                  <option value="mittel">Priorität: Mittel</option>
                  <option value="hoch">Priorität: Hoch</option>
                </select>
                <input 
                  type="date" 
                  value={newTodo.dueDate}
                  onChange={e => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none"
                />
                <button type="submit" className="sm:col-span-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl transition flex items-center justify-center gap-2 mt-2">
                  <Plus className="w-5 h-5" /> Aufgabe erstellen
                </button>
              </form>
            </div>

            {/* To-Do Listen */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white">Deine Aufgabenliste</h3>
              {todos.length === 0 ? (
                <p className="text-slate-500 text-sm italic">Keine Aufgaben vorhanden.</p>
              ) : (
                <div className="space-y-2">
                  {todos.map(todo => (
                    <div key={todo.id} className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 transition">
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleTodo(todo.id)} className={`w-5 h-5 rounded border flex items-center justify-center transition ${todo.completed ? 'bg-emerald-600 border-emerald-500' : 'border-slate-600'}`}>
                          {todo.completed && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                        <div>
                          <span className={`font-medium text-sm ${todo.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                            {todo.title}
                          </span>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                            <span>Fällig: {todo.dueDate}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          todo.priority === 'hoch' ? 'bg-red-950 text-red-400 border border-red-800' :
                          todo.priority === 'mittel' ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {todo.priority}
                        </span>
                        <button onClick={() => deleteTodo(todo.id)} className="text-slate-500 hover:text-red-400 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ----------------- TAB: STUNDENPLAN ----------------- */}
        {activeTab === 'timetable' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white">Stundenplan Manager</h2>
                <p className="text-sm text-slate-400">Verwalte deine wöchentlichen Fächer und erstelle automatisch Kalendereinträge.</p>
              </div>
              <button 
                onClick={importTimetableToCalendar}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-medium transition shadow-lg shadow-emerald-600/20"
              >
                <Download className="w-5 h-5" />
                In Kalender übernehmen
              </button>
            </div>

            {/* Neue Stunde hinzufügen */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <h3 className="text-md font-semibold text-white mb-3">Unterrichtseinheit hinzufügen</h3>
              <form onSubmit={addLesson} className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-3">
                <select 
                  value={newLesson.day}
                  onChange={e => setNewLesson({ ...newLesson, day: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                >
                  {['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                
                <input 
                  type="text" 
                  placeholder="Zeit (z.B. 08:00 - 09:30)" 
                  value={newLesson.time}
                  onChange={e => setNewLesson({ ...newLesson, time: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />

                <input 
                  type="text" 
                  placeholder="Fach / Modul" 
                  value={newLesson.subject}
                  onChange={e => setNewLesson({ ...newLesson, subject: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white sm:col-span-2"
                />

                <input 
                  type="text" 
                  placeholder="Raum" 
                  value={newLesson.room}
                  onChange={e => setNewLesson({ ...newLesson, room: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />

                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2 font-medium flex items-center justify-center gap-1">
                  <Plus className="w-4 h-4" /> Hinzufügen
                </button>
              </form>
            </div>

            {/* Stundenplan Wochenansicht */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'].map(day => {
                const dayLessons = timetable.filter(l => l.day === day);
                return (
                  <div key={day} className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3">
                    <h4 className="font-bold text-indigo-400 border-b border-slate-800 pb-2 text-center">{day}</h4>
                    {dayLessons.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4 italic">Kein Unterricht</p>
                    ) : (
                      dayLessons.map(lesson => (
                        <div key={lesson.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 relative group">
                          <button 
                            onClick={() => deleteLesson(lesson.id)}
                            className="absolute top-2 right-2 text-slate-600 hover:text-red-400 opacity-80"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="text-[11px] font-mono text-indigo-300 font-semibold">{lesson.time}</div>
                          <div className="font-bold text-sm text-white mt-1">{lesson.subject}</div>
                          {lesson.room && <div className="text-[11px] text-slate-400 mt-1">📍 {lesson.room}</div>}
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* MODAL: NEUER TERMIN */}
      {showEventModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Neuen Termin anlegen</h3>
              <button onClick={() => setShowEventModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>

            <form onSubmit={addEvent} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Titel</label>
                <input 
                  type="text" 
                  required
                  placeholder="z. B. Prüfung Anwendungsentwicklung" 
                  value={newEvent.title}
                  onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Datum</label>
                  <input 
                    type="date" 
                    value={newEvent.date}
                    onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Uhrzeit</label>
                  <input 
                    type="time" 
                    value={newEvent.time}
                    onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Notizen / Ort</label>
                <textarea 
                  rows="2"
                  placeholder="Zusätzliche Infos..." 
                  value={newEvent.notes}
                  onChange={e => setNewEvent({ ...newEvent, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowEventModal(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-sm font-medium">Abbrechen</button>
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-sm font-medium">Speichern</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex justify-around p-2 z-30">
        <button 
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition ${activeTab === 'calendar' ? 'text-indigo-400' : 'text-slate-500'}`}
        >
          <CalendarIcon className="w-5 h-5" />
          <span className="text-[10px] font-medium">Kalender</span>
        </button>

        <button 
          onClick={() => setActiveTab('todos')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition ${activeTab === 'todos' ? 'text-indigo-400' : 'text-slate-500'}`}
        >
          <CheckSquare className="w-5 h-5" />
          <span className="text-[10px] font-medium">To-Dos</span>
        </button>

        <button 
          onClick={() => setActiveTab('timetable')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition ${activeTab === 'timetable' ? 'text-indigo-400' : 'text-slate-500'}`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-medium">Stundenplan</span>
        </button>
      </nav>
    </div>
  );
}