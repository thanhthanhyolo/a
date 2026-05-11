'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, GripVertical, Clock, Play, Pause, Square, Calendar, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, Circle } from 'lucide-react';
import type { WorkspaceColumn, WorkspaceTask, TimeLog } from '@/lib/types';

const DEFAULT_COLUMNS = [
  { title: 'To Do', sort_order: 0 },
  { title: 'In Progress', sort_order: 1 },
  { title: 'Review', sort_order: 2 },
  { title: 'Done', sort_order: 3 },
];

const priorityColors = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
};

export default function WorkspacePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [columns, setColumns] = useState<WorkspaceColumn[]>([]);
  const [activeTimer, setActiveTimer] = useState<{ taskId: string; start: number } | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [newTask, setNewTask] = useState<{ title: string; description: string; priority: 'low' | 'medium' | 'high' | 'urgent'; columnId: string }>({ title: '', description: '', priority: 'medium', columnId: '' });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchWorkspace = async () => {
      let { data: boards } = await supabase.from('workspace_boards').select('id').eq('project_id', user.id).limit(1);
      let boardId = boards?.[0]?.id;
      if (!boardId) {
        const { data: board } = await supabase.from('workspace_boards').insert({ project_id: user.id, title: 'My Workspace' }).select('id').single();
        boardId = board?.id;
        if (boardId) {
          for (const col of DEFAULT_COLUMNS) {
            await supabase.from('workspace_columns').insert({ board_id: boardId, ...col });
          }
        }
      }
      if (boardId) {
        const { data: cols } = await supabase
          .from('workspace_columns')
          .select('*, tasks:workspace_tasks(*)')
          .eq('board_id', boardId)
          .order('sort_order');
        if (cols) {
          const sortedCols = cols.map((col: WorkspaceColumn & { tasks?: WorkspaceTask[] }) => ({
            ...col,
            tasks: (col.tasks || []).sort((a, b) => a.sort_order - b.sort_order),
          }));
          setColumns(sortedCols as WorkspaceColumn[]);
        }
      }
    };
    fetchWorkspace();
  }, [user]);

  useEffect(() => {
    if (!activeTimer) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - activeTimer.start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTimer]);

  const addTask = async () => {
    if (!newTask.title || !newTask.columnId) return;
    const { data: maxOrder } = await supabase
      .from('workspace_tasks')
      .select('sort_order')
      .eq('column_id', newTask.columnId)
      .order('sort_order', { ascending: false })
      .limit(1);
    const nextOrder = (maxOrder?.[0]?.sort_order || 0) + 1;
    const { data: task } = await supabase
      .from('workspace_tasks')
      .insert({
        column_id: newTask.columnId,
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        sort_order: nextOrder,
        assignee_id: user!.id,
      })
      .select('id, title, description, priority, sort_order, column_id, assignee_id, due_date, estimated_hours, created_at, updated_at')
      .single();
    if (task) {
      setColumns(columns.map((col) =>
        col.id === newTask.columnId
          ? { ...col, tasks: [...(col.tasks || []), task as WorkspaceTask] }
          : col
      ));
    }
    setNewTask({ title: '', description: '', priority: 'medium', columnId: '' });
    setDialogOpen(false);
    toast.success('Task added');
  };

  const startTimer = (taskId: string) => {
    setActiveTimer({ taskId, start: Date.now() });
    setElapsed(0);
  };

  const stopTimer = async () => {
    if (!activeTimer) return;
    const duration = Math.floor((Date.now() - activeTimer.start) / 60000);
    await supabase.from('time_logs').insert({
      task_id: activeTimer.taskId,
      user_id: user!.id,
      start_time: new Date(activeTimer.start).toISOString(),
      end_time: new Date().toISOString(),
      duration_minutes: duration || 1,
      description: 'Work session',
    });
    setActiveTimer(null);
    setElapsed(0);
    toast.success(`Logged ${duration || 1} minutes`);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Workspace</h1>
            <p className="mt-1 text-muted-foreground">Manage tasks and track your time</p>
          </div>
          <div className="flex items-center gap-3">
            {activeTimer && (
              <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 shadow-sm">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                <span className="font-mono text-sm">{formatTime(elapsed)}</span>
                <Button size="sm" variant="ghost" onClick={stopTimer} className="h-7 w-7 p-0">
                  <Square className="h-3 w-3" />
                </Button>
              </div>
            )}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary border-0 text-white">
                  <Plus className="mr-2 h-4 w-4" /> Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Task title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
                  <Textarea placeholder="Description (optional)" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
                  <div className="grid grid-cols-2 gap-4">
                    <select className="rounded-md border px-3 py-2 text-sm" value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as WorkspaceTask['priority'] })}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    <select className="rounded-md border px-3 py-2 text-sm" value={newTask.columnId} onChange={(e) => setNewTask({ ...newTask, columnId: e.target.value })}>
                      <option value="">Select column</option>
                      {columns.map((col) => <option key={col.id} value={col.id}>{col.title}</option>)}
                    </select>
                  </div>
                  <Button onClick={addTask} className="w-full gradient-primary border-0 text-white">Create Task</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => (
            <div key={column.id} className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                <h3 className="text-sm font-semibold">{column.title}</h3>
                <Badge variant="secondary" className="text-xs">{column.tasks?.length || 0}</Badge>
              </div>
              <div className="space-y-2">
                {(column.tasks || []).map((task) => (
                  <Card key={task.id} className="border-0 shadow-sm cursor-pointer transition-all hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{task.title}</p>
                        <Badge className={`text-[10px] ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {task.due_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(task.due_date).toLocaleDateString('vi-VN')}
                            </span>
                          )}
                          {task.estimated_hours > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {task.estimated_hours}h
                            </span>
                          )}
                        </div>
                        {activeTimer?.taskId === task.id ? (
                          <Button size="sm" variant="ghost" onClick={stopTimer} className="h-6 w-6 p-0">
                            <Pause className="h-3 w-3" />
                          </Button>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => startTimer(task.id)} className="h-6 w-6 p-0">
                            <Play className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
