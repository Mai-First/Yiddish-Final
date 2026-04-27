/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo } from 'react';
import { 
  History, 
  Map as MapIcon, 
  BookOpen, 
  Filter, 
  ChevronRight,
  Info,
  Calendar,
  Building2,
  Newspaper,
  School,
  Drama,
  Users
} from 'lucide-react';
import InstitutionMap from './components/InstitutionMap';
import { institutions, Institution, InstitutionType } from './data/institutions';
import { cn } from './lib/utils';
import ReactMarkdown from 'react-markdown';

const PROJECT_EXPLANATION = `
### Mapping Yiddish Culture in America (1880–1950)

This digital geographic visualization explores the development of Yiddish cultural institutions in the United States during the peak period of Jewish immigration and cultural flourishing.

#### Research Question
How did the geographic distribution of Yiddish cultural institutions change between 1880 and 1950, and what does this reveal about the development and spread of Yiddish culture among Jewish immigrant communities?

#### Historical Patterns
Early Yiddish life was heavily concentrated in the **Lower East Side of Manhattan**, often referred to as the "Yiddish Broadway." However, as communities settled and expanded, we see hubs emerging in **Chicago, Philadelphia, Boston, and Cleveland**. By the 1920s and 30s, the map illustrates a "second settlement" pattern, with cultural life expanding to **Los Angeles, Detroit, and Miami Beach**, reflecting economic mobility and the search for warmer climates or new industrial opportunities.

#### About the Data
The dataset represents a selection of **300+ cultural institutions**, including primary branches of the **Workmen's Circle (Arbeter Ring)**, landsmanshaft societies, labor organizations, and historical Yiddish newspapers and theaters. The data is drawn from archival record groups at the **YIVO Institute for Jewish Research** and the **Center for Jewish History**.
`;

const CATEGORY_ABOUT: Record<InstitutionType, { title: string, content: string }> = {
  Newspaper: {
    title: "The Yiddish Press",
    content: "The daily Yiddish press served as the 'secular synagogue' for millions of immigrants. Beyond news, papers like the *Forverts* (Forward) and *Der Tog* provided orientation to American life, serial literature (Bintl Brief), and a forum for political debate. As the community integrated after 1924, papers transitioned from radical immigrant advocacy to broader Jewish communal commentary."
  },
  Theater: {
    title: "Yiddish Broadway & The Rialto",
    content: "From the raw energy of the Bowery to the prestige of the Second Avenue Rialto, Yiddish theater provided an emotional catharsis for a displaced people. It evolved from popular 'shund' (low-brow musicals) to sophisticated avant-garde art theater. By the 1940s, while professional stages declined, the aesthetic and talent pool had profoundly reshaped American Broadway and Hollywood."
  },
  School: {
    title: "Folkshuln: Secular Education",
    content: "The Yiddish secular school movement (Folkshuln) was a grassroots effort by labor and cultural groups to pass 'Yiddishkeit' to American-born generations. Networks like the Workmen's Circle (Arbeter Ring) and the Sholem Aleichem Folk Institute taught Yiddish literature and social justice. These centers peaked in the 1930s as vital hubs of community life before public school assimilation intensified."
  },
  Organization: {
    title: "Mutual Aid & Labor",
    content: "Immigrant life was anchored by Organizations: the Workmen's Circle provided safety nets, labor unions (like the ILGWU) fought for rights, and 'landsmanshaftn' connected neighbors from the same European towns. These provided burial, medical care, and social continuity. After 1950, they evolved from practical survival networks into historical and commemorative societies."
  }
};

export default function App() {
  const [selectedYear, setSelectedYear] = useState(1950);
  const [selectedType, setSelectedType] = useState<InstitutionType | 'All'>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const filteredInstitutions = useMemo(() => {
    return institutions.filter(inst => {
      const typeMatch = selectedType === 'All' || inst.type === selectedType;
      const yearMatch = inst.founded <= selectedYear;
      return typeMatch && yearMatch;
    });
  }, [selectedType, selectedYear]);

  const selectedInstitution = useMemo(() => {
    return institutions.find(inst => inst.id === selectedId) || null;
  }, [selectedId]);

  const stats = useMemo(() => {
    const active = institutions.filter(inst => inst.founded <= selectedYear);
    return {
      total: active.length,
      types: {
        Newspaper: active.filter(i => i.type === 'Newspaper').length,
        Theater: active.filter(i => i.type === 'Theater').length,
        School: active.filter(i => i.type === 'School').length,
        Organization: active.filter(i => i.type === 'Organization').length,
      }
    };
  }, [selectedYear]);

  return (
    <div className="flex h-screen bg-[#FDFCFB] text-slate-900 font-sans selection:bg-slate-100 selection:text-slate-900">
      {/* Sidebar */}
      <aside className="w-80 border-right border-slate-200 flex flex-col bg-white shadow-xl z-10 shrink-0">
        <header className="p-8 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-6 text-slate-600">
            <div className="p-2 bg-slate-100 rounded-lg shadow-sm shadow-slate-100">
              <History size={20} />
            </div>
            <span className="text-[11px] uppercase font-bold tracking-[0.3em] text-slate-500">Historical Atlas</span>
          </div>
          <h1 className="text-3xl font-serif font-bold leading-[1.1] tracking-tight text-slate-900 mb-4">
            Yiddish Cultural Institutions <span className="text-slate-600">(1880-1950)</span> in the United States
          </h1>
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
            Mapping the geographic evolution of Jewish diaspora anchors and community settlements.
          </p>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Year Selector */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <label className="text-[11px] uppercase font-bold tracking-wider text-slate-400">Timeline</label>
              <span className="text-3xl font-serif font-bold text-slate-900">{selectedYear}</span>
            </div>
            <input 
              type="range" 
              min="1880" 
              max="1950" 
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
            <div className="flex justify-between text-[10px] font-medium text-slate-400 mt-2">
              <span>1880</span>
              <span>1900</span>
              <span>1920</span>
              <span>1950</span>
            </div>
          </section>

          {/* Filter */}
          <section>
            <label className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-3 flex items-center gap-2">
              <Filter size={12} />
              Filter by Type
            </label>
            <div className="grid grid-cols-1 gap-1">
              {(['All', 'Newspaper', 'Theater', 'School', 'Organization'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-xs rounded-md transition-all text-left border",
                    selectedType === type 
                      ? "shadow-sm font-medium" 
                      : "text-slate-600 hover:bg-slate-50 border-transparent"
                  )}
                  style={selectedType === type ? (
                    type === 'All' 
                      ? { backgroundColor: '#0f172a', color: 'white', borderColor: '#0f172a' } 
                      : { 
                          backgroundColor: `${getTypeColor(type)}10`, 
                          color: getTypeColor(type),
                          borderColor: `${getTypeColor(type)}30`
                        }
                  ) : {}}
                >
                  <span className="flex items-center gap-2">
                    {getTypeIcon(type as any)}
                    {type === 'All' ? 'Every Institution' : type}
                  </span>
                  <span className={cn(
                    "text-[10px] font-mono opacity-60",
                    selectedType === type ? "" : "text-slate-400"
                  )}>
                    {type === 'All' ? stats.total : stats.types[type as keyof typeof stats.types]}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Category About */}
          <AnimatePresence mode="wait">
            {selectedType !== 'All' && (
              <motion.section
                key={selectedType}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-xl border"
                style={{ 
                  backgroundColor: `${getTypeColor(selectedType)}10`, // 10 is ~6% opacity in hex
                  borderColor: `${getTypeColor(selectedType)}30`     // 30 is ~18% opacity
                }}
              >
                <h3 
                  className="text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"
                  style={{ color: getTypeColor(selectedType) }}
                >
                  {getTypeIcon(selectedType)}
                  About {CATEGORY_ABOUT[selectedType].title}
                </h3>
                <p 
                  className="text-[11px] leading-relaxed font-medium italic"
                  style={{ color: getTypeColor(selectedType) }}
                >
                  {CATEGORY_ABOUT[selectedType].content}
                </p>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Directory */}
          <section className="flex flex-col h-[300px]">
            <label className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BookOpen size={12} />
                Directory
              </span>
              <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                {filteredInstitutions.length} Results
              </span>
            </label>
            <div className="flex-1 overflow-y-auto pr-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
              {filteredInstitutions.length > 0 ? (
                filteredInstitutions.map(inst => (
                  <button
                    key={inst.id}
                    onClick={() => setSelectedId(inst.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg transition-all group border",
                      selectedId === inst.id
                        ? "shadow-sm"
                        : "hover:bg-slate-50 border-transparent"
                    )}
                    style={selectedId === inst.id ? { 
                      backgroundColor: `${getTypeColor(inst.type)}10`,
                      borderColor: `${getTypeColor(inst.type)}30`
                    } : {}}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className={cn(
                          "text-xs font-bold truncate leading-tight",
                          selectedId === inst.id ? "" : "text-slate-800"
                        )}
                        style={selectedId === inst.id ? { color: getTypeColor(inst.type) } : {}}
                        >
                          {inst.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-400 uppercase tracking-tighter">
                            {inst.city} • {inst.founded}
                          </span>
                        </div>
                      </div>
                      <div 
                        className="w-1.5 h-1.5 rounded-full shrink-0 mt-1" 
                        style={{ backgroundColor: getTypeColor(inst.type) }}
                      />
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-[11px] text-slate-400 italic">No institutions founded yet.</p>
                </div>
              )}
            </div>
          </section>

          {/* History Snippet */}
          <section className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <BookOpen size={12} />
              Key Insight
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              {getPeriodInsight(selectedYear)}
            </p>
          </section>
        </div>

        <footer className="p-4 border-t border-slate-100 flex items-center justify-between">
          <button 
            onClick={() => setShowInfo(true)}
            className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors flex items-center gap-2"
          >
            <Info size={14} />
            About Project
          </button>
          <span className="text-[10px] text-slate-300 font-mono italic">v2.0</span>
        </footer>
      </aside>

      {/* Main Map Area */}
      <main className="flex-1 relative">
        <InstitutionMap 
          data={filteredInstitutions}
          selectedYear={selectedYear}
          highlightedId={selectedId}
          onSelectInstitution={setSelectedId}
        />

        {/* Floating Detail Card */}
        <AnimatePresence>
          {selectedInstitution && (
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="absolute top-8 right-8 w-80 bg-white shadow-2xl rounded-2xl border border-slate-200 overflow-hidden"
            >
              <div className="h-2" style={{ backgroundColor: getTypeColor(selectedInstitution.type) }}/>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">
                      {selectedInstitution.type}
                    </span>
                    <h2 className="text-xl font-serif font-bold text-slate-800 leading-tight">
                      {selectedInstitution.name}
                    </h2>
                  </div>
                  <button 
                    onClick={() => setSelectedId(null)}
                    className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                  >
                    <ChevronRight className="rotate-90 sm:rotate-0" size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-600">
                    <MapIcon size={14} className="opacity-50" />
                    <span className="text-xs font-medium">{selectedInstitution.city}, {selectedInstitution.state}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Calendar size={14} className="opacity-50" />
                    <span className="text-xs font-medium">Founded: {selectedInstitution.founded}</span>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                      {selectedInstitution.description}
                    </p>
                    
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <BookOpen size={12} />
                        Sources
                      </h4>
                      <div className="space-y-1.5">
                        {selectedInstitution.sources.map((source, idx) => (
                          <div 
                            key={idx} 
                            className="text-[11px] text-slate-500 leading-tight bg-slate-50/50 p-2 rounded border border-slate-100 italic"
                          >
                            {source}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Explanation Modal */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-slate-900/40 backdrop-blur-md"
              onClick={() => setShowInfo(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-2xl w-full bg-white rounded-3xl p-10 shadow-2xl relative overflow-y-auto max-h-[90vh]"
                onClick={e => e.stopPropagation()}
              >
                <button 
                  onClick={() => setShowInfo(false)}
                  className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-all"
                >
                  <Filter className="rotate-45" size={24} />
                </button>
                <div className="markdown-body prose prose-slate prose-sm max-w-none">
                  <ReactMarkdown>{PROJECT_EXPLANATION}</ReactMarkdown>
                </div>
                <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between items-end">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Sources</h4>
                    <ul className="text-[10px] text-slate-500 space-y-1">
                      <li>• YIVO Institute for Jewish Research (Record Groups 123, 575, 685, 1400)</li>
                      <li>• Center for Jewish History ArchivesSpace</li>
                      <li>• Library of Congress Yiddish Newspaper Collection</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => setShowInfo(false)}
                    className="px-6 py-2 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md"
                  >
                    Return to Map
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function getTypeIcon(type: InstitutionType | 'All') {
  switch (type) {
    case 'Newspaper': return <Newspaper size={14} />;
    case 'Theater': return <Drama size={14} />;
    case 'School': return <School size={14} />;
    case 'Organization': return <Building2 size={14} />;
    default: return <MapIcon size={14} />;
  }
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'Newspaper': return '#ef4444';
    case 'Theater': return '#8b5cf6';
    case 'School': return '#059669';
    case 'Organization': return '#3b82f6';
    default: return '#64748b';
  }
}

function getPeriodInsight(year: number): string {
  if (year < 1900) return "Cultural life is extremely concentrated in Lower Manhattan's 'Yiddish Broadway'. Mass migration is beginning to fuel the Yiddish daily press.";
  if (year < 1920) return "Yiddish institutions are expanding to Chicago and Philadelphia. The Forward is becoming a national power in Jewish life.";
  if (year < 1940) return "The 'Second Settlement' is in full effect. Secular school systems (Arbeter Ring, Sholem Aleichem) are peaking across major cities.";
  return "Western and Southern migration (LA, Miami) reflects the post-war shifts in the American Jewish community while established hubs remain active.";
}
