'use client';

import { useEffect, useState } from 'react';
import { Upload, Folder, Image, Video, Clock, Settings, Users, FileText, Search, MoreVertical, Download, Eye, Trash2, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/language-context';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DocumentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  folder: string | null;
  uploaded_by: string;
  created_at: string;
}

interface StorageStats {
  total: number; // in GB
  used: number; // in GB
  files: number;
}

export default function StoragePage() {
  const { t } = useLanguage();
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'all' | 'images' | 'videos' | 'folders'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<StorageStats>({
    total: 100,
    used: 53.64,
    files: 0,
  });

  useEffect(() => {
    fetchFiles();
  }, [view]);

  const fetchFiles = async () => {
    try {
      const response = await fetch(`/api/storage/files?view=${view}`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    // TODO: Implement file upload logic
    console.log('Files to upload:', uploadedFiles);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-12 w-12 text-purple-500" />;
    if (type.startsWith('video/')) return <Video className="h-12 w-12 text-red-500" />;
    if (type === 'application/pdf') return <FileText className="h-12 w-12 text-red-500" />;
    if (type.includes('zip') || type.includes('rar')) return <File className="h-12 w-12 text-green-500" />;
    return <File className="h-12 w-12 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const getUsagePercentage = () => {
    return (stats.used / stats.total) * 100;
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mock recent files - replace with real data from API
  const recentFiles = [
    { id: '1', name: 'UX/UI Templates', type: 'application/zip', size: 15728640, modified: '24 min ago' },
    { id: '2', name: 'UX/UI Templates', type: 'image/png', size: 2097152, modified: '1 hour ago' },
    { id: '3', name: 'UX/UI Templates', type: 'application/pdf', size: 4194304, modified: '2 hours ago' },
    { id: '4', name: 'UX/UI Templates', type: 'image/psd', size: 10485760, modified: '3 hours ago' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-t-primary border-r-primary border-b-border border-l-border rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card p-4 space-y-6">
        {/* Upload Button */}
        <label htmlFor="file-upload" className="cursor-pointer">
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            <Upload className="mr-2 h-4 w-4" />
            UPLOAD FILES
          </Button>
          <input
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {/* Navigation */}
        <div className="space-y-1">
          <button
            onClick={() => setView('all')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              view === 'all' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'
            }`}
          >
            <Folder className="h-4 w-4" />
            Home
          </button>
          <button
            onClick={() => setView('images')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              view === 'images' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'
            }`}
          >
            <Image className="h-4 w-4" />
            Images
          </button>
          <button
            onClick={() => setView('videos')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              view === 'videos' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'
            }`}
          >
            <Video className="h-4 w-4" />
            Videos
          </button>
          <button
            onClick={() => setView('folders')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              view === 'folders' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'
            }`}
          >
            <Folder className="h-4 w-4" />
            Folders
            <Badge variant="secondary" className="ml-auto">7</Badge>
          </button>
          <button
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            <Clock className="h-4 w-4" />
            History
          </button>
          <button
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </div>

        {/* Members */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">MEMBERS</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              Alls
            </div>
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
              <div className="w-4 h-4" />
              Users
            </div>
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
              <div className="w-4 h-4" />
              Editor
            </div>
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-primary font-medium">
              <div className="w-4 h-4 flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full" />
              </div>
              Admin
            </div>
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
              <div className="w-4 h-4" />
              Administrator
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Storage</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Cloud Storage */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Cloud Storage</h2>
              <button className="text-sm text-primary hover:underline">VIEW MORE</button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Total Storage {stats.total} GB (Free space {(stats.total - stats.used).toFixed(2)} GB)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Dropbox */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 2L0 5.5 6 9l6-3.5L6 2zm6 3.5L18 9l6-3.5L18 2l-6 3.5zM0 12l6 3.5 6-3.5-6-3.5L0 12zm18 0l6 3.5-6 3.5-6-3.5 6-3.5zM6 18.5L12 22l6-3.5-6-3.5-6 3.5z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Dropbox Storage</h3>
                    <p className="text-sm text-muted-foreground">5.68GB / 15.00GB</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>View</DropdownMenuItem>
                      <DropdownMenuItem>Settings</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">STORAGE</p>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-blue-500" style={{ width: '37.87%' }} />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Last Activity: 3 Hours Ago
                  </div>
                </div>
              </div>

              {/* Google Drive */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7.71 3.5L1.15 15l2.85 5 6.56-11.5L7.71 3.5zm12.44 0L13.5 15l2.85 5 6.65-11.5-2.85-5zM1.5 15L8 3.5h8L9.5 15H1.5z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Google Drive</h3>
                    <p className="text-sm text-muted-foreground">4.75GB / 10.00GB</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>View</DropdownMenuItem>
                      <DropdownMenuItem>Settings</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">STORAGE</p>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-green-500" style={{ width: '47.5%' }} />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Last Activity: 5 Hours Ago
                  </div>
                </div>
              </div>

              {/* Box Storage */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-cyan-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 3h18v18H3z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Box Storage</h3>
                    <p className="text-sm text-muted-foreground">3.64GB / 10.00GB</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>View</DropdownMenuItem>
                      <DropdownMenuItem>Settings</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">STORAGE</p>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-cyan-500" style={{ width: '36.4%' }} />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Last Activity: 26 Aug, 2022
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Files */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Recent Files</h2>
              <p className="text-sm text-muted-foreground">Recent access files (Last access 24 min ago)</p>
              <button className="text-sm text-primary hover:underline">VIEW MORE</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentFiles.map((file) => (
                <div key={file.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow group">
                  <div className="flex flex-col items-center text-center space-y-4">
                    {getFileIcon(file.type)}
                    <div className="flex-1 w-full">
                      <h4 className="font-medium text-foreground text-sm mb-1">{file.name}</h4>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
