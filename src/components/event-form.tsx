"use client";

import { useState, useEffect } from "react";
import { Event } from "@/lib/models";
import { X, Github, Code, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { isDateInPast } from "@/lib/utils";

interface EventFormProps {
  event?: Event;
  onSubmit: (event: Event) => void;
  onCancel: () => void;
}

const colorOptions = [
  { value: "bg-blue-500", label: "Blue" },
  { value: "bg-green-500", label: "Green" },
  { value: "bg-purple-500", label: "Purple" },
  { value: "bg-yellow-500", label: "Yellow" },
  { value: "bg-indigo-500", label: "Indigo" },
  { value: "bg-pink-500", label: "Pink" },
  { value: "bg-teal-500", label: "Teal" },
  { value: "bg-cyan-500", label: "Cyan" },
  { value: "bg-red-500", label: "Red" },
];

const codeLanguages = [
  "JavaScript", "TypeScript", "Python", "Java", "C#", "PHP", "Go", "Ruby", "Rust", "Swift"
];

export default function EventForm({ event, onSubmit, onCancel }: EventFormProps) {
  const [formData, setFormData] = useState<Event>({
    title: "",
    startTime: "",
    endTime: "",
    date: "",
    color: "bg-blue-500",
    description: "",
    priority: "medium",
    reminderTime: 15,
  });
  
  const [attendeeInput, setAttendeeInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (event) {
      setFormData(event);
    } else {
      // Set default date to today and default times
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      
      setFormData(prev => ({
        ...prev,
        date: formattedDate,
      }));
    }
  }, [event]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };





  const validateForm = () => {
    if (!formData.title) {
      setFormError("Title is required");
      return false;
    }
    if (!formData.date) {
      setFormError("Date is required");
      return false;
    }
    if (!formData.startTime) {
      setFormError("Start time is required");
      return false;
    }
    if (!formData.endTime) {
      setFormError("End time is required");
      return false;
    }
    
    // Check if event is in the past
    if (isDateInPast(formData.date, formData.startTime)) {
      setFormError("Cannot schedule events in the past");
      return false;
    }
    
    // Check if end time is after start time
    const eventStart = new Date(`${formData.date}T${formData.startTime}`);
    const eventEnd = new Date(`${formData.date}T${formData.endTime}`);
    if (eventEnd <= eventStart) {
      setFormError("End time must be after start time");
      return false;
    }
    
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-foreground">
      {formError && (
        <div className="bg-destructive/20 border border-destructive p-3 rounded-md flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{formError}</span>
        </div>
      )}
      
      <div>
        <label className="block mb-1">Title</label>
        <Input
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="bg-background/10 border-border text-foreground"
          placeholder="Event title"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Date</label>
          <Input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="bg-background/10 border-border text-foreground"
          />
        </div>
        
        <div>
          <label className="block mb-1">Color</label>
          <Select
            value={formData.color}
            onValueChange={(value) => handleSelectChange("color", value)}
          >
            <SelectTrigger className="bg-background/10 border-border text-foreground">
              <SelectValue placeholder="Select color" />
            </SelectTrigger>
            <SelectContent>
              {colorOptions.map((color) => (
                <SelectItem key={color.value} value={color.value}>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${color.value}`}></div>
                    <span>{color.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Start Time</label>
          <Input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className="bg-background/10 border-border text-foreground"
          />
        </div>
        
        <div>
          <label className="block mb-1">End Time</label>
          <Input
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            className="bg-background/10 border-border text-foreground"
          />
        </div>
      </div>
      

      
      <div>
        <label className="block mb-1">Description</label>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="bg-background/10 border-border text-foreground"
          placeholder="Event description"
          rows={3}
        />
      </div>
      

      
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Priority</label>
          <Select
            value={formData.priority || "medium"}
            onValueChange={(value) => handleSelectChange("priority", value as 'low' | 'medium' | 'high')}
          >
            <SelectTrigger className="bg-background/10 border-border text-foreground">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block mb-1">Reminder (minutes before)</label>
          <Select
            value={String(formData.reminderTime || 15)}
            onValueChange={(value) => handleSelectChange("reminderTime", value)}
          >
            <SelectTrigger className="bg-background/10 border-border text-foreground">
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 minutes</SelectItem>
              <SelectItem value="10">10 minutes</SelectItem>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {event ? "Update Event" : "Create Event"}
        </Button>
      </div>
    </form>
  );
}
