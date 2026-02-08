import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useTournaments } from '@/hooks/useTournaments';
import { TournamentCard } from '@/components/tournaments/TournamentCard';
import { Spinner } from '@/components/ui/Spinner';
import { Trophy, Calendar, Users, Sparkles, ArrowRight, Play, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export function HomePage() {
  const { data: tournaments, isLoading } = useTournaments();
  
  const recentTournaments = tournaments?.slice(0, 3) || [];
  
  // In a real app, these would come from an API
  const stats = [
    { 
      label: 'Active Tournaments', 
      value: tournaments?.filter(t => t.status === 'in_progress').length || 0, 
      icon: Trophy, 
      color: 'from-amber-500 to-orange-600',
      bg: 'bg-orange-50'
    },
    { 
      label: 'Upcoming Matches', 
      value: '12', 
      icon: Calendar, 
      color: 'from-blue-500 to-indigo-600',
      bg: 'bg-blue-50'
    }, 
    { 
      label: 'Teams Registered', 
      value: '24', 
      icon: Users, 
      color: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-50'
    }, 
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-12 pb-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gray-900 text-white shadow-2xl">
        {/* Abstract Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 opacity-90" />
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-[100px]" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] rounded-full bg-purple-500/20 blur-[100px]" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-20" />
        </div>

        <div className="relative p-8 md:p-16 lg:p-20 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium text-blue-200">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>AI-Powered Scheduling Engine</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
              Cricket <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                Tournaments
              </span>
              <br />  
              Reimagined.
            </h1>
            
            <p className="text-lg text-gray-300 max-w-xl leading-relaxed">
              Create professional cricket tournaments in seconds. Let our AI handle the complex scheduling logic while you focus on the game.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/tournaments/new">
                <Button size="lg" className="h-14 px-8 text-base bg-white text-indigo-900 hover:bg-blue-50 border-none shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300">
                  <Play className="w-5 h-5 mr-2 fill-current" />
                  Create Tournament
                </Button>
              </Link>
              <Link to="/tournaments">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: 6 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
            className="hidden lg:block relative"
          >
            <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl transform rotate-3 hover:rotate-1 transition-transform duration-500">
              <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="text-xs font-mono text-gray-400">schedule_generated.json</div>
              </div>
              
              <div className="space-y-4">
                 {[1, 2, 3].map((i) => (
                   <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/10">
                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold">M{i}</div>
                     <div className="flex-1 space-y-2">
                       <div className="h-2 bg-white/20 rounded-full w-2/3" />
                       <div className="h-2 bg-white/10 rounded-full w-1/3" />
                     </div>
                     <div className="text-xs text-green-400 font-mono">SCHEDULED</div>
                   </div>
                 ))}
                 <div className="pt-2 flex justify-center">
                    <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-medium border border-green-500/30">
                      0 Conflicts Detected
                    </div>
                 </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-2xl shadow-lg border border-white/20 z-20"
            >
              <Trophy className="w-8 h-8 text-white" />
            </motion.div>
            
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-6 -left-6 bg-gradient-to-br from-emerald-400 to-teal-500 p-4 rounded-2xl shadow-lg border border-white/20 z-20"
            >
              <Calendar className="w-8 h-8 text-white" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Grid */}
      <motion.section 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {stats.map((stat, i) => (
          <motion.div variants={item} key={i}>
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-none ring-1 ring-gray-100">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full group-hover:scale-110 transition-transform duration-500`} />
              
              <div className="p-6 relative z-10">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg mb-4 group-hover:-translate-y-1 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{stat.value}</h3>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.section>

      {/* Recent Tournaments */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-6 h-6 text-primary-600" />
              Recent Tournaments
            </h2>
            <p className="text-gray-500 text-sm mt-1">Manage and track your ongoing events</p>
          </div>
          <Link to="/tournaments">
            <Button variant="ghost" className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 group">
              View All <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex py-20 justify-center">
            <div className="flex flex-col items-center gap-3">
              <Spinner size="lg" />
              <p className="text-gray-400 animate-pulse">Loading tournaments...</p>
            </div>
          </div>
        ) : recentTournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentTournaments.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <TournamentCard tournament={t} />
              </motion.div>
            ))}
          </div>
        ) : (
           <Card className="p-12 text-center border-dashed border-2 border-gray-200 bg-gray-50/50 rounded-2xl">
             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <Trophy className="w-8 h-8 text-gray-400" />
             </div>
             <h3 className="text-lg font-semibold text-gray-900 mb-2">No tournaments yet</h3>
             <p className="text-gray-500 mb-6 max-w-sm mx-auto">Get started by creating your first tournament and experience the power of AI scheduling.</p>
             <Link to="/tournaments/new">
               <Button>Create Your First Tournament</Button>
             </Link>
           </Card>
        )}
      </section>
    </div>
  );
}
