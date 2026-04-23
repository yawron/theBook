import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { posts as defaultPosts, Post } from './data/posts';

const getInitialPosts = (): Post[] => {
  const stored = localStorage.getItem('diary_posts_v2');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return defaultPosts;
    }
  }
  return defaultPosts;
};

export default function App() {
  const [allPosts, setAllPosts] = useState<Post[]>(getInitialPosts);
  const [currentView, setCurrentView] = useState<'list' | 'post'>('list');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Composer state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Gist state
  const [gistToken, setGistToken] = useState<string>(localStorage.getItem('github_gist_token') || '');
  const [gistId, setGistId] = useState<string>(localStorage.getItem('github_gist_id') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [formGistToken, setFormGistToken] = useState(gistToken);
  const [formGistId, setFormGistId] = useState(gistId);

  // Fetch initial posts from Gist if configured
  useEffect(() => {
    const fetchGist = async () => {
      if (!gistId) return;
      try {
        setSyncStatus('Fetching from cloud...');
        const res = await fetch(`https://api.github.com/gists/${gistId}`);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        if (data.files && data.files['diary_posts.json']) {
          const parsed = JSON.parse(data.files['diary_posts.json'].content);
          setAllPosts(parsed);
          localStorage.setItem('diary_posts_v2', JSON.stringify(parsed));
        }
        setSyncStatus('Synced');
        setTimeout(() => setSyncStatus(''), 3000);
      } catch (e) {
        console.error(e);
        setSyncStatus('Failed to sync. using local.');
      }
    };
    fetchGist();
  }, [gistId]);

  const [calendarView, setCalendarView] = useState<Date>(() => {
    return allPosts.length > 0 ? new Date(allPosts[0].date) : new Date();
  });

  // Get unique tags from all posts
  const allTags = Array.from(new Set(allPosts.flatMap(p => p.tags)));

  let filteredPosts = allPosts;
  if (selectedTag) {
    filteredPosts = filteredPosts.filter(p => p.tags.includes(selectedTag));
  }
  if (selectedDateFilter) {
    filteredPosts = filteredPosts.filter(p => p.date === selectedDateFilter);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredPosts = filteredPosts.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.content.toLowerCase().includes(q) || 
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  // Sort by date (descending)
  const sortedPosts = [...filteredPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const viewPost = (post: Post) => {
    setSelectedPost(post);
    setCurrentView('post');
    window.scrollTo(0, 0);
  };

  const goHome = () => {
    setSelectedPost(null);
    setSelectedTag(null);
    setSelectedDateFilter(null);
    setSearchQuery('');
    setCurrentView('list');
    window.scrollTo(0, 0);
  };

  const filterByTag = (tag: string | null) => {
    setSelectedTag(tag);
    setSearchQuery('');
    setCurrentView('list');
    setSelectedPost(null);
    window.scrollTo(0, 0);
  };

  const toggleDateFilter = (dateStr: string) => {
    if (selectedDateFilter === dateStr) {
      setSelectedDateFilter(null);
    } else {
      setSelectedDateFilter(dateStr);
    }
    setSearchQuery('');
    setCurrentView('list');
    setSelectedPost(null);
    window.scrollTo(0, 0);
  };

  const handlePrevMonth = () => {
    setCalendarView(new Date(calendarView.getFullYear(), calendarView.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCalendarView(new Date(calendarView.getFullYear(), calendarView.getMonth() + 1, 1));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCalendarView(new Date(calendarView.getFullYear(), parseInt(e.target.value), 1));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCalendarView(new Date(parseInt(e.target.value), calendarView.getMonth(), 1));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (currentView === 'post') {
      setCurrentView('list');
      setSelectedPost(null);
    }
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i);
  const monthOptions = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const daysInMonth = new Date(calendarView.getFullYear(), calendarView.getMonth() + 1, 0).getDate();
  const startDay = new Date(calendarView.getFullYear(), calendarView.getMonth(), 1).getDay();
  const startDayMonAligned = (startDay + 6) % 7;
  const postDates = new Set(allPosts.map(p => p.date));

  const handlePostSubmit = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const now = new Date();
    const localDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const exactTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const newPost: Post = {
      id: 'local-post-' + Date.now(),
      title: newTitle,
      date: localDateStr,
      time: exactTimeStr,
      tags: newTags.split(/[,，]/).map(t => t.trim()).filter(Boolean),
      content: newContent
    };
    const updatedPosts = [newPost, ...allPosts];
    setAllPosts(updatedPosts);
    localStorage.setItem('diary_posts_v2', JSON.stringify(updatedPosts));
    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setIsPreviewMode(false);

    if (gistToken && gistId) {
      setSyncStatus('Saving to cloud...');
      try {
        const res = await fetch(`https://api.github.com/gists/${gistId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${gistToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            files: {
              'diary_posts.json': {
                content: JSON.stringify(updatedPosts, null, 2)
              }
            }
          })
        });
        if (!res.ok) throw new Error('Push failed');
        setSyncStatus('Stored in cloud');
        setTimeout(() => setSyncStatus(''), 3000);
      } catch (e) {
        console.error(e);
        setSyncStatus('Cloud push failed!');
      }
    }
  };

  const handleCreateDatabase = async () => {
    if (!formGistToken) {
      alert("Please enter a token first");
      return;
    }
    setSyncStatus('Generating remote DB...');
    try {
      const res = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${formGistToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: "YAWRON Space Blog Data",
          public: false,
          files: {
            'diary_posts.json': {
              content: JSON.stringify(allPosts)
            }
          }
        })
      });
      if (!res.ok) throw new Error("Creation failed. Invalid Token?");
      const data = await res.json();
      if (data.id) {
        setFormGistId(data.id);
        setSyncStatus('');
        alert(`Database created successfully!\nGist ID: ${data.id}\n(Click "Save Config" to apply)`);
      }
    } catch (e) {
      alert('Failed to create Gist. Please check your token.');
      setSyncStatus('');
    }
  };

  const saveSettings = () => {
    localStorage.setItem('github_gist_token', formGistToken);
    localStorage.setItem('github_gist_id', formGistId);
    setGistToken(formGistToken);
    setGistId(formGistId);
    setShowSettings(false);
  };

  return (
    <div className="min-h-screen bg-[#e9eaed] font-['Tahoma',_sans-serif] text-[11px] flex flex-col">
      {/* Top Blue Header */}
      <header className="bg-[#3b5998] h-[42px] flex items-center px-4 border-b border-[#29487d] shrink-0">
        <div className="flex items-center gap-4 w-full max-w-[1024px] mx-auto">
          <span 
            className="text-white font-bold text-2xl tracking-tighter cursor-pointer" 
            onClick={goHome}
          >
            YAWRON Space
          </span>
          <div className="bg-white px-1 py-0.5 flex items-center w-64 max-w-[250px]">
            <input 
              type="text" 
              className="outline-none w-full text-black px-1 py-0.5 text-[11px] placeholder:text-gray-400 font-normal" 
              placeholder="Search diary entries..." 
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-4 text-white font-bold">
            <span className="cursor-pointer" onClick={goHome}>Home</span>
            <span className="cursor-pointer">Profile</span>
            <span className="cursor-pointer opacity-70">Account</span>
          </div>
        </div>
      </header>

      {/* Sub Header for breadcrumbs or secondary actions */}
      <div className="bg-white border-b border-[#dddfe2] shadow-sm mb-4">
        <div className="max-w-[1024px] mx-auto px-4 py-1.5 text-[11px] flex gap-2 text-[#3b5998] font-bold border-b-2 border-transparent">
          <span className="cursor-pointer hover:underline" onClick={goHome}>Home</span>
          <span className="text-gray-400 font-normal">|</span>
          <span 
            className={`cursor-pointer hover:underline transition-none ${selectedTag === null && selectedDateFilter === null && currentView === 'list' && searchQuery.trim() === '' ? 'text-black' : ''}`}
            onClick={goHome}
          >
            All Entries
          </span>
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-[1024px] mx-auto w-full flex-1 flex flex-col sm:flex-row px-4 gap-4 pb-4">
        
        {/* Left Sidebar */}
        <aside className="w-full sm:w-[180px] shrink-0 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
             <div className="bg-white border border-[#dddfe2] p-2 mb-2 relative">
                {syncStatus && (
                  <div className="absolute top-[-18px] right-0 text-[10px] text-[#3b5998] font-bold opacity-80">
                    {syncStatus}
                  </div>
                )}
                <h3 className="text-[#9197a3] font-bold uppercase text-[10px] mb-2 px-1">Calendar</h3>
                <div className="flex justify-between items-center mb-3 px-1 text-[#3b5998] font-bold select-none">
                  <span onClick={handlePrevMonth} className="hover:bg-[#eff1f3] px-1.5 cursor-pointer border border-[#bdc7d8] bg-[#f6f7f9] leading-tight">&lt;</span>
                  <div className="flex gap-[2px]">
                    <select 
                      value={calendarView.getMonth()} 
                      onChange={handleMonthChange}
                      className="border border-[#bdc7d8] text-[10px] text-black outline-none cursor-pointer bg-white h-[18px] w-[52px] pl-[1px]"
                      style={{fontFamily: 'Tahoma'}}
                    >
                      {monthOptions.map((m, i) => (
                        <option key={m} value={i}>{m}</option>
                      ))}
                    </select>
                    <select 
                      value={calendarView.getFullYear()} 
                      onChange={handleYearChange}
                      className="border border-[#bdc7d8] text-[10px] text-black outline-none cursor-pointer bg-white h-[18px] w-[52px] pl-[1px]"
                      style={{fontFamily: 'Tahoma'}}
                    >
                      {yearOptions.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <span onClick={handleNextMonth} className="hover:bg-[#eff1f3] px-1.5 cursor-pointer border border-[#bdc7d8] bg-[#f6f7f9] leading-tight">&gt;</span>
                </div>
                <div className="grid grid-cols-7 text-center gap-y-1 text-[10px]">
                  <div className="text-gray-400">M</div><div className="text-gray-400">T</div><div className="text-gray-400">W</div><div className="text-gray-400">T</div><div className="text-gray-400">F</div><div className="text-gray-400">S</div><div className="text-gray-400">S</div>
                  {Array.from({ length: startDayMonAligned }).map((_, i) => <div key={`empty-${i}`}></div>)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${calendarView.getFullYear()}-${String(calendarView.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const hasPost = postDates.has(dateStr);
                    const isSelected = selectedDateFilter === dateStr;

                    let className = "cursor-pointer p-[2px] border border-transparent ";
                    if (isSelected) {
                      className += "bg-[#3b5998] text-white font-bold border-[#29487d]";
                    } else if (hasPost) {
                      className += "bg-blue-100 text-[#3b5998] font-bold hover:bg-[#d8dfea] border-blue-200";
                    } else {
                      className += "hover:bg-[#eff1f3] text-[#333333]";
                    }

                    return (
                      <div key={day} className={className} onClick={() => toggleDateFilter(dateStr)}>
                        {day}
                      </div>
                    );
                  })}
                </div>
             </div>
             <h1 
               className="text-[#3b5998] font-bold text-[13px] hover:underline cursor-pointer inline mt-1"
               onClick={() => setShowSettings(true)}
               title={gistId && gistToken ? "Cloud DB Active (Click to config)" : "Setup Cloud DB"}
             >
               YAWRON Space {gistId && gistToken ? '☁️' : ''}
             </h1>
             <div className="text-[11px] text-[#808080] w-full border-b border-[#dddfe2] pb-2">
                 Female<br/>
                 since 2026/4/23
             </div>
          </div>

          <div>
             <h3 className="text-[#9197a3] font-bold uppercase text-[10px] mb-2 px-1">Categories</h3>
             <ul className="flex flex-col text-[#3b5998]">
               <li 
                 className={`hover:bg-[#eff1f3] p-1 cursor-pointer flex gap-2 ${selectedTag === null ? 'font-bold text-black pointer-events-none' : ''}`}
                 onClick={() => filterByTag(null)}
               >
                 • All Categories
               </li>
               {allTags.map(tag => (
                 <li 
                   key={tag}
                   className={`hover:bg-[#eff1f3] p-1 cursor-pointer flex gap-2 ${selectedTag === tag ? 'font-bold text-black pointer-events-none' : ''}`}
                   onClick={() => filterByTag(tag)}
                 >
                   • {tag}
                 </li>
               ))}
             </ul>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 flex flex-col gap-3 min-h-[500px]">
          
          {currentView === 'list' && !selectedTag && !selectedDateFilter && !searchQuery.trim() && (
            <div className="bg-white border border-[#dddfe2] shadow-sm relative">
              {gistId && gistToken ? (
                <div className="absolute top-2 right-2 text-[10px] text-[#29487d] font-bold flex items-center gap-1 opacity-80 cursor-help" title="Configured to save to GitHub Gist cloud.">
                  ☁️ Cloud Mode
                </div>
              ) : (
                <div className="absolute top-2 right-2 text-[10px] text-[#808080] font-bold flex items-center gap-1 opacity-80 cursor-help" title="You are only saving to this browser. Click 'Setup Cloud DB' on the left to sync.">
                  💾 Local Mode
                </div>
              )}
              <div className="bg-[#f6f7f9] px-2 py-1.5 border-b border-[#dddfe2] font-bold text-[#3b5998] flex gap-2">
                <span className="flex items-center gap-1">✎ Update Status</span>
                <span className="text-[#808080] font-normal">|</span>
                <span className="flex items-center gap-1 opacity-70">📝 Add Essay</span>
              </div>
              <div className="p-2 flex flex-col gap-2">
                 <input 
                    type="text" 
                    placeholder="Title..." 
                    className="w-full border border-gray-300 p-1 text-[11px] outline-none focus:border-[#3b5998]"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                 />
                 
                 <div className="flex bg-[#f6f7f9] border border-gray-300 border-b-0 text-[10px] font-bold text-[#3b5998]">
                    <span 
                      className={`px-3 py-1 cursor-pointer border-r border-gray-300 hover:bg-[#eff1f3] ${!isPreviewMode ? 'bg-white text-black' : ''}`}
                      onClick={() => setIsPreviewMode(false)}
                    >
                      Write
                    </span>
                    <span 
                      className={`px-3 py-1 cursor-pointer border-r border-gray-300 hover:bg-[#eff1f3] ${isPreviewMode ? 'bg-white text-black' : ''}`}
                      onClick={() => setIsPreviewMode(true)}
                    >
                      Preview
                    </span>
                 </div>
                 
                 {!isPreviewMode ? (
                   <textarea 
                      placeholder="What's on your mind? (Supports Markdown)" 
                      className="w-full border border-gray-300 p-2 text-[12px] outline-none min-h-[220px] focus:border-[#3b5998] border-t-0 mt-[-8px] font-sans resize-y leading-relaxed"
                      value={newContent}
                      onChange={e => setNewContent(e.target.value)}
                   />
                 ) : (
                   <div className="w-full border border-gray-300 p-3 min-h-[220px] bg-white border-t-0 mt-[-8px] overflow-auto">
                     {newContent.trim() ? (
                       <div className="markdown-body prose prose-sm max-w-none text-[12px] leading-relaxed text-[#1c1e21]">
                         <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{newContent}</ReactMarkdown>
                       </div>
                     ) : (
                       <span className="text-gray-400 italic text-[12px]">Nothing to preview</span>
                     )}
                   </div>
                 )}

                 <input 
                    type="text" 
                    placeholder="Tags (comma separated)..." 
                    className="w-full border border-gray-300 p-1 text-[11px] outline-none focus:border-[#3b5998]"
                    value={newTags}
                    onChange={e => setNewTags(e.target.value)}
                 />
                 <div className="flex justify-between items-center mt-1">
                   <span className="text-[#808080] text-[10px]">HTML/Markdown rendering supported.</span>
                   <button 
                     className="bg-[#3b5998] text-white font-bold px-3 py-1 border border-[#29487d] hover:bg-[#4a6baf] active:bg-[#29487d] cursor-pointer"
                     onClick={handlePostSubmit}
                   >
                     Post
                   </button>
                 </div>
              </div>
            </div>
          )}

          {currentView === 'list' && (
            <div className="bg-white border border-[#dddfe2] shadow-sm">
               <div className="bg-[#f6f7f9] px-2 py-1.5 border-b border-[#dddfe2] flex justify-between font-bold text-[#4b4f56] items-center">
                  <span className="border-b-2 border-[#3b5998] pb-1">
                    {[
                      selectedTag && `Category: ${selectedTag}`,
                      selectedDateFilter && `Date: ${selectedDateFilter}`,
                      searchQuery.trim() && `Search: "${searchQuery}"`
                    ].filter(Boolean).join(' | ') || 'Recent Diary Entries'}
                  </span>
                  {(selectedTag || selectedDateFilter || searchQuery.trim() !== '') && (
                     <span 
                       className="cursor-pointer text-[#3b5998] font-normal hover:underline ml-auto"
                       onClick={goHome}
                     >
                       ✕ Clear Filter
                     </span>
                  )}
               </div>
              
               <div className="divide-y divide-[#dddfe2]">
                 {sortedPosts.length === 0 && (
                  <div className="text-[12px] text-[#808080] p-4 text-center bg-white">
                    No entries found.
                  </div>
                 )}
                
                 {sortedPosts.map((post) => (
                  <div key={post.id} className="p-3">
                    <div className="flex gap-2 mb-2">
                      <div className="w-10 h-10 bg-[#3b5998] shrink-0"></div>
                      <div>
                        <div 
                           className="text-[#3b5998] font-bold cursor-pointer hover:underline text-[12px]"
                           onClick={() => viewPost(post)}
                        >
                           {post.title}
                        </div>
                        <div className="text-gray-400 text-[10px]">{post.date}{post.time ? ` ${post.time}` : ''} · Tags: {post.tags.join(', ')}</div>
                      </div>
                    </div>
                    {/* Snippet preview rendering */}
                    <div className="text-black leading-snug mb-3 text-[11px]">
                      {post.content.replace(/#+\s/g, '').replace(/\*/g, '').slice(0, 180)}...
                    </div>
                    <div className="flex gap-4 border-t border-gray-100 pt-2 text-[#3b5998] font-bold mt-2 text-[10px]">
                      <span className="cursor-pointer hover:underline" onClick={() => viewPost(post)}>Read More...</span>
                      <span className="cursor-pointer hover:underline text-gray-500 font-normal">Like</span>
                      <span className="cursor-pointer hover:underline text-gray-500 font-normal">Comment</span>
                      <span className="cursor-pointer hover:underline text-gray-500 font-normal">Share</span>
                    </div>
                  </div>
                 ))}
               </div>
            </div>
          )}

          {currentView === 'post' && selectedPost && (
            <div className="bg-white border border-[#dddfe2] shadow-sm">
               <div className="bg-[#f6f7f9] px-2 py-1.5 border-b border-[#dddfe2] flex gap-4 font-bold text-[#4b4f56]">
                <div 
                  className="cursor-pointer hover:underline text-[#3b5998]" 
                  onClick={goHome}
                >
                  « Back to Entries
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex gap-2 mb-4">
                  <div className="w-10 h-10 bg-[#3b5998] shrink-0"></div>
                  <div>
                    <h1 className="text-[#3b5998] font-bold text-[14px]">
                      {selectedPost.title}
                    </h1>
                    <div className="text-gray-400 text-[10px] flex items-center flex-wrap gap-1 mt-0.5">
                      <span>Posted by User on {selectedPost.date}{selectedPost.time ? ` ${selectedPost.time}` : ''} · Tags:</span>
                      {selectedPost.tags.map((tag, idx) => (
                        <span key={tag}>
                          <span 
                            className="text-[#3b5998] hover:underline cursor-pointer"
                            onClick={() => filterByTag(tag)}
                          >
                            {tag}
                          </span>
                          {idx < selectedPost.tags.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                    {selectedPost.content}
                  </ReactMarkdown>
                </div>

              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* Footer */}
      <footer className="w-full mt-auto mb-4 px-4 text-[#9197a3] text-[10px] leading-tight text-center max-w-[1024px] mx-auto">
        Privacy · Terms · Advertising · Ad Choices · Cookies · More · YAWRON Space © {new Date().getFullYear()}
      </footer>

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#29487d] w-full max-w-md shadow-xl text-black">
            <div className="bg-[#3b5998] text-white px-3 py-2 font-bold flex justify-between">
              <span>Cloud Database Config</span>
              <span className="cursor-pointer" onClick={() => setShowSettings(false)}>✕</span>
            </div>
            <div className="p-4 flex flex-col gap-4 text-[12px]">
               <div className="bg-[#fff9d7] border border-[#e2c822] p-2 text-[#333]">
                 <strong>Warning:</strong> This uses GitHub Gist to sync your diary across devices. Your token is stored locally in this browser.
               </div>
               
               <div>
                 <label className="font-bold text-[#3b5998] block mb-1">GitHub Personal Access Token</label>
                 <input 
                   type="password" 
                   value={formGistToken}
                   onChange={e => setFormGistToken(e.target.value)}
                   placeholder="ghp_xxx..."
                   className="w-full border border-gray-300 px-2 py-1 outline-none focus:border-[#3b5998]"
                 />
                 <span className="text-[10px] text-gray-400">Needs "gist" scope. Never share this token.</span>
               </div>
               
               <div className="border-t border-gray-200 mt-2 pt-4">
                 <label className="font-bold text-[#3b5998] block mb-1">Target Gist ID (Optional if new)</label>
                 <div className="flex gap-2">
                   <input 
                     type="text" 
                     value={formGistId}
                     onChange={e => setFormGistId(e.target.value)}
                     placeholder="Empty to create new..."
                     className="w-full border border-gray-300 px-2 py-1 outline-none focus:border-[#3b5998]"
                   />
                   <button 
                     className="bg-gray-200 border border-gray-300 px-2 font-bold hover:bg-gray-300 whitespace-nowrap"
                     onClick={handleCreateDatabase}
                   >
                     Initialize New
                   </button>
                 </div>
                 <span className="text-[10px] text-gray-400">Paste your existing Gist ID here to sync from another device, or initialize a new cloud database.</span>
               </div>

               <div className="flex justify-end gap-2 mt-4">
                  <button 
                    className="border border-gray-300 px-4 py-1 hover:bg-gray-100"
                    onClick={() => {
                       localStorage.removeItem('github_gist_token');
                       localStorage.removeItem('github_gist_id');
                       setGistToken('');
                       setGistId('');
                       setFormGistToken('');
                       setFormGistId('');
                       alert("Cloud sync disabled and tokens removed from this browser.");
                       setShowSettings(false);
                    }}
                  >
                    Disconnect
                  </button>
                  <button 
                    className="bg-[#3b5998] text-white font-bold border border-[#29487d] px-4 py-1 hover:bg-[#4a6baf]"
                    onClick={saveSettings}
                  >
                    Save Config
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
