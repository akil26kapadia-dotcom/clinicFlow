import { useState } from "react";
import { useListAppointments } from "@workspace/api-client-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  Scheduled: "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
  "No Show": "bg-gray-100 text-gray-700",
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: appointments = [] } = useListAppointments();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDay = monthStart.getDay();
  const prefixBlanks = startDay === 0 ? 6 : startDay - 1;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Appointment Calendar</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold min-w-[180px] text-center">
            {format(currentDate, "MMMM yyyy")}
          </span>
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setCurrentDate(new Date())}>Today</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
              <div key={d} className="p-3 text-center text-sm font-semibold text-muted-foreground border-r last:border-r-0">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: prefixBlanks }).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[100px] border-b border-r bg-muted/20" />
            ))}
            {days.map((day) => {
              const dayAppointments = appointments.filter(apt =>
                isSameDay(new Date(apt.date), day)
              );
              const isCurrentDay = isToday(day);
              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[100px] p-2 border-b border-r last-in-row:border-r-0 ${isCurrentDay ? "bg-primary/5" : ""}`}
                >
                  <div className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                    isCurrentDay ? "bg-primary text-primary-foreground" : "text-foreground"
                  }`}>
                    {format(day, "d")}
                  </div>
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 3).map(apt => (
                      <div
                        key={apt.id}
                        className={`text-xs px-1 py-0.5 rounded truncate ${STATUS_COLORS[apt.status || "Scheduled"]}`}
                        title={`${apt.time} - ${apt.patientName} - ${apt.treatment}`}
                      >
                        {apt.time} {apt.patientName}
                      </div>
                    ))}
                    {dayAppointments.length > 3 && (
                      <div className="text-xs text-muted-foreground pl-1">
                        +{dayAppointments.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 flex-wrap">
        {Object.entries(STATUS_COLORS).map(([status, cls]) => (
          <div key={status} className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded ${cls}`}>{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
